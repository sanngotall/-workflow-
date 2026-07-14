import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessTableEntity } from './business-table.entity';
import { BusinessFieldEntity } from './business-field.entity';
import { BusinessTableService } from './business-table.service';
import { TableRowService } from './table-row.service';
import { TtlScannerService } from './ttl-scanner.service';
import { BusinessDataController } from './business-data.controller';
import { RedisModule } from '../redis/redis.module';
import { FileStorageModule } from '../file-storage/file-storage.module';

/**
 * 业务数据存储模块（对齐 SPEC-04 §6）
 *
 * 装配：
 * - 实体：BusinessTableEntity + BusinessFieldEntity
 * - 服务：BusinessTableService（元数据 + DDL）+ TableRowService（行级 CRUD）+ TtlScannerService（TTL 扫描 Worker）
 * - 控制器：BusinessDataController（12 个接口）
 * - 依赖：RedisModule（清理 TTL 键）+ FileStorageModule（TTL 清理时删 file 索引）
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessTableEntity, BusinessFieldEntity]),
    RedisModule,
    FileStorageModule,
  ],
  controllers: [BusinessDataController],
  providers: [BusinessTableService, TableRowService, TtlScannerService],
  exports: [BusinessTableService, TableRowService],
})
export class BusinessDataModule {}
