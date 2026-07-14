import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { GlobalRoleEntity } from './global-role.entity';
import { ConfigService } from '../config/config.service';
import { AuthService } from '../auth/auth.service';
export declare class BootstrapService implements OnModuleInit {
    private readonly userRepo;
    private readonly globalRoleRepo;
    private readonly configService;
    private readonly authService;
    private readonly logger;
    constructor(userRepo: Repository<UserEntity>, globalRoleRepo: Repository<GlobalRoleEntity>, configService: ConfigService, authService: AuthService);
    onModuleInit(): Promise<void>;
    private ensureInitialAdmin;
    private generateRandomPassword;
}
