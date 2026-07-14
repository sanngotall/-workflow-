import { ProjectEntity } from '../projects/project.entity';
export declare class RouteEntity {
    id: string;
    project_id: string;
    project: ProjectEntity;
    environment: string;
    method: string;
    path: string;
    is_active: boolean;
    is_async: boolean;
    is_mock: boolean;
    mock_response: Record<string, any> | null;
    timeout_ms: number;
    created_at: Date;
    updated_at: Date;
}
