export declare class UserEntity {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    name: string;
    avatar_url: string | null;
    phone: string | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    last_login_at: Date | null;
    deleted_at: Date | null;
}
