import { Repository } from 'typeorm';
import { ConfigSnapshotEntity } from './config-snapshot.entity';
import { CredentialAuditLogEntity } from './credential-audit-log.entity';
export declare class ConfigSnapshotsService {
    private readonly snapshotRepo;
    private readonly logger;
    constructor(snapshotRepo: Repository<ConfigSnapshotEntity>);
    list(projectId: string): Promise<{
        items: Array<{
            id: string;
            version: string;
            description: string | null;
            created_by: string | null;
            created_at: Date;
        }>;
        total: number;
    }>;
    create(projectId: string, version: string, description: string | null, snapshotJson: Record<string, any>, creatorId: string): Promise<{
        id: string;
        version: string;
    }>;
    findById(id: string): Promise<ConfigSnapshotEntity>;
}
export declare class CredentialAuditLogsService {
    private readonly auditRepo;
    private readonly logger;
    constructor(auditRepo: Repository<CredentialAuditLogEntity>);
    record(params: {
        credential_id: string | null;
        user_id: string | null;
        action: 'create' | 'view' | 'update' | 'delete' | 'decrypt';
        client_ip?: string | null;
    }): Promise<void>;
    list(params: {
        credential_id?: string;
        user_id?: string;
        action?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        items: CredentialAuditLogEntity[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
