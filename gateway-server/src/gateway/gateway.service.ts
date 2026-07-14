import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';
import { FastifyReply } from 'fastify';
import { RouteService, RouteCacheData } from '../routes/route.service';
import { TransformerService } from '../transformers/transformer.service';
import { CredentialService } from '../credentials/credential.service';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { RequestLogService } from '../request-logs/request-log.service';
import { BusinessTableService } from '../business-data/business-table.service';
import { TableRowService } from '../business-data/table-row.service';
import { DdtException } from '../common/ddt-exception';
import { ConfigService } from '../config/config.service';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

/**
 * 下游派发结果。
 * - streamed=true：响应已通过 reply.raw 流式写入，controller 不应再调用 reply.send
 * - streamed=false：data 为同步响应体，controller 按 envelope 包装
 * - errorCode：流式场景中途出错时填充（此时 reply.raw 已写入，无法再返回错误 envelope）
 */
interface DispatchResult {
  streamed: boolean;
  data: any;
  errorCode?: string;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  // [FLOW-05] 异步降载阈值：业务表数 ≥3 或单表字段数 ≥20 时下沉到 BullMQ
  private readonly ASYNC_BIZ_TABLE_THRESHOLD = 3;
  private readonly ASYNC_BIZ_FIELD_THRESHOLD = 20;

  constructor(
    private readonly routeService: RouteService,
    private readonly transformerService: TransformerService,
    private readonly credentialService: CredentialService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly requestLogService: RequestLogService,
    private readonly businessTableService: BusinessTableService,
    private readonly tableRowService: TableRowService,
    private readonly configService: ConfigService,
    @InjectQueue('async-tasks') private readonly asyncQueue: Queue,
  ) {}

  /**
   * 网关入口处理（对齐 SPEC-04 §2：POST /v1/transit/:transitId/invoke）。
   *
   * 路径模型裁决后，客户端只需持有 transitId（即 route.id）即可调用，
   * 不再暴露 projectId/environment/method/path 四元组。
   * project_id / environment / method / path 等字段从 route 实体内部取，用于日志记录与权限校验。
   *
   * 流式透传：当下游返回 Content-Type: text/event-stream 时，通过 reply.raw 直接 pipe 到客户端，
   * 不再走标准 envelope。controller 根据 streamed 标记决定是否再调用 reply.send。
   */
  async handleRequest(
    transitId: string,
    body: any,
    clientIp: string,
    reply: FastifyReply,
  ): Promise<{ streamed: boolean; data: any }> {
    const startTime = Date.now();
    let route: RouteCacheData | null = null;
    let transformedBody: any = null;
    let responseBody: any = null;
    let httpStatus = 200;
    let errorCode: string | null = null;
    let streamed = false;

    try {
      route = await this.resolveRoute(transitId);

      if (!route) {
        throw new DdtException('ROUTE_NOT_FOUND');
      }

      if (!route.route.is_active) {
        throw new DdtException('ROUTE_NOT_FOUND');
      }

      await this.checkRateLimit(route.route.id, clientIp);

      if (route.route.is_async) {
        const asyncResult = await this.handleAsync(route, body, clientIp);
        return { streamed: false, data: asyncResult };
      }

      // [Mock-Mode] is_mock=true 时阻断向下游派发，直接返回 mock_response（对齐 SPEC-00 IN-SCOPE 第 6 项）
      // 不走 transformer/credential/dispatch，但请求日志照常记录（便于排查 Mock 命中）
      if (route.route.is_mock) {
        responseBody = route.route.mock_response || {};
        this.logger.log(
          `[Mock-Mode] transit=${transitId} 命中 Mock 响应，阻断下游派发`,
        );
        return { streamed: false, data: responseBody };
      }

      const breakerState = await this.circuitBreakerService.getState(route.route.id);
      if (breakerState === 'OPEN') {
        throw new DdtException('TARGET_CIRCUIT_BROKEN');
      }

      transformedBody = await this.transformRequest(route, body);

      // 下游 method 由 route 配置决定（入口固定 POST，但转发方法用 route.method）
      // 流式透传：dispatchToTarget 内部检测 Content-Type，SSE 时直接 pipe 到 reply.raw
      const dispatchResult = await this.dispatchToTarget(route, transformedBody, route.route.method, reply);

      if (dispatchResult.streamed) {
        // 流式响应已通过 reply.raw 写入，无法再走标准 envelope
        streamed = true;
        responseBody = '[STREAM]';

        if (dispatchResult.errorCode) {
          // 流式中途出错（stream 'error'），已记录熔断失败，错误码写入 request_log
          errorCode = dispatchResult.errorCode;
          httpStatus = 500;
        } else {
          await this.circuitBreakerService.recordSuccess(route.route.id);
        }
        // 流式场景跳过业务数据写入（响应为流，无法预先抽取字段）
        return { streamed: true, data: null };
      }

      responseBody = dispatchResult.data;
      await this.circuitBreakerService.recordSuccess(route.route.id);

      // [FLOW-05] 业务数据表隔离写入子流程（对齐 SPEC-02 §5）
      // 写入失败不阻断主请求响应，仅记录日志
      const projectIdForBiz = route.route.project_id;
      await this.persistBusinessData(projectIdForBiz, body, responseBody).catch((err) => {
        this.logger.error(`[FLOW-05] 业务数据写入失败 project=${projectIdForBiz}: ${err?.message || err}`);
      });

      return { streamed: false, data: responseBody };
    } catch (error) {
      httpStatus = error instanceof DdtException ? error.getStatus() : 500;
      const response = error instanceof DdtException ? error.getResponse() : null;
      errorCode = response && typeof response === 'object' && 'error' in response
        ? (response as { error: { code: string } }).error.code
        : null;

      if (route) {
        if (errorCode === 'TARGET_TIMEOUT' || errorCode === 'TARGET_SERVER_ERROR') {
          await this.circuitBreakerService.recordFailure(route.route.id, errorCode === 'TARGET_TIMEOUT' ? 'TIMEOUT' : 'SERVER_ERROR');
        }
      }

      throw error;
    } finally {
      if (route) {
        // 日志字段从 route 实体取（入口固定 POST /v1/transit/:transitId/invoke，记录入口无意义）
        // 流式场景 response_body_raw 记录为 [STREAM]（无法预先获取完整响应内容）
        await this.requestLogService.create({
          project_id: route.route.project_id,
          route_id: route.route.id,
          environment: route.route.environment,
          client_ip: clientIp,
          method: route.route.method,
          path: route.route.path,
          request_body_raw: JSON.stringify(body),
          transformed_body_raw: JSON.stringify(transformedBody),
          response_body_raw: streamed ? '[STREAM]' : JSON.stringify(responseBody),
          http_status: httpStatus,
          error_code: errorCode || undefined,
          latency_ms: Date.now() - startTime,
        });
      }
    }
  }

