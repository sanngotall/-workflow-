import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DdtException } from '../common/ddt-exception';
import { IS_PUBLIC_KEY } from '../common/decorators';
import { AuthService } from './auth.service';

/**
 * JWT 鉴权守卫（对齐 SPEC-05 §4.2）
 *
 * 设计要点：
 * 1. @Public() 标记的接口跳过鉴权
 * 2. 校验流程：提取 token → jwtService.verify → authService.validateUser → 注入 request.user
 *
 * 全局应用方式：在 main.ts 通过 APP_GUARD 注册为全局守卫
 * 注意：必须先于 PermissionGuard 执行（注册顺序在前面）
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. @Public() 直接放行
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new DdtException('UNAUTHENTICATED');
    }

    const token = authHeader.substring(7);

    // jwtService.verify 校验签名 + 过期时间
    // 注意：过期会抛 TokenExpiredError，签名错误会抛 JsonWebTokenError
    let payload: any;
    try {
      payload = this.authService.jwtVerify(token);
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new DdtException('TOKEN_EXPIRED');
      }
      throw new DdtException('TOKEN_INVALID');
    }

    // 校验黑名单 + 账号状态
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new DdtException('TOKEN_INVALID');
    }

    request.user = user;
    return true;
  }
}
