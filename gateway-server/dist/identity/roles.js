"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_MATRIX = exports.UserStatusEnum = exports.ALL_GLOBAL_ROLES = exports.GlobalRoleEnum = exports.ALL_PROJECT_ROLES = exports.ProjectRoleEnum = void 0;
exports.isValidProjectRole = isValidProjectRole;
exports.isValidGlobalRole = isValidGlobalRole;
exports.hasPermission = hasPermission;
exports.ProjectRoleEnum = {
    ADMIN: 'admin',
    ARCHITECT: 'architect',
    DEVELOPER: 'developer',
    EDITOR: 'editor',
    OPS: 'ops',
    TESTER: 'tester',
    OPERATOR: 'operator',
    ANALYST: 'analyst',
    VIEWER: 'viewer',
};
exports.ALL_PROJECT_ROLES = [
    exports.ProjectRoleEnum.ADMIN,
    exports.ProjectRoleEnum.ARCHITECT,
    exports.ProjectRoleEnum.DEVELOPER,
    exports.ProjectRoleEnum.EDITOR,
    exports.ProjectRoleEnum.OPS,
    exports.ProjectRoleEnum.TESTER,
    exports.ProjectRoleEnum.OPERATOR,
    exports.ProjectRoleEnum.ANALYST,
    exports.ProjectRoleEnum.VIEWER,
];
exports.GlobalRoleEnum = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
};
exports.ALL_GLOBAL_ROLES = [
    exports.GlobalRoleEnum.SUPER_ADMIN,
    exports.GlobalRoleEnum.ADMIN,
];
exports.UserStatusEnum = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISABLED: 'disabled',
};
function isValidProjectRole(role) {
    return exports.ALL_PROJECT_ROLES.includes(role);
}
function isValidGlobalRole(role) {
    return exports.ALL_GLOBAL_ROLES.includes(role);
}
exports.PERMISSION_MATRIX = {
    'project:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'project:update': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'project:delete': { projectRoles: [exports.ProjectRoleEnum.ADMIN], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'member:list': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'member:create': { projectRoles: [exports.ProjectRoleEnum.ADMIN], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'member:update': { projectRoles: [exports.ProjectRoleEnum.ADMIN], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'member:delete': { projectRoles: [exports.ProjectRoleEnum.ADMIN], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'route:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'route:write': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT, exports.ProjectRoleEnum.DEVELOPER], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'route:delete': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'route:toggle': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT, exports.ProjectRoleEnum.DEVELOPER, exports.ProjectRoleEnum.OPS], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'transformer:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'transformer:write': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT, exports.ProjectRoleEnum.DEVELOPER, exports.ProjectRoleEnum.EDITOR], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'transformer:delete': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'credential:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'credential:write': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'log:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'breaker:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'breaker:reset': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.OPS], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'snapshot:export': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'snapshot:rollback': { projectRoles: [exports.ProjectRoleEnum.ADMIN], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'biztable:read': { projectRoles: ['*'], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN, exports.GlobalRoleEnum.ADMIN] },
    'biztable:write': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT, exports.ProjectRoleEnum.DEVELOPER], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
    'biztable:delete': { projectRoles: [exports.ProjectRoleEnum.ADMIN, exports.ProjectRoleEnum.ARCHITECT], globalRoles: [exports.GlobalRoleEnum.SUPER_ADMIN] },
};
function hasPermission(userGlobalRoles, userProjectRole, permissionKey) {
    const permission = exports.PERMISSION_MATRIX[permissionKey];
    if (!permission) {
        return false;
    }
    if (userGlobalRoles.includes(exports.GlobalRoleEnum.SUPER_ADMIN)) {
        return true;
    }
    if (permission.globalRoles.includes('*')) {
        return userGlobalRoles.length > 0;
    }
    for (const r of userGlobalRoles) {
        if (permission.globalRoles.includes(r)) {
            return true;
        }
    }
    if (userProjectRole === null) {
        return false;
    }
    if (permission.projectRoles.includes('*')) {
        return true;
    }
    return permission.projectRoles.includes(userProjectRole);
}
//# sourceMappingURL=roles.js.map