"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const config_service_1 = require("../config/config.service");
const redis_service_1 = require("../redis/redis.service");
const user_entity_1 = require("../identity/user.entity");
const global_role_entity_1 = require("../identity/global-role.entity");
const ddt_exception_1 = require("../common/ddt-exception");
const roles_1 = require("../identity/roles");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService, redisService, userRepo, globalRoleRepo) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
        this.userRepo = userRepo;
        this.globalRoleRepo = globalRoleRepo;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(username, password, clientIp) {
        const failCount = await this.redisService.getLoginFailCount(clientIp);
        if (failCount >= this.configService.loginFailThreshold) {
            this.logger.warn(`[Auth] IP ${clientIp} 登录失败 ${failCount} 次，已封禁 ${this.configService.loginFailBanSec}s`);
            throw new ddt_exception_1.DdtException('USER_DISABLED', '登录失败次数过多，IP 已被临时封禁');
        }
        const user = await this.userRepo.findOne({
            where: { username },
        });
        if (!user || user.deleted_at) {
            await this.recordLoginFail(clientIp);
            throw new ddt_exception_1.DdtException('INVALID_CREDENTIALS');
        }
        if (user.status === roles_1.UserStatusEnum.DISABLED) {
            throw new ddt_exception_1.DdtException('USER_DISABLED');
        }
        if (user.status === roles_1.UserStatusEnum.INACTIVE) {
            throw new ddt_exception_1.DdtException('USER_DISABLED', '账号未激活');
        }
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            await this.recordLoginFail(clientIp);
            throw new ddt_exception_1.DdtException('INVALID_CREDENTIALS');
        }
        await this.redisService.resetLoginFail(clientIp);
        const globalRoles = await this.loadGlobalRoles(user.id);
        const accessJti = (0, crypto_1.randomUUID)();
        const refreshJti = (0, crypto_1.randomUUID)();
        const accessToken = await this.signToken({ sub: user.id, username: user.username, gr: globalRoles, type: 'access' }, accessJti, this.configService.jwtExpiresIn);
        const refreshToken = await this.signToken({ sub: user.id, username: user.username, type: 'refresh' }, refreshJti, this.configService.jwtRefreshExpiresIn);
        await this.userRepo.update(user.id, { last_login_at: new Date() });
        this.logger.log(`[Auth] 用户 ${user.username} (id=${user.id}) 登录成功`);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: parseInt(this.configService.jwtExpiresIn, 10),
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                avatar_url: user.avatar_url ?? null,
                global_roles: globalRoles,
            },
        };
    }
    async refresh(refreshTokenStr) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshTokenStr, {
                secret: this.configService.jwtSecret,
            });
        }
        catch (err) {
            if (err?.name === 'TokenExpiredError') {
                throw new ddt_exception_1.DdtException('TOKEN_EXPIRED');
            }
            throw new ddt_exception_1.DdtException('TOKEN_INVALID');
        }
        if (payload.type !== 'refresh' || !payload.jti) {
            throw new ddt_exception_1.DdtException('TOKEN_INVALID');
        }
        const isBlacklisted = await this.redisService.isBlacklisted(payload.jti);
        if (isBlacklisted) {
            throw new ddt_exception_1.DdtException('TOKEN_INVALID');
        }
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (!user || user.deleted_at || user.status !== roles_1.UserStatusEnum.ACTIVE) {
            throw new ddt_exception_1.DdtException('USER_DISABLED');
        }
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        const remainTtl = Math.max(1, exp - now);
        await this.redisService.setBlacklist(payload.jti, remainTtl);
        const globalRoles = await this.loadGlobalRoles(user.id);
        const accessJti = (0, crypto_1.randomUUID)();
        const refreshJti = (0, crypto_1.randomUUID)();
        const newAccessToken = await this.signToken({ sub: user.id, username: user.username, gr: globalRoles, type: 'access' }, accessJti, this.configService.jwtExpiresIn);
        const newRefreshToken = await this.signToken({ sub: user.id, username: user.username, type: 'refresh' }, refreshJti, this.configService.jwtRefreshExpiresIn);
        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_in: parseInt(this.configService.jwtExpiresIn, 10),
        };
    }
    async logout(accessToken) {
        let payload;
        try {
            payload = this.jwtService.verify(accessToken, {
                secret: this.configService.jwtSecret,
            });
        }
        catch {
            return;
        }
        if (payload.jti) {
            const exp = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            const remainTtl = Math.max(1, exp - now);
            await this.redisService.setBlacklist(payload.jti, remainTtl);
            this.logger.log(`[Auth] 用户 ${payload.username} (jti=${payload.jti}) 登出，token 已加入黑名单 TTL=${remainTtl}s`);
        }
    }
    async getMe(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || user.deleted_at) {
            throw new ddt_exception_1.DdtException('USER_NOT_FOUND');
        }
        const globalRoles = await this.loadGlobalRoles(user.id);
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url ?? null,
            phone: user.phone ?? null,
            status: user.status,
            last_login_at: user.last_login_at,
            global_roles: globalRoles,
        };
    }
    async validateUser(payload) {
        if (!payload || !payload.sub || !payload.jti) {
            return null;
        }
        if (payload.type && payload.type !== 'access') {
            return null;
        }
        const isBlacklisted = await this.redisService.isBlacklisted(payload.jti);
        if (isBlacklisted) {
            return null;
        }
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (!user || user.deleted_at || user.status !== roles_1.UserStatusEnum.ACTIVE) {
            return null;
        }
        return {
            userId: user.id,
            username: user.username,
            globalRoles: (payload.gr || []),
            jti: payload.jti,
        };
    }
    jwtVerify(token) {
        return this.jwtService.verify(token, {
            secret: this.configService.jwtSecret,
        });
    }
    async loadGlobalRoles(userId) {
        const roles = await this.globalRoleRepo.find({ where: { user_id: userId } });
        return roles.map((r) => r.role);
    }
    async signToken(payload, jti, expiresIn) {
        return this.jwtService.signAsync({ ...payload, jti }, {
            secret: this.configService.jwtSecret,
            expiresIn,
        });
    }
    async recordLoginFail(clientIp) {
        const count = await this.redisService.incrLoginFail(clientIp, this.configService.loginFailWindowSec);
        this.logger.warn(`[Auth] IP ${clientIp} 登录失败 ${count}/${this.configService.loginFailThreshold}`);
    }
    async hashPassword(plaintext) {
        return bcrypt.hash(plaintext, this.configService.bcryptCost);
    }
    validatePasswordStrength(password) {
        if (typeof password !== 'string' || password.length < 8) {
            return false;
        }
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        return hasLetter && hasDigit;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(global_role_entity_1.GlobalRoleEntity)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_service_1.ConfigService,
        redis_service_1.RedisService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map