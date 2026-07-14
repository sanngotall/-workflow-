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
exports.GlobalRolesController = exports.GrantRoleDto = void 0;
const common_1 = require("@nestjs/common");
const global_roles_service_1 = require("./global-roles.service");
const decorators_1 = require("../common/decorators");
const current_user_decorator_1 = require("../common/current-user.decorator");
const class_validator_1 = require("class-validator");
class GrantRoleDto {
}
exports.GrantRoleDto = GrantRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['super_admin', 'admin']),
    __metadata("design:type", String)
], GrantRoleDto.prototype, "role", void 0);
let GlobalRolesController = class GlobalRolesController {
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    async list(id) {
        const data = await this.rolesService.listByUser(id);
        return { success: true, data, error: null };
    }
    async grant(id, dto, operatorId) {
        const data = await this.rolesService.grant(id, dto.role, operatorId);
        return { success: true, data, error: null };
    }
    async revoke(id, role, operatorId) {
        await this.rolesService.revoke(id, role, operatorId);
        return { success: true, data: null, error: null };
    }
};
exports.GlobalRolesController = GlobalRolesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GlobalRolesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequireGlobalRole)('super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GrantRoleDto, String]),
    __metadata("design:returntype", Promise)
], GlobalRolesController.prototype, "grant", null);
__decorate([
    (0, common_1.Delete)(':role'),
    (0, decorators_1.RequireGlobalRole)('super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('role')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GlobalRolesController.prototype, "revoke", null);
exports.GlobalRolesController = GlobalRolesController = __decorate([
    (0, common_1.Controller)('users/:id/roles'),
    __metadata("design:paramtypes", [global_roles_service_1.GlobalRolesService])
], GlobalRolesController);
//# sourceMappingURL=global-roles.controller.js.map