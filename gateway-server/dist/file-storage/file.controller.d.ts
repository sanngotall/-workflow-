import { FastifyRequest, FastifyReply } from 'fastify';
import { FileStorageService } from './file-storage.service';
export declare class FileController {
    private readonly fileStorage;
    constructor(fileStorage: FileStorageService);
    upload(request: FastifyRequest, businessTableId?: string, expiresAt?: string): Promise<{
        success: boolean;
        data: {
            fileId: string;
            fileName: string;
            mimeType: string;
            sizeBytes: number;
            sha256: string;
            storagePath: string;
            expiresAt: Date | null;
        };
        error: null;
    }>;
    download(fileId: string, reply: FastifyReply): Promise<never>;
    delete(fileId: string): Promise<{
        success: boolean;
        data: {
            deleted: boolean;
            physicalRemoved: boolean;
        };
        error: null;
    }>;
}
