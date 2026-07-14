import { RouteService } from './route.service';
export declare class RouteController {
    private readonly routeService;
    constructor(routeService: RouteService);
    create(body: {
        project_id: string;
        environment: string;
        method: string;
        path: string;
        is_async?: boolean;
        timeout_ms?: number;
        is_mock?: boolean;
        mock_response?: Record<string, any> | null;
    }): Promise<{
        success: boolean;
        data: import("./route.entity").RouteEntity;
        error: null;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: import("./route.entity").RouteEntity;
        error: null;
    }>;
    findByProjectId(projectId: string): Promise<{
        success: boolean;
        data: import("./route.entity").RouteEntity[];
        error: null;
    }>;
    update(id: string, body: Partial<{
        environment: string;
        method: string;
        path: string;
        is_active: boolean;
        is_async: boolean;
        timeout_ms: number;
        is_mock: boolean;
        mock_response: Record<string, any> | null;
    }>): Promise<{
        success: boolean;
        data: import("./route.entity").RouteEntity;
        error: null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
}
