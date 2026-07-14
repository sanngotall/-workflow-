import { Repository, DataSource } from 'typeorm';
import { FileIndexEntity } from './file-index.entity';
import { ConfigService } from '../config/config.service';
export declare class FileStorageService {
    private readonly fileRepo;
    private readonly dataSource;
    private readonly config;
    constructor(fileRepo: Repository<FileIndexEntity>, dataSource: DataSource, config: ConfigService);
    private static readonly ALLOWED_MIME;
    private static readonly MIME_EXT;
    upload(params: {
        businessTableId: string;
        fileName: string;
        mimeType: string;
        buffer: Buffer;
        expiresAt?: Date | null;
    }): Promise<{
        fileId: string;
        fileName: string;
        mimeType: string;
        sizeBytes: number;
        sha256: string;
        storagePath: string;
        expiresAt: Date | null;
    }>;
    findById(fileId: string): Promise<FileIndexEntity | null>;
    getAbsolutePath(storagePath: string): string;
    deleteFileIndex(fileId: string): Promise<{
        deleted: boolean;
        physicalRemoved: boolean;
    }>;
    cleanupExpired(): Promise<number>;
}
