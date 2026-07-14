import { AuthService } from './auth.service';
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class RefreshDto {
    refresh_token: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: any): Promise<{
        success: boolean;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            user: {
                id: string;
                username: string;
                name: string;
                avatar_url: string | null;
                global_roles: import("../identity/roles").GlobalRole[];
            };
        };
        error: null;
    }>;
    refresh(dto: RefreshDto): Promise<{
        success: boolean;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
        };
        error: null;
    }>;
    logout(req: any): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
    me(userId: string): Promise<{
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
            global_roles: import("../identity/roles").GlobalRole[];
        };
        error: null;
    }>;
}
