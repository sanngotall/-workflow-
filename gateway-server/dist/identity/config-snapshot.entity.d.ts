import { ProjectEntity } from '../projects/project.entity';
export declare class ConfigSnapshotEntity {
    id: string;
    project_id: string;
    project: ProjectEntity;
    version: string;
    snapshot_json: Record<string, any>;
    created_by: string | null;
    description: string | null;
    created_at: Date;
}
