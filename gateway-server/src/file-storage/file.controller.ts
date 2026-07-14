import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { FileStorageService } from './file-storage.service';
import { DdtException } from '../common/ddt-exception';

/**
 * 文件存储控制器（对齐 SPEC-04 §6.6）
 * 路由前缀：/api/admin/v1/files
 *
 * 接口清单：
 * 6.6.1 POST   /files/upload          multipart 上传
 * 6.6.2 GET    /files/:fileId/download 下载文件流
 * 6.6.3 DELETE /files/:fileId         删除文件索引
 *
 * 注意：multipart 上传不走 NestJS ValidationPipe body 解析，
 * 通过 @Req() 拿到 fastify 原生 request 调用 .parts() 流式读取。
 */
@Controller('api/admin/v1/files')
export class FileController {
  constructor(private readonly fileStorage: FileStorageService) {}

  /** 6.6.1 上传文件（multipart/form-data） */
  @Post('upload')
  async upload(
    @Req() request: FastifyRequest,
    @Query('businessTableId') businessTableId?: string,
    @Query('expiresAt') expiresAt?: string,
  ) {
    if (!businessTableId) {
      throw new DdtException('FILE_FIELD_TYPE_REQUIRED');
    }

    // 解析 multipart 请求
    const parts = request.parts();
    let fileBuffer: Buffer | null = null;
    let fileName = '';
    let mimeType = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename;
        mimeType = part.mimetype;
        // 读取整个文件到 buffer（限 50MB，已在 main.ts 配置）
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk as Buffer);
        }
        fileBuffer = Buffer.concat(chunks);
        break; // 只处理第一个 file 字段
      }
    }

    if (!fileBuffer) {
      throw new BadRequestException('缺少 file 字段');
    }

    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    const result = await this.fileStorage.upload({
      businessTableId,
      fileName,
      mimeType,
      buffer: fileBuffer,
      expiresAt: expiresAtDate,
    });

    return {
      success: true,
      data: result,
      error: null,
    };
  }

  /** 6.6.2 下载文件 */
  @Get(':fileId/download')
  async download(
    @Param('fileId') fileId: string,
    @Res({ passthrough: false }) reply: FastifyReply,
  ) {
    const entity = await this.fileStorage.findById(fileId);
    if (!entity) {
      throw new DdtException('FILE_NOT_FOUND');
    }

    const absPath = this.fileStorage.getAbsolutePath(entity.storage_path);
    const fs = await import('fs');
    if (!fs.existsSync(absPath)) {
      throw new DdtException('FILE_NOT_FOUND');
    }

    const stream = fs.createReadStream(absPath);
    reply.header('Content-Type', entity.mime_type);
    reply.header(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(entity.file_name)}"`,
    );
    reply.header('Content-Length', String(entity.size_bytes));
    return reply.send(stream);
  }

  /** 6.6.3 删除文件索引 */
  @Delete(':fileId')
  async delete(@Param('fileId') fileId: string) {
    const result = await this.fileStorage.deleteFileIndex(fileId);
    return {
      success: true,
      data: result,
      error: null,
    };
  }
}
