"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const file_index_entity_1 = require("./file-index.entity");
const file_storage_service_1 = require("./file-storage.service");
const file_controller_1 = require("./file.controller");
const config_module_1 = require("../config/config.module");
let FileStorageModule = class FileStorageModule {
};
exports.FileStorageModule = FileStorageModule;
exports.FileStorageModule = FileStorageModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_index_entity_1.FileIndexEntity]), config_module_1.ConfigModule],
        controllers: [file_controller_1.FileController],
        providers: [file_storage_service_1.FileStorageService],
        exports: [file_storage_service_1.FileStorageService],
    })
], FileStorageModule);
//# sourceMappingURL=file-storage.module.js.map