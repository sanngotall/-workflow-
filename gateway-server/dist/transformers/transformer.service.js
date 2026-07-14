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
exports.TransformerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transformer_entity_1 = require("./transformer.entity");
const vm2_1 = require("vm2");
let TransformerService = class TransformerService {
    constructor(transformerRepository) {
        this.transformerRepository = transformerRepository;
    }
    async create(routeId, targetUrl, type, credentialId, mappingRules, scriptCode, responseRules) {
        const transformer = this.transformerRepository.create({
            route_id: routeId,
            credential_id: credentialId,
            target_url: targetUrl,
            type,
            mapping_rules: mappingRules,
            script_code: scriptCode,
            response_rules: responseRules,
        });
        return this.transformerRepository.save(transformer);
    }
    async findById(id) {
        return this.transformerRepository.findOne({ where: { id } });
    }
    async findByRouteId(routeId) {
        return this.transformerRepository.findOne({ where: { route_id: routeId } });
    }
    async update(id, updates) {
        const transformer = await this.findById(id);
        if (!transformer)
            return null;
        Object.assign(transformer, updates);
        return this.transformerRepository.save(transformer);
    }
    async delete(id) {
        const result = await this.transformerRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    async transform(transformer, input) {
        if (transformer.type === 'visual') {
            return this.transformVisual(transformer.mapping_rules || {}, input);
        }
        else if (transformer.type === 'script') {
            return this.transformScript(transformer.script_code || '', input);
        }
        return input;
    }
    transformVisual(mappingRules, input) {
        const output = {};
        for (const [targetKey, sourcePath] of Object.entries(mappingRules)) {
            output[targetKey] = this.getNestedValue(input, sourcePath);
        }
        return output;
    }
    getNestedValue(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null)
                return undefined;
            current = current[part];
        }
        return current;
    }
    transformScript(scriptCode, input) {
        const vm = new vm2_1.VM({
            timeout: 5000,
            sandbox: {
                req: { body: input },
            },
        });
        try {
            const result = vm.run(scriptCode);
            return typeof result === 'object' ? result : input;
        }
        catch {
            return input;
        }
    }
};
exports.TransformerService = TransformerService;
exports.TransformerService = TransformerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transformer_entity_1.TransformerEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransformerService);
//# sourceMappingURL=transformer.service.js.map