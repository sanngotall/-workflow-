import { GlobalRolesService } from './global-roles.service';
export declare class GrantRoleDto {
    role: string;
}
export declare class GlobalRolesController {
    private readonly rolesService;
    constructor(rolesService: GlobalRolesService);
    list(id: string): Promise<{
        success: boolean;
        data: {
            user_id: string;
            roles: import("./roles").GlobalRole[];
        };
        error: null;
    }>;
    grant(id: string, dto: GrantRoleDto, operatorId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            user_id: string;
            role: import("./roles").GlobalRole;
        };
        error: null;
    }>;
    revoke(id: string, role: string, operatorId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
}
