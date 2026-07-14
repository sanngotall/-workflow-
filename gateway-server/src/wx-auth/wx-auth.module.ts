import { Module } from '@nestjs/common';
import { WxAuthController } from './wx-auth.controller';
import { WxAuthService } from './wx-auth.service';
import { RoutesModule } from '../routes/routes.module';
import { WxConfigModule } from '../wx-config/wx-config.module';

/**
 * 微信小程序登录模块（对齐 SPEC-04 §6.8）
 *
 * 职责：实现 wx.login() 的 code → openid → 业务 JWT 的换发链路
 *
 * 依赖：
 * - RoutesModule：用 RouteService.findById 反查 route.project_id
 * - WxConfigModule：用 WxConfigService.getDecryptedSecrets 拿解密后的 appId/appSecret/jwtSecret
 *
 * 路由：
 * - POST /v1/transit/:transitId/auth/wx（与 GatewayController 共享前缀，子路径不同）
 *
 * 安全约束：
 * - 接口用 @Public() 标记跳过系统级 JWT 鉴权（这是网关侧接口，给小程序前端调用）
 * - JWT 用项目级 jwtSecret 签发，与系统 JWT_SECRET 隔离（多租户隔离）
 */
@Module({
  imports: [RoutesModule, WxConfigModule],
  controllers: [WxAuthController],
  providers: [WxAuthService],
})
export class WxAuthModule {}
