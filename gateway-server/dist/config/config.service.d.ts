export declare class ConfigService {
    get port(): number;
    get jwtSecret(): string;
    get jwtExpiresIn(): string;
    get jwtRefreshExpiresIn(): string;
    get aesKey(): string;
    get aesIv(): string;
    get rateLimitPerMinute(): number;
    get maxQueueSize(): number;
    get environment(): string;
    get bcryptCost(): number;
    get initAdminEmail(): string;
    get initAdminPasswordFile(): string;
    get loginFailWindowSec(): number;
    get loginFailThreshold(): number;
    get loginFailBanSec(): number;
    get fileStorageRoot(): string;
    get fileMaxBytes(): number;
}
