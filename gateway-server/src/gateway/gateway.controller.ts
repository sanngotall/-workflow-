import { Controller, Post, Param, Body, Req, Res, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from './gateway.service';
import { Public } from '../common/decorators';

/**
 * 网关入口控制器（对齐 SPEC-04 §2：POST /v1/transit/:transitId/invoke）。
 *
 * 路径模型裁决：采用 transitId 入口模型，客户端只需持有 transitId（即 route.id）
 * 即可调用中转，不再暴露 projectId/environment/method/path 四元组。
 * 微信登录链路（/v1/transit/:transitId/auth/wx）由 wx-auth 模块后续实现。
 *
 * @Public 标记：网关入口为公开接口，前端调中转时不需要 admin token。
 * 鉴权由 transitId 本身承担（持有 transitId 即有权调用，对齐 SPEC-04 §2 设计）。
 */
@Public()
@Controller('v1/transit/:transitId')
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('invoke')
  async invoke(
    @Param('transitId') transitId: string,
    @Body() body: any,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';

    try {
      const result = await this.gatewayService.handleRequest(transitId, body, clientIp, reply);

      // 流式响应已通过 reply.raw 直接写入（SSE 透传），不能再调用 reply.send
      if (result.streamed) {
        return;
      }

      reply.send({
        success: true,
        data: result.data,
        error: null,
      });
    } catch (error) {
      // 兜底错误处理：DdtException 有 getResponse()，原生错误统一包装为 INTERNAL_ERROR
      if (error && typeof error.getResponse === 'function') {
        reply.send(error.getResponse());
      } else {
        this.logger.error(`[Gateway] 未预期错误: ${error?.message || error}`);
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
