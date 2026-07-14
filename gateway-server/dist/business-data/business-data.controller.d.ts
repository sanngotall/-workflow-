import { BusinessTableService } from './business-table.service';
import { TableRowService } from './table-row.service';
import { CreateBusinessTableDto, UpdateBusinessTableDto, CreateRowDto, UpdateRowDto, BackupTableDto } from './dto';
export declare class BusinessDataController {
    private readonly businessTableService;
    private readonly tableRowService;
    constructor(businessTableService: BusinessTableService, tableRowService: TableRowService);
    listByProject(projectId: string, storageType?: 'persistent' | 'cache'): Promise<{
        success: boolean;
        data: import("./business-table.entity").BusinessTableEntity[];
        error: null;
    }>;
    createTable(projectId: string, body: CreateBusinessTableDto): Promise<{
        success: boolean;
        data: import("./business-table.entity").BusinessTableEntity;
        error: null;
    }>;
    updateTable(tableId: string, body: UpdateBusinessTableDto): Promise<{
        success: boolean;
        data: import("./business-table.entity").BusinessTableEntity;
        error: null;
    }>;
    removeTable(tableId: string, confirm?: string): Promise<{
        success: boolean;
        data: {
            dropped_table: string;
            rows_affected: number;
        };
        error: null;
    }>;
    listRows(tableId: string, search?: string, field?: string, limit?: string, offset?: string, orderBy?: string): Promise<{
        success: boolean;
        data: {
            table_id: string;
            rows: any[];
            total: number;
            limit: number;
            offset: number;
        };
        error: null;
    }>;
    createRow(tableId: string, body: CreateRowDto): Promise<{
        success: boolean;
        data: any;
        error: null;
    }>;
    updateRow(tableId: string, rowId: string, body: UpdateRowDto): Promise<{
        success: boolean;
        data: any;
        error: null;
    }>;
    deleteRow(tableId: string, rowId: string): Promise<{
        success: boolean;
        data: {
            deleted_row_id: any;
            table_id: string;
        };
        error: null;
    }>;
    listCacheTables(): Promise<{
        success: boolean;
        data: import("./business-table.entity").BusinessTableEntity[];
        error: null;
    }>;
    clearCache(tableId: string): Promise<{
        success: boolean;
        data: {
            cleared_rows: number;
            table_id: string;
        };
        error: null;
    }>;
    backup(tableId: string, body: BackupTableDto): Promise<{
        success: boolean;
        data: {
            backup_id: string;
            table_id: string;
            table_name: string;
            rows_backed_up: number;
            size_mb: number;
            download_url: string;
            created_at: string;
        };
        error: null;
    }>;
    listBackups(projectId: string, type?: 'backup' | 'migration'): Promise<{
        success: boolean;
        data: any[];
        error: null;
    }>;
}
