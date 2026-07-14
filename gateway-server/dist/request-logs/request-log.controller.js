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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLogController = void 0;
const common_1 = require("@nestjs/common");
const request_log_service_1 = require("./request-log.service");
let RequestLogController = class RequestLogController {
    constructor(requestLogService) {
        this.requestLogService = requestLogService;
    }
    async listLogs(projectId, routeId, method, httpStatus, errorCode, limit, offset) {
        const result = await this.requestLogService.listLogs({
            projectId,
            routeId,
            method,
            httpStatus: httpStatus ? parseInt(httpStatus, 10) : undefined,
            errorCode,
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return {
            success: true,
            data: {
                rows: result.rows,
                total: result.total,
                limit: limit ? parseInt(limit, 10) : 50,
                offset: offset ? parseInt(offset, 10) : 0,
            },
            error: null,
        };
    }
    async getStats(projectId, sinceHours) {
        const stats = await this.requestLogService.getStats(projectId, sinceHours ? parseInt(sinceHours, 10) : 24);
        return {
            success: true,
            data: stats,
            error: null,
        };
    }
};
exports.RequestLogController = RequestLogController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('routeId')),
    __param(2, (0, common_1.Query)('method')),
    __param(3, (0, common_1.Query)('httpStatus')),
    __param(4, (0, common_1.Query)('errorCode')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RequestLogController.prototype, "listLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('sinceHours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequestLogController.prototype, "getStats", null);
exports.RequestLogController = RequestLogController = __decorate([
    (0, common_1.Controller)('api/admin/v1/projects/:projectId/logs'),
    __metadata("design:paramtypes", [request_log_service_1.RequestLogService])
], RequestLogController);
//# sourceMappingURL=request-log.controller.js.map