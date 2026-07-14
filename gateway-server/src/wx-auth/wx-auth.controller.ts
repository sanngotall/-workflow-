import { Controller, Post, Param, Body, Res, Logger } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { WxAuthService } from './wx-auth.service';
import { Public } from '../common/decorators';

/**
 * 微信小程序登录控制器（对齐 SPEC-04 §6.8.1）
 *
 * 路径：POST /v1/transit/:transitId/auth/wx
 *
 * 设计要点：
 * 1. @Public() 标记跳过系统级 JWT 鉴权（这是网关侧接口，给小程序前端调用，不走 admin 鉴权）
 * 2. 与 GatewayController 共享 /v1/transit/:transitId 前缀，子路径不同（auth/wx vs invoke）
 * 3. main.ts 的 setGlobalPrefix exclude 已包含 v1/transit/(.*)，所以此接口不走 /api 前缀
 */
@Public()
@Controller('v1/transit/:transitId')
export class WxAuthController {
  private readonly logger = new Logger(WxAuthController.name);
  constructor(private readonly wxAuthService: WxAuthService) {}

  @Post('auth/wx')
  async login(
    @Param('transitId') transitId: string,
    @Body() body: { wxCode?: string; userId?: string },
    @Res() reply: FastifyReply,
  ) {
    // wxCode 必填校验
    if (!body?.wxCode) {
      reply.status(400).send({
        success: false,
        data: null,
        error: {
          code: 'INVALID_ARGUMENT',
          message: '缺少 wxCode 参数（wx.login() 返回的 5 分钟有效 code）',
        },
      });
      return;
    }

    try {
      const result = await this.wxAuthService.login(
        transitId,
        body.wxCode,
        body.userId,
      );

      reply.send({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      // 兜底错误处理：DdtException 有 getResponse()，原生错误统一包装为 INTERNAL_ERROR
      if (error && typeof error.getResponse === 'function') {
        reply.send(error.getResponse());
      } else {
        this.logger.error(`[WxAuth] 未预期错误: ${error?.message || error}`);
        reply.send({
          success: false,
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: error?.message || '内部错误',
          },
        });
      }
    }
  }
}
