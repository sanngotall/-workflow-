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
exports.CredentialAuditLogsController = exports.ConfigSnapshotsController = exports.CreateSnapshotDto = void 0;
const common_1 = require("@nestjs/common");
const config_snapshots_service_1 = require("./config-snapshots.service");
const decorators_1 = require("../common/decorators");
const current_user_decorator_1 = require("../common/current-user.decorator");
const class_validator_1 = require("class-validator");
class CreateSnapshotDto {
}
exports.CreateSnapshotDto = CreateSnapshotDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateSnapshotDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateSnapshotDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSnapshotDto.prototype, "snapshot_json", void 0);
let ConfigSnapshotsController = class ConfigSnapshotsController {
    constructor(snapshotsService) {
        this.snapshotsService = snapshotsService;
    }
    async list(projectId) {
        const data = await this.snapshotsService.list(projectId);
        return { success: true, data, error: null };
    }
    async create(projectId, dto, creatorId) {
        const data = await this.snapshotsService.create(projectId, dto.version, dto.description ?? null, dto.snapshot_json ?? { _placeholder: true }, creatorId);
        return { success: true, data, error: null };
    }
};
exports.ConfigSnapshotsController = ConfigSnapshotsController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermission)('snapshot:export'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigSnapshotsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequirePermission)('snapshot:export'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateSnapshotDto, String]),
    __metadata("design:returntype", Promise)
], ConfigSnapshotsController.prototype, "create", null);
exports.ConfigSnapshotsController = ConfigSnapshotsController = __decorate([
    (0, common_1.Controller)('projects/:projectId/snapshots'),
    __metadata("design:paramtypes", [config_snapshots_service_1.ConfigSnapshotsService])
], ConfigSnapshotsController);
let CredentialAuditLogsController = class CredentialAuditLogsController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async list(credential_id, user_id, action, page, pageSize) {
        const data = await this.auditService.list({
            credential_id,
            user_id,
            action,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
        return { success: true, data, error: null };
    }
};
exports.CredentialAuditLogsController = CredentialAuditLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequireGlobalRole)('super_admin', 'admin'),
    __param(0, (0, common_1.Query)('credential_id')),
    __param(1, (0, common_1.Query)('user_id')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CredentialAuditLogsController.prototype, "list", null);
exports.CredentialAuditLogsController = CredentialAuditLogsController = __decorate([
    (0, common_1.Controller)('audit-logs/credentials'),
    __metadata("design:paramtypes", [config_snapshots_service_1.CredentialAuditLogsService])
], CredentialAuditLogsController);
//# sourceMappingURL=config-snapshots.controller.js.map