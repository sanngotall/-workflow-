export declare class CreateBusinessFieldDto {
    id?: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file';
    source: 'request' | 'response' | 'system';
    enabled: boolean;
    nullable: boolean;
    is_primary_key: boolean;
    description?: string;
}
export declare class CreateBusinessTableDto {
    display_name: string;
    storage_type: 'persistent' | 'cache';
    ttl_seconds?: number | null;
    source: 'request' | 'response' | 'mixed';
    fields: CreateBusinessFieldDto[];
}
export declare class UpdateBusinessTableDto {
    display_name?: string;
    storage_type?: 'persistent' | 'cache';
    ttl_seconds?: number | null;
    source?: 'request' | 'response' | 'mixed';
    fields?: CreateBusinessFieldDto[];
}
export type CreateRowDto = Record<string, string | number | boolean | object | null>;
export type UpdateRowDto = Record<string, string | number | boolean | object | null>;
export declare class BackupTableDto {
    gzip?: boolean;
    description?: string;
}
