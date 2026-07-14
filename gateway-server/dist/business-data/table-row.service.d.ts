import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { BusinessTableService } from './business-table.service';
import { CreateRowDto, UpdateRowDto } from './dto';
export interface ListRowsQuery {
    search?: string;
    field?: string;
    limit?: number;
    offset?: number;
    order_by?: string;
}
export declare class TableRowService {
    private readonly dataSource;
    private readonly businessTableService;
    private readonly redisService;
    constructor(dataSource: DataSource, businessTableService: BusinessTableService, redisService: RedisService);
    listRows(tableId: string, query: ListRowsQuery): Promise<{
        table_id: string;
        rows: any[];
        total: number;
        limit: number;
        offset: number;
    }>;
    createRow(tableId: string, row: CreateRowDto): Promise<any>;
    updateRow(tableId: string, rowId: string, patch: UpdateRowDto): Promise<any>;
    deleteRow(tableId: string, rowId: string): Promise<{
        deleted_row_id: any;
        table_id: string;
    }>;
    private quoteIdent;
    private validateValueType;
    private normalizeValue;
}
