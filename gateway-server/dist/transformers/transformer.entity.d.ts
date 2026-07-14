import { RouteEntity } from '../routes/route.entity';
import { CredentialEntity } from '../credentials/credential.entity';
export declare class TransformerEntity {
    id: string;
    route_id: string;
    route: RouteEntity;
    credential_id: string;
    credential: CredentialEntity;
    target_url: string;
    type: string;
    mapping_rules: Record<string, any>;
    script_code: string;
    response_rules: Record<string, any>;
    updated_at: Date;
}