  /**
   * 按 transitId 解析路由配置（缓存优先，未命中查 DB 并回填）。
   */
  private async resolveRoute(transitId: string): Promise<RouteCacheData | null> {
    let cached = await this.routeService.getCachedRoute(transitId);
    if (cached) {
      return cached;
    }

    const route = await this.routeService.findById(transitId);
    if (!route) {
      return null;
    }

    const transformer = await this.transformerService.findByRouteId(route.id);

    let credentialInfo: any = null;
    if (transformer?.credential_id) {
      const credential = await this.credentialService.findById(transformer.credential_id);
      if (credential) {
        const secret = await this.credentialService.getDecryptedSecret(credential.id);
        credentialInfo = {
          type: credential.type,
          secret,
        };
      }
    }

    const cacheData: RouteCacheData = {
      route,
      transformer,
      credential: credentialInfo,
    };

    await this.routeService.cacheRoute(route.id, cacheData);

    return cacheData;
  }

  private async checkRateLimit(routeId: string, clientIp: string): Promise<void> {
    const allowed = await this.rateLimiterService.check(routeId, clientIp);
    if (!allowed) {
      throw new DdtException('RESOURCE_EXHAUSTED');
    }
  }

  private async handleAsync(
    route: RouteCacheData,
    body: any,
    clientIp: string,
  ): Promise<any> {
    const taskId = uuidv4();

    await this.asyncQueue.add(
      {
        taskId,
        route,
        body,
        clientIp,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    return {
      success: true,
      data: {
        task_id: taskId,
        status: 'ACCEPTED',
      },
      error: null,
    };
  }

  private async transformRequest(
    route: RouteCacheData,
    body: any,
  ): Promise<any> {
    if (!route.transformer) {
      return body;
    }

    return this.transformerService.transform(route.transformer, body);
  }

  /**
   * 派发到下游目标（对齐 SPEC-02 FLOW-01 第 5 步 DISPATCH）。
   *
   * 流式透传：统一使用 responseType: 'stream' 接收下游响应，再按 Content-Type 分流：
   * - text/event-stream → 调用 pipeStreamToReply 直接 pipe 到客户端（SSE 透传，核心卖点）
   * - 其他 → 收集 stream 到 buffer，尝试 JSON.parse 后返回（保持同步 JSON 兼容）
   *
   * 错误处理：
   * - 请求阶段失败（连接超时/5xx）→ 抛 DdtException，由 handleRequest catch 统一处理
   * - 流式阶段失败（stream 'error'）→ 返回 { streamed: true, errorCode }，因 reply.raw 已写入无法再返回错误 envelope
   */
  private async dispatchToTarget(
    route: RouteCacheData,
    body: any,
    method: string,
    reply: FastifyReply,
  ): Promise<DispatchResult> {
    if (!route.transformer) {
      throw new DdtException('TARGET_SERVER_ERROR');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // 声明接受 SSE，便于下游返回 text/event-stream（对齐 Dify/n8n 流式接口约定）
      'Accept': 'application/json, text/event-stream',
    };

    if (route.credential) {
      if (route.credential.type === 'Bearer') {
        headers['Authorization'] = `Bearer ${route.credential.secret}`;
      } else if (route.credential.type === 'Basic') {
        headers['Authorization'] = `Basic ${route.credential.secret}`;
      }
    }

    let response;
    try {
      response = await axios({
        method: method.toLowerCase(),
        url: route.transformer.target_url,
        data: body,
        headers,
        timeout: route.route.timeout_ms,
        // 统一用 stream 接收，再按 Content-Type 分流（SSE 流式 / JSON 同步）
        responseType: 'stream',
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new DdtException('TARGET_TIMEOUT');
        }
        if (error.response?.status && error.response.status >= 500) {
          throw new DdtException('TARGET_SERVER_ERROR');
        }
        throw new DdtException('TARGET_SERVER_ERROR');
      }
      throw new DdtException('TARGET_SERVER_ERROR');
    }

    const contentType = String(response.headers['content-type'] || '');
    const isSSE = contentType.includes('text/event-stream');

    if (isSSE) {
      // [SSE 流式透传] 核心卖点：直接 pipe 下游 stream 到客户端，边收边转发
      return await this.pipeStreamToReply(route, response.data, reply);
    }

    // [同步响应] 收集 stream 到 buffer，尝试 JSON 解析（保持原同步 JSON 行为）
    const data = await this.collectStreamToJson(response.data);
    return { streamed: false, data };
  }

  /**
   * 将下游 SSE 流直接 pipe 到客户端 reply.raw（核心流式透传实现）。
   *
   * 实现要点：
   * 1. reply.hijack() 告知 Fastify 不再自动处理响应（由我们完全接管 raw response）
   * 2. writeHead 写入 SSE 标准头（Content-Type / Cache-Control / Connection / X-Accel-Buffering）
   *    X-Accel-Buffering: no → 提示 Nginx 禁用缓冲（对齐 SSE 透传要求）
   * 3. 监听 stream 'data' → write 到 reply.raw
   * 4. 监听 stream 'end' → end reply.raw，resolve { streamed: true }
   * 5. 监听 stream 'error' → 记录熔断失败，end reply.raw，resolve { streamed: true, errorCode }
   * 6. 监听 reply.raw 'close'（客户端断开）→ destroy 下游 stream，避免泄漏
   *
   * 返回 Promise：在 stream 结束（end/error）时 resolve，使 handleRequest 的 await 等到流完成
   * 这样 finally 块能准确记录流式请求的 latency_ms 与 error_code
   */
  private pipeStreamToReply(
    route: RouteCacheData,
    stream: Readable,
    reply: FastifyReply,
  ): Promise<DispatchResult> {
    return new Promise<DispatchResult>((resolve) => {
      let resolved = false;
      const finish = (errorCode?: string) => {
        if (resolved) return;
        resolved = true;
        try {
          if (!reply.raw.writableEnded) {
            reply.raw.end();
          }
        } catch {
          // ignore double-end
        }
        if (errorCode) {
          this.circuitBreakerService
            .recordFailure(route.route.id, 'SERVER_ERROR')
            .catch(() => {});
        }
        resolve({ streamed: true, data: null, errorCode });
      };

      // hijack：接管 raw response，Fastify 不再自动 send
      reply.hijack();

      try {
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          // 提示 Nginx 禁用缓冲，确保 SSE 实时透传
          'X-Accel-Buffering': 'no',
        });
      } catch (err) {
        this.logger.error(`[SSE] writeHead 失败: ${err?.message || err}`);
        finish('TARGET_SERVER_ERROR');
        return;
      }

      stream.on('data', (chunk: Buffer) => {
        if (reply.raw.writableEnded) {
          stream.destroy();
          return;
        }
        try {
          reply.raw.write(chunk);
        } catch (err) {
          this.logger.error(`[SSE] 写入客户端失败: ${err?.message || err}`);
          stream.destroy();
          finish('TARGET_SERVER_ERROR');
        }
      });

      stream.on('end', () => {
        this.logger.debug(`[SSE] 流式响应完成 route=${route.route.id}`);
        finish();
      });

      stream.on('error', (err: Error) => {
        this.logger.error(`[SSE] 下游流错误 route=${route.route.id}: ${err?.message || err}`);
        finish('TARGET_SERVER_ERROR');
      });

      // 客户端断开连接时，销毁下游流避免泄漏
      reply.raw.on('close', () => {
        if (!resolved) {
          this.logger.warn(`[SSE] 客户端断开连接 route=${route.route.id}`);
          stream.destroy();
          finish();
        }
      });
    });
  }

