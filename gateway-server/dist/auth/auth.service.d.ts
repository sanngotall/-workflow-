import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { RedisService } from '../redis/redis.service';
import { UserEntity } from '../identity/user.entity';
import { GlobalRoleEntity } from '../identity/global-role.entity';
import { GlobalRole } from '../identity/roles';
import { CurrentUserPayload } from '../common/current-user.decorator';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly redisService;
    private readonly userRepo;
    private readonly globalRoleRepo;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, redisService: RedisService, userRepo: Repository<UserEntity>, globalRoleRepo: Repository<GlobalRoleEntity>);
    login(username: string, password: string, clientIp: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: string;
            username: string;
            name: string;
            avatar_url: string | null;
            global_roles: GlobalRole[];
        };
    }>;
    refresh(refreshTokenStr: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>;
    logout(accessToken: string): Promise<void>;
    getMe(userId: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
        avatar_url: string | null;
        phone: string | null;
        status: string;
        last_login_at: Date | null;
        global_roles: GlobalRole[];
    }>;
    validateUser(payload: any): Promise<CurrentUserPayload | null>;
    jwtVerify(token: string): any;
    private loadGlobalRoles;
    private signToken;
    private recordLoginFail;
    hashPassword(plaintext: string): Promise<string>;
    validatePasswordStrength(password: string): boolean;
}
