import { BusinessTableEntity } from './business-table.entity';
export declare class BusinessFieldEntity {
    id: string;
    business_table_id: string;
    business_table: BusinessTableEntity;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file';
    source: 'request' | 'response' | 'system';
    enabled: boolean;
    nullable: boolean;
    is_primary_key: boolean;
    description: string;
    position: number;
}
