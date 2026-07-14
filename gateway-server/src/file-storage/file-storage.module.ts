import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileIndexEntity } from './file-index.entity';
import { FileStorageService } from './file-storage.service';
import { FileController } from './file.controller';
import { ConfigModule } from '../config/config.module';

/**
 * 文件存储模块（对齐 SPEC-04 §6.6）
 *
 * 装配：
 * - 实体：FileIndexEntity
 * - 服务：FileStorageService（本地磁盘实现）
 * - 控制器：FileController（3 个接口）
 * - 依赖：ConfigModule（读取 fileStorageRoot / fileMaxBytes）
 *
 * 被 BusinessDataModule 引用：行删除/表清空时调用 FileStorageService 删 file 索引
 */
@Module({
  imports: [TypeOrmModule.forFeature([FileIndexEntity]), ConfigModule],
  controllers: [FileController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
