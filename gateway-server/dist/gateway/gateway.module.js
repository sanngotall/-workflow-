"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayModule = void 0;
const common_1 = require("@nestjs/common");
const gateway_controller_1 = require("./gateway.controller");
const gateway_service_1 = require("./gateway.service");
const routes_module_1 = require("../routes/routes.module");
const transformers_module_1 = require("../transformers/transformers.module");
const credentials_module_1 = require("../credentials/credentials.module");
const rate_limiter_module_1 = require("../rate-limiter/rate-limiter.module");
const circuit_breaker_module_1 = require("../circuit-breaker/circuit-breaker.module");
const request_logs_module_1 = require("../request-logs/request-logs.module");
const config_module_1 = require("../config/config.module");
const bull_1 = require("@nestjs/bull");
const business_data_module_1 = require("../business-data/business-data.module");
let GatewayModule = class GatewayModule {
};
exports.GatewayModule = GatewayModule;
exports.GatewayModule = GatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            routes_module_1.RoutesModule,
            transformers_module_1.TransformersModule,
            credentials_module_1.CredentialsModule,
            rate_limiter_module_1.RateLimiterModule,
            circuit_breaker_module_1.CircuitBreakerModule,
            request_logs_module_1.RequestLogsModule,
            business_data_module_1.BusinessDataModule,
            bull_1.BullModule.registerQueue({
                name: 'async-tasks',
            }),
        ],
        controllers: [gateway_controller_1.GatewayController],
        providers: [gateway_service_1.GatewayService],
    })
], GatewayModule);
//# sourceMappingURL=gateway.module.js.map