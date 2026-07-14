"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
let ConfigService = class ConfigService {
    get port() {
        return parseInt(process.env.PORT || '3000');
    }
    get jwtSecret() {
        return process.env.JWT_SECRET || '';
    }
    get jwtExpiresIn() {
        return process.env.JWT_EXPIRES_IN || '7200s';
    }
    get jwtRefreshExpiresIn() {
        return process.env.JWT_REFRESH_EXPIRES_IN || '604800s';
    }
    get aesKey() {
        return process.env.AES_KEY || '';
    }
    get aesIv() {
        return process.env.AES_IV || '';
    }
    get rateLimitPerMinute() {
        return parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60');
    }
    get maxQueueSize() {
        return parseInt(process.env.MAX_QUEUE_SIZE || '10000');
    }
    get environment() {
        return process.env.NODE_ENV || 'development';
    }
    get bcryptCost() {
        return parseInt(process.env.BCRYPT_COST || '12');
    }
    get initAdminEmail() {
        return process.env.INIT_ADMIN_EMAIL || 'admin@ddt.local';
    }
    get initAdminPasswordFile() {
        return process.env.INIT_ADMIN_PASSWORD_FILE || './.ddt-admin-password';
    }
    get loginFailWindowSec() {
        return parseInt(process.env.LOGIN_FAIL_WINDOW_SEC || '300');
    }
    get loginFailThreshold() {
        return parseInt(process.env.LOGIN_FAIL_THRESHOLD || '5');
    }
    get loginFailBanSec() {
        return parseInt(process.env.LOGIN_FAIL_BAN_SEC || '900');
    }
    get fileStorageRoot() {
        return process.env.FILE_STORAGE_ROOT || './storage/files';
    }
    get fileMaxBytes() {
        return parseInt(process.env.FILE_MAX_BYTES || String(50 * 1024 * 1024));
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)()
], ConfigService);
//# sourceMappingURL=config.service.js.map