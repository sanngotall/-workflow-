import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 从 Fastify request.user 中提取当前用户信息
 *
 * request.user 由 JwtAuthGuard 注入，结构对齐 SPEC-05 §4.2：
 *   { userId, username, globalRoles, jti, tokenId }
 *
 * 使用方式：
 *   async someMethod(@CurrentUser() user: CurrentUserPayload) { ... }
 *   async someMethod(@CurrentUser('userId') userId: string) { ... }
 */
export interface CurrentUserPayload {
  userId: string;
  username: string;
  globalRoles: string[];
  jti: string;
  tokenId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);
