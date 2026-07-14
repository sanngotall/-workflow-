"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const axios_1 = __importDefault(require("axios"));
const route_service_1 = require("../routes/route.service");
const transformer_service_1 = require("../transformers/transformer.service");
const credential_service_1 = require("../credentials/credential.service");
const rate_limiter_service_1 = require("../rate-limiter/rate-limiter.service");
const circuit_breaker_service_1 = require("../circuit-breaker/circuit-breaker.service");
const request_log_service_1 = require("../request-logs/request-log.service");
const business_table_service_1 = require("../business-data/business-table.service");
const table_row_service_1 = require("../business-data/table-row.service");
const ddt_exception_1 = require("../common/ddt-exception");
const config_service_1 = require("../config/config.service");
const uuid_1 = require("uuid");
let GatewayService = GatewayService_1 = class GatewayService {
    constructor(routeService, transformerService, credentialService, rateLimiterService, circuitBreakerService, requestLogService, businessTableService, tableRowService, configService, asyncQueue) {
        this.routeService = routeService;
        this.transformerService = transformerService;
        this.credentialService = credentialService;
        this.rateLimiterService = rateLimiterService;
        this.circuitBreakerService = circuitBreakerService;
        this.requestLogService = requestLogService;
        this.businessTableService = businessTableService;
        this.tableRowService = tableRowService;
        this.configService = configService;
        this.asyncQueue = asyncQueue;
        this.logger = new common_1.Logger(GatewayService_1.name);
        this.ASYNC_BIZ_TABLE_THRESHOLD = 3;
        this.ASYNC_BIZ_FIELD_THRESHOLD = 20;
    }
    async handleRequest(transitId, body, clientIp, reply) {
        const startTime = Date.now();
        let route = null;
        let transformedBody = null;
        let responseBody = null;
        let httpStatus = 200;
        let errorCode = null;
        let streamed = false;
        try {
            route = await this.resolveRoute(transitId);
            if (!route) {
                throw new ddt_exception_1.DdtException('ROUTE_NOT_FOUND');
            }
            if (!route.route.is_active) {
                throw new ddt_exception_1.DdtException('ROUTE_NOT_FOUND');
            }
            await this.checkRateLimit(route.route.id, clientIp);
            if (route.route.is_async) {
                const asyncResult = await this.handleAsync(route, body, clientIp);
                return { streamed: false, data: asyncResult };
            }
            if (route.route.is_mock) {
                responseBody = route.route.mock_response || {};
                this.logger.log(`[Mock-Mode] transit=${transitId} 命中 Mock 响应，阻断下游派发`);
                return { streamed: false, data: responseBody };
            }
            const breakerState = await this.circuitBreakerService.getState(route.route.id);
            if (breakerState === 'OPEN') {
                throw new ddt_exception_1.DdtException('TARGET_CIRCUIT_BROKEN');
            }
            transformedBody = await this.transformRequest(route, body);
            const dispatchResult = await this.dispatchToTarget(route, transformedBody, route.route.method, reply);
            if (dispatchResult.streamed) {
                streamed = true;
                responseBody = '[STREAM]';
                if (dispatchResult.errorCode) {
                    errorCode = dispatchResult.errorCode;
                    httpStatus = 500;
                }
                else {
                    await this.circuitBreakerService.recordSuccess(route.route.id);
                }
                return { streamed: true, data: null };
            }
            responseBody = dispatchResult.data;
            await this.circuitBreakerService.recordSuccess(route.route.id);
            const projectIdForBiz = route.route.project_id;
            await this.persistBusinessData(projectIdForBiz, body, responseBody).catch((err) => {
                this.logger.error(`[FLOW-05] 业务数据写入失败 project=${projectIdForBiz}: ${err?.message || err}`);
            });
            return { streamed: false, data: responseBody };
        }
        catch (error) {
            httpStatus = error instanceof ddt_exception_1.DdtException ? error.getStatus() : 500;
            const response = error instanceof ddt_exception_1.DdtException ? error.getResponse() : null;
            errorCode = response && typeof response === 'object' && 'error' in response
                ? response.error.code
                : null;
            if (route) {
                if (errorCode === 'TARGET_TIMEOUT' || errorCode === 'TARGET_SERVER_ERROR') {
                    await this.circuitBreakerService.recordFailure(route.route.id, errorCode === 'TARGET_TIMEOUT' ? 'TIMEOUT' : 'SERVER_ERROR');
                }
            }
            throw error;
        }
        finally {
            if (route) {
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
    async resolveRoute(transitId) {
        let cached = await this.routeService.getCachedRoute(transitId);
        if (cached) {
            return cached;
        }
        const route = await this.routeService.findById(transitId);
        if (!route) {
            return null;
        }
        const transformer = await this.transformerService.findByRouteId(route.id);
        let credentialInfo = null;
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
        const cacheData = {
            route,
            transformer,
            credential: credentialInfo,
        };
        await this.routeService.cacheRoute(route.id, cacheData);
        return cacheData;
    }
    async checkRateLimit(routeId, clientIp) {
        const allowed = await this.rateLimiterService.check(routeId, clientIp);
        if (!allowed) {
            throw new ddt_exception_1.DdtException('RESOURCE_EXHAUSTED');
        }
    }
    async handleAsync(route, body, clientIp) {
        const taskId = (0, uuid_1.v4)();
        await this.asyncQueue.add({
            taskId,
            route,
            body,
            clientIp,
        }, {
            removeOnComplete: true,
            removeOnFail: true,
        });
        return {
            success: true,
            data: {
                task_id: taskId,
                status: 'ACCEPTED',
            },
            error: null,
        };
    }
    async transformRequest(route, body) {
        if (!route.transformer) {
            return body;
        }
        return this.transformerService.transform(route.transformer, body);
    }
    async dispatchToTarget(route, body, method, reply) {
        if (!route.transformer) {
            throw new ddt_exception_1.DdtException('TARGET_SERVER_ERROR');
        }
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
        };
        if (route.credential) {
            if (route.credential.type === 'Bearer') {
                headers['Authorization'] = `Bearer ${route.credential.secret}`;
            }
            else if (route.credential.type === 'Basic') {
                headers['Authorization'] = `Basic ${route.credential.secret}`;
            }
        }
        let response;
        try {
            response = await (0, axios_1.default)({
                method: method.toLowerCase(),
                url: route.transformer.target_url,
                data: body,
                headers,
                timeout: route.route.timeout_ms,
                responseType: 'stream',
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    throw new ddt_exception_1.DdtException('TARGET_TIMEOUT');
                }
                if (error.response?.status && error.response.status >= 500) {
                    throw new ddt_exception_1.DdtException('TARGET_SERVER_ERROR');
                }
                throw new ddt_exception_1.DdtException('TARGET_SERVER_ERROR');
            }
            throw new ddt_exception_1.DdtException('TARGET_SERVER_ERROR');
        }
        const contentType = String(response.headers['content-type'] || '');
        const isSSE = contentType.includes('text/event-stream');
        if (isSSE) {
            return await this.pipeStreamToReply(route, response.data, reply);
        }
        const data = await this.collectStreamToJson(response.data);
        return { streamed: false, data };
    }
    pipeStreamToReply(route, stream, reply) {
        return new Promise((resolve) => {
            let resolved = false;
            const finish = (errorCode) => {
                if (resolved)
                    return;
                resolved = true;
                try {
                    if (!reply.raw.writableEnded) {
                        reply.raw.end();
                    }
                }
                catch {
                }
                if (errorCode) {
                    this.circuitBreakerService
                        .recordFailure(route.route.id, 'SERVER_ERROR')
                        .catch(() => { });
                }
                resolve({ streamed: true, data: null, errorCode });
            };
            reply.hijack();
            try {
                reply.raw.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                });
            }
            catch (err) {
                this.logger.error(`[SSE] writeHead 失败: ${err?.message || err}`);
                finish('TARGET_SERVER_ERROR');
                return;
            }
            stream.on('data', (chunk) => {
                if (reply.raw.writableEnded) {
                    stream.destroy();
                    return;
                }
                try {
                    reply.raw.write(chunk);
                }
                catch (err) {
                    this.logger.error(`[SSE] 写入客户端失败: ${err?.message || err}`);
                    stream.destroy();
                    finish('TARGET_SERVER_ERROR');
                }
            });
            stream.on('end', () => {
                this.logger.debug(`[SSE] 流式响应完成 route=${route.route.id}`);
                finish();
            });
            stream.on('error', (err) => {
                this.logger.error(`[SSE] 下游流错误 route=${route.route.id}: ${err?.message || err}`);
                finish('TARGET_SERVER_ERROR');
            });
            reply.raw.on('close', () => {
                if (!resolved) {
                    this.logger.warn(`[SSE] 客户端断开连接 route=${route.route.id}`);
                    stream.destroy();
                    finish();
                }
            });
        });
    }
    collectStreamToJson(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const text = buffer.toString('utf-8');
                if (!text) {
                    resolve(null);
                    return;
                }
                try {
                    resolve(JSON.parse(text));
                }
                catch {
                    resolve(text);
                }
            });
            stream.on('error', (err) => reject(err));
        });
    }
    async persistBusinessData(projectId, requestBody, responseBody) {
        const tables = await this.businessTableService.listByProject(projectId);
        if (!tables || tables.length === 0) {
            return;
        }
        const needAsync = tables.length >= this.ASYNC_BIZ_TABLE_THRESHOLD
            || tables.some(t => (t.fields?.length || 0) >= this.ASYNC_BIZ_FIELD_THRESHOLD);
        if (needAsync) {
            this.logger.warn(`[FLOW-05] project=${projectId} 业务表数=${tables.length} 触发异步降载阈值，本轮仍同步执行（TODO: 下沉 BullMQ）`);
        }
        for (const table of tables) {
            try {
                const row = {};
                for (const field of table.fields || []) {
                    if (!field.enabled)
                        continue;
                    let value = null;
                    if (field.source === 'request') {
                        value = this.extractField(requestBody, field.name);
                    }
                    else if (field.source === 'response') {
                        value = this.extractField(responseBody, field.name);
                    }
                    else if (field.source === 'system') {
                        continue;
                    }
                    if (!field.nullable && (value === null || value === undefined)) {
                        this.logger.warn(`[FLOW-05] table=${table.table_name} field=${field.name} 非空但抽取为空，跳过该表写入`);
                        row.__skipped = true;
                        break;
                    }
                    if (value !== null && value !== undefined) {
                        row[field.name] = value;
                    }
                }
                if (row.__skipped)
                    continue;
                delete row.__skipped;
                if (Object.keys(row).length > 0) {
                    await this.tableRowService.createRow(table.id, row);
                }
            }
            catch (err) {
                this.logger.error(`[FLOW-05] table=${table.table_name} 写入失败: ${err?.message || err}`);
            }
        }
    }
    extractField(obj, fieldPath) {
        if (!obj || typeof obj !== 'object')
            return null;
        const parts = fieldPath.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined)
                return null;
            current = current[part];
        }
        if (current === null || current === undefined)
            return null;
        if (typeof current === 'string' || typeof current === 'number' || typeof current === 'boolean') {
            return current;
        }
        return JSON.stringify(current);
    }
};
exports.GatewayService = GatewayService;
exports.GatewayService = GatewayService = GatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, bull_1.InjectQueue)('async-tasks')),
    __metadata("design:paramtypes", [route_service_1.RouteService,
        transformer_service_1.TransformerService,
        credential_service_1.CredentialService,
        rate_limiter_service_1.RateLimiterService,
        circuit_breaker_service_1.CircuitBreakerService,
        request_log_service_1.RequestLogService,
        business_table_service_1.BusinessTableService,
        table_row_service_1.TableRowService,
        config_service_1.ConfigService, Object])
], GatewayService);
//# sourceMappingURL=gateway.service.js.map