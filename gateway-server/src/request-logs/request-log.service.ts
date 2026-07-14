import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLogEntity } from './request-log.entity';

interface CreateLogDto {
  project_id: string;
  route_id?: string;
  environment: string;
  client_ip?: string;
  method: string;
  path: string;
  request_body_raw?: string;
  transformed_body_raw?: string;
  response_body_raw?: string;
  http_status: number;
  error_code?: string;
  latency_ms: number;
}

/**
 * 请求日志统计结果（对齐前端 DashboardOverview.vue）
 */
export interface LogStats {
  /** 总请求数 */
  total: number;
  /** 错误请求数（http_status >= 400） */
  error_count: number;
  /** 平均耗时（毫秒） */
  avg_latency_ms: number;
  /** P95 耗时（毫秒），无数据时为 0 */
  p95_latency_ms: number;
  /** 状态码分布，如 { "200": 120, "404": 5, "500": 2 } */
  status_distribution: Record<string, number>;
  /** 错误码 Top5，按出现次数降序 */
  top_errors: Array<{ error_code: string; count: number }>;
}

/**
 * 请求日志服务（对齐 SPEC-04 §7 Live-Console API）
 *
 * 职责：
 * 1. 网关层每次请求后写入一条 request_log
 * 2. 控制台查询：按 projectId 分页查询 + 统计聚合
 */
@Injectable()
export class RequestLogService {
  constructor(
    @InjectRepository(RequestLogEntity)
    private readonly requestLogRepository: Repository<RequestLogEntity>,
  ) {}

  async create(dto: CreateLogDto): Promise<RequestLogEntity> {
    const log = this.requestLogRepository.create(dto);
    return this.requestLogRepository.save(log);
  }

  async findByProjectId(projectId: string, limit: number = 100): Promise<RequestLogEntity[]> {
    return this.requestLogRepository.find({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByRouteId(routeId: string, limit: number = 100): Promise<RequestLogEntity[]> {
    return this.requestLogRepository.find({
      where: { route_id: routeId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * 分页查询日志（支持按 routeId / 状态码 / 方法 筛选）
   */
  async listLogs(options: {
    projectId: string;
    routeId?: string;
    method?: string;
    httpStatus?: number;
    errorCode?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: RequestLogEntity[]; total: number }> {
    const limit = Math.min(options.limit ?? 50, 500);
    const offset = options.offset ?? 0;

    const qb = this.requestLogRepository
      .createQueryBuilder('log')
      .where('log.project_id = :projectId', { projectId: options.projectId });

    if (options.routeId) {
      qb.andWhere('log.route_id = :routeId', { routeId: options.routeId });
    }
    if (options.method) {
      qb.andWhere('log.method = :method', { method: options.method.toUpperCase() });
    }
    if (options.httpStatus) {
      qb.andWhere('log.http_status = :httpStatus', { httpStatus: options.httpStatus });
    }
    if (options.errorCode) {
      qb.andWhere('log.error_code = :errorCode', { errorCode: options.errorCode });
    }

    qb.orderBy('log.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    const [rows, total] = await qb.getManyAndCount();
    return { rows, total };
  }

  /**
   * 聚合统计（用于 DashboardOverview）
   * 默认统计最近 24 小时数据，避免全表扫描
   */
  async getStats(projectId: string, sinceHours: number = 24): Promise<LogStats> {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

    // 基础统计：总数 / 错误数 / 平均耗时
    const baseStats = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('COUNT(*)', 'total')
      .addSelect(
        `SUM(CASE WHEN log.http_status >= 400 THEN 1 ELSE 0 END)`,
        'error_count',
      )
      .addSelect('COALESCE(AVG(log.latency_ms), 0)', 'avg_latency_ms')
      .where('log.project_id = :projectId', { projectId })
      .andWhere('log.created_at >= :since', { since })
      .getRawOne<{ total: string; error_count: string; avg_latency_ms: string }>();

    // P95 耗时（用 percentile_cont，PostgreSQL 原生函数）
    const p95Result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY log.latency_ms), 0)', 'p95')
      .where('log.project_id = :projectId', { projectId })
      .andWhere('log.created_at >= :since', { since })
      .getRawOne<{ p95: string }>();

    // 状态码分布
    const statusDist = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.http_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('log.project_id = :projectId', { projectId })
      .andWhere('log.created_at >= :since', { since })
      .groupBy('log.http_status')
      .getRawMany<{ status: number; count: string }>();

    const status_distribution: Record<string, number> = {};
    for (const row of statusDist) {
      status_distribution[String(row.status)] = parseInt(row.count, 10);
    }

    // 错误码 Top5
    const topErrors = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.error_code', 'error_code')
      .addSelect('COUNT(*)', 'count')
      .where('log.project_id = :projectId', { projectId })
      .andWhere('log.created_at >= :since', { since })
      .andWhere('log.error_code IS NOT NULL')
      .groupBy('log.error_code')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany<{ error_code: string; count: string }>();

    return {
      total: parseInt(baseStats?.total || '0', 10),
      error_count: parseInt(baseStats?.error_count || '0', 10),
      avg_latency_ms: Math.round(parseFloat(baseStats?.avg_latency_ms || '0')),
      p95_latency_ms: Math.round(parseFloat(p95Result?.p95 || '0')),
      status_distribution,
      top_errors: topErrors.map((e) => ({
        error_code: e.error_code,
        count: parseInt(e.count, 10),
      })),
    };
  }
}
