import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createRouteWithTransformer(projectId: string, body: {
        environment: string;
        method: string;
        path: string;
        is_async?: boolean;
        timeout_ms?: number;
        transformer: {
            credential_id?: string;
            target_url: string;
            type: string;
            mapping_rules?: Record<string, any>;
            script_code?: string;
            response_rules?: Record<string, any>;
        };
    }): Promise<{
        success: boolean;
        data: {
            route_id: string;
            status: string;
        };
        error: null;
    }>;
}
