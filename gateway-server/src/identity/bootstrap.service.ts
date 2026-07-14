import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { UserEntity } from './user.entity';
import { GlobalRoleEntity } from './global-role.entity';
import { ConfigService } from '../config/config.service';
import { AuthService } from '../auth/auth.service';
import { GlobalRoleEnum, UserStatusEnum } from './roles';

/**
 * 初始 admin 账户引导服务（对齐 SPEC-05 §9）
 *
 * 启动时检测：
 * - 若 users 表无任何 super_admin 用户 → 创建初始 admin 账户
 * - 用户名固定为 admin
 * - 密码随机生成 16 位（大小写字母 + 数字 + 符号）
 * - 密码同时：
 *   1. 打印到启动日志一次（醒目提示运维立即修改）
 *   2. 写入 INIT_ADMIN_PASSWORD_FILE 指定文件（默认 ./.ddt-admin-password）
 *
 * 若已存在 super_admin 用户则跳过（幂等）。
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(GlobalRoleEntity)
    private readonly globalRoleRepo: Repository<GlobalRoleEntity>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureInitialAdmin();
  }

  /**
   * 确保系统中存在至少一个 super_admin 用户
   */
  private async ensureInitialAdmin(): Promise<void> {
    // 1. 查询是否已有 super_admin
    const existingSuperAdmin = await this.globalRoleRepo.findOne({
      where: { role: GlobalRoleEnum.SUPER_ADMIN },
      relations: ['user'],
    });

    if (existingSuperAdmin && existingSuperAdmin.user) {
      // 已存在 super_admin，跳过创建
      this.logger.log(
        `[Bootstrap] 检测到已有 super_admin 用户：${existingSuperAdmin.user.username}，跳过初始 admin 创建`,
      );
      return;
    }

    // 2. 检查 admin 用户名是否已被占用（可能是 disabled 的旧 admin）
    const existingAdmin = await this.userRepo.findOne({
      where: { username: 'admin' },
    });
    if (existingAdmin) {
      // admin 用户名被占用但无 super_admin 角色 → 异常状态，警告但不创建
      this.logger.warn(
        `[Bootstrap] 用户名 admin 已被占用但未持有 super_admin 角色，跳过初始 admin 创建。请手动处理。`,
      );
      return;
    }

    // 3. 生成随机密码（16 位，含大小写字母 + 数字 + 符号）
    const password = this.generateRandomPassword(16);

    // 4. 哈希密码
    const passwordHash = await this.authService.hashPassword(password);

    // 5. 创建 admin 用户
    const user = this.userRepo.create({
      username: 'admin',
      email: this.configService.initAdminEmail,
      password_hash: passwordHash,
      name: 'Administrator',
      status: UserStatusEnum.ACTIVE,
    });
    const saved = await this.userRepo.save(user);

    // 6. 授予 super_admin 全局角色
    const gr = this.globalRoleRepo.create({
      user_id: saved.id,
      role: GlobalRoleEnum.SUPER_ADMIN,
    });
    await this.globalRoleRepo.save(gr);

    // 7. 打印密码到日志（醒目提示）
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

    // 8. 写入密码文件
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
      this.logger.log(
        `[Bootstrap] 初始 admin 密码已写入文件：${filePath}`,
      );
    } catch (err: any) {
      this.logger.error(
        `[Bootstrap] 初始 admin 密码文件写入失败：${err?.message}（密码仅在日志中显示，请立即记录并修改）`,
      );
    }
  }

  /**
   * 生成随机密码（对齐 SPEC-05 §8 密码强度：至少 8 位含字母+数字）
   * 这里生成 16 位，含大小写字母 + 数字 + 符号，确保高熵
   */
  private generateRandomPassword(length: number = 16): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{}';
    const all = upper + lower + digits + symbols;

    // 使用 crypto.randomBytes 生成密码，确保至少包含每类字符
    const bytes = crypto.randomBytes(length);
    const chars: string[] = [];

    // 前 4 位分别从 4 类中各取 1 个，确保覆盖
    chars.push(upper[bytes[0] % upper.length]);
    chars.push(lower[bytes[1] % lower.length]);
    chars.push(digits[bytes[2] % digits.length]);
    chars.push(symbols[bytes[3] % symbols.length]);

    // 剩余位数从全部字符集中取
    for (let i = 4; i < length; i++) {
      chars.push(all[bytes[i % bytes.length] % all.length]);
    }

    // 打乱顺序
    for (let i = chars.length - 1; i > 0; i--) {
      const j = bytes[i % bytes.length] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  }
}
