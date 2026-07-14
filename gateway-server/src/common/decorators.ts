import { SetMetadata } from '@nestjs/common';

/**
 * 身份权限装饰器集合（对齐 SPEC-05 §3 / §4.2）
 *
 * 设计原则：
 * - @Public()：标记接口为公开访问（如 /api/auth/login），JwtAuthGuard 跳过鉴权
 * - @RequirePermission('route:write')：声明接口所需权限 key（来自 PERMISSION_MATRIX）
 * - @RequireGlobalRole('admin' | 'super_admin')：声明所需全局角色（与权限矩阵二选一）
 * - @SelfOrPermission()：声明「本人或具备权限」即可通过（如用户改自己的密码）
 *
 * 守卫执行顺序（综合 Guard）：
 *   JwtAuthGuard（Token 校验） → ProjectMemberGuard（提取项目角色） → PermissionGuard（权限判定）
 */

export const IS_PUBLIC_KEY = 'isPublic';
export const PERMISSION_KEY = 'permission';
export const GLOBAL_ROLE_KEY = 'globalRole';
export const SELF_OR_PERMISSION_KEY = 'selfOrPermission';
export const PROJECT_ID_PARAM_KEY = 'projectIdParam';

/**
 * 标记接口为公开访问，跳过 JwtAuthGuard
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * 声明接口所需的权限 key（来自 PERMISSION_MATRIX）
 * 例如：@RequirePermission('route:write')
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);

/**
 * 声明接口所需的全局角色（与 @RequirePermission 互斥使用）
 * 例如：@RequireGlobalRole('super_admin')
 */
export const RequireGlobalRole = (...roles: string[]) =>
  SetMetadata(GLOBAL_ROLE_KEY, roles);

/**
 * 声明「本人或具备权限」即可通过
 * - 若 targetUserId === currentUserId，直接放行（本人操作）
 * - 否则必须具备 permission 权限
 *
 * controller 中 targetUserId 必须从路由参数 :id 提取，且参数名固定为 'id'
 *
 * 例如：@SelfOrPermission('user:write') 用于 PUT /api/users/:id
 */
export const SelfOrPermission = (permission: string) =>
  SetMetadata(SELF_OR_PERMISSION_KEY, permission);

/**
 * 自定义项目 ID 路由参数名（默认 'projectId'，特殊场景可改）
 */
export const ProjectIdParam = (paramName: string) =>
  SetMetadata(PROJECT_ID_PARAM_KEY, paramName);
