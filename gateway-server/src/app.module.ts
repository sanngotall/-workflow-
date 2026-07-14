import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { DataSourceConfig } from './database/data-source';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PermissionGuard } from './common/permission.guard';
import { ProjectsModule } from './projects/projects.module';
import { RoutesModule } from './routes/routes.module';
import { CredentialsModule } from './credentials/credentials.module';
import { TransformersModule } from './transformers/transformers.module';
import { GatewayModule } from './gateway/gateway.module';
import { AdminModule } from './admin/admin.module';
import { RequestLogsModule } from './request-logs/request-logs.module';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';
import { CryptoModule } from './crypto/crypto.module';
import { AsyncWorkerModule } from './async-worker/async-worker.module';
import { QueueModule } from './queue/queue.module';
import { BusinessDataModule } from './business-data/business-data.module';
import { IdentityModule } from './identity/identity.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { WxConfigModule } from './wx-config/wx-config.module';
import { WxAuthModule } from './wx-auth/wx-auth.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DataSourceConfig,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    AppConfigModule,
    RedisModule,
    CryptoModule,
    CircuitBreakerModule,
    RateLimiterModule,
    AuthModule,
    ProjectsModule,
    RoutesModule,
    CredentialsModule,
    TransformersModule,
    GatewayModule,
    AdminModule,
    RequestLogsModule,
    AsyncWorkerModule,
    QueueModule,
    // 业务数据存储（表隔离模式，对齐 SPEC-03 §5 / SPEC-04 §6）
    BusinessDataModule,
    // 身份权限模块（对齐 SPEC-05：登录/用户/项目成员/全局角色/审计）
    IdentityModule,
    // 文件存储模块（对齐 SPEC-04 §6.6：file 类型字段的文件上传/下载/删除）
    FileStorageModule,
    // 微信小程序配置模块（per-project，存储 appId/appSecret/jwtSecret，AES-256-GCM 加密）
    WxConfigModule,
    // 微信小程序登录模块（对齐 SPEC-04 §6.8：wx.login() code → openid → 业务 JWT 换发）
    WxAuthModule,
  ],
  controllers: [HealthController],
  providers: [
    // 全局 Guard：先 JwtAuthGuard（token 校验 + 注入 user），再 PermissionGuard（角色权限判定）
    // 注意：注册顺序决定执行顺序，JwtAuthGuard 必须在前
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
