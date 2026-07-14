import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { DdtException } from '../common/ddt-exception';
import { BusinessTableService } from './business-table.service';
import { BusinessFieldEntity } from './business-field.entity';
import { CreateRowDto, UpdateRowDto } from './dto';

export interface ListRowsQuery {
  search?: string;
  field?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
}

/**
 * 业务表行数据图形化 CRUD 服务（对齐 SPEC-04 §6.2）
 *
 * 全部使用动态 SQL（参数化 $1, $2...），严禁 SELECT *。
 * source=system 字段由服务端填充（主键自增、created_at=NOW()），前端传值忽略。
 * 行 ID 统一用 string 接收，主键为 number(BIGSERIAL) 时内部转换为数字。
 */
@Injectable()
export class TableRowService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly businessTableService: BusinessTableService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 查询行（对齐 SPEC-04 §6.2.1）
   * 从 business_fields 加载 enabled 字段构造 SELECT（严禁 SELECT *）。
   * 支持全字段搜索 + 指定字段搜索。
   */
  async listRows(
    tableId: string,
    query: ListRowsQuery,
  ): Promise<{
    table_id: string;
    rows: any[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const table = await this.businessTableService.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const enabledFields = table.fields.filter((f) => f.enabled);
    const limit = Math.min(Number(query.limit ?? 50), 500);
    const offset = Number(query.offset ?? 0);

    if (enabledFields.length === 0) {
      return { table_id: tableId, rows: [], total: 0, limit, offset };
    }

    // 严禁 SELECT *：仅取 enabled 字段
    const cols = enabledFields.map((f) => this.quoteIdent(f.name)).join(', ');

    // WHERE 条件（全字段搜索 / 指定字段搜索，统一 ::text ILIKE）
    const params: any[] = [];
    let whereSql = '';
    let paramIdx = 1;
    if (query.search) {
      const searchFields = query.field
        ? enabledFields.filter((f) => f.name === query.field)
        : enabledFields;
      const conditions: string[] = [];
      for (const f of searchFields) {
        conditions.push(`${this.quoteIdent(f.name)}::text ILIKE $${paramIdx}`);
        params.push(`%${query.search}%`);
        paramIdx++;
      }
      if (conditions.length > 0) {
        whereSql = 'WHERE ' + conditions.join(' OR ');
      }
    }

    // 总数（复用同一 whereSql 与 params）
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*)::bigint AS cnt FROM ${this.quoteIdent(table.table_name)} ${whereSql}`,
      params,
    );
    const total = Number(countResult[0]?.cnt ?? 0);

    // 排序（默认 created_at DESC，不存在则用主键或首列）
    let orderBy: string;
    if (query.order_by) {
      const obField = enabledFields.find((f) => f.name === query.order_by);
      orderBy = obField
        ? `${this.quoteIdent(obField.name)} DESC`
        : `${this.quoteIdent(enabledFields[0].name)} DESC`;
    } else {
      const createdField = enabledFields.find((f) => f.name === 'created_at');
      if (createdField) {
        orderBy = `${this.quoteIdent('created_at')} DESC`;
      } else {
        const pk =
          enabledFields.find((f) => f.is_primary_key) ?? enabledFields[0];
        orderBy = `${this.quoteIdent(pk.name)} DESC`;
      }
    }

    // 数据查询（追加 limit/offset 参数）
    const dataParams = [...params, limit, offset];
    const limitIdx = paramIdx;
    const offsetIdx = paramIdx + 1;
    const rows = await this.dataSource.query(
      `SELECT ${cols} FROM ${this.quoteIdent(table.table_name)} ${whereSql} ORDER BY ${orderBy} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return { table_id: tableId, rows, total, limit, offset };
  }

  /**
   * 新增一行（对齐 SPEC-04 §6.2.2）
   * source=system 字段由服务端填充（主键自增、created_at=DEFAULT CURRENT_TIMESTAMP），前端传值忽略。
   * nullable=false 字段缺失抛 INVALID_ARGUMENT。
   */
  async createRow(tableId: string, row: CreateRowDto): Promise<any> {
    const table = await this.businessTableService.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const enabledFields = table.fields.filter((f) => f.enabled);

    const cols: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];
    let idx = 1;

    for (const field of enabledFields) {
      // source=system 字段由服务端填充，忽略前端传值
      // 主键 BIGSERIAL 自增；timestamp+system 有 DEFAULT CURRENT_TIMESTAMP
      if (field.source === 'system') {
        continue;
      }
      const val = (row as any)[field.name];
      if (val === undefined || val === null) {
        if (!field.nullable) {
          throw new DdtException(
            'INVALID_ARGUMENT',
            `字段 ${field.name} 不可为空`,
          );
        }
        continue;
      }
      this.validateValueType(field, val);
      cols.push(this.quoteIdent(field.name));
      values.push(this.normalizeValue(field, val));
      placeholders.push(`$${idx}`);
      idx++;
    }

    let result: any[];
    if (cols.length === 0) {
      result = await this.dataSource.query(
        `INSERT INTO ${this.quoteIdent(table.table_name)} DEFAULT VALUES RETURNING *`,
      );
    } else {
      result = await this.dataSource.query(
        `INSERT INTO ${this.quoteIdent(table.table_name)} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values,
      );
    }

    // 同步更新 business_tables.row_count
    await this.dataSource.query(
      `UPDATE business_tables SET row_count = row_count + 1 WHERE id = $1`,
      [tableId],
    );

    return result[0];
  }

  /**
   * 双击编辑单元格（对齐 SPEC-04 §6.2.3）
   * is_primary_key=true 字段不可改抛 PRIMARY_KEY_IMMUTABLE。
   * 按 type 校验值类型不匹配抛 FIELD_TYPE_MISMATCH。
   */
  async updateRow(
    tableId: string,
    rowId: string,
    patch: UpdateRowDto,
  ): Promise<any> {
    const table = await this.businessTableService.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const enabledFields = table.fields.filter((f) => f.enabled);

    // 主键字段定位（优先 enabled，兜底全表）
    const pkField =
      enabledFields.find((f) => f.is_primary_key) ??
      table.fields.find((f) => f.is_primary_key);
    if (!pkField) {
      throw new DdtException('INVALID_ARGUMENT', '表无主键字段');
    }

    // 校验 patch：字段存在/启用、主键不可改、类型校验
    const setClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(patch)) {
      const field = enabledFields.find((f) => f.name === key);
      if (!field) {
        throw new DdtException(
          'INVALID_ARGUMENT',
          `字段 ${key} 不存在或未启用`,
        );
      }
      if (field.is_primary_key) {
        throw new DdtException('PRIMARY_KEY_IMMUTABLE');
      }
      if (val !== null && val !== undefined) {
        this.validateValueType(field, val);
      }
      setClauses.push(`${this.quoteIdent(key)} = $${idx}`);
      params.push(
        val === undefined ? null : this.normalizeValue(field, val),
      );
      idx++;
    }

    if (setClauses.length === 0) {
      throw new DdtException('INVALID_ARGUMENT', '无可更新字段');
    }

    // rowId 类型转换（主键 number 时转数字）
    let rowIdParam: any = rowId;
    if (pkField.type === 'number') {
      rowIdParam = Number(rowId);
    }
    const whereIdx = idx;
    params.push(rowIdParam);

    const result = await this.dataSource.query(
      `UPDATE ${this.quoteIdent(table.table_name)} SET ${setClauses.join(', ')} WHERE ${this.quoteIdent(pkField.name)} = $${whereIdx} RETURNING *`,
      params,
    );
    if (result.length === 0) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND', '行不存在');
    }
    return result[0];
  }

  /**
   * 删除一行（对齐 SPEC-04 §6.2.4）
   * 同步更新 business_tables.row_count；若为 cache 表，删 Redis TTL 键。
   */
  async deleteRow(
    tableId: string,
    rowId: string,
  ): Promise<{ deleted_row_id: any; table_id: string }> {
    const table = await this.businessTableService.findById(tableId);
    if (!table) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND');
    }
    const pkField = table.fields.find((f) => f.is_primary_key);
    if (!pkField) {
      throw new DdtException('INVALID_ARGUMENT', '表无主键字段');
    }

    let rowIdParam: any = rowId;
    if (pkField.type === 'number') {
      rowIdParam = Number(rowId);
    }

    const result = await this.dataSource.query(
      `DELETE FROM ${this.quoteIdent(table.table_name)} WHERE ${this.quoteIdent(pkField.name)} = $1 RETURNING ${this.quoteIdent(pkField.name)}`,
      [rowIdParam],
    );
    if (result.length === 0) {
      throw new DdtException('BUSINESS_TABLE_NOT_FOUND', '行不存在');
    }

    // 同步更新 row_count（GREATEST 防止负数）
    await this.dataSource.query(
      `UPDATE business_tables SET row_count = GREATEST(row_count - 1, 0) WHERE id = $1`,
      [tableId],
    );

    // 若为 cache 表，删 Redis 行级 TTL 键（对齐 SPEC-03 §5.4）
    if (table.storage_type === 'cache') {
      await this.redisService.del(`ddt:cache:biz:${tableId}:${rowId}`);
    }

    return { deleted_row_id: rowIdParam, table_id: tableId };
  }

  // ===== 私有辅助 =====

  /** 标识符转义（双引号包裹，内部双引号转义，防 SQL 注入） */
  private quoteIdent(name: string): string {
    return '"' + name.replace(/"/g, '""') + '"';
  }

  /**
   * 按 type 校验值类型（对齐 SPEC-04 §6.5 FIELD_TYPE_MISMATCH）
   * null/undefined 由 nullable 逻辑处理，此处跳过。
   */
  private validateValueType(field: BusinessFieldEntity, value: any): void {
    if (value === null || value === undefined) return;
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 应为 string`,
          );
        }
        break;
      case 'number':
        if (typeof value !== 'number' || Number.isNaN(value)) {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 应为 number`,
          );
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 应为 boolean`,
          );
        }
        break;
      case 'json':
        // 允许对象或可解析字符串
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
          } catch {
            throw new DdtException(
              'FIELD_TYPE_MISMATCH',
              `字段 ${field.name} JSON 解析失败`,
            );
          }
        } else if (typeof value !== 'object') {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 应为 json`,
          );
        }
        break;
      case 'timestamp':
        if (typeof value === 'string') {
          if (isNaN(Date.parse(value))) {
            throw new DdtException(
              'FIELD_TYPE_MISMATCH',
              `字段 ${field.name} 时间格式非法`,
            );
          }
        } else if (!(value instanceof Date)) {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 应为 timestamp`,
          );
        }
        break;
      case 'file':
        // file 类型字段值必须为对象 { fileId, fileName, mimeType, sizeBytes, sha256 }
        if (typeof value !== 'object' || value === null) {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 应为 file 对象`,
          );
        }
        if (!(value as any).fileId) {
          throw new DdtException(
            'FIELD_TYPE_MISMATCH',
            `字段 ${field.name} 缺少 fileId`,
          );
        }
        break;
    }
  }

  /** 值规范化（json/file 对象序列化为字符串，Date 转 ISO 字符串） */
  private normalizeValue(field: BusinessFieldEntity, value: any): any {
    if (value === null || value === undefined) return null;
    if ((field.type === 'json' || field.type === 'file') && typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (field.type === 'timestamp' && value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
}
