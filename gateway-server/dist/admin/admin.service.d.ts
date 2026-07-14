import { RouteService } from '../routes/route.service';
import { TransformerService } from '../transformers/transformer.service';
import { CredentialService } from '../credentials/credential.service';
import { RedisService } from '../redis/redis.service';
interface CreateRouteWithTransformerDto {
    project_id: string;
    environment: string;
    method: string;
    path: string;
    is_async?: boolean;
    timeout_ms?: number;
    is_mock?: boolean;
    mock_response?: Record<string, any> | null;
    transformer: {
        credential_id?: string;
        target_url: string;
        type: string;
        mapping_rules?: Record<string, any>;
        script_code?: string;
        response_rules?: Record<string, any>;
    };
}
export declare class AdminService {
    private readonly routeService;
    private readonly transformerService;
    private readonly credentialService;
    private readonly redisService;
    constructor(routeService: RouteService, transformerService: TransformerService, credentialService: CredentialService, redisService: RedisService);
    createRouteWithTransformer(dto: CreateRouteWithTransformerDto): Promise<{
        route_id: string;
        status: string;
    }>;
    private updateRouteCache;
}
export {};
