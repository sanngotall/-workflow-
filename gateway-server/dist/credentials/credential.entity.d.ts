import { ProjectEntity } from '../projects/project.entity';
export declare class CredentialEntity {
    id: string;
    project_id: string;
    project: ProjectEntity;
    name: string;
    type: string;
    encrypted_secret: string;
    created_at: Date;
    updated_at: Date;
}
