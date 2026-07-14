import { ProjectEntity } from '../projects/project.entity';
export declare class WxConfigEntity {
    id: string;
    project_id: string;
    project: ProjectEntity;
    app_id: string;
    encrypted_app_secret: string;
    encrypted_jwt_secret: string;
    created_at: Date;
    updated_at: Date;
}
