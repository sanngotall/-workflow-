"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FileStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const file_index_entity_1 = require("./file-index.entity");
const business_table_entity_1 = require("../business-data/business-table.entity");
const config_service_1 = require("../config/config.service");
const ddt_exception_1 = require("../common/ddt-exception");
let FileStorageService = FileStorageService_1 = class FileStorageService {
    constructor(fileRepo, dataSource, config) {
        this.fileRepo = fileRepo;
        this.dataSource = dataSource;
        this.config = config;
    }
    async upload(params) {
        const { businessTableId, fileName, mimeType, buffer } = params;
        if (buffer.length > this.config.fileMaxBytes) {
            throw new ddt_exception_1.DdtException('FILE_TOO_LARGE');
        }
        if (!FileStorageService_1.ALLOWED_MIME.has(mimeType)) {
            throw new ddt_exception_1.DdtException('FILE_TYPE_FORBIDDEN');
        }
        const tableRepo = this.dataSource.getRepository(business_table_entity_1.BusinessTableEntity);
        const table = await tableRepo.findOne({
            where: { id: businessTableId },
            relations: ['fields'],
        });
        if (!table) {
            throw new ddt_exception_1.DdtException('BUSINESS_TABLE_NOT_FOUND');
        }
        const hasFileField = table.fields.some((f) => f.type === 'file' && f.enabled);
        if (!hasFileField) {
            throw new ddt_exception_1.DdtException('FILE_FIELD_TYPE_REQUIRED');
        }
        const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
        const tablePrefix = table.project_id.replace(/_/g, '').toLowerCase();
        const slug = table.display_name
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_');
        const ext = FileStorageService_1.MIME_EXT[mimeType] || 'bin';
        const storagePath = path.join(tablePrefix, slug, sha256.slice(0, 2), sha256.slice(2, 4), `${sha256}.${ext}`);
        const absPath = path.join(this.config.fileStorageRoot, storagePath);
        await fs.mkdir(path.dirname(absPath), { recursive: true });
        try {
            await fs.access(absPath);
        }
        catch {
            await fs.writeFile(absPath, buffer);
        }
        const expiresAt = table.storage_type === 'cache' ? (params.expiresAt ?? null) : null;
        const entity = this.fileRepo.create({
            project_id: table.project_id,
            business_table_id: businessTableId,
            file_name: fileName,
            mime_type: mimeType,
            size_bytes: buffer.length,
            sha256,
            storage_path: storagePath,
            storage_type: 'local_disk',
            expires_at: expiresAt,
        });
        const saved = await this.fileRepo.save(entity);
        return {
            fileId: saved.id,
            fileName,
            mimeType,
            sizeBytes: buffer.length,
            sha256,
            storagePath,
            expiresAt,
        };
    }
    async findById(fileId) {
        return this.fileRepo.findOne({ where: { id: fileId } });
    }
    getAbsolutePath(storagePath) {
        return path.join(this.config.fileStorageRoot, storagePath);
    }
    async deleteFileIndex(fileId) {
        const entity = await this.fileRepo.findOne({ where: { id: fileId } });
        if (!entity) {
            throw new ddt_exception_1.DdtException('FILE_NOT_FOUND');
        }
        const { sha256, storage_path } = entity;
        await this.fileRepo.delete({ id: fileId });
        const remaining = await this.fileRepo.count({ where: { sha256 } });
        if (remaining > 0) {
            return { deleted: true, physicalRemoved: false };
        }
        const absPath = this.getAbsolutePath(storage_path);
        try {
            await fs.unlink(absPath);
            return { deleted: true, physicalRemoved: true };
        }
        catch (e) {
            return { deleted: true, physicalRemoved: false };
        }
    }
    async cleanupExpired() {
        const now = new Date();
        const expired = await this.fileRepo
            .createQueryBuilder('f')
            .where('f.expires_at IS NOT NULL AND f.expires_at < :now', { now })
            .getMany();
        for (const f of expired) {
            try {
                await this.deleteFileIndex(f.id);
            }
            catch (e) {
            }
        }
        return expired.length;
    }
};
exports.FileStorageService = FileStorageService;
FileStorageService.ALLOWED_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/zip',
]);
FileStorageService.MIME_EXT = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/zip': 'zip',
};
exports.FileStorageService = FileStorageService = FileStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_index_entity_1.FileIndexEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        config_service_1.ConfigService])
], FileStorageService);
//# sourceMappingURL=file-storage.service.js.map