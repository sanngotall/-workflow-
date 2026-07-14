import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { GlobalRoleEntity } from './global-role.entity';
import { AuthService } from '../auth/auth.service';
import { DdtException } from '../common/ddt-exception';
import {
  GlobalRole,
  GlobalRoleEnum,
  UserStatus,
  UserStatusEnum,
  isValidGlobalRole,
} from './roles';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  ChangePasswordDto,
  AdminResetPasswordDto,
} from './users.dto';

/**
 * 用户管理服务（对齐 SPEC-05 §3.2 / §6.2）
 *
 * 关键规则：
 * 1. 其它用户账号只能由管理员（super_admin / admin）创建
 * 2. 普通用户只能修改自己的密码和个人信息（name/avatar_url/phone）
 * 3. 管理员可重置任意用户密码、修改状态、授予全局角色
 * 4. 不可删除用户（仅软删除，保留 deleted_at 审计痕迹）
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(GlobalRoleEntity)
    private readonly globalRoleRepo: Repository<GlobalRoleEntity>,
    private readonly authService: AuthService,
  ) {}

  /**
   * 用户列表（分页 + 搜索，仅 super_admin/admin 可调用）
   */
  async list(params: {
    keyword?: string;
    status?: UserStatus;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: Array<{
      id: string;
      username: string;
      email: string;
      name: string;
      avatar_url: string | null;
      phone: string | null;
      status: string;
      last_login_at: Date | null;
      created_at: Date;
      global_roles: GlobalRole[];
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.deleted_at IS NULL');

    if (params.keyword) {
      qb.andWhere(
        '(u.username ILIKE :kw OR u.email ILIKE :kw OR u.name ILIKE :kw)',
        { kw: `%${params.keyword}%` },
      );
    }
    if (params.status) {
      qb.andWhere('u.status = :status', { status: params.status });
    }
    qb.orderBy('u.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [users, total] = await qb.getManyAndCount();
    const items = await Promise.all(
      users.map(async (u) => ({
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
      })),
    );
    return { items, total, page, pageSize };
  }

  /** 用户详情（super_admin/admin 或本人可访问） */
  async findById(id: string): Promise<{
    id: string;
    username: string;
    email: string;
    name: string;
    avatar_url: string | null;
    phone: string | null;
    status: string;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
    global_roles: GlobalRole[];
  }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
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

  /**
   * 创建用户（仅 super_admin/admin 可调用）
   * 创建后可选授予全局角色
   */
  async create(dto: CreateUserDto, creatorId: string): Promise<{
    id: string;
    username: string;
    email: string;
    name: string;
    status: string;
    global_roles: GlobalRole[];
  }> {
    // 校验用户名/邮箱唯一性
    const existsUsername = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existsUsername) {
      throw new DdtException('USERNAME_EXISTS');
    }
    const existsEmail = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existsEmail) {
      throw new DdtException('EMAIL_EXISTS');
    }

    // 哈希密码
    const passwordHash = await this.authService.hashPassword(dto.password);

    // 创建用户
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password_hash: passwordHash,
      name: dto.name,
      avatar_url: dto.avatar_url ?? null,
      phone: dto.phone ?? null,
      status: UserStatusEnum.ACTIVE,
    });
    const saved = await this.userRepo.save(user);

    // 授予全局角色（若提供）
    const globalRoles: GlobalRole[] = [];
    if (dto.global_role) {
      if (!isValidGlobalRole(dto.global_role)) {
        throw new DdtException('ROLE_INVALID');
      }
      const gr = this.globalRoleRepo.create({
        user_id: saved.id,
        role: dto.global_role,
      });
      await this.globalRoleRepo.save(gr);
      globalRoles.push(dto.global_role);
    }

    this.logger.log(
      `[Users] 用户 ${dto.username} (id=${saved.id}) 由 ${creatorId} 创建，全局角色=${globalRoles.length ? globalRoles.join(',') : '无'}`,
    );

    return {
      id: saved.id,
      username: saved.username,
      email: saved.email,
      name: saved.name,
      status: saved.status,
      global_roles: globalRoles,
    };
  }

  /**
   * 更新用户信息（super_admin/admin 或本人，本人只能改 name/avatar_url/phone）
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    operatorId: string,
    isSelf: boolean,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }

    if (isSelf) {
      // 本人仅可改 name/avatar_url/phone，不可改 username/email/status
      if (dto.name !== undefined) user.name = dto.name;
      if (dto.avatar_url !== undefined) user.avatar_url = dto.avatar_url;
      if (dto.phone !== undefined) user.phone = dto.phone;
    } else {
      // 管理员也只能改这几个字段（其他字段有专门接口）
      if (dto.name !== undefined) user.name = dto.name;
      if (dto.avatar_url !== undefined) user.avatar_url = dto.avatar_url;
      if (dto.phone !== undefined) user.phone = dto.phone;
    }

    await this.userRepo.save(user);
    this.logger.log(`[Users] 用户 ${id} 信息已更新，操作者=${operatorId}`);
  }

  /**
   * 更新用户状态（仅 super_admin/admin）
   * 不可禁用 super_admin（防止误锁最高权限）
   */
  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    operatorId: string,
    operatorGlobalRoles: GlobalRole[],
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }

    // 不可禁用 super_admin（除非操作者是 super_admin 本人）
    const targetRoles = await this.loadGlobalRoles(id);
    if (
      targetRoles.includes(GlobalRoleEnum.SUPER_ADMIN) &&
      !operatorGlobalRoles.includes(GlobalRoleEnum.SUPER_ADMIN)
    ) {
      throw new DdtException('FORBIDDEN', '不可修改超级管理员状态');
    }

    user.status = dto.status;
    await this.userRepo.save(user);
    this.logger.log(
      `[Users] 用户 ${id} 状态变更为 ${dto.status}，操作者=${operatorId}`,
    );
  }

  /**
   * 修改自己的密码（本人）
   * 需校验旧密码 + 新密码强度
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }

    // 校验旧密码
    const ok = await (await import('bcrypt')).compare(
      dto.old_password,
      user.password_hash,
    );
    if (!ok) {
      throw new DdtException('INVALID_CREDENTIALS', '旧密码不正确');
    }

    // 新旧密码不可相同
    if (dto.old_password === dto.new_password) {
      throw new DdtException('INVALID_ARGUMENT', '新密码不能与旧密码相同');
    }

    user.password_hash = await this.authService.hashPassword(dto.new_password);
    await this.userRepo.save(user);
    this.logger.log(`[Users] 用户 ${userId} 已自行修改密码`);
  }

  /**
   * 管理员重置用户密码（仅 super_admin/admin）
   * 重置后不需要旧密码，但需符合密码强度
   */
  async adminResetPassword(
    targetUserId: string,
    dto: AdminResetPasswordDto,
    operatorId: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }

    user.password_hash = await this.authService.hashPassword(dto.new_password);
    await this.userRepo.save(user);
    this.logger.log(
      `[Users] 用户 ${targetUserId} 密码已被管理员 ${operatorId} 重置`,
    );
  }

  /**
   * 软删除用户（仅 super_admin）
   * 不可软删除拥有 super_admin 角色的用户（防止误删）
   */
  async softDelete(id: string, operatorId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }
    const targetRoles = await this.loadGlobalRoles(id);
    if (targetRoles.includes(GlobalRoleEnum.SUPER_ADMIN)) {
      throw new DdtException('FORBIDDEN', '不可删除超级管理员账号');
    }
    user.deleted_at = new Date();
    user.status = UserStatusEnum.DISABLED;
    await this.userRepo.save(user);
    this.logger.log(`[Users] 用户 ${id} 已被软删除，操作者=${operatorId}`);
  }

  // ===== 私有辅助 =====

  private async loadGlobalRoles(userId: string): Promise<GlobalRole[]> {
    const roles = await this.globalRoleRepo.find({ where: { user_id: userId } });
    return roles.map((r) => r.role as GlobalRole);
  }
}
