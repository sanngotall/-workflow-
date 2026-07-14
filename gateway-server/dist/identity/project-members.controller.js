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
exports.ProjectMembersController = void 0;
const common_1 = require("@nestjs/common");
const project_members_service_1 = require("./project-members.service");
const project_members_dto_1 = require("./project-members.dto");
const decorators_1 = require("../common/decorators");
const current_user_decorator_1 = require("../common/current-user.decorator");
let ProjectMembersController = class ProjectMembersController {
    constructor(membersService) {
        this.membersService = membersService;
    }
    async list(projectId) {
        const data = await this.membersService.list(projectId);
        return { success: true, data, error: null };
    }
    async available(projectId, dto) {
        const data = await this.membersService.available(projectId, {
            keyword: dto.keyword,
            page: dto.page ? parseInt(dto.page, 10) : 1,
            pageSize: dto.pageSize ? parseInt(dto.pageSize, 10) : 20,
        });
        return { success: true, data, error: null };
    }
    async add(projectId, dto, operatorId) {
        const data = await this.membersService.add(projectId, dto, operatorId);
        return { success: true, data, error: null };
    }
    async updateRole(projectId, memberId, dto, operatorId) {
        await this.membersService.updateRole(projectId, memberId, dto, operatorId);
        return { success: true, data: null, error: null };
    }
    async remove(projectId, memberId, operatorId) {
        await this.membersService.remove(projectId, memberId, operatorId);
        return { success: true, data: null, error: null };
    }
};
exports.ProjectMembersController = ProjectMembersController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermission)('member:list'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectMembersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, decorators_1.RequirePermission)('member:create'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_members_dto_1.SearchAvailableUsersDto]),
    __metadata("design:returntype", Promise)
], ProjectMembersController.prototype, "available", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequirePermission)('member:create'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_members_dto_1.AddMembersDto, String]),
    __metadata("design:returntype", Promise)
], ProjectMembersController.prototype, "add", null);
__decorate([
    (0, common_1.Put)(':memberId'),
    (0, decorators_1.RequirePermission)('member:update'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('memberId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_members_dto_1.UpdateMemberRoleDto, String]),
    __metadata("design:returntype", Promise)
], ProjectMembersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)(':memberId'),
    (0, decorators_1.RequirePermission)('member:delete'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('memberId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectMembersController.prototype, "remove", null);
exports.ProjectMembersController = ProjectMembersController = __decorate([
    (0, common_1.Controller)('projects/:projectId/members'),
    __metadata("design:paramtypes", [project_members_service_1.ProjectMembersService])
], ProjectMembersController);
//# sourceMappingURL=project-members.controller.js.map