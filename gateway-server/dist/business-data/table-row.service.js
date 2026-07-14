"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableRowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const redis_service_1 = require("../redis/redis.service");
const ddt_exception_1 = require("../common/ddt-exception");
const business_table_service_1 = require("./business-table.service");
let TableRowService = class TableRowService {
    constructor(dataSource, businessTableService, redisService) {
        this.dataSource = dataSource;
        this.businessTableService = businessTableService;
        this.redisService = redisService;
    }
    async listRows(tableId, query) {
        const table = await this.businessTableService.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const enabledFields = table.fields.filter((f) => f.enabled);
        const limit = Math.min(Number(query.limit ?? 50), 500);
        const offset = Number(query.offset ?? 0);
        if (enabledFields.length === 0) {
            return { table_id: tableId, rows: [], total: 0, limit, offset };
        }
        const cols = enabledFields.map((f) => this.quoteIdent(f.name)).join(', ');
        const params = [];
        let whereSql = '';
        let paramIdx = 1;
        if (query.search) {
            const searchFields = query.field
                ? enabledFields.filter((f) => f.name === query.field)
                : enabledFields;
            const conditions = [];
            for (const f of searchFields) {
                conditions.push(`${this.quoteIdent(f.name)}::text ILIKE $${paramIdx}`);
                params.push(`%${query.search}%`);
                paramIdx++;
            }
            if (conditions.length > 0) {
                whereSql = 'WHERE ' + conditions.join(' OR ');
            }
        }
        const countResult = await this.dataSource.query(`SELECT COUNT(*)::bigint AS cnt FROM ${this.quoteIdent(table.table_name)} ${whereSql}`, params);
        const total = Number(countResult[0]?.cnt ?? 0);
        let orderBy;
        if (query.order_by) {
            const obField = enabledFields.find((f) => f.name === query.order_by);
            orderBy = obField
                ? `${this.quoteIdent(obField.name)} DESC`
                : `${this.quoteIdent(enabledFields[0].name)} DESC`;
        }
        else {
            const createdField = enabledFields.find((f) => f.name === 'created_at');
            if (createdField) {
                orderBy = `${this.quoteIdent('created_at')} DESC`;
            }
            else {
                const pk = enabledFields.find((f) => f.is_primary_key) ?? enabledFields[0];
                orderBy = `${this.quoteIdent(pk.name)} DESC`;
            }
        }
        const dataParams = [...params, limit, offset];
        const limitIdx = paramIdx;
        const offsetIdx = paramIdx + 1;
        const rows = await this.dataSource.query(`SELECT ${cols} FROM ${this.quoteIdent(table.table_name)} ${whereSql} ORDER BY ${orderBy} LIMIT $${limitIdx} OFFSET $${offsetIdx}`, dataParams);
        return { table_id: tableId, rows, total, limit, offset };
    }
    async createRow(tableId, row) {
        const table = await this.businessTableService.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const enabledFields = table.fields.filter((f) => f.enabled);
        const cols = [];
        const values = [];
        const placeholders = [];
        let idx = 1;
        for (const field of enabledFields) {
            if (field.source === 'system') {
                continue;
            }
            const val = row[field.name];
            if (val === undefined || val === null) {
                if (!field.nullable) {
                    throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', `字段 ${field.name} 不可为空`);
                }
                continue;
            }
            this.validateValueType(field, val);
            cols.push(this.quoteIdent(field.name));
            values.push(this.normalizeValue(field, val));
            placeholders.push(`$${idx}`);
            idx++;
        }
        let result;
        if (cols.length === 0) {
            result = await this.dataSource.query(`INSERT INTO ${this.quoteIdent(table.table_name)} DEFAULT VALUES RETURNING *`);
        }
        else {
            result = await this.dataSource.query(`INSERT INTO ${this.quoteIdent(table.table_name)} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values);
        }
        await this.dataSource.query(`UPDATE business_tables SET row_count = row_count + 1 WHERE id = $1`, [tableId]);
        return result[0];
    }
    async updateRow(tableId, rowId, patch) {
        const table = await this.businessTableService.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const enabledFields = table.fields.filter((f) => f.enabled);
        const pkField = enabledFields.find((f) => f.is_primary_key) ??
            table.fields.find((f) => f.is_primary_key);
        if (!pkField) {
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '表无主键字段');
        }
        const setClauses = [];
        const params = [];
        let idx = 1;
        for (const [key, val] of Object.entries(patch)) {
            const field = enabledFields.find((f) => f.name === key);
            if (!field) {
                throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', `字段 ${key} 不存在或未启用`);
            }
            if (field.is_primary_key) {
                throw new ddt_exception_1.DdtException('PRIMARY_KEY_IMMUTABLE');
            }
            if (val !== null && val !== undefined) {
                this.validateValueType(field, val);
            }
            setClauses.push(`${this.quoteIdent(key)} = $${idx}`);
            params.push(val === undefined ? null : this.normalizeValue(field, val));
            idx++;
        }
        if (setClauses.length === 0) {
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '无可更新字段');
        }
        let rowIdParam = rowId;
        if (pkField.type === 'number') {
            rowIdParam = Number(rowId);
        }
        const whereIdx = idx;
        params.push(rowIdParam);
        const result = await this.dataSource.query(`UPDATE ${this.quoteIdent(table.table_name)} SET ${setClauses.join(', ')} WHERE ${this.quoteIdent(pkField.name)} = $${whereIdx} RETURNING *`, params);
        if (result.length === 0) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND', '行不存在');
        }
        return result[0];
    }
    async deleteRow(tableId, rowId) {
        const table = await this.businessTableService.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const pkField = table.fields.find((f) => f.is_primary_key);
        if (!pkField) {
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '表无主键字段');
        }
        let rowIdParam = rowId;
        if (pkField.type === 'number') {
            rowIdParam = Number(rowId);
        }
        const result = await this.dataSource.query(`DELETE FROM ${this.quoteIdent(table.table_name)} WHERE ${this.quoteIdent(pkField.name)} = $1 RETURNING ${this.quoteIdent(pkField.name)}`, [rowIdParam]);
        if (result.length === 0) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND', '行不存在');
        }
        await this.dataSource.query(`UPDATE business_tables SET row_count = GREATEST(row_count - 1, 0) WHERE id = $1`, [tableId]);
        if (table.storage_type === 'cache') {
            await this.redisService.del(`ddt:cache:biz:${tableId}:${rowId}`);
        }
        return { deleted_row_id: rowIdParam, table_id: tableId };
    }
    quoteIdent(name) {
        return '"' + name.replace(/"/g, '""') + '"';
    }
    validateValueType(field, value) {
        if (value === null || value === undefined)
            return;
        switch (field.type) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 应为 string`);
                }
                break;
            case 'number':
                if (typeof value !== 'number' || Number.isNaN(value)) {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 应为 number`);
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 应为 boolean`);
                }
                break;
            case 'json':
                if (typeof value === 'string') {
                    try {
                        JSON.parse(value);
                    }
                    catch {
                        throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} JSON 解析失败`);
                    }
                }
                else if (typeof value !== 'object') {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 应为 json`);
                }
                break;
            case 'timestamp':
                if (typeof value === 'string') {
                    if (isNaN(Date.parse(value))) {
                        throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 时间格式非法`);
                    }
                }
                else if (!(value instanceof Date)) {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 应为 timestamp`);
                }
                break;
            case 'file':
                if (typeof value !== 'object' || value === null) {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 应为 file 对象`);
                }
                if (!value.fileId) {
                    throw new ddt_exception_1.DdtException('FIELD_TYPE_MISMATCH', `字段 ${field.name} 缺少 fileId`);
                }
                break;
        }
    }
    normalizeValue(field, value) {
        if (value === null || value === undefined)
            return null;
        if ((field.type === 'json' || field.type === 'file') && typeof value === 'object') {
            return JSON.stringify(value);
        }
        if (field.type === 'timestamp' && value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }
};
exports.TableRowService = TableRowService;
exports.TableRowService = TableRowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        business_table_service_1.BusinessTableService,
        redis_service_1.RedisService])
], TableRowService);
//# sourceMappingURL=table-row.service.js.map