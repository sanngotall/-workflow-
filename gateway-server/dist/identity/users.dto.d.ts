export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    name: string;
    avatar_url?: string;
    phone?: string;
    global_role?: 'super_admin' | 'admin';
}
export declare class UpdateUserDto {
    name?: string;
    avatar_url?: string;
    phone?: string;
}
export declare class UpdateUserStatusDto {
    status: 'active' | 'inactive' | 'disabled';
}
export declare class ChangePasswordDto {
    old_password: string;
    new_password: string;
}
export declare class AdminResetPasswordDto {
    new_password: string;
}
