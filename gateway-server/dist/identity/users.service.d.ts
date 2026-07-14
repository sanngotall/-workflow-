import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { GlobalRoleEntity } from './global-role.entity';
import { AuthService } from '../auth/auth.service';
import { GlobalRole, UserStatus } from './roles';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto, ChangePasswordDto, AdminResetPasswordDto } from './users.dto';
export declare class UsersService {
    private readonly userRepo;
    private readonly globalRoleRepo;
    private readonly authService;
    private readonly logger;
    constructor(userRepo: Repository<UserEntity>, globalRoleRepo: Repository<GlobalRoleEntity>, authService: AuthService);
    list(params: {
        keyword?: string;
        status?: UserStatus;
        page?: number;
        pageSize?: number;
    }): Promise<{
        items: Array<{
            id: string;
            username: string;
            email: string;
            name: string;
            avatar_url: string | null;
            phone: string | null;
            status: string;
            last_login_at: Date | null;
            created_at: Date;
            global_roles: GlobalRole[];
        }>;
        total: number;
        page: number;
        pageSize: number;
    }>;
    findById(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
        avatar_url: string | null;
        phone: string | null;
        status: string;
        last_login_at: Date | null;
        created_at: Date;
        updated_at: Date;
        global_roles: GlobalRole[];
    }>;
    create(dto: CreateUserDto, creatorId: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
        status: string;
        global_roles: GlobalRole[];
    }>;
    update(id: string, dto: UpdateUserDto, operatorId: string, isSelf: boolean): Promise<void>;
    updateStatus(id: string, dto: UpdateUserStatusDto, operatorId: string, operatorGlobalRoles: GlobalRole[]): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    adminResetPassword(targetUserId: string, dto: AdminResetPasswordDto, operatorId: string): Promise<void>;
    softDelete(id: string, operatorId: string): Promise<void>;
    private loadGlobalRoles;
}
