import { ConfigSnapshotsService, CredentialAuditLogsService } from './config-snapshots.service';
export declare class CreateSnapshotDto {
    version: string;
    description?: string;
    snapshot_json?: Record<string, any>;
}
export declare class ConfigSnapshotsController {
    private readonly snapshotsService;
    constructor(snapshotsService: ConfigSnapshotsService);
    list(projectId: string): Promise<{
        success: boolean;
        data: {
            items: Array<{
                id: string;
                version: string;
                description: string | null;
                created_by: string | null;
                created_at: Date;
            }>;
            total: number;
        };
        error: null;
    }>;
    create(projectId: string, dto: CreateSnapshotDto, creatorId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            version: string;
        };
        error: null;
    }>;
}
export declare class CredentialAuditLogsController {
    private readonly auditService;
    constructor(auditService: CredentialAuditLogsService);
    list(credential_id?: string, user_id?: string, action?: string, page?: string, pageSize?: string): Promise<{
        success: boolean;
        data: {
            items: import("./credential-audit-log.entity").CredentialAuditLogEntity[];
            total: number;
            page: number;
            pageSize: number;
        };
        error: null;
    }>;
}
