import { ProjectEntity } from '../projects/project.entity';
import { UserEntity } from './user.entity';
export declare class ProjectMemberEntity {
    id: string;
    project_id: string;
    project: ProjectEntity | null;
    user_id: string;
    user: UserEntity | null;
    role: string;
    joined_at: Date;
    created_at: Date;
    updated_at: Date;
}
