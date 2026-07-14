import { Repository } from 'typeorm';
import { GlobalRoleEntity } from './global-role.entity';
import { UserEntity } from './user.entity';
import { GlobalRole } from './roles';
export declare class GlobalRolesService {
    private readonly roleRepo;
    private readonly userRepo;
    private readonly logger;
    constructor(roleRepo: Repository<GlobalRoleEntity>, userRepo: Repository<UserEntity>);
    listByUser(userId: string): Promise<{
        user_id: string;
        roles: GlobalRole[];
    }>;
    grant(userId: string, role: string, operatorId: string): Promise<{
        id: string;
        user_id: string;
        role: GlobalRole;
    }>;
    revoke(userId: string, role: string, operatorId: string): Promise<void>;
}
