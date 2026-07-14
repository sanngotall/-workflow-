import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { ProjectMemberEntity } from './project-member.entity';
import { UserEntity } from './user.entity';
import { DdtException } from '../common/ddt-exception';
import {
  ProjectRole,
  ProjectRoleEnum,
  isValidProjectRole,
} from './roles';
import {
  AddMembersDto,
  UpdateMemberRoleDto,
} from './project-members.dto';

/**
 * 项目成员管理服务（对齐 SPEC-05 §3.1 / §6.3）
 *
 * 强约束（INVARIANT-05/06/07）：
 * - INVARIANT-05 Admin-Immunity：admin 成员不可被修改或移除（需走两阶段事务）
 * - INVARIANT-06 Last-Admin-Lock：项目内最后一个 admin 不允许被移除或降级
 * - INVARIANT-07 Backend-Enforced：所有权限校验后端强制执行
 */
@Injectable()
export class ProjectMembersService {
  private readonly logger = new Logger(ProjectMembersService.name);

  constructor(
    @InjectRepository(ProjectMemberEntity)
    private readonly memberRepo: Repository<ProjectMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /** 获取项目成员列表 */
  async list(projectId: string): Promise<{
    items: Array<{
      id: string;
      user_id: string;
      username: string;
      name: string;
      avatar_url: string | null;
      role: string;
      joined_at: Date;
    }>;
    total: number;
  }> {
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

  /**
   * 批量添加成员（仅 project admin 或 super_admin）
   * 若用户已是成员，跳过并返回跳过列表
   */
  async add(
    projectId: string,
    dto: AddMembersDto,
    operatorId: string,
  ): Promise<{
    added: Array<{ user_id: string; role: string }>;
    skipped: Array<{ user_id: string; reason: string }>;
  }> {
    const added: Array<{ user_id: string; role: string }> = [];
    const skipped: Array<{ user_id: string; reason: string }> = [];

    // 查询已是成员的用户
    const existing = await this.memberRepo.find({
      where: { project_id: projectId },
    });
    const existingUserIds = new Set(existing.map((m) => m.user_id));

    for (const item of dto.members) {
      if (!isValidProjectRole(item.role)) {
        skipped.push({ user_id: item.user_id, reason: '角色值非法' });
        continue;
      }
      if (existingUserIds.has(item.user_id)) {
        skipped.push({ user_id: item.user_id, reason: '已是项目成员' });
        continue;
      }
      // 校验用户存在且未软删除
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
        role: item.role as ProjectRole,
      });
      await this.memberRepo.save(m);
      existingUserIds.add(item.user_id);
      added.push({ user_id: item.user_id, role: item.role });
    }

    this.logger.log(
      `[Members] 项目 ${projectId} 批量添加成员：成功 ${added.length}，跳过 ${skipped.length}，操作者=${operatorId}`,
    );
    return { added, skipped };
  }

  /**
   * 修改成员角色（仅 project admin 或 super_admin）
   * - INVARIANT-05：admin 角色不可被修改（包括降级 admin 自己）
   * - INVARIANT-06：若该成员是项目最后一个 admin 且新角色非 admin，禁止降级
   */
  async updateRole(
    projectId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    operatorId: string,
  ): Promise<void> {
    if (!isValidProjectRole(dto.role)) {
      throw new DdtException('ROLE_INVALID');
    }

    const member = await this.memberRepo.findOne({
      where: { id: memberId, project_id: projectId },
    });
    if (!member) {
      throw new DdtException('MEMBER_NOT_FOUND');
    }

    // INVARIANT-05：admin 角色不可被修改
    if (member.role === ProjectRoleEnum.ADMIN) {
      throw new DdtException(
        'ADMIN_IMMUTABLE',
        '项目 admin 成员不可被修改角色，请先指派新 admin 再降级旧 admin',
      );
    }

    // INVARIANT-06：若降级到非 admin，无需检查 last-admin（因为该成员本就不是 admin）
    // 若升级到 admin，无需检查 last-admin
    member.role = dto.role as ProjectRole;
    await this.memberRepo.save(member);
    this.logger.log(
      `[Members] 项目 ${projectId} 成员 ${memberId} 角色变更为 ${dto.role}，操作者=${operatorId}`,
    );
  }

  /**
   * 移除成员（仅 project admin 或 super_admin）
   * - INVARIANT-05：admin 成员不可被移除
   * - INVARIANT-06：若是最后一个 admin，禁止移除（但 admin 不可移除已经覆盖此情况）
   */
  async remove(
    projectId: string,
    memberId: string,
    operatorId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, project_id: projectId },
    });
    if (!member) {
      throw new DdtException('MEMBER_NOT_FOUND');
    }

    // INVARIANT-05：admin 角色不可被移除
    if (member.role === ProjectRoleEnum.ADMIN) {
      throw new DdtException(
        'ADMIN_IMMUTABLE',
        '项目 admin 成员不可被移除，请先指派新 admin 再移除旧 admin',
      );
    }

    await this.memberRepo.remove(member);
    this.logger.log(
      `[Members] 项目 ${projectId} 成员 ${memberId} 已被移除，操作者=${operatorId}`,
    );
  }

  /**
   * 可添加用户列表（排除已加入成员）
   */
  async available(
    projectId: string,
    params: { keyword?: string; page?: number; pageSize?: number },
  ): Promise<{
    items: Array<{
      id: string;
      username: string;
      email: string;
      name: string;
      avatar_url: string | null;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));

    // 查询已加入的用户 ID
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
      qb.andWhere(
        '(u.username ILIKE :kw OR u.email ILIKE :kw OR u.name ILIKE :kw)',
        { kw: `%${params.keyword}%` },
      );
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

  /**
   * 查询用户在项目中的角色（供 PermissionGuard 调用）
   */
  async getMemberRole(
    projectId: string,
    userId: string,
  ): Promise<ProjectRole | null> {
    const m = await this.memberRepo.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    return m ? (m.role as ProjectRole) : null;
  }
}
