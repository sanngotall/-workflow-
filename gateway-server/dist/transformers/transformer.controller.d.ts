import { TransformerService } from './transformer.service';
export declare class TransformerController {
    private readonly transformerService;
    constructor(transformerService: TransformerService);
    create(body: {
        route_id: string;
        target_url: string;
        type: string;
        credential_id?: string;
        mapping_rules?: Record<string, any>;
        script_code?: string;
        response_rules?: Record<string, any>;
    }): Promise<{
        success: boolean;
        data: import("./transformer.entity").TransformerEntity;
        error: null;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: import("./transformer.entity").TransformerEntity;
        error: null;
    }>;
    findByRouteId(routeId: string): Promise<{
        success: boolean;
        data: import("./transformer.entity").TransformerEntity | null;
        error: null;
    }>;
    update(id: string, body: Partial<{
        target_url: string;
        type: string;
        credential_id: string;
        mapping_rules: Record<string, any>;
        script_code: string;
        response_rules: Record<string, any>;
    }>): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: import("./transformer.entity").TransformerEntity;
        error: null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: null;
        error: null;
    }>;
}
