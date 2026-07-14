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
var BootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const user_entity_1 = require("./user.entity");
const global_role_entity_1 = require("./global-role.entity");
const config_service_1 = require("../config/config.service");
const auth_service_1 = require("../auth/auth.service");
const roles_1 = require("./roles");
let BootstrapService = BootstrapService_1 = class BootstrapService {
    constructor(userRepo, globalRoleRepo, configService, authService) {
        this.userRepo = userRepo;
        this.globalRoleRepo = globalRoleRepo;
        this.configService = configService;
        this.authService = authService;
        this.logger = new common_1.Logger(BootstrapService_1.name);
    }
    async onModuleInit() {
        await this.ensureInitialAdmin();
    }
    async ensureInitialAdmin() {
        const existingSuperAdmin = await this.globalRoleRepo.findOne({
            where: { role: roles_1.GlobalRoleEnum.SUPER_ADMIN },
            relations: ['user'],
        });
        if (existingSuperAdmin && existingSuperAdmin.user) {
            this.logger.log(`[Bootstrap] 检测到已有 super_admin 用户：${existingSuperAdmin.user.username}，跳过初始 admin 创建`);
            return;
        }
        const existingAdmin = await this.userRepo.findOne({
            where: { username: 'admin' },
        });
        if (existingAdmin) {
            this.logger.warn(`[Bootstrap] 用户名 admin 已被占用但未持有 super_admin 角色，跳过初始 admin 创建。请手动处理。`);
            return;
        }
        const password = this.generateRandomPassword(16);
        const passwordHash = await this.authService.hashPassword(password);
        const user = this.userRepo.create({
            username: 'admin',
            email: this.configService.initAdminEmail,
            password_hash: passwordHash,
            name: 'Administrator',
            status: roles_1.UserStatusEnum.ACTIVE,
        });
        const saved = await this.userRepo.save(user);
        const gr = this.globalRoleRepo.create({
            user_id: saved.id,
            role: roles_1.GlobalRoleEnum.SUPER_ADMIN,
        });
        await this.globalRoleRepo.save(gr);
        const banner = '='.repeat(72);
        this.logger.log(`\n${banner}
[Bootstrap] 初始管理员账户已创建 ⚠️

  用户名：admin
  密码：${password}
  邮箱：${this.configService.initAdminEmail}
  用户ID：${saved.id}

  ⚠️  请立即登录并修改密码！
  ⚠️  此密码仅本次启动显示，不会再次输出。
  ⚠️  密码已落盘到：${this.configService.initAdminPasswordFile}

${banner}`);
        try {
            const filePath = path.resolve(this.configService.initAdminPasswordFile);
            const content = `# DDT 初始管理员密码（首次部署自动生成）
# 生成时间：${new Date().toISOString()}
# 用户名：admin
# 用户ID：${saved.id}
# 邮箱：${this.configService.initAdminEmail}
# ⚠️ 请立即登录并修改密码，修改后可删除此文件
admin:${password}
`;
            fs.writeFileSync(filePath, content, { mode: 0o600 });
            this.logger.log(`[Bootstrap] 初始 admin 密码已写入文件：${filePath}`);
        }
        catch (err) {
            this.logger.error(`[Bootstrap] 初始 admin 密码文件写入失败：${err?.message}（密码仅在日志中显示，请立即记录并修改）`);
        }
    }
    generateRandomPassword(length = 16) {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{}';
        const all = upper + lower + digits + symbols;
        const bytes = crypto.randomBytes(length);
        const chars = [];
        chars.push(upper[bytes[0] % upper.length]);
        chars.push(lower[bytes[1] % lower.length]);
        chars.push(digits[bytes[2] % digits.length]);
        chars.push(symbols[bytes[3] % symbols.length]);
        for (let i = 4; i < length; i++) {
            chars.push(all[bytes[i % bytes.length] % all.length]);
        }
        for (let i = chars.length - 1; i > 0; i--) {
            const j = bytes[i % bytes.length] % (i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        return chars.join('');
    }
};
exports.BootstrapService = BootstrapService;
exports.BootstrapService = BootstrapService = BootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(global_role_entity_1.GlobalRoleEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_service_1.ConfigService,
        auth_service_1.AuthService])
], BootstrapService);
//# sourceMappingURL=bootstrap.service.js.map