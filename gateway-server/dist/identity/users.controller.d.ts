import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto, ChangePasswordDto, AdminResetPasswordDto } from './users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(keyword?: string, status?: 'active' | 'inactive' | 'disabled', page?: string, pageSize?: string): Promise<{
        success: boolean;
        data: {
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
                global_roles: import("./roles").GlobalRole[];
            }>;
            total: number;
            page: number;
            pageSize: number;
        };
        error: null;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: {
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
            global_roles: import("./roles").GlobalRole[];
        };
        error: null;
    }>;
    create(dto: CreateUserDto, creatorId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            username: string;
            email: string;
            name: string;
            status: string;
            global_roles: import("./roles").GlobalRole[];
        };
        error: null;
    }>;
    update(id: string, dto: UpdateUserDto, operatorId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
    updateStatus(id: string, dto: UpdateUserStatusDto, operatorId: string, operatorGlobalRoles: string[]): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
    changePassword(id: string, dto: ChangePasswordDto, userId: string): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: null;
        error: null;
    }>;
    adminResetPassword(id: string, dto: AdminResetPasswordDto, operatorId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
    softDelete(id: string, operatorId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
}
