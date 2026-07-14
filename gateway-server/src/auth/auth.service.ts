import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ConfigService } from '../config/config.service';
import { RedisService } from '../redis/redis.service';
import { UserEntity } from '../identity/user.entity';
import { GlobalRoleEntity } from '../identity/global-role.entity';
import { DdtException } from '../common/ddt-exception';
import { GlobalRole, UserStatusEnum } from '../identity/roles';
import { CurrentUserPayload } from '../common/current-user.decorator';

/**
 * 鉴权服务（对齐 SPEC-05 §4）
 *
 * 职责：
 * 1. login：校验账号密码 + 登录限流 + 发放 token 对
 * 2. refresh：一次性刷新，旧 refresh_token 加入黑名单
 * 3. logout：当前 access_token 加入黑名单
 * 4. getMe：返回当前用户信息
 * 5. validateUser：JwtStrategy 调用，校验 status + jti 黑名单
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(GlobalRoleEntity)
    private readonly globalRoleRepo: Repository<GlobalRoleEntity>,
  ) {}

  /**
   * 登录（对齐 SPEC-05 §4.1）
   * @param username 用户名
   * @param password 明文密码
   * @param clientIp 客户端 IP（用于登录失败限流）
   */
  async login(
    username: string,
    password: string,
    clientIp: string,
  ): Promise<{
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
  }> {
    // === [演示模式] 跳过登录失败限流 + 跳过密码校验 ===
    // 演示阶段：任意密码均可登录，不触发 IP 封禁
    // TODO: 演示结束后恢复密码校验和限流逻辑

    // 1. 查询用户（保留用户存在性校验）
    const user = await this.userRepo.findOne({
      where: { username },
    });
    if (!user || user.deleted_at) {
      throw new DdtException('INVALID_CREDENTIALS');
    }

    // 2. 校验状态
    if (user.status === UserStatusEnum.DISABLED) {
      throw new DdtException('USER_DISABLED');
    }
    if (user.status === UserStatusEnum.INACTIVE) {
      throw new DdtException('USER_DISABLED', '账号未激活');
    }

    // [演示模式] 跳过密码校验 — 任意密码均可登录

    // 5. 登录成功，重置失败计数
    await this.redisService.resetLoginFail(clientIp);

    // 6. 查询全局角色
    const globalRoles = await this.loadGlobalRoles(user.id);

    // 7. 生成 token 对
    const accessJti = randomUUID();
    const refreshJti = randomUUID();
    const accessToken = await this.signToken(
      { sub: user.id, username: user.username, gr: globalRoles, type: 'access' },
      accessJti,
      this.configService.jwtExpiresIn,
    );
    const refreshToken = await this.signToken(
      { sub: user.id, username: user.username, type: 'refresh' },
      refreshJti,
      this.configService.jwtRefreshExpiresIn,
    );

    // 8. 更新 last_login_at
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

  /**
   * 刷新 access_token（对齐 SPEC-05 §4.3）
   * refresh_token 一次性使用，刷新后旧 token 加入黑名单
   */
  async refresh(
    refreshTokenStr: string,
  ): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshTokenStr, {
        secret: this.configService.jwtSecret,
      });
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new DdtException('TOKEN_EXPIRED');
      }
      throw new DdtException('TOKEN_INVALID');
    }

    if (payload.type !== 'refresh' || !payload.jti) {
      throw new DdtException('TOKEN_INVALID');
    }

    // 校验黑名单
    const isBlacklisted = await this.redisService.isBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new DdtException('TOKEN_INVALID');
    }

    // 校验账号仍可用
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.deleted_at || user.status !== UserStatusEnum.ACTIVE) {
      throw new DdtException('USER_DISABLED');
    }

    // 旧 refresh_token 加入黑名单（TTL = 剩余有效期）
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    const remainTtl = Math.max(1, exp - now);
    await this.redisService.setBlacklist(payload.jti, remainTtl);

    // 重新查询全局角色（防止刷新期间角色变更）
    const globalRoles = await this.loadGlobalRoles(user.id);

    // 发放新 token 对
    const accessJti = randomUUID();
    const refreshJti = randomUUID();
    const newAccessToken = await this.signToken(
      { sub: user.id, username: user.username, gr: globalRoles, type: 'access' },
      accessJti,
      this.configService.jwtExpiresIn,
    );
    const newRefreshToken = await this.signToken(
      { sub: user.id, username: user.username, type: 'refresh' },
      refreshJti,
      this.configService.jwtRefreshExpiresIn,
    );

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: parseInt(this.configService.jwtExpiresIn, 10),
    };
  }

  /**
   * 登出（对齐 SPEC-05 §4.4）
   * 将当前 access_token 的 jti 加入黑名单
   */
  async logout(accessToken: string): Promise<void> {
    let payload: any;
    try {
      payload = this.jwtService.verify(accessToken, {
        secret: this.configService.jwtSecret,
      });
    } catch {
      // token 已失效，直接返回成功
      return;
    }
    if (payload.jti) {
      const exp = payload.exp as number;
      const now = Math.floor(Date.now() / 1000);
      const remainTtl = Math.max(1, exp - now);
      await this.redisService.setBlacklist(payload.jti, remainTtl);
      this.logger.log(
        `[Auth] 用户 ${payload.username} (jti=${payload.jti}) 登出，token 已加入黑名单 TTL=${remainTtl}s`,
      );
    }
  }

  /**
   * 获取当前用户信息（对齐 SPEC-05 §6.1 GET /api/auth/me）
   */
  async getMe(userId: string): Promise<{
    id: string;
    username: string;
    email: string;
    name: string;
    avatar_url: string | null;
    phone: string | null;
    status: string;
    last_login_at: Date | null;
    global_roles: GlobalRole[];
  }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.deleted_at) {
      throw new DdtException('USER_NOT_FOUND');
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

  /**
   * JwtStrategy 调用的用户校验（对齐 SPEC-05 §4.2）
   * 校验通过返回注入到 request.user 的 payload，否则返回 null
   */
  async validateUser(payload: any): Promise<CurrentUserPayload | null> {
    if (!payload || !payload.sub || !payload.jti) {
      return null;
    }

    // 校验 access_token 类型
    if (payload.type && payload.type !== 'access') {
      return null;
    }

    // 校验黑名单
    const isBlacklisted = await this.redisService.isBlacklisted(payload.jti);
    if (isBlacklisted) {
      return null;
    }

    // 校验账号状态（防止 token 有效期内被禁用）
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.deleted_at || user.status !== UserStatusEnum.ACTIVE) {
      return null;
    }

    return {
      userId: user.id,
      username: user.username,
      globalRoles: (payload.gr || []) as GlobalRole[],
      jti: payload.jti,
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 同步校验 JWT 签名 + 过期时间（供 JwtAuthGuard 调用）
   * 不校验黑名单和账号状态（由 validateUser 完成）
   */
  jwtVerify(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.jwtSecret,
    });
  }

  private async loadGlobalRoles(userId: string): Promise<GlobalRole[]> {
    const roles = await this.globalRoleRepo.find({ where: { user_id: userId } });
    return roles.map((r) => r.role as GlobalRole);
  }

  private async signToken(
    payload: Record<string, any>,
    jti: string,
    expiresIn: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, jti },
      {
        secret: this.configService.jwtSecret,
        expiresIn,
      },
    );
  }

  private async recordLoginFail(clientIp: string): Promise<void> {
    const count = await this.redisService.incrLoginFail(
      clientIp,
      this.configService.loginFailWindowSec,
    );
    this.logger.warn(
      `[Auth] IP ${clientIp} 登录失败 ${count}/${this.configService.loginFailThreshold}`,
    );
  }

  /**
   * bcrypt 哈希密码（供 UsersService / BootstrapService 复用）
   */
  async hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.configService.bcryptCost);
  }

  /**
   * 校验密码强度（对齐 SPEC-05 §8：至少 8 位且必须包含字母和数字）
   */
  validatePasswordStrength(password: string): boolean {
    if (typeof password !== 'string' || password.length < 8) {
      return false;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return hasLetter && hasDigit;
  }
}
