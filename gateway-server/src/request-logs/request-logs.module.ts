import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLogEntity } from './request-log.entity';
import { RequestLogService } from './request-log.service';
import { RequestLogController } from './request-log.controller';

/**
 * 请求日志模块（对齐 SPEC-04 §7 Live-Console API）
 *
 * 装配：
 * - 实体：RequestLogEntity
 * - 服务：RequestLogService（写入 + 分页查询 + 聚合统计）
 * - 控制器：RequestLogController（2 个接口：listLogs + getStats）
 *
 * 被 GatewayModule 引用：网关层每次请求后调 requestLogService.create 写日志
 */
@Module({
  imports: [TypeOrmModule.forFeature([RequestLogEntity])],
  controllers: [RequestLogController],
  providers: [RequestLogService],
  exports: [RequestLogService],
})
export class RequestLogsModule {}
