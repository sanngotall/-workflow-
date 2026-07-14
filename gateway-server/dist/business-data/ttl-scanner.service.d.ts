import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BusinessTableService } from './business-table.service';
import { RedisService } from '../redis/redis.service';
import { FileStorageService } from '../file-storage/file-storage.service';
export declare class TtlScannerService implements OnModuleInit, OnModuleDestroy {
    private readonly dataSource;
    private readonly businessTableService;
    private readonly redisService;
    private readonly fileStorageService;
    private readonly logger;
    private readonly SCAN_INTERVAL_MS;
    private timer;
    constructor(dataSource: DataSource, businessTableService: BusinessTableService, redisService: RedisService, fileStorageService: FileStorageService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    scan(): Promise<void>;
    private scanTable;
    private quoteIdent;
}
