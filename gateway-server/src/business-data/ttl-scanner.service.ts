import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BusinessTableService } from './business-table.service';
import { BusinessTableEntity } from './business-table.entity';
import { RedisService } from '../redis/redis.service';
import { FileStorageService } from '../file-storage/file-storage.service';

/**
 * 业务数据缓存表 TTL 扫描 Worker（对齐 SPEC-02 §5 步骤 5 与 SPEC-03 §5.4）
 *
 * 职责：
 * - 定时扫描 storage_type='cache' 的物理表
 * - 删除超过 created_at + ttl_seconds 的过期行（物理删除兜底，防止 Redis TTL 失效后行残留）
 * - 同步删除 Redis 中对应的 ddt:cache:biz:{tableId}:{rowId} 键
 * - 同步清理行中 file 类型字段引用的文件索引（按 sha256 引用计数判定是否删磁盘）
 *
 * 触发周期：默认 60s 扫描一次（可由环境变量 BIZ_TTL_SCAN_INTERVAL_MS 调整）
 */
@Injectable()
export class TtlScannerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TtlScannerService.name);
  private readonly SCAN_INTERVAL_MS: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly dataSource: DataSource,
    private readonly businessTableService: BusinessTableService,
    private readonly redisService: RedisService,
    private readonly fileStorageService: FileStorageService,
  ) {
    this.SCAN_INTERVAL_MS = parseInt(process.env.BIZ_TTL_SCAN_INTERVAL_MS || '60000');
  }

  onModuleInit() {
    // 启动后延迟 10s 再开始首次扫描，避免与启动期流量峰值叠加
    this.timer = setTimeout(() => {
      this.scan().catch((err) => {
        this.logger.error(`TTL 扫描首次执行失败: ${err?.message || err}`);
      });
      // 之后定时执行
      this.timer = setInterval(() => {
        this.scan().catch((err) => {
          this.logger.error(`TTL 扫描失败: ${err?.message || err}`);
        });
      }, this.SCAN_INTERVAL_MS);
    }, 10000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 执行一次 TTL 扫描
   */
  async scan(): Promise<void> {
    // 获取所有 cache 类型业务表
    const cacheTables = await this.businessTableService.listCacheTables();
    if (cacheTables.length === 0) {
      return;
    }

    let totalExpired = 0;
    for (const table of cacheTables) {
      try {
        const expired = await this.scanTable(table);
        totalExpired += expired;
      } catch (err: any) {
        this.logger.error(`TTL 扫描表 ${table.table_name} 失败: ${err?.message || err}`);
      }
    }

    if (totalExpired > 0) {
      this.logger.log(`TTL 扫描完成：共清理 ${totalExpired} 行过期缓存数据`);
    }
  }

  /**
   * 扫描单张缓存表，删除过期行
   * 扩展：删除行前先提取 file 类型字段值，删除行后同步清理 file_index（按 sha256 引用计数判定是否删磁盘）
   */
  private async scanTable(table: BusinessTableEntity): Promise<number> {
    if (!table.ttl_seconds || table.ttl_seconds < 60) {
      return 0;
    }

    // 找到时间戳字段（created_at 或类似字段）
    const timeField = table.fields?.find(
      (f) => f.enabled && f.type === 'timestamp' && f.source === 'system',
    );
    if (!timeField) {
      // 没有时间字段无法判断过期，跳过
      return 0;
    }

    // 找到主键字段
    const pkField = table.fields?.find((f) => f.enabled && f.is_primary_key);
    if (!pkField) {
      return 0;
    }

    // 找到所有 file 类型字段（可能 0~N 个）
    const fileFields = table.fields?.filter((f) => f.enabled && f.type === 'file') || [];

    const quotedTable = this.quoteIdent(table.table_name);
    const quotedTime = this.quoteIdent(timeField.name);
    const quotedPk = this.quoteIdent(pkField.name);

    // 构造 SELECT 子句：主键 + 所有 file 字段值（JSONB 会被 node-postgres 解析为 JS 对象）
    const selectCols = [`${quotedPk} AS pk`];
    fileFields.forEach((f, idx) => {
      selectCols.push(`${this.quoteIdent(f.name)} AS f${idx}`);
    });

    // 先查询过期行（主键 + file 字段值），再删除
    const selectSql = `
      SELECT ${selectCols.join(', ')} FROM ${quotedTable}
      WHERE ${quotedTime} < NOW() - ($1 || ' seconds')::interval
      LIMIT 1000
    `;
    const expiredRows = await this.dataSource.query(selectSql, [String(table.ttl_seconds)]);

    if (!expiredRows || expiredRows.length === 0) {
      return 0;
    }

    // 清理 Redis TTL 键
    const pkValues = expiredRows.map((r: any) => String(r.pk));
    for (const pk of pkValues) {
      const key = `ddt:cache:biz:${table.id}:${pk}`;
      await this.redisService.del(key);
    }

    // 提取所有 file 字段值中的 fileId（file 字段值结构：{ fileId, fileName, mimeType, sizeBytes, sha256 }）
    const fileIdsToDelete: string[] = [];
    for (const row of expiredRows) {
      for (let i = 0; i < fileFields.length; i++) {
        const fileData = row[`f${i}`];
        if (!fileData) continue;
        // node-postgres 通常把 JSONB 解析为对象，但兜底处理字符串情况
        if (typeof fileData === 'object' && fileData.fileId) {
          fileIdsToDelete.push(fileData.fileId);
        } else if (typeof fileData === 'string') {
          try {
            const parsed = JSON.parse(fileData);
            if (parsed?.fileId) fileIdsToDelete.push(parsed.fileId);
          } catch {
            // 非合法 JSON，跳过
          }
        }
      }
    }

    // 执行删除（参数化主键列表）
    if (pkValues.length === 0) return 0;

    // 主键可能是 number 或 string，用 ANY($1::text[]) 通用处理
    const deleteSql = `
      DELETE FROM ${quotedTable}
      WHERE ${quotedPk}::text = ANY($1::text[])
    `;
    await this.dataSource.query(deleteSql, [pkValues]);

    // 行删除后，同步清理 file_index 记录（deleteFileIndex 内部按 sha256 引用计数判定是否删磁盘）
    if (fileIdsToDelete.length > 0) {
      let fileCleaned = 0;
      let filePhysicalRemoved = 0;
      for (const fileId of fileIdsToDelete) {
        try {
          const result = await this.fileStorageService.deleteFileIndex(fileId);
          fileCleaned++;
          if (result.physicalRemoved) filePhysicalRemoved++;
        } catch (e: any) {
          // 单个文件索引删除失败不阻断整体扫描
          this.logger.warn(`TTL 清理：删除文件索引 ${fileId} 失败: ${e?.message || e}`);
        }
      }
      if (fileCleaned > 0) {
        this.logger.debug(`TTL 表 ${table.table_name} 清理文件索引 ${fileCleaned} 条（其中 ${filePhysicalRemoved} 个物理文件已删盘）`);
      }
    }

    // 更新 row_count（减去删除的行数）
    await this.dataSource.query(
      `UPDATE business_tables SET row_count = GREATEST(row_count - $1, 0) WHERE id = $2`,
      [pkValues.length, table.id],
    );

    this.logger.debug(`TTL 表 ${table.table_name} 清理 ${pkValues.length} 行`);
    return pkValues.length;
  }

  /**
   * 标识符转义（防 SQL 注入，双引号包裹 + 内部双引号双写）
   */
  private quoteIdent(name: string): string {
    return '"' + name.replace(/"/g, '""') + '"';
  }
}
