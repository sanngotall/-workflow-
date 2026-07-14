import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalRoleEntity } from './global-role.entity';
import { UserEntity } from './user.entity';
import { DdtException } from '../common/ddt-exception';
import { GlobalRole, isValidGlobalRole } from './roles';

/**
 * 全局角色管理服务（对齐 SPEC-05 §3.2）
 *
 * 仅 super_admin 可授予/撤销全局角色。
 * 不可撤销最后一个 super_admin（防止系统失去最高权限）。
 */
@Injectable()
export class GlobalRolesService {
  private readonly logger = new Logger(GlobalRolesService.name);

  constructor(
    @InjectRepository(GlobalRoleEntity)
    private readonly roleRepo: Repository<GlobalRoleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /** 查询用户的全局角色 */
  async listByUser(userId: string): Promise<{
    user_id: string;
    roles: GlobalRole[];
  }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }
    const roles = await this.roleRepo.find({ where: { user_id: userId } });
    return {
      user_id: userId,
      roles: roles.map((r) => r.role as GlobalRole),
    };
  }

  /** 授予全局角色 */
  async grant(
    userId: string,
    role: string,
    operatorId: string,
  ): Promise<{ id: string; user_id: string; role: GlobalRole }> {
    if (!isValidGlobalRole(role)) {
      throw new DdtException('ROLE_INVALID');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
    }
    // 检查是否已存在
    const existing = await this.roleRepo.findOne({
      where: { user_id: userId, role: role as GlobalRole },
    });
    if (existing) {
      return {
        id: existing.id,
        user_id: existing.user_id,
        role: existing.role as GlobalRole,
      };
    }
    const gr = this.roleRepo.create({
      user_id: userId,
      role: role as GlobalRole,
    });
    const saved = await this.roleRepo.save(gr);
    this.logger.log(
      `[GlobalRoles] 用户 ${userId} 被授予全局角色 ${role}，操作者=${operatorId}`,
    );
    return { id: saved.id, user_id: saved.user_id, role: saved.role as GlobalRole };
  }

  /** 撤销全局角色 */
  async revoke(
    userId: string,
    role: string,
    operatorId: string,
  ): Promise<void> {
    if (!isValidGlobalRole(role)) {
      throw new DdtException('ROLE_INVALID');
    }
    const gr = await this.roleRepo.findOne({
      where: { user_id: userId, role: role as GlobalRole },
    });
    if (!gr) {
      throw new DdtException('FORBIDDEN', '该用户未持有此全局角色');
    }

    // 不可撤销最后一个 super_admin
    if (role === 'super_admin') {
      const superAdminCount = await this.roleRepo.count({
        where: { role: 'super_admin' as GlobalRole },
      });
      if (superAdminCount <= 1) {
        throw new DdtException(
          'LAST_ADMIN_LOCKED',
          '不可撤销最后一个 super_admin 角色，系统必须保留至少一个超级管理员',
        );
      }
    }

    await this.roleRepo.remove(gr);
    this.logger.log(
      `[GlobalRoles] 用户 ${userId} 的全局角色 ${role} 已被撤销，操作者=${operatorId}`,
    );
  }
}
