import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  PERMISSION_KEY,
  GLOBAL_ROLE_KEY,
  SELF_OR_PERMISSION_KEY,
  PROJECT_ID_PARAM_KEY,
} from './decorators';
import { hasPermission, GlobalRole, ProjectRole } from '../identity/roles';
import { DdtException } from './ddt-exception';
import { ProjectMembersService } from '../identity/project-members.service';

/**
 * 综合权限守卫（对齐 SPEC-05 §3 / §4.2）
 *
 * 执行流程：
 *   1. @Public() 标记 → 直接放行
 *   2. request.user 不存在 → 抛 UNAUTHENTICATED（JwtAuthGuard 应已注入 user）
 *   3. 路由参数含 :projectId → 通过 ProjectMembersService 查询用户项目角色
 *   4. 检查 @RequireGlobalRole → 全局角色匹配
 *   5. 检查 @SelfOrPermission → 本人放行 或 权限匹配
 *   6. 检查 @RequirePermission → 权限矩阵匹配
 *   7. 均不通过 → 抛 FORBIDDEN
 *
 * 注意：本 Guard 假设 JwtAuthGuard 已先执行并注入 request.user。
 *       在 main.ts 中以 APP_GUARD 顺序注册时，JwtAuthGuard 必须先注册。
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly membersService: ProjectMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. @Public() 直接放行
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { userId: string; globalRoles: string[] }
      | undefined;
    if (!user || !user.userId) {
      throw new DdtException('UNAUTHENTICATED');
    }

    const userGlobalRoles = (user.globalRoles || []) as GlobalRole[];

    // 2. 提取项目角色（若路由含 :projectId）
    const projectIdParamName =
      this.reflector.getAllAndOverride<string>(PROJECT_ID_PARAM_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || 'projectId';
    const projectId: string | undefined = request.params?.[projectIdParamName];
    let userProjectRole: ProjectRole | null = null;
    if (projectId) {
      // 通过 service 查询，避免直接注入 Repository 导致跨模块依赖问题
      userProjectRole = await this.membersService.getMemberRole(
        projectId,
        user.userId,
      );
    }

    // 3. @RequireGlobalRole 检查
    const requiredGlobalRoles = this.reflector.getAllAndOverride<string[]>(
      GLOBAL_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredGlobalRoles && requiredGlobalRoles.length > 0) {
      // super_admin 直接放行
      if (userGlobalRoles.includes('super_admin' as GlobalRole)) {
        return true;
      }
      const matched = requiredGlobalRoles.some((r) =>
        userGlobalRoles.includes(r as GlobalRole),
      );
      if (!matched) {
        throw new DdtException('FORBIDDEN');
      }
      return true;
    }

    // 4. @SelfOrPermission 检查：本人放行，否则需权限匹配
    const selfOrPermission = this.reflector.getAllAndOverride<string>(
      SELF_OR_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (selfOrPermission) {
      const targetId: string | undefined = request.params?.['id'];
      if (targetId && targetId === user.userId) {
        return true; // 本人操作，放行
      }
      if (!hasPermission(userGlobalRoles, userProjectRole, selfOrPermission)) {
        throw new DdtException('FORBIDDEN');
      }
      return true;
    }

    // 5. @RequirePermission 检查
    const permission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (permission) {
      if (!hasPermission(userGlobalRoles, userProjectRole, permission)) {
        throw new DdtException('FORBIDDEN');
      }
      return true;
    }

    // 6. 无任何权限装饰器 → 默认放行（仅需登录即可）
    return true;
  }
}
