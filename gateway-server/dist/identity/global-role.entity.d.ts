import { UserEntity } from './user.entity';
export declare class GlobalRoleEntity {
    id: string;
    user_id: string;
    user: UserEntity | null;
    role: string;
    created_at: Date;
}
