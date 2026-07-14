import { ProjectEntity } from '../projects/project.entity';
import { BusinessFieldEntity } from './business-field.entity';
export declare class BusinessTableEntity {
    id: string;
    project_id: string;
    project: ProjectEntity;
    table_name: string;
    display_name: string;
    storage_type: 'persistent' | 'cache';
    ttl_seconds: number | null;
    source: 'request' | 'response' | 'mixed';
    row_count: number;
    size_mb: number;
    created_at: Date;
    updated_at: Date;
    fields: BusinessFieldEntity[];
}
