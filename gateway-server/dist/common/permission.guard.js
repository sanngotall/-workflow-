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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const decorators_1 = require("./decorators");
const roles_1 = require("../identity/roles");
const ddt_exception_1 = require("./ddt-exception");
const project_members_service_1 = require("../identity/project-members.service");
let PermissionGuard = class PermissionGuard {
    constructor(reflector, membersService) {
        this.reflector = reflector;
        this.membersService = membersService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(decorators_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.userId) {
            throw new ddt_exception_1.DdtException('UNAUTHENTICATED');
        }
        const userGlobalRoles = (user.globalRoles || []);
        const projectIdParamName = this.reflector.getAllAndOverride(decorators_1.PROJECT_ID_PARAM_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || 'projectId';
        const projectId = request.params?.[projectIdParamName];
        let userProjectRole = null;
        if (projectId) {
            userProjectRole = await this.membersService.getMemberRole(projectId, user.userId);
        }
        const requiredGlobalRoles = this.reflector.getAllAndOverride(decorators_1.GLOBAL_ROLE_KEY, [context.getHandler(), context.getClass()]);
        if (requiredGlobalRoles && requiredGlobalRoles.length > 0) {
            if (userGlobalRoles.includes('super_admin')) {
                return true;
            }
            const matched = requiredGlobalRoles.some((r) => userGlobalRoles.includes(r));
            if (!matched) {
                throw new ddt_exception_1.DdtException('FORBIDDEN');
            }
            return true;
        }
        const selfOrPermission = this.reflector.getAllAndOverride(decorators_1.SELF_OR_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        if (selfOrPermission) {
            const targetId = request.params?.['id'];
            if (targetId && targetId === user.userId) {
                return true;
            }
            if (!(0, roles_1.hasPermission)(userGlobalRoles, userProjectRole, selfOrPermission)) {
                throw new ddt_exception_1.DdtException('FORBIDDEN');
            }
            return true;
        }
        const permission = this.reflector.getAllAndOverride(decorators_1.PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (permission) {
            if (!(0, roles_1.hasPermission)(userGlobalRoles, userProjectRole, permission)) {
                throw new ddt_exception_1.DdtException('FORBIDDEN');
            }
            return true;
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        project_members_service_1.ProjectMembersService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map