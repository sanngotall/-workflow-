import { WxConfigService } from './wx-config.service';
export declare class WxConfigController {
    private readonly wxConfigService;
    constructor(wxConfigService: WxConfigService);
    get(projectId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    } | {
        success: boolean;
        data: {
            id: string;
            app_id: string;
            has_app_secret: boolean;
            has_jwt_secret: boolean;
            created_at: Date;
            updated_at: Date;
        };
        error: null;
    }>;
    upsert(projectId: string, body: {
        app_id?: string;
        app_secret?: string;
        jwt_secret?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            app_id: string;
            has_app_secret: boolean;
            has_jwt_secret: boolean;
            created_at: Date;
            updated_at: Date;
        };
        error: null;
    }>;
    delete(projectId: string): Promise<{
        success: boolean;
        data: {
            deleted: boolean;
        };
        error: null;
    }>;
}
