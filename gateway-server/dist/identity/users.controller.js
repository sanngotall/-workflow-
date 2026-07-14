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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_dto_1 = require("./users.dto");
const decorators_1 = require("../common/decorators");
const current_user_decorator_1 = require("../common/current-user.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async list(keyword, status, page, pageSize) {
        const data = await this.usersService.list({
            keyword,
            status,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
        return { success: true, data, error: null };
    }
    async findById(id) {
        const data = await this.usersService.findById(id);
        return { success: true, data, error: null };
    }
    async create(dto, creatorId) {
        const data = await this.usersService.create(dto, creatorId);
        return { success: true, data, error: null };
    }
    async update(id, dto, operatorId) {
        const isSelf = id === operatorId;
        await this.usersService.update(id, dto, operatorId, isSelf);
        return { success: true, data: null, error: null };
    }
    async updateStatus(id, dto, operatorId, operatorGlobalRoles) {
        await this.usersService.updateStatus(id, dto, operatorId, operatorGlobalRoles);
        return { success: true, data: null, error: null };
    }
    async changePassword(id, dto, userId) {
        if (id !== userId) {
            return {
                success: false,
                data: null,
                error: { code: 'FORBIDDEN', message: '只能修改自己的密码' },
            };
        }
        await this.usersService.changePassword(userId, dto);
        return { success: true, data: null, error: null };
    }
    async adminResetPassword(id, dto, operatorId) {
        await this.usersService.adminResetPassword(id, dto, operatorId);
        return { success: true, data: null, error: null };
    }
    async softDelete(id, operatorId) {
        await this.usersService.softDelete(id, operatorId);
        return { success: true, data: null, error: null };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequireGlobalRole)('super_admin', 'admin'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.SelfOrPermission)('user:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequireGlobalRole)('super_admin', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.CreateUserDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, decorators_1.SelfOrPermission)('user:write'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, decorators_1.RequireGlobalRole)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('globalRoles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserStatusDto, String, Array]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.ChangePasswordDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)(':id/password/admin'),
    (0, decorators_1.RequireGlobalRole)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.AdminResetPasswordDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "adminResetPassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.RequireGlobalRole)('super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "softDelete", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map