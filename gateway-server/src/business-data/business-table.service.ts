import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from '../redis/redis.service';
import { DdtException } from '../common/ddt-exception';
import { BusinessTableEntity } from './business-table.entity';
import { BusinessFieldEntity } from './business-field.entity';
import {
  CreateBusinessTableDto,
  UpdateBusinessTableDto,
  CreateBusinessFieldDto,
  BackupTableDto,
} from './dto';

/**
 * 业务表元数据服务（对齐 SPEC-04 §6.1 / §6.3 / §6.4 与 SPEC-03 §5.2 类型映射）
 *
 * 职责：
 * 1. 业务表元数据 CRUD（business_tables + business_fields）
 * 2. 动态建物理表 / ALTER TABLE / DROP TABLE（按 SPEC-03 §5.2 类型映射）
 * 3. 缓存表清空与 Redis TTL 键清理
 * 4. 备份接口（本轮 mock，对齐 SPEC-04 §6.4.1 响应结构）
 *
 * 强约束：
 * - 动态 SQL 全部参数化（$1, $2...），标识符用双引号转义防注入
 * - 建表用 QueryRunner 事务：先写元数据 → 再 CREATE TABLE → 失败回滚
 * - 删表：先 DROP TABLE → 再删元数据（CASCADE 自动删字段元数据）
 */
