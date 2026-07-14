/**
 * 角色枚举与权限矩阵（对齐 SPEC-05 §2 / §3）
 *
 * 强锁约束：严禁在业务代码中出现枚举外的字符串。
 * 数据库层以 CHECK 约束锁定，代码层以 TypeScript 联合类型对齐。
 */

/** 项目级角色（9 种，对齐 SPEC-05 §2.1） */
export const ProjectRoleEnum = {
  ADMIN: 'admin',
  ARCHITECT: 'architect',
  DEVELOPER: 'developer',
  EDITOR: 'editor',
  OPS: 'ops',
  TESTER: 'tester',
  OPERATOR: 'operator',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const;

export type ProjectRole = typeof ProjectRoleEnum[keyof typeof ProjectRoleEnum];

/** 全部项目角色数组（用于校验与遍历） */
export const ALL_PROJECT_ROLES: ProjectRole[] = [
  ProjectRoleEnum.ADMIN,
  ProjectRoleEnum.ARCHITECT,
  ProjectRoleEnum.DEVELOPER,
  ProjectRoleEnum.EDITOR,
  ProjectRoleEnum.OPS,
  ProjectRoleEnum.TESTER,
  ProjectRoleEnum.OPERATOR,
  ProjectRoleEnum.ANALYST,
  ProjectRoleEnum.VIEWER,
];

/** 全局角色（2 种，对齐 SPEC-05 §2.2） */
export const GlobalRoleEnum = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

export type GlobalRole = typeof GlobalRoleEnum[keyof typeof GlobalRoleEnum];

export const ALL_GLOBAL_ROLES: GlobalRole[] = [
  GlobalRoleEnum.SUPER_ADMIN,
  GlobalRoleEnum.ADMIN,
];

/** 用户账号状态（对齐 SPEC-05 §5 users.status） */
export const UserStatusEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
} as const;

export type UserStatus = typeof UserStatusEnum[keyof typeof UserStatusEnum];

/**
 * 校验项目角色字符串是否合法
 */
export function isValidProjectRole(role: string): role is ProjectRole {
  return (ALL_PROJECT_ROLES as string[]).includes(role);
}

/**
 * 校验全局角色字符串是否合法
 */
export function isValidGlobalRole(role: string): role is GlobalRole {
  return (ALL_GLOBAL_ROLES as string[]).includes(role);
}

/**
 * RBAC 权限矩阵（对齐 SPEC-05 §3）
 *
 * 数据结构：resource + operation → { projectRoles: ProjectRole[], globalRoles: GlobalRole[] }
 * 含义：当用户对某资源执行某操作时，其项目角色必须在 projectRoles 集合内，
 *       或其全局角色必须在 globalRoles 集合内，二者满足其一即放行。
 *
 * 特殊标记：
 * - projectRoles: ['*'] 表示全部 9 种项目角色均可
 * - globalRoles: ['*'] 表示全部全局角色均可
 * - 自身资源（如本人改密码）由 controller 内额外判断 currentUserId === targetUserId
 */
export type PermissionSpec = {
  projectRoles: ProjectRole[] | ['*'];
  globalRoles: GlobalRole[] | ['*'];
};

export const PERMISSION_MATRIX: Record<string, PermissionSpec> = {
  // === Project 资源 ===
  'project:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'project:update': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'project:delete': { projectRoles: [ProjectRoleEnum.ADMIN], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === ProjectMember 资源 ===
  'member:list': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'member:create': { projectRoles: [ProjectRoleEnum.ADMIN], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'member:update': { projectRoles: [ProjectRoleEnum.ADMIN], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'member:delete': { projectRoles: [ProjectRoleEnum.ADMIN], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === Route 资源 ===
  'route:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'route:write': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT, ProjectRoleEnum.DEVELOPER], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'route:delete': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'route:toggle': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT, ProjectRoleEnum.DEVELOPER, ProjectRoleEnum.OPS], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === Transformer 资源 ===
  'transformer:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'transformer:write': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT, ProjectRoleEnum.DEVELOPER, ProjectRoleEnum.EDITOR], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'transformer:delete': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === Credential 资源 ===
  'credential:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'credential:write': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === RequestLog 资源 ===
  'log:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },

  // === CircuitBreaker 资源 ===
  'breaker:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'breaker:reset': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.OPS], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === ConfigSnapshot 资源 ===
  'snapshot:export': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'snapshot:rollback': { projectRoles: [ProjectRoleEnum.ADMIN], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },

  // === BusinessTable 资源（业务数据存储模块，沿用项目成员权限）===
  'biztable:read': { projectRoles: ['*'], globalRoles: [GlobalRoleEnum.SUPER_ADMIN, GlobalRoleEnum.ADMIN] },
  'biztable:write': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT, ProjectRoleEnum.DEVELOPER], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
  'biztable:delete': { projectRoles: [ProjectRoleEnum.ADMIN, ProjectRoleEnum.ARCHITECT], globalRoles: [GlobalRoleEnum.SUPER_ADMIN] },
};

/**
 * 权限判定核心函数（对齐 SPEC-05 §3）
 *
 * 判定规则：
 * 1. 若用户拥有全局角色 super_admin，直接放行（最高权限）
 * 2. 否则检查用户的全局角色是否在 permission.globalRoles 内
 * 3. 若不在，检查用户在当前项目的角色是否在 permission.projectRoles 内
 * 4. 若 projectRoles 为 ['*']，只要用户是该项目成员即放行
 *
 * @param userGlobalRoles 用户的全局角色数组
 * @param userProjectRole 用户在当前项目的角色（可为 null 表示非成员）
 * @param permissionKey 权限矩阵的 key（如 'route:write'）
 */
export function hasPermission(
  userGlobalRoles: GlobalRole[],
  userProjectRole: ProjectRole | null,
  permissionKey: string,
): boolean {
  const permission = PERMISSION_MATRIX[permissionKey];
  if (!permission) {
    return false;
  }

  // 规则 1：super_admin 直接放行
  if (userGlobalRoles.includes(GlobalRoleEnum.SUPER_ADMIN)) {
    return true;
  }

  // 规则 2：全局角色匹配
  if ((permission.globalRoles as string[]).includes('*')) {
    return userGlobalRoles.length > 0;
  }
  for (const r of userGlobalRoles) {
    if ((permission.globalRoles as GlobalRole[]).includes(r)) {
      return true;
    }
  }

  // 规则 3 & 4：项目角色匹配
  if (userProjectRole === null) {
    return false;
  }
  if ((permission.projectRoles as string[]).includes('*')) {
    return true;
  }
  return (permission.projectRoles as ProjectRole[]).includes(userProjectRole);
}
