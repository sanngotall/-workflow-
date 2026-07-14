export declare const ProjectRoleEnum: {
    readonly ADMIN: "admin";
    readonly ARCHITECT: "architect";
    readonly DEVELOPER: "developer";
    readonly EDITOR: "editor";
    readonly OPS: "ops";
    readonly TESTER: "tester";
    readonly OPERATOR: "operator";
    readonly ANALYST: "analyst";
    readonly VIEWER: "viewer";
};
export type ProjectRole = typeof ProjectRoleEnum[keyof typeof ProjectRoleEnum];
export declare const ALL_PROJECT_ROLES: ProjectRole[];
export declare const GlobalRoleEnum: {
    readonly SUPER_ADMIN: "super_admin";
    readonly ADMIN: "admin";
};
export type GlobalRole = typeof GlobalRoleEnum[keyof typeof GlobalRoleEnum];
export declare const ALL_GLOBAL_ROLES: GlobalRole[];
export declare const UserStatusEnum: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly DISABLED: "disabled";
};
export type UserStatus = typeof UserStatusEnum[keyof typeof UserStatusEnum];
export declare function isValidProjectRole(role: string): role is ProjectRole;
export declare function isValidGlobalRole(role: string): role is GlobalRole;
export type PermissionSpec = {
    projectRoles: ProjectRole[] | ['*'];
    globalRoles: GlobalRole[] | ['*'];
};
export declare const PERMISSION_MATRIX: Record<string, PermissionSpec>;
export declare function hasPermission(userGlobalRoles: GlobalRole[], userProjectRole: ProjectRole | null, permissionKey: string): boolean;
