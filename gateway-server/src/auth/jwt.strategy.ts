import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';

/**
 * JWT 策略（对齐 SPEC-05 §4.2）
 *
 * 从 Authorization: Bearer <token> 提取 token，
 * 调用 AuthService.validateUser 校验：
 *   - 签名 + 过期时间（jwtService.verify）
 *   - jti 黑名单
 *   - 账号 status = 'active'
 *
 * 校验通过后将 CurrentUserPayload 注入 request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      // 返回 null 会触发 Passport 的 UnauthorizedException
      return null;
    }
    return user;
  }
}