@Injectable()
export class BusinessTableService {
  constructor(
    @InjectRepository(BusinessTableEntity)
    private readonly tableRepository: Repository<BusinessTableEntity>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  // ===== 元数据查询 =====

  /**
   * 列出项目业务表（对齐 SPEC-04 §6.1.1）
   * @param projectId 项目 ID
   * @param storageType 可选存储类型过滤（persistent / cache）
   */
  async listByProject(
    projectId: string,
    storageType?: 'persistent' | 'cache',
  ): Promise<BusinessTableEntity[]> {
    const where: any = { project_id: projectId };
    if (storageType) where.storage_type = storageType;
    return this.tableRepository.find({
      where,
      relations: ['fields'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 单表查询（含 fields）
   */
  async findById(tableId: string): Promise<BusinessTableEntity | null> {
    return this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['fields'],
    });
  }

  /**
   * 列出所有 cache 类型表（对齐 SPEC-04 §6.3.1）
   */
  async listCacheTables(): Promise<BusinessTableEntity[]> {
    return this.tableRepository.find({
      where: { storage_type: 'cache' },
      relations: ['fields'],
      order: { created_at: 'DESC' },
    });
  }

  // ===== 创建业务表（对齐 SPEC-04 §6.1.2）=====

  /**
   * 创建元数据 + 动态建物理表（事务）
   * 流程：校验 TTL → 派生表名 → 校验唯一 → 事务写元数据 + CREATE TABLE
   */
  async create(
    projectId: string,
    dto: CreateBusinessTableDto,
  ): Promise<BusinessTableEntity> {
    // 1. 校验 TTL（cache 类型必须 >= 60，对齐 SPEC-03 §5.1 chk_biztbl_ttl）
    if (dto.storage_type === 'cache') {
      if (!dto.ttl_seconds || dto.ttl_seconds < 60) {
        throw new DdtException('TTL_INVALID');
      }
    }

    // 2. 派生物理表名（对齐 SPEC-03 §5.3）
    const tableName = this.deriveTableName(projectId, dto.display_name);

    // 3. 校验全局唯一性（UNIQUE(table_name)）
    const existing = await this.tableRepository.findOne({
      where: { table_name: tableName },
    });
    if (existing) {
      throw new DdtException('BUSINESS_TABLE_NAME_CONFLICT');
    }

    // 4. 事务：写元数据 → 动态建物理表 → 失败回滚
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let newTableId: string | undefined;
    try {
      const table = queryRunner.manager.create(BusinessTableEntity, {
        project_id: projectId,
        table_name: tableName,
        display_name: dto.display_name,
        storage_type: dto.storage_type,
        ttl_seconds: dto.ttl_seconds ?? null,
        source: dto.source,
        row_count: 0,
        size_mb: 0,
      });
      const savedTable = await queryRunner.manager.save(table);
      newTableId = savedTable.id;

      // 写字段元数据（按数组顺序写 position）
      const fieldEntities = dto.fields.map((f, idx) => {
        return queryRunner.manager.create(BusinessFieldEntity, {
          business_table_id: savedTable.id,
          name: f.name,
          type: f.type,
          source: f.source,
          enabled: f.enabled,
          nullable: f.nullable,
          is_primary_key: f.is_primary_key,
          description: f.description ?? undefined,
          position: idx,
        });
      });
      await queryRunner.manager.save(fieldEntities);

      // 动态建物理表（按 SPEC-03 §5.2 类型映射）
      const ddl = this.buildCreateTableSql(tableName, dto.fields);
      await queryRunner.query(ddl);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // 返回完整对象（含 fields）
    return (await this.findById(newTableId!))!;
  }

  // ===== 更新业务表（对齐 SPEC-04 §6.1.3）=====

  /**
   * 更新元数据 + ALTER TABLE（字段启用/禁用切换）
   * - 字段 enabled false→true：ALTER TABLE ADD COLUMN
   * - 字段 enabled true→false：ALTER TABLE DROP COLUMN
   * - fields 项含 id 为更新现有字段，不含 id 为新增字段
   */
  async update(
    tableId: string,
    dto: UpdateBusinessTableDto,
  ): Promise<BusinessTableEntity> {
    const table = await this.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }

    // 校验 TTL（若更新后为 cache 类型）
    const willBeCache =
      dto.storage_type !== undefined
        ? dto.storage_type === 'cache'
        : table.storage_type === 'cache';
    if (willBeCache) {
      const ttl =
        dto.ttl_seconds !== undefined ? dto.ttl_seconds : table.ttl_seconds;
      if (!ttl || ttl < 60) {
        throw new DdtException('TTL_INVALID');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 更新表级字段（table_name 不可改，建表后物理表名锁定）
      if (dto.display_name !== undefined) table.display_name = dto.display_name;
      if (dto.storage_type !== undefined) table.storage_type = dto.storage_type;
      if (dto.ttl_seconds !== undefined) table.ttl_seconds = dto.ttl_seconds;
      if (dto.source !== undefined) table.source = dto.source;
      await queryRunner.manager.save(table);

      // 处理字段变更（启用/禁用切换 → ALTER TABLE）
      if (dto.fields && dto.fields.length > 0) {
        for (const f of dto.fields) {
          if (f.id) {
            await this.applyFieldUpdate(queryRunner, table, f);
          } else {
            await this.applyFieldCreate(queryRunner, table, f);
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return (await this.findById(tableId))!;
  }

  // ===== 删除业务表（对齐 SPEC-04 §6.1.4）=====

  /**
   * DROP TABLE + 删元数据（CASCADE 自动删字段元数据）+ 清 Redis TTL 键
   */
  async remove(
    tableId: string,
  ): Promise<{ dropped_table: string; rows_affected: number }> {
    const table = await this.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const rowsAffected = Number(table.row_count || 0);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 先 DROP TABLE（CASCADE 连带索引等依赖）
      await queryRunner.query(
        `DROP TABLE IF EXISTS ${this.quoteIdent(table.table_name)} CASCADE`,
      );
      // 再删元数据（CASCADE 自动删 business_fields 关联行）
      await queryRunner.manager.delete(BusinessTableEntity, { id: tableId });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // 清理 Redis 中该表所有 TTL 键
    await this.clearRedisTtlKeys(tableId);

    return { dropped_table: table.table_name, rows_affected: rowsAffected };
  }

  // ===== 清空缓存表（对齐 SPEC-04 §6.3.2）=====

  /**
   * TRUNCATE TABLE → 重置 row_count=0 / size_mb=0 → 清 Redis TTL 键
   */
  async clearCache(
    tableId: string,
  ): Promise<{ cleared_rows: number; table_id: string }> {
    const table = await this.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const clearedRows = Number(table.row_count || 0);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.query(
        `TRUNCATE TABLE ${this.quoteIdent(table.table_name)}`,
      );
      // 重置计数（参数化）
      await queryRunner.query(
        `UPDATE business_tables SET row_count = 0, size_mb = 0 WHERE id = $1`,
        [tableId],
      );
    } finally {
      await queryRunner.release();
    }

    // 清理 Redis 中该表所有 TTL 键
    await this.clearRedisTtlKeys(tableId);

    return { cleared_rows: clearedRows, table_id: tableId };
  }

  // ===== 备份（本轮 mock，对齐 SPEC-04 §6.4）=====

  /**
   * 触发单表备份（对齐 SPEC-04 §6.4.1）
   * 仅 storage_type=persistent 的表可备份；cache 表抛 CACHE_TABLE_BACKUP_FORBIDDEN。
   * 本轮返回 mock 结构，备份功能后续单独实现。
   */
  async backup(
    tableId: string,
    _dto: BackupTableDto,
  ): Promise<{
    backup_id: string;
    table_id: string;
    table_name: string;
    rows_backed_up: number;
    size_mb: number;
    download_url: string;
    created_at: string;
  }> {
    const table = await this.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    if (table.storage_type === 'cache') {
      throw new DdtException('CACHE_TABLE_BACKUP_FORBIDDEN');
    }
    // 本轮 mock 返回，对齐 SPEC-04 §6.4.1 响应结构
    const backupId = `bk_${Date.now()}`;
    return {
      backup_id: backupId,
      table_id: tableId,
      table_name: table.table_name,
      rows_backed_up: Number(table.row_count || 0),
      size_mb: Number(table.size_mb || 0),
      download_url: `/api/admin/v1/backups/${backupId}/download`,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * 列出备份与迁移记录（对齐 SPEC-04 §6.4.2）
   * 本轮 mock 返回空列表，备份功能后续单独实现。
   */
  async listBackups(
    _projectId: string,
    _type?: 'backup' | 'migration',
  ): Promise<any[]> {
    return [];
  }

  // ===== 私有辅助：字段变更 =====

  /** 更新现有字段（含启用/禁用切换的 ALTER TABLE） */
  private async applyFieldUpdate(
    queryRunner: import('typeorm').QueryRunner,
    table: BusinessTableEntity,
    f: CreateBusinessFieldDto & { id?: string },
  ): Promise<void> {
    const existing = table.fields.find((ef) => ef.id === f.id);
    if (!existing) return;
    const wasEnabled = existing.enabled;
    const willBeEnabled = f.enabled !== undefined ? f.enabled : existing.enabled;

    // 更新元数据
    if (f.enabled !== undefined) existing.enabled = f.enabled;
    if (f.nullable !== undefined) existing.nullable = f.nullable;
    await queryRunner.manager.save(existing);

    // ALTER TABLE：禁用→启用 ADD COLUMN；启用→禁用 DROP COLUMN
    if (!wasEnabled && willBeEnabled) {
      const colType = this.mapFieldType(existing);
      const parts = [colType];
      if (!existing.nullable) parts.push('NOT NULL');
      if (existing.type === 'timestamp' && existing.source === 'system') {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      }
      await queryRunner.query(
        `ALTER TABLE ${this.quoteIdent(table.table_name)} ADD COLUMN ${this.quoteIdent(existing.name)} ${parts.join(' ')}`,
      );
    } else if (wasEnabled && !willBeEnabled) {
      await queryRunner.query(
        `ALTER TABLE ${this.quoteIdent(table.table_name)} DROP COLUMN IF EXISTS ${this.quoteIdent(existing.name)}`,
      );
    }
  }

  /** 新增字段（含可选 ALTER TABLE ADD COLUMN） */
  private async applyFieldCreate(
    queryRunner: import('typeorm').QueryRunner,
    table: BusinessTableEntity,
    f: CreateBusinessFieldDto,
  ): Promise<void> {
    const newField = queryRunner.manager.create(BusinessFieldEntity, {
      business_table_id: table.id,
      name: f.name,
      type: f.type,
      source: f.source,
      enabled: f.enabled,
      nullable: f.nullable,
      is_primary_key: f.is_primary_key,
      description: f.description ?? undefined,
      position: table.fields.length,
    });
    await queryRunner.manager.save(newField);

    // enabled=true 时同步加物理列
    if (f.enabled) {
      const colType = this.mapFieldType(f);
      const parts = [colType];
      if (!f.nullable) parts.push('NOT NULL');
      if (f.type === 'timestamp' && f.source === 'system') {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      }
      await queryRunner.query(
        `ALTER TABLE ${this.quoteIdent(table.table_name)} ADD COLUMN ${this.quoteIdent(f.name)} ${parts.join(' ')}`,
      );
    }
  }

  // ===== 私有辅助：DDL / 类型映射 / 命名 =====

  /**
   * 派生物理表名（对齐 SPEC-03 §5.3）
   * tablePrefix = projectId 去除下划线小写；slug = displayName 转小写、非字母数字与中文替换为 _
   */
  private deriveTableName(projectId: string, displayName: string): string {
    const tablePrefix = projectId.replace(/_/g, '').toLowerCase();
    const slug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_');
    return `${tablePrefix}_${slug}`;
  }

  /** 标识符转义（双引号包裹，内部双引号转义，防 SQL 注入） */
  private quoteIdent(name: string): string {
    return '"' + name.replace(/"/g, '""') + '"';
  }

  /**
   * 类型映射（强锁 SPEC-03 §5.2）
   * - string → VARCHAR(255)，字段名含 content/reply/query/text/body 用 TEXT
   * - number → INTEGER，主键(is_primary_key=true && type=number) 用 BIGSERIAL
   * - boolean → BOOLEAN
   * - json → JSONB
   * - timestamp → TIMESTAMP WITH TIME ZONE
   */
  private mapFieldType(field: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file';
    is_primary_key: boolean;
    source: string;
  }): string {
    if (field.type === 'number' && field.is_primary_key) {
      return 'BIGSERIAL';
    }
    switch (field.type) {
      case 'string':
        // 长文本启发式：字段名含 content/reply/query/text/body 用 TEXT
        if (/(content|reply|query|text|body)/.test(field.name.toLowerCase())) {
          return 'TEXT';
        }
        return 'VARCHAR(255)';
      case 'number':
        return 'INTEGER';
      case 'boolean':
        return 'BOOLEAN';
      case 'json':
      case 'file': // file 类型物理列用 JSONB 存 { fileId, fileName, mimeType, sizeBytes, sha256 }
        return 'JSONB';
      case 'timestamp':
        return 'TIMESTAMP WITH TIME ZONE';
      default:
        return 'VARCHAR(255)';
    }
  }

  /**
   * 动态生成 CREATE TABLE DDL（对齐 SPEC-03 §5.2）
   * - 未启用字段(enabled=false)不创建列
   * - nullable=false 加 NOT NULL
   * - timestamp & source=system 加 DEFAULT CURRENT_TIMESTAMP
   */
  private buildCreateTableSql(
    tableName: string,
    fields: CreateBusinessFieldDto[],
  ): string {
    const columnDefs: string[] = [];
    for (const field of fields) {
      if (!field.enabled) continue; // 未启用字段不在物理表中创建列
      const colName = this.quoteIdent(field.name);
      const colType = this.mapFieldType(field);
      const parts: string[] = [colName, colType];
      if (field.is_primary_key && field.type === 'number') {
        // BIGSERIAL 隐含 NOT NULL，仅加 PRIMARY KEY
        parts.push('PRIMARY KEY');
      } else {
        if (!field.nullable) parts.push('NOT NULL');
        if (field.type === 'timestamp' && field.source === 'system') {
          parts.push('DEFAULT CURRENT_TIMESTAMP');
        }
      }
      columnDefs.push(parts.join(' '));
    }
    return `CREATE TABLE ${this.quoteIdent(tableName)} (\n  ${columnDefs.join(',\n  ')}\n)`;
  }

  /**
   * 清理某表所有 Redis TTL 键（ddt:cache:biz:{tableId}:*，对齐 SPEC-03 §5.4）
   * RedisService 未提供 scan/keys 封装，直接取原生客户端 keys（小规模可接受）。
   */
  private async clearRedisTtlKeys(tableId: string): Promise<void> {
    const client = this.redisService.getClient();
    const pattern = `ddt:cache:biz:${tableId}:*`;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
