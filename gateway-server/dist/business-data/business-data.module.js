"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessDataModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const business_table_entity_1 = require("./business-table.entity");
const business_field_entity_1 = require("./business-field.entity");
const business_table_service_1 = require("./business-table.service");
const table_row_service_1 = require("./table-row.service");
const ttl_scanner_service_1 = require("./ttl-scanner.service");
const business_data_controller_1 = require("./business-data.controller");
const redis_module_1 = require("../redis/redis.module");
const file_storage_module_1 = require("../file-storage/file-storage.module");
let BusinessDataModule = class BusinessDataModule {
};
exports.BusinessDataModule = BusinessDataModule;
exports.BusinessDataModule = BusinessDataModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([business_table_entity_1.BusinessTableEntity, business_field_entity_1.BusinessFieldEntity]),
            redis_module_1.RedisModule,
            file_storage_module_1.FileStorageModule,
        ],
        controllers: [business_data_controller_1.BusinessDataController],
        providers: [business_table_service_1.BusinessTableService, table_row_service_1.TableRowService, ttl_scanner_service_1.TtlScannerService],
        exports: [business_table_service_1.BusinessTableService, table_row_service_1.TableRowService],
    })
], BusinessDataModule);
//# sourceMappingURL=business-data.module.js.map