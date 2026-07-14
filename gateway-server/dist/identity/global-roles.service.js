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
var GlobalRolesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const global_role_entity_1 = require("./global-role.entity");
const user_entity_1 = require("./user.entity");
const ddt_exception_1 = require("../common/ddt-exception");
const roles_1 = require("./roles");
let GlobalRolesService = GlobalRolesService_1 = class GlobalRolesService {
    constructor(roleRepo, userRepo) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(GlobalRolesService_1.name);
    }
    async listByUser(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        const roles = await this.roleRepo.find({ where: { user_id: userId } });
        return {
            user_id: userId,
            roles: roles.map((r) => r.role),
        };
    }
    async grant(userId, role, operatorId) {
        if (!(0, roles_1.isValidGlobalRole)(role)) {
            throw new ddt_exception_1.DdtException('ROLE_INVALID');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        const existing = await this.roleRepo.findOne({
            where: { user_id: userId, role: role },
        });
        if (existing) {
            return {
                id: existing.id,
                user_id: existing.user_id,
                role: existing.role,
            };
        }
        const gr = this.roleRepo.create({
            user_id: userId,
            role: role,
        });
        const saved = await this.roleRepo.save(gr);
        this.logger.log(`[GlobalRoles] 用户 ${userId} 被授予全局角色 ${role}，操作者=${operatorId}`);
        return { id: saved.id, user_id: saved.user_id, role: saved.role };
    }
    async revoke(userId, role, operatorId) {
        if (!(0, roles_1.isValidGlobalRole)(role)) {
            throw new ddt_exception_1.DdtException('ROLE_INVALID');
        }
        const gr = await this.roleRepo.findOne({
            where: { user_id: userId, role: role },
        });
        if (!gr) {
            throw new ddt_exception_1.DdtException('FORBIDDEN', '该用户未持有此全局角色');
        }
        if (role === 'super_admin') {
            const superAdminCount = await this.roleRepo.count({
                where: { role: 'super_admin' },
            });
            if (superAdminCount <= 1) {
                throw new ddt_exception_1.DdtException('LAST_ADMIN_LOCKED', '不可撤销最后一个 super_admin 角色，系统必须保留至少一个超级管理员');
            }
        }
        await this.roleRepo.remove(gr);
        this.logger.log(`[GlobalRoles] 用户 ${userId} 的全局角色 ${role} 已被撤销，操作者=${operatorId}`);
    }
};
exports.GlobalRolesService = GlobalRolesService;
exports.GlobalRolesService = GlobalRolesService = GlobalRolesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(global_role_entity_1.GlobalRoleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GlobalRolesService);
//# sourceMappingURL=global-roles.service.js.map