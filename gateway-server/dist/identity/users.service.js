"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const global_role_entity_1 = require("./global-role.entity");
const auth_service_1 = require("../auth/auth.service");
const ddt_exception_1 = require("../common/ddt-exception");
const roles_1 = require("./roles");
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepo, globalRoleRepo, authService) {
        this.userRepo = userRepo;
        this.globalRoleRepo = globalRoleRepo;
        this.authService = authService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async list(params) {
        const page = Math.max(1, params.page || 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
        const qb = this.userRepo
            .createQueryBuilder('u')
            .where('u.deleted_at IS NULL');
        if (params.keyword) {
            qb.andWhere('(u.username ILIKE :kw OR u.email ILIKE :kw OR u.name ILIKE :kw)', { kw: `%${params.keyword}%` });
        }
        if (params.status) {
            qb.andWhere('u.status = :status', { status: params.status });
        }
        qb.orderBy('u.created_at', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);
        const [users, total] = await qb.getManyAndCount();
        const items = await Promise.all(users.map(async (u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            name: u.name,
            avatar_url: u.avatar_url ?? null,
            phone: u.phone ?? null,
            status: u.status,
            last_login_at: u.last_login_at,
            created_at: u.created_at,
            global_roles: await this.loadGlobalRoles(u.id),
        })));
        return { items, total, page, pageSize };
    }
    async findById(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url ?? null,
            phone: user.phone ?? null,
            status: user.status,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            global_roles: await this.loadGlobalRoles(user.id),
        };
    }
    async create(dto, creatorId) {
        const existsUsername = await this.userRepo.findOne({
            where: { username: dto.username },
        });
        if (existsUsername) {
            throw new ddt_exception_1.DdtException('USERNAME_EXISTS');
        }
        const existsEmail = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existsEmail) {
            throw new ddt_exception_1.DdtException('EMAIL_EXISTS');
        }
        const passwordHash = await this.authService.hashPassword(dto.password);
        const user = this.userRepo.create({
            username: dto.username,
            email: dto.email,
            password_hash: passwordHash,
            name: dto.name,
            avatar_url: dto.avatar_url ?? null,
            phone: dto.phone ?? null,
            status: roles_1.UserStatusEnum.ACTIVE,
        });
        const saved = await this.userRepo.save(user);
        const globalRoles = [];
        if (dto.global_role) {
            if (!(0, roles_1.isValidGlobalRole)(dto.global_role)) {
                throw new ddt_exception_1.DdtException('ROLE_INVALID');
            }
            const gr = this.globalRoleRepo.create({
                user_id: saved.id,
                role: dto.global_role,
            });
            await this.globalRoleRepo.save(gr);
            globalRoles.push(dto.global_role);
        }
        this.logger.log(`[Users] 用户 ${dto.username} (id=${saved.id}) 由 ${creatorId} 创建，全局角色=${globalRoles.length ? globalRoles.join(',') : '无'}`);
        return {
            id: saved.id,
            username: saved.username,
            email: saved.email,
            name: saved.name,
            status: saved.status,
            global_roles: globalRoles,
        };
    }
    async update(id, dto, operatorId, isSelf) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        if (isSelf) {
            if (dto.name !== undefined)
                user.name = dto.name;
            if (dto.avatar_url !== undefined)
                user.avatar_url = dto.avatar_url;
            if (dto.phone !== undefined)
                user.phone = dto.phone;
        }
        else {
            if (dto.name !== undefined)
                user.name = dto.name;
            if (dto.avatar_url !== undefined)
                user.avatar_url = dto.avatar_url;
            if (dto.phone !== undefined)
                user.phone = dto.phone;
        }
        await this.userRepo.save(user);
        this.logger.log(`[Users] 用户 ${id} 信息已更新，操作者=${operatorId}`);
    }
    async updateStatus(id, dto, operatorId, operatorGlobalRoles) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        const targetRoles = await this.loadGlobalRoles(id);
        if (targetRoles.includes(roles_1.GlobalRoleEnum.SUPER_ADMIN) &&
            !operatorGlobalRoles.includes(roles_1.GlobalRoleEnum.SUPER_ADMIN)) {
            throw new ddt_exception_1.DdtException('FORBIDDEN', '不可修改超级管理员状态');
        }
        user.status = dto.status;
        await this.userRepo.save(user);
        this.logger.log(`[Users] 用户 ${id} 状态变更为 ${dto.status}，操作者=${operatorId}`);
    }
    async changePassword(userId, dto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        const ok = await (await Promise.resolve().then(() => __importStar(require('bcrypt')))).compare(dto.old_password, user.password_hash);
        if (!ok) {
            throw new ddt_exception_1.DdtException('INVALID_CREDENTIALS', '旧密码不正确');
        }
        if (dto.old_password === dto.new_password) {
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '新密码不能与旧密码相同');
        }
        user.password_hash = await this.authService.hashPassword(dto.new_password);
        await this.userRepo.save(user);
        this.logger.log(`[Users] 用户 ${userId} 已自行修改密码`);
    }
    async adminResetPassword(targetUserId, dto, operatorId) {
        const user = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        user.password_hash = await this.authService.hashPassword(dto.new_password);
        await this.userRepo.save(user);
        this.logger.log(`[Users] 用户 ${targetUserId} 密码已被管理员 ${operatorId} 重置`);
    }
    async softDelete(id, operatorId) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        const targetRoles = await this.loadGlobalRoles(id);
        if (targetRoles.includes(roles_1.GlobalRoleEnum.SUPER_ADMIN)) {
            throw new ddt_exception_1.DdtException('FORBIDDEN', '不可删除超级管理员账号');
        }
        user.deleted_at = new Date();
        user.status = roles_1.UserStatusEnum.DISABLED;
        await this.userRepo.save(user);
        this.logger.log(`[Users] 用户 ${id} 已被软删除，操作者=${operatorId}`);
    }
    async loadGlobalRoles(userId) {
        const roles = await this.globalRoleRepo.find({ where: { user_id: userId } });
        return roles.map((r) => r.role);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(global_role_entity_1.GlobalRoleEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        auth_service_1.AuthService])
], UsersService);
//# sourceMappingURL=users.service.js.map