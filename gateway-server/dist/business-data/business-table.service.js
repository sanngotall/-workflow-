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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTableService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const redis_service_1 = require("../redis/redis.service");
const ddt_exception_1 = require("../common/ddt-exception");
const business_table_entity_1 = require("./business-table.entity");
const business_field_entity_1 = require("./business-field.entity");
let BusinessTableService = class BusinessTableService {
    constructor(tableRepository, dataSource, redisService) {
        this.tableRepository = tableRepository;
        this.dataSource = dataSource;
        this.redisService = redisService;
    }
    async listByProject(projectId, storageType) {
        const where = { project_id: projectId };
        if (storageType)
            where.storage_type = storageType;
        return this.tableRepository.find({
            where,
            relations: ['fields'],
            order: { created_at: 'DESC' },
        });
    }
    async findById(tableId) {
        return this.tableRepository.findOne({
            where: { id: tableId },
            relations: ['fields'],
        });
    }
    async listCacheTables() {
        return this.tableRepository.find({
            where: { storage_type: 'cache' },
            relations: ['fields'],
            order: { created_at: 'DESC' },
        });
    }
    async create(projectId, dto) {
        if (dto.storage_type === 'cache') {
            if (!dto.ttl_seconds || dto.ttl_seconds < 60) {
                throw new ddt_exception_1.DdtException('TTL_INVALID');
            }
        }
        const tableName = this.deriveTableName(projectId, dto.display_name);
        const existing = await this.tableRepository.findOne({
            where: { table_name: tableName },
        });
        if (existing) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NAME_CONFLICT');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let newTableId;
        try {
            const table = queryRunner.manager.create(business_table_entity_1.BusinessTableEntity, {
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
            const fieldEntities = dto.fields.map((f, idx) => {
                return queryRunner.manager.create(business_field_entity_1.BusinessFieldEntity, {
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
            const ddl = this.buildCreateTableSql(tableName, dto.fields);
            await queryRunner.query(ddl);
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
        return (await this.findById(newTableId));
    }
    async update(tableId, dto) {
        const table = await this.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const willBeCache = dto.storage_type !== undefined
            ? dto.storage_type === 'cache'
            : table.storage_type === 'cache';
        if (willBeCache) {
            const ttl = dto.ttl_seconds !== undefined ? dto.ttl_seconds : table.ttl_seconds;
            if (!ttl || ttl < 60) {
                throw new ddt_exception_1.DdtException('TTL_INVALID');
            }
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (dto.display_name !== undefined)
                table.display_name = dto.display_name;
            if (dto.storage_type !== undefined)
                table.storage_type = dto.storage_type;
            if (dto.ttl_seconds !== undefined)
                table.ttl_seconds = dto.ttl_seconds;
            if (dto.source !== undefined)
                table.source = dto.source;
            await queryRunner.manager.save(table);
            if (dto.fields && dto.fields.length > 0) {
                for (const f of dto.fields) {
                    if (f.id) {
                        await this.applyFieldUpdate(queryRunner, table, f);
                    }
                    else {
                        await this.applyFieldCreate(queryRunner, table, f);
                    }
                }
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
        return (await this.findById(tableId));
    }
    async remove(tableId) {
        const table = await this.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const rowsAffected = Number(table.row_count || 0);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`DROP TABLE IF EXISTS ${this.quoteIdent(table.table_name)} CASCADE`);
            await queryRunner.manager.delete(business_table_entity_1.BusinessTableEntity, { id: tableId });
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
        await this.clearRedisTtlKeys(tableId);
        return { dropped_table: table.table_name, rows_affected: rowsAffected };
    }
    async clearCache(tableId) {
        const table = await this.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const clearedRows = Number(table.row_count || 0);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await queryRunner.query(`TRUNCATE TABLE ${this.quoteIdent(table.table_name)}`);
            await queryRunner.query(`UPDATE business_tables SET row_count = 0, size_mb = 0 WHERE id = $1`, [tableId]);
        }
        finally {
            await queryRunner.release();
        }
        await this.clearRedisTtlKeys(tableId);
        return { cleared_rows: clearedRows, table_id: tableId };
    }
    async backup(tableId, _dto) {
        const table = await this.findById(tableId);
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        if (table.storage_type === 'cache') {
            throw new ddt_exception_1.DdtException('CACHE_TABLE_BACKUP_FORBIDDEN');
        }
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
    async listBackups(_projectId, _type) {
        return [];
    }
    async applyFieldUpdate(queryRunner, table, f) {
        const existing = table.fields.find((ef) => ef.id === f.id);
        if (!existing)
            return;
        const wasEnabled = existing.enabled;
        const willBeEnabled = f.enabled !== undefined ? f.enabled : existing.enabled;
        if (f.enabled !== undefined)
            existing.enabled = f.enabled;
        if (f.nullable !== undefined)
            existing.nullable = f.nullable;
        await queryRunner.manager.save(existing);
        if (!wasEnabled && willBeEnabled) {
            const colType = this.mapFieldType(existing);
            const parts = [colType];
            if (!existing.nullable)
                parts.push('NOT NULL');
            if (existing.type === 'timestamp' && existing.source === 'system') {
                parts.push('DEFAULT CURRENT_TIMESTAMP');
            }
            await queryRunner.query(`ALTER TABLE ${this.quoteIdent(table.table_name)} ADD COLUMN ${this.quoteIdent(existing.name)} ${parts.join(' ')}`);
        }
        else if (wasEnabled && !willBeEnabled) {
            await queryRunner.query(`ALTER TABLE ${this.quoteIdent(table.table_name)} DROP COLUMN IF EXISTS ${this.quoteIdent(existing.name)}`);
        }
    }
    async applyFieldCreate(queryRunner, table, f) {
        const newField = queryRunner.manager.create(business_field_entity_1.BusinessFieldEntity, {
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
        if (f.enabled) {
            const colType = this.mapFieldType(f);
            const parts = [colType];
            if (!f.nullable)
                parts.push('NOT NULL');
            if (f.type === 'timestamp' && f.source === 'system') {
                parts.push('DEFAULT CURRENT_TIMESTAMP');
            }
            await queryRunner.query(`ALTER TABLE ${this.quoteIdent(table.table_name)} ADD COLUMN ${this.quoteIdent(f.name)} ${parts.join(' ')}`);
        }
    }
    deriveTableName(projectId, displayName) {
        const tablePrefix = projectId.replace(/_/g, '').toLowerCase();
        const slug = displayName
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_');
        return `${tablePrefix}_${slug}`;
    }
    quoteIdent(name) {
        return '"' + name.replace(/"/g, '""') + '"';
    }
    mapFieldType(field) {
        if (field.type === 'number' && field.is_primary_key) {
            return 'BIGSERIAL';
        }
        switch (field.type) {
            case 'string':
                if (/(content|reply|query|text|body)/.test(field.name.toLowerCase())) {
                    return 'TEXT';
                }
                return 'VARCHAR(255)';
            case 'number':
                return 'INTEGER';
            case 'boolean':
                return 'BOOLEAN';
            case 'json':
            case 'file':
                return 'JSONB';
            case 'timestamp':
                return 'TIMESTAMP WITH TIME ZONE';
            default:
                return 'VARCHAR(255)';
        }
    }
    buildCreateTableSql(tableName, fields) {
        const columnDefs = [];
        for (const field of fields) {
            if (!field.enabled)
                continue;
            const colName = this.quoteIdent(field.name);
            const colType = this.mapFieldType(field);
            const parts = [colName, colType];
            if (field.is_primary_key && field.type === 'number') {
                parts.push('PRIMARY KEY');
            }
            else {
                if (!field.nullable)
                    parts.push('NOT NULL');
                if (field.type === 'timestamp' && field.source === 'system') {
                    parts.push('DEFAULT CURRENT_TIMESTAMP');
                }
            }
            columnDefs.push(parts.join(' '));
        }
        return `CREATE TABLE ${this.quoteIdent(tableName)} (\n  ${columnDefs.join(',\n  ')}\n)`;
    }
    async clearRedisTtlKeys(tableId) {
        const client = this.redisService.getClient();
        const pattern = `ddt:cache:biz:${tableId}:*`;
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    }
};
exports.BusinessTableService = BusinessTableService;
exports.BusinessTableService = BusinessTableService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(business_table_entity_1.BusinessTableEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.DataSource,
        redis_service_1.RedisService])
], BusinessTableService);
//# sourceMappingURL=business-table.service.js.map