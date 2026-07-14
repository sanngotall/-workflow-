import { DataSource, Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { BusinessTableEntity } from './business-table.entity';
import { CreateBusinessTableDto, UpdateBusinessTableDto, BackupTableDto } from './dto';
export declare class BusinessTableService {
    private readonly tableRepository;
    private readonly dataSource;
    private readonly redisService;
    constructor(tableRepository: Repository<BusinessTableEntity>, dataSource: DataSource, redisService: RedisService);
    listByProject(projectId: string, storageType?: 'persistent' | 'cache'): Promise<BusinessTableEntity[]>;
    findById(tableId: string): Promise<BusinessTableEntity | null>;
    listCacheTables(): Promise<BusinessTableEntity[]>;
    create(projectId: string, dto: CreateBusinessTableDto): Promise<BusinessTableEntity>;
    update(tableId: string, dto: UpdateBusinessTableDto): Promise<BusinessTableEntity>;
    remove(tableId: string): Promise<{
        dropped_table: string;
        rows_affected: number;
    }>;
    clearCache(tableId: string): Promise<{
        cleared_rows: number;
        table_id: string;
    }>;
    backup(tableId: string, _dto: BackupTableDto): Promise<{
        backup_id: string;
        table_id: string;
        table_name: string;
        rows_backed_up: number;
        size_mb: number;
        download_url: string;
        created_at: string;
    }>;
    listBackups(_projectId: string, _type?: 'backup' | 'migration'): Promise<any[]>;
    private applyFieldUpdate;
    private applyFieldCreate;
    private deriveTableName;
    private quoteIdent;
    private mapFieldType;
    private buildCreateTableSql;
    private clearRedisTtlKeys;
}
