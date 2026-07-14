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
exports.WxConfigController = void 0;
const common_1 = require("@nestjs/common");
const wx_config_service_1 = require("./wx-config.service");
let WxConfigController = class WxConfigController {
    constructor(wxConfigService) {
        this.wxConfigService = wxConfigService;
    }
    async get(projectId) {
        const config = await this.wxConfigService.findByProjectId(projectId);
        if (!config) {
            return {
                success: true,
                data: null,
                error: null,
            };
        }
        return {
            success: true,
            data: {
                id: config.id,
                app_id: config.app_id,
                has_app_secret: true,
                has_jwt_secret: true,
                created_at: config.created_at,
                updated_at: config.updated_at,
            },
            error: null,
        };
    }
    async upsert(projectId, body) {
        if (!body.app_id || !body.app_secret || !body.jwt_secret) {
            throw new common_1.BadRequestException('app_id、app_secret、jwt_secret 均为必填');
        }
        const config = await this.wxConfigService.upsert(projectId, body.app_id, body.app_secret, body.jwt_secret);
        return {
            success: true,
            data: {
                id: config.id,
                app_id: config.app_id,
                has_app_secret: true,
                has_jwt_secret: true,
                created_at: config.created_at,
                updated_at: config.updated_at,
            },
            error: null,
        };
    }
    async delete(projectId) {
        const deleted = await this.wxConfigService.deleteByProjectId(projectId);
        return {
            success: true,
            data: { deleted },
            error: null,
        };
    }
};
exports.WxConfigController = WxConfigController;
__decorate([
    (0, common_1.Get)(':projectId/wx-config'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WxConfigController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':projectId/wx-config'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WxConfigController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':projectId/wx-config'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WxConfigController.prototype, "delete", null);
exports.WxConfigController = WxConfigController = __decorate([
    (0, common_1.Controller)('api/admin/v1/projects'),
    __metadata("design:paramtypes", [wx_config_service_1.WxConfigService])
], WxConfigController);
//# sourceMappingURL=wx-config.controller.js.map