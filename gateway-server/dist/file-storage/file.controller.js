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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const file_storage_service_1 = require("./file-storage.service");
const ddt_exception_1 = require("../common/ddt-exception");
let FileController = class FileController {
    constructor(fileStorage) {
        this.fileStorage = fileStorage;
    }
    async upload(request, businessTableId, expiresAt) {
        if (!businessTableId) {
            throw new ddt_exception_1.DdtException('FILE_FIELD_TYPE_REQUIRED');
        }
        const parts = request.parts();
        let fileBuffer = null;
        let fileName = '';
        let mimeType = '';
        for await (const part of parts) {
            if (part.type === 'file') {
                fileName = part.filename;
                mimeType = part.mimetype;
                const chunks = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                fileBuffer = Buffer.concat(chunks);
                break;
            }
        }
        if (!fileBuffer) {
            throw new common_1.BadRequestException('缺少 file 字段');
        }
        const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
        const result = await this.fileStorage.upload({
            businessTableId,
            fileName,
            mimeType,
            buffer: fileBuffer,
            expiresAt: expiresAtDate,
        });
        return {
            success: true,
            data: result,
            error: null,
        };
    }
    async download(fileId, reply) {
        const entity = await this.fileStorage.findById(fileId);
        if (!entity) {
            throw new ddt_exception_1.DdtException('FILE_NOT_FOUND');
        }
        const absPath = this.fileStorage.getAbsolutePath(entity.storage_path);
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        if (!fs.existsSync(absPath)) {
            throw new ddt_exception_1.DdtException('FILE_NOT_FOUND');
        }
        const stream = fs.createReadStream(absPath);
        reply.header('Content-Type', entity.mime_type);
        reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(entity.file_name)}"`);
        reply.header('Content-Length', String(entity.size_bytes));
        return reply.send(stream);
    }
    async delete(fileId) {
        const result = await this.fileStorage.deleteFileIndex(fileId);
        return {
            success: true,
            data: result,
            error: null,
        };
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('businessTableId')),
    __param(2, (0, common_1.Query)('expiresAt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':fileId/download'),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "download", null);
__decorate([
    (0, common_1.Delete)(':fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "delete", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)('api/admin/v1/files'),
    __metadata("design:paramtypes", [file_storage_service_1.FileStorageService])
], FileController);
//# sourceMappingURL=file.controller.js.map