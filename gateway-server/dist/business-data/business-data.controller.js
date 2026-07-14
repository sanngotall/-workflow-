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
exports.BusinessDataController = void 0;
const common_1 = require("@nestjs/common");
const business_table_service_1 = require("./business-table.service");
const table_row_service_1 = require("./table-row.service");
const ddt_exception_1 = require("../common/ddt-exception");
const dto_1 = require("./dto");
let BusinessDataController = class BusinessDataController {
    constructor(businessTableService, tableRowService) {
        this.businessTableService = businessTableService;
        this.tableRowService = tableRowService;
    }
    async listByProject(projectId, storageType) {
        const data = await this.businessTableService.listByProject(projectId, storageType);
        return { success: true, data, error: null };
    }
    async createTable(projectId, body) {
        const data = await this.businessTableService.create(projectId, body);
        return { success: true, data, error: null };
    }
    async updateTable(tableId, body) {
        const data = await this.businessTableService.update(tableId, body);
        return { success: true, data, error: null };
    }
    async removeTable(tableId, confirm) {
        if (confirm !== 'true') {
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '删除业务表需 confirm=true 确认');
        }
        const data = await this.businessTableService.remove(tableId);
        return { success: true, data, error: null };
    }
    async listRows(tableId, search, field, limit, offset, orderBy) {
        const data = await this.tableRowService.listRows(tableId, {
            search,
            field,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order_by: orderBy,
        });
        return { success: true, data, error: null };
    }
    async createRow(tableId, body) {
        const data = await this.tableRowService.createRow(tableId, body);
        return { success: true, data, error: null };
    }
    async updateRow(tableId, rowId, body) {
        const data = await this.tableRowService.updateRow(tableId, rowId, body);
        return { success: true, data, error: null };
    }
    async deleteRow(tableId, rowId) {
        const data = await this.tableRowService.deleteRow(tableId, rowId);
        return { success: true, data, error: null };
    }
    async listCacheTables() {
        const data = await this.businessTableService.listCacheTables();
        return { success: true, data, error: null };
    }
    async clearCache(tableId) {
        const data = await this.businessTableService.clearCache(tableId);
        return { success: true, data, error: null };
    }
    async backup(tableId, body) {
        const data = await this.businessTableService.backup(tableId, body);
        return { success: true, data, error: null };
    }
    async listBackups(projectId, type) {
        const data = await this.businessTableService.listBackups(projectId, type);
        return { success: true, data, error: null };
    }
};
exports.BusinessDataController = BusinessDataController;
__decorate([
    (0, common_1.Get)('projects/:projectId/business-tables'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('storage_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "listByProject", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/business-tables'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateBusinessTableDto]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "createTable", null);
__decorate([
    (0, common_1.Patch)('business-tables/:tableId'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateBusinessTableDto]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "updateTable", null);
__decorate([
    (0, common_1.Delete)('business-tables/:tableId'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Query)('confirm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "removeTable", null);
__decorate([
    (0, common_1.Get)('business-tables/:tableId/rows'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('field')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __param(5, (0, common_1.Query)('order_by')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "listRows", null);
__decorate([
    (0, common_1.Post)('business-tables/:tableId/rows'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "createRow", null);
__decorate([
    (0, common_1.Patch)('business-tables/:tableId/rows/:rowId'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Param)('rowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "updateRow", null);
__decorate([
    (0, common_1.Delete)('business-tables/:tableId/rows/:rowId'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Param)('rowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "deleteRow", null);
__decorate([
    (0, common_1.Get)('database/cache-tables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "listCacheTables", null);
__decorate([
    (0, common_1.Post)('business-tables/:tableId/clear'),
    __param(0, (0, common_1.Param)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Post)('business-tables/:tableId/backup'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.BackupTableDto]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "backup", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/backups'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessDataController.prototype, "listBackups", null);
exports.BusinessDataController = BusinessDataController = __decorate([
    (0, common_1.Controller)('api/admin/v1'),
    __metadata("design:paramtypes", [business_table_service_1.BusinessTableService,
        table_row_service_1.TableRowService])
], BusinessDataController);
//# sourceMappingURL=business-data.controller.js.map