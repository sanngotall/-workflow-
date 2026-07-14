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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncWorker = void 0;
const bull_1 = require("@nestjs/bull");
const axios_1 = __importDefault(require("axios"));
const transformer_service_1 = require("../transformers/transformer.service");
const request_log_service_1 = require("../request-logs/request-log.service");
let AsyncWorker = class AsyncWorker {
    constructor(transformerService, requestLogService) {
        this.transformerService = transformerService;
        this.requestLogService = requestLogService;
    }
    async process(job) {
        const { taskId, route, body, clientIp } = job.data;
        const startTime = Date.now();
        try {
            let transformedBody = body;
            if (route.transformer) {
                transformedBody = await this.transformerService.transform(route.transformer, body);
            }
            const headers = {
                'Content-Type': 'application/json',
            };
            if (route.credential) {
                if (route.credential.type === 'Bearer') {
                    headers['Authorization'] = `Bearer ${route.credential.secret}`;
                }
                else if (route.credential.type === 'Basic') {
                    headers['Authorization'] = `Basic ${route.credential.secret}`;
                }
            }
            const response = await (0, axios_1.default)({
                method: route.route.method.toLowerCase(),
                url: route.transformer?.target_url || '',
                data: transformedBody,
                headers,
                timeout: route.route.timeout_ms,
            });
            await this.requestLogService.create({
                project_id: route.route.project_id,
                route_id: route.route.id,
                environment: route.route.environment,
                client_ip: clientIp,
                method: route.route.method,
                path: route.route.path,
                request_body_raw: JSON.stringify(body),
                transformed_body_raw: JSON.stringify(transformedBody),
                response_body_raw: JSON.stringify(response.data),
                http_status: response.status,
                latency_ms: Date.now() - startTime,
            });
        }
        catch (error) {
            const httpStatus = axios_1.default.isAxiosError(error) && error.response?.status
                ? error.response.status
                : 500;
            await this.requestLogService.create({
                project_id: route.route.project_id,
                route_id: route.route.id,
                environment: route.route.environment,
                client_ip: clientIp,
                method: route.route.method,
                path: route.route.path,
                request_body_raw: JSON.stringify(body),
                transformed_body_raw: JSON.stringify(null),
                response_body_raw: JSON.stringify(error),
                http_status: httpStatus,
                error_code: axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED'
                    ? 'TARGET_TIMEOUT'
                    : 'TARGET_SERVER_ERROR',
                latency_ms: Date.now() - startTime,
            });
        }
    }
};
exports.AsyncWorker = AsyncWorker;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AsyncWorker.prototype, "process", null);
exports.AsyncWorker = AsyncWorker = __decorate([
    (0, bull_1.Processor)('async-tasks'),
    __metadata("design:paramtypes", [transformer_service_1.TransformerService,
        request_log_service_1.RequestLogService])
], AsyncWorker);
//# sourceMappingURL=async-worker.service.js.map