  /**
   * 收集 stream 到 buffer 并尝试 JSON 解析（同步响应路径）。
   *
   * 用于 dispatchToTarget 中非 SSE 响应：axios responseType:'stream' 返回的 ReadableStream
   * 需手动收集为 buffer，再按 Content-Type 解析（JSON 优先，失败则返回字符串）。
   */
  private collectStreamToJson(stream: Readable): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf-8');
        if (!text) {
          resolve(null);
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          // 非 JSON 响应，返回原始字符串
          resolve(text);
        }
      });
      stream.on('error', (err: Error) => reject(err));
    });
  }

  /**
   * [FLOW-05] 业务数据表隔离写入子流程（对齐 SPEC-02 §5）
   *
   * 步骤：
   * 1. RESOLVE：按 projectId 加载所有启用的 BusinessTable
   * 2. EXTRACT：按 BusinessField.source 从请求/响应/系统上下文抽取值
   * 3. PROJECT：仅保留 enabled=true 字段
   * 4. WRITE：调用 TableRowService.createRow 写入物理表
   * 5. CACHE-TTL：cache 类型由 TableRowService 内部同步写 Redis TTL 键
   *
   * 失败隔离：写入异常不抛出，仅记录 error 日志，主请求响应不受影响
   * 异步降载：表数 ≥3 或单表字段数 ≥20 时整体下沉到 BullMQ（本轮简化为同步，标记 TODO）
   */
  private async persistBusinessData(
    projectId: string,
    requestBody: any,
    responseBody: any,
  ): Promise<void> {
    // 1. RESOLVE
    const tables = await this.businessTableService.listByProject(projectId);
    if (!tables || tables.length === 0) {
      return; // 该项目未配置业务表，跳过
    }

    // 判断是否需要异步降载（本轮简化：仅记日志，实际仍同步执行）
    const needAsync = tables.length >= this.ASYNC_BIZ_TABLE_THRESHOLD
      || tables.some(t => (t.fields?.length || 0) >= this.ASYNC_BIZ_FIELD_THRESHOLD);
    if (needAsync) {
      this.logger.warn(`[FLOW-05] project=${projectId} 业务表数=${tables.length} 触发异步降载阈值，本轮仍同步执行（TODO: 下沉 BullMQ）`);
    }

    // 2~4. 逐表 EXTRACT + PROJECT + WRITE
    for (const table of tables) {
      try {
        const row: Record<string, string | number | boolean | null> = {};
        for (const field of table.fields || []) {
          if (!field.enabled) continue; // PROJECT：跳过未启用字段

          // EXTRACT：按 source 抽取
          let value: string | number | boolean | null = null;
          if (field.source === 'request') {
            value = this.extractField(requestBody, field.name);
          } else if (field.source === 'response') {
            value = this.extractField(responseBody, field.name);
          } else if (field.source === 'system') {
            // system 字段由 TableRowService 内部填充（主键自增 / created_at=NOW()）
            continue;
          }

          // NULLABLE 校验：nullable=false 且值为空时跳过该表写入（不抛错以免影响主链路）
          if (!field.nullable && (value === null || value === undefined)) {
            this.logger.warn(`[FLOW-05] table=${table.table_name} field=${field.name} 非空但抽取为空，跳过该表写入`);
            // 跳过整张表的写入（避免部分字段缺失导致 NOT NULL 约束报错）
            // 标记跳过
            row.__skipped = true;
            break;
          }

          if (value !== null && value !== undefined) {
            row[field.name] = value;
          }
        }

        if (row.__skipped) continue;
        // 清理标记字段
        delete row.__skipped;

        // 至少有一个业务字段才写入
        if (Object.keys(row).length > 0) {
          await this.tableRowService.createRow(table.id, row);
        }
      } catch (err: any) {
        // 单表失败不影响其他表
        this.logger.error(`[FLOW-05] table=${table.table_name} 写入失败: ${err?.message || err}`);
      }
    }
  }

  /**
   * 从对象中按字段名抽取值（支持点路径，如 'data.user_id'）
   */
  private extractField(obj: any, fieldPath: string): string | number | boolean | null {
    if (!obj || typeof obj !== 'object') return null;
    // 支持点路径
    const parts = fieldPath.split('.');
    let current: any = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return null;
      current = current[part];
    }
    if (current === null || current === undefined) return null;
    if (typeof current === 'string' || typeof current === 'number' || typeof current === 'boolean') {
      return current;
    }
    // 复杂对象序列化为 JSON 字符串
    return JSON.stringify(current);
  }
}
