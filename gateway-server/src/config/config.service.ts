import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get port(): number {
    return parseInt(process.env.PORT || '3000');
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || '';
  }

  /** access_token 过期时间（默认 2h，对齐 SPEC-05 §4.1） */
  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7200s';
  }

  /** refresh_token 过期时间（默认 7d，对齐 SPEC-05 §4.1） */
  get jwtRefreshExpiresIn(): string {
    return process.env.JWT_REFRESH_EXPIRES_IN || '604800s';
  }

  get aesKey(): string {
    return process.env.AES_KEY || '';
  }

  get aesIv(): string {
    return process.env.AES_IV || '';
  }

  get rateLimitPerMinute(): number {
    return parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60');
  }

  get maxQueueSize(): number {
    return parseInt(process.env.MAX_QUEUE_SIZE || '10000');
  }

  get environment(): string {
    return process.env.NODE_ENV || 'development';
  }

  /** bcrypt 哈希成本（默认 12，对齐 SPEC-05 §8） */
  get bcryptCost(): number {
    return parseInt(process.env.BCRYPT_COST || '12');
  }

  /** 初始 admin 邮箱（部署时通过环境变量注入，对齐 SPEC-05 §9） */
  get initAdminEmail(): string {
    return process.env.INIT_ADMIN_EMAIL || 'admin@ddt.local';
  }

  /** 初始 admin 密码文件落盘路径（部署时由运维查看，对齐 SPEC-05 §9） */
  get initAdminPasswordFile(): string {
    return process.env.INIT_ADMIN_PASSWORD_FILE || './.ddt-admin-password';
  }

  /** 登录失败限流：窗口期（秒，默认 300 = 5 分钟，对齐 SPEC-05 §8） */
  get loginFailWindowSec(): number {
    return parseInt(process.env.LOGIN_FAIL_WINDOW_SEC || '300');
  }

  /** 登录失败限流：阈值（默认 5 次，对齐 SPEC-05 §8） */
  get loginFailThreshold(): number {
    return parseInt(process.env.LOGIN_FAIL_THRESHOLD || '5');
  }

  /** 登录失败限流：封禁时长（秒，默认 900 = 15 分钟，对齐 SPEC-05 §8） */
  get loginFailBanSec(): number {
    return parseInt(process.env.LOGIN_FAIL_BAN_SEC || '900');
  }

  /** 文件存储根目录（对齐 SPEC-03 §5.1.1）
   * 开发环境：./storage/files
   * 生产环境：/opt/duanduantong-core/files（通过 FILE_STORAGE_ROOT 注入）
   */
  get fileStorageRoot(): string {
    return process.env.FILE_STORAGE_ROOT || './storage/files';
  }

  /** 单文件大小上限（字节，默认 50MB，对齐 SPEC-04 §6.6.1） */
  get fileMaxBytes(): number {
    return parseInt(process.env.FILE_MAX_BYTES || String(50 * 1024 * 1024));
  }
}
