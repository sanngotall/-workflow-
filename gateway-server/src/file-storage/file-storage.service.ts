import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileIndexEntity } from './file-index.entity';
import { BusinessTableEntity } from '../business-data/business-table.entity';
import { ConfigService } from '../config/config.service';
import { DdtException } from '../common/ddt-exception';
import { ERROR_CODES } from '../common/error-codes';

/**
 * 文件存储服务（对齐 SPEC-04 §6.6）
 *
 * 本地磁盘实现。预留 MinIO 接口扩展位。
 *
 * 关键行为：
 * - 上传：计算 sha256，按 sha256 散列目录存盘；元数据落 file_index 表
 * - 去重：相同 sha256 物理文件只存一份，file_index 多条记录共用 storage_path
 * - 删除：删 file_index 记录后，按 sha256 查引用计数，无引用才删磁盘
 * - 下载：按 fileId 查索引，从磁盘读取流式返回
 */
@Injectable()
export class FileStorageService {
  constructor(
    @InjectRepository(FileIndexEntity)
    private readonly fileRepo: Repository<FileIndexEntity>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  /** 允许的 MIME 类型（对齐 SPEC-04 §6.6.1） */
  private static readonly ALLOWED_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/zip',
  ]);

  /** MIME → 扩展名映射（用于派生 storage_path） */
  private static readonly MIME_EXT: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/zip': 'zip',
  };

  /**
   * 上传文件（对齐 SPEC-04 §6.6.1）
   * @param businessTableId 关联业务表 ID
   * @param fileName 原始文件名
   * @param mimeType MIME 类型
   * @param buffer 文件字节
   * @param expiresAt 过期时间（仅 cache 表有效）
   */
  async upload(params: {
    businessTableId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    expiresAt?: Date | null;
  }): Promise<{
    fileId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
    storagePath: string;
    expiresAt: Date | null;
  }> {
    const { businessTableId, fileName, mimeType, buffer } = params;

    // 1. 校验文件大小
    if (buffer.length > this.config.fileMaxBytes) {
      throw new DdtException('FILE_TOO_LARGE');
    }

    // 2. 校验 MIME 类型
    if (!FileStorageService.ALLOWED_MIME.has(mimeType)) {
      throw new DdtException('FILE_TYPE_FORBIDDEN');
    }

    // 3. 查关联业务表（确认存在 + 是否有 file 类型字段）
    const tableRepo = this.dataSource.getRepository(BusinessTableEntity);
    const table = await tableRepo.findOne({
      where: { id: businessTableId },
      relations: ['fields'],
    });
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const hasFileField = table.fields.some(
      (f) => f.type === 'file' && f.enabled,
    );
    if (!hasFileField) {
      throw new DdtException('FILE_FIELD_TYPE_REQUIRED');
    }

    // 4. 计算 sha256
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // 5. 派生 storage_path：{tablePrefix}/{slug}/{sha[0:2]}/{sha[2:4]}/{sha}.{ext}
    const tablePrefix = table.project_id.replace(/_/g, '').toLowerCase();
    const slug = table.display_name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_');
    const ext = FileStorageService.MIME_EXT[mimeType] || 'bin';
    const storagePath = path.join(
      tablePrefix,
      slug,
      sha256.slice(0, 2),
      sha256.slice(2, 4),
      `${sha256}.${ext}`,
    );

    // 6. 写磁盘（按 sha256 去重：若已存在则跳过）
    const absPath = path.join(this.config.fileStorageRoot, storagePath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    try {
      await fs.access(absPath);
      // 文件已存在（sha256 相同），不重复写
    } catch {
      // 文件不存在，写入
      await fs.writeFile(absPath, buffer);
    }

    // 7. 落 file_index 记录
    const expiresAt =
      table.storage_type === 'cache' ? (params.expiresAt ?? null) : null;
    const entity = this.fileRepo.create({
      project_id: table.project_id,
      business_table_id: businessTableId,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: buffer.length,
      sha256,
      storage_path: storagePath,
      storage_type: 'local_disk',
      expires_at: expiresAt,
    });
    const saved = await this.fileRepo.save(entity);

    return {
      fileId: saved.id,
      fileName,
      mimeType,
      sizeBytes: buffer.length,
      sha256,
      storagePath,
      expiresAt,
    };
  }

  /**
   * 查询文件索引（用于下载与行写入校验）
   */
  async findById(fileId: string): Promise<FileIndexEntity | null> {
    return this.fileRepo.findOne({ where: { id: fileId } });
  }

  /**
   * 获取文件磁盘绝对路径（用于流式下载）
   */
  getAbsolutePath(storagePath: string): string {
    return path.join(this.config.fileStorageRoot, storagePath);
  }

  /**
   * 删除文件索引（对齐 SPEC-04 §6.6.3）
   * - 删 file_index 记录
   * - 按 sha256 查引用计数，无引用才删磁盘文件
   * @returns { deleted, physicalRemoved }
   */
  async deleteFileIndex(fileId: string): Promise<{
    deleted: boolean;
    physicalRemoved: boolean;
  }> {
    const entity = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!entity) {
      throw new DdtException('FILE_NOT_FOUND');
    }
    const { sha256, storage_path } = entity;

    // 删元数据
    await this.fileRepo.delete({ id: fileId });

    // 引用计数：是否还有其他记录引用同一 sha256
    const remaining = await this.fileRepo.count({ where: { sha256 } });
    if (remaining > 0) {
      return { deleted: true, physicalRemoved: false };
    }

    // 无引用，删磁盘文件
    const absPath = this.getAbsolutePath(storage_path);
    try {
      await fs.unlink(absPath);
      return { deleted: true, physicalRemoved: true };
    } catch (e: any) {
      // 磁盘文件已不存在（可能是手动删过），忽略错误
      return { deleted: true, physicalRemoved: false };
    }
  }

  /**
   * 批量清理过期文件索引（TTL 扫描器调用，对齐 SPEC-04 §6.6.5）
   * @returns 删除的记录数
   */
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const expired = await this.fileRepo
      .createQueryBuilder('f')
      .where('f.expires_at IS NOT NULL AND f.expires_at < :now', { now })
      .getMany();

    for (const f of expired) {
      try {
        await this.deleteFileIndex(f.id);
      } catch (e) {
        // 单条失败不影响整体
      }
    }
    return expired.length;
  }
}
