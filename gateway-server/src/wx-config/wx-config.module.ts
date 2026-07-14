import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WxConfigEntity } from './wx-config.entity';
import { WxConfigService } from './wx-config.service';
import { WxConfigController } from './wx-config.controller';
import { CryptoModule } from '../crypto/crypto.module';

/**
 * 微信小程序配置模块
 *
 * 依赖：
 * - TypeOrmModule.forFeature([WxConfigEntity])：注册实体
 * - CryptoModule：复用 CryptoService 加密 app_secret / jwt_secret
 *
 * 导出：
 * - WxConfigService：供网关层调用 getDecryptedSecrets 实现 wx 登录
 */
@Module({
  imports: [TypeOrmModule.forFeature([WxConfigEntity]), CryptoModule],
  controllers: [WxConfigController],
  providers: [WxConfigService],
  exports: [WxConfigService],
})
export class WxConfigModule {}
