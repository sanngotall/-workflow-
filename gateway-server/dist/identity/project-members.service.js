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
var ProjectMembersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMembersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_member_entity_1 = require("./project-member.entity");
const user_entity_1 = require("./user.entity");
const ddt_exception_1 = require("../common/ddt-exception");
const roles_1 = require("./roles");
let ProjectMembersService = ProjectMembersService_1 = class ProjectMembersService {
    constructor(memberRepo, userRepo) {
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(ProjectMembersService_1.name);
    }
    async list(projectId) {
        const members = await this.memberRepo.find({
            where: { project_id: projectId },
            relations: ['user'],
            order: { joined_at: 'ASC' },
        });
        return {
            items: members.map((m) => ({
                id: m.id,
                user_id: m.user_id,
                username: m.user?.username ?? '',
                name: m.user?.name ?? '',
                avatar_url: m.user?.avatar_url ?? null,
                role: m.role,
                joined_at: m.joined_at,
            })),
            total: members.length,
        };
    }
    async add(projectId, dto, operatorId) {
        const added = [];
        const skipped = [];
        const existing = await this.memberRepo.find({
            where: { project_id: projectId },
        });
        const existingUserIds = new Set(existing.map((m) => m.user_id));
        for (const item of dto.members) {
            if (!(0, roles_1.isValidProjectRole)(item.role)) {
                skipped.push({ user_id: item.user_id, reason: '角色值非法' });
                continue;
            }
            if (existingUserIds.has(item.user_id)) {
                skipped.push({ user_id: item.user_id, reason: '已是项目成员' });
                continue;
            }
            const user = await this.userRepo.findOne({
                where: { id: item.user_id },
            });
            if (!user || user.deleted_at) {
                skipped.push({ user_id: item.user_id, reason: '用户不存在' });
                continue;
            }
            const m = this.memberRepo.create({
                project_id: projectId,
                user_id: item.user_id,
                role: item.role,
            });
            await this.memberRepo.save(m);
            existingUserIds.add(item.user_id);
            added.push({ user_id: item.user_id, role: item.role });
        }
        this.logger.log(`[Members] 项目 ${projectId} 批量添加成员：成功 ${added.length}，跳过 ${skipped.length}，操作者=${operatorId}`);
        return { added, skipped };
    }
    async updateRole(projectId, memberId, dto, operatorId) {
        if (!(0, roles_1.isValidProjectRole)(dto.role)) {
            throw new ddt_exception_1.DdtException('ROLE_INVALID');
        }
        const member = await this.memberRepo.findOne({
            where: { id: memberId, project_id: projectId },
        });
        if (!member) {
            throw new ddt_exception_1.DdtException('MEMBER_NOT_FOUND');
        }
        if (member.role === roles_1.ProjectRoleEnum.ADMIN) {
            throw new ddt_exception_1.DdtException('ADMIN_IMMUTABLE', '项目 admin 成员不可被修改角色，请先指派新 admin 再降级旧 admin');
        }
        member.role = dto.role;
        await this.memberRepo.save(member);
        this.logger.log(`[Members] 项目 ${projectId} 成员 ${memberId} 角色变更为 ${dto.role}，操作者=${operatorId}`);
    }
    async remove(projectId, memberId, operatorId) {
        const member = await this.memberRepo.findOne({
            where: { id: memberId, project_id: projectId },
        });
        if (!member) {
            throw new ddt_exception_1.DdtException('MEMBER_NOT_FOUND');
        }
        if (member.role === roles_1.ProjectRoleEnum.ADMIN) {
            throw new ddt_exception_1.DdtException('ADMIN_IMMUTABLE', '项目 admin 成员不可被移除，请先指派新 admin 再移除旧 admin');
        }
        await this.memberRepo.remove(member);
        this.logger.log(`[Members] 项目 ${projectId} 成员 ${memberId} 已被移除，操作者=${operatorId}`);
    }
    async available(projectId, params) {
        const page = Math.max(1, params.page || 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
        const existing = await this.memberRepo.find({
            where: { project_id: projectId },
            select: ['user_id'],
        });
        const existingIds = existing.map((m) => m.user_id);
        const qb = this.userRepo
            .createQueryBuilder('u')
            .where('u.deleted_at IS NULL')
            .andWhere('u.status = :status', { status: 'active' });
        if (existingIds.length > 0) {
            qb.andWhere('u.id NOT IN (:...ids)', { ids: existingIds });
        }
        if (params.keyword) {
            qb.andWhere('(u.username ILIKE :kw OR u.email ILIKE :kw OR u.name ILIKE :kw)', { kw: `%${params.keyword}%` });
        }
        qb.orderBy('u.username', 'ASC')
            .skip((page - 1) * pageSize)
            .take(pageSize);
        const [users, total] = await qb.getManyAndCount();
        return {
            items: users.map((u) => ({
                id: u.id,
                username: u.username,
                email: u.email,
                name: u.name,
                avatar_url: u.avatar_url ?? null,
            })),
            total,
            page,
            pageSize,
        };
    }
    async getMemberRole(projectId, userId) {
        const m = await this.memberRepo.findOne({
            where: { project_id: projectId, user_id: userId },
        });
        return m ? m.role : null;
    }
};
exports.ProjectMembersService = ProjectMembersService;
exports.ProjectMembersService = ProjectMembersService = ProjectMembersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_member_entity_1.ProjectMemberEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectMembersService);
//# sourceMappingURL=project-members.service.js.map