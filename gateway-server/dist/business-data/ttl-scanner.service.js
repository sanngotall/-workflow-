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
var TtlScannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtlScannerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const business_table_service_1 = require("./business-table.service");
const redis_service_1 = require("../redis/redis.service");
const file_storage_service_1 = require("../file-storage/file-storage.service");
let TtlScannerService = TtlScannerService_1 = class TtlScannerService {
    constructor(dataSource, businessTableService, redisService, fileStorageService) {
        this.dataSource = dataSource;
        this.businessTableService = businessTableService;
        this.redisService = redisService;
        this.fileStorageService = fileStorageService;
        this.logger = new common_1.Logger(TtlScannerService_1.name);
        this.timer = null;
        this.SCAN_INTERVAL_MS = parseInt(process.env.BIZ_TTL_SCAN_INTERVAL_MS || '60000');
    }
    onModuleInit() {
        this.timer = setTimeout(() => {
            this.scan().catch((err) => {
                this.logger.error(`TTL 扫描首次执行失败: ${err?.message || err}`);
            });
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
    async scan() {
        const cacheTables = await this.businessTableService.listCacheTables();
        if (cacheTables.length === 0) {
            return;
        }
        let totalExpired = 0;
        for (const table of cacheTables) {
            try {
                const expired = await this.scanTable(table);
                totalExpired += expired;
            }
            catch (err) {
                this.logger.error(`TTL 扫描表 ${table.table_name} 失败: ${err?.message || err}`);
            }
        }
        if (totalExpired > 0) {
            this.logger.log(`TTL 扫描完成：共清理 ${totalExpired} 行过期缓存数据`);
        }
    }
    async scanTable(table) {
        if (!table.ttl_seconds || table.ttl_seconds < 60) {
            return 0;
        }
        const timeField = table.fields?.find((f) => f.enabled && f.type === 'timestamp' && f.source === 'system');
        if (!timeField) {
            return 0;
        }
        const pkField = table.fields?.find((f) => f.enabled && f.is_primary_key);
        if (!pkField) {
            return 0;
        }
        const fileFields = table.fields?.filter((f) => f.enabled && f.type === 'file') || [];
        const quotedTable = this.quoteIdent(table.table_name);
        const quotedTime = this.quoteIdent(timeField.name);
        const quotedPk = this.quoteIdent(pkField.name);
        const selectCols = [`${quotedPk} AS pk`];
        fileFields.forEach((f, idx) => {
            selectCols.push(`${this.quoteIdent(f.name)} AS f${idx}`);
        });
        const selectSql = `
      SELECT ${selectCols.join(', ')} FROM ${quotedTable}
      WHERE ${quotedTime} < NOW() - ($1 || ' seconds')::interval
      LIMIT 1000
    `;
        const expiredRows = await this.dataSource.query(selectSql, [String(table.ttl_seconds)]);
        if (!expiredRows || expiredRows.length === 0) {
            return 0;
        }
        const pkValues = expiredRows.map((r) => String(r.pk));
        for (const pk of pkValues) {
            const key = `ddt:cache:biz:${table.id}:${pk}`;
            await this.redisService.del(key);
        }
        const fileIdsToDelete = [];
        for (const row of expiredRows) {
            for (let i = 0; i < fileFields.length; i++) {
                const fileData = row[`f${i}`];
                if (!fileData)
                    continue;
                if (typeof fileData === 'object' && fileData.fileId) {
                    fileIdsToDelete.push(fileData.fileId);
                }
                else if (typeof fileData === 'string') {
                    try {
                        const parsed = JSON.parse(fileData);
                        if (parsed?.fileId)
                            fileIdsToDelete.push(parsed.fileId);
                    }
                    catch {
                    }
                }
            }
        }
        if (pkValues.length === 0)
            return 0;
        const deleteSql = `
      DELETE FROM ${quotedTable}
      WHERE ${quotedPk}::text = ANY($1::text[])
    `;
        await this.dataSource.query(deleteSql, [pkValues]);
        if (fileIdsToDelete.length > 0) {
            let fileCleaned = 0;
            let filePhysicalRemoved = 0;
            for (const fileId of fileIdsToDelete) {
                try {
                    const result = await this.fileStorageService.deleteFileIndex(fileId);
                    fileCleaned++;
                    if (result.physicalRemoved)
                        filePhysicalRemoved++;
                }
                catch (e) {
                    this.logger.warn(`TTL 清理：删除文件索引 ${fileId} 失败: ${e?.message || e}`);
                }
            }
            if (fileCleaned > 0) {
                this.logger.debug(`TTL 表 ${table.table_name} 清理文件索引 ${fileCleaned} 条（其中 ${filePhysicalRemoved} 个物理文件已删盘）`);
            }
        }
        await this.dataSource.query(`UPDATE business_tables SET row_count = GREATEST(row_count - $1, 0) WHERE id = $2`, [pkValues.length, table.id]);
        this.logger.debug(`TTL 表 ${table.table_name} 清理 ${pkValues.length} 行`);
        return pkValues.length;
    }
    quoteIdent(name) {
        return '"' + name.replace(/"/g, '""') + '"';
    }
};
exports.TtlScannerService = TtlScannerService;
exports.TtlScannerService = TtlScannerService = TtlScannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        business_table_service_1.BusinessTableService,
        redis_service_1.RedisService,
        file_storage_service_1.FileStorageService])
], TtlScannerService);
//# sourceMappingURL=ttl-scanner.service.js.map