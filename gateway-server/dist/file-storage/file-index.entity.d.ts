import { ProjectEntity } from '../projects/project.entity';
import { BusinessTableEntity } from '../business-data/business-table.entity';
export declare class FileIndexEntity {
    id: string;
    project_id: string;
    project: ProjectEntity;
    business_table_id: string;
    business_table: BusinessTableEntity;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    sha256: string;
    storage_path: string;
    storage_type: 'local_disk' | 'minio';
    expires_at: Date | null;
    created_at: Date;
}
