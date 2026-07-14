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
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const ddt_exception_1 = require("../common/ddt-exception");
let ProjectController = class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    async create(body) {
        const project = await this.projectService.create(body.name, body.description);
        return {
            success: true,
            data: project,
            error: null,
        };
    }
    async findAll() {
        const projects = await this.projectService.findAll();
        return {
            success: true,
            data: projects,
            error: null,
        };
    }
    async findById(id) {
        const project = await this.projectService.findById(id);
        if (!project) {
            throw new ddt_exception_1.DdtException('PROJECT_NOT_FOUND');
        }
        return {
            success: true,
            data: project,
            error: null,
        };
    }
    async update(id, body) {
        const project = await this.projectService.update(id, body.name, body.description);
        if (!project) {
            throw new ddt_exception_1.DdtException('PROJECT_NOT_FOUND');
        }
        return {
            success: true,
            data: project,
            error: null,
        };
    }
    async delete(id) {
        const success = await this.projectService.delete(id);
        if (!success) {
            throw new ddt_exception_1.DdtException('PROJECT_NOT_FOUND');
        }
        return {
            success: true,
            data: null,
            error: null,
        };
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "delete", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('api/admin/v1/projects'),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map