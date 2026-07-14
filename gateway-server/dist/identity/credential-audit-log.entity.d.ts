export declare class CredentialAuditLogEntity {
    id: number;
    credential_id: string | null;
    user_id: string | null;
    action: string;
    client_ip: string | null;
    created_at: Date;
}
