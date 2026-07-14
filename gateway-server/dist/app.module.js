"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const core_1 = require("@nestjs/core");
const data_source_1 = require("./database/data-source");
const config_module_1 = require("./config/config.module");
const redis_module_1 = require("./redis/redis.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const permission_guard_1 = require("./common/permission.guard");
const projects_module_1 = require("./projects/projects.module");
const routes_module_1 = require("./routes/routes.module");
const credentials_module_1 = require("./credentials/credentials.module");
const transformers_module_1 = require("./transformers/transformers.module");
const gateway_module_1 = require("./gateway/gateway.module");
const admin_module_1 = require("./admin/admin.module");
const request_logs_module_1 = require("./request-logs/request-logs.module");
const circuit_breaker_module_1 = require("./circuit-breaker/circuit-breaker.module");
const rate_limiter_module_1 = require("./rate-limiter/rate-limiter.module");
const crypto_module_1 = require("./crypto/crypto.module");
const async_worker_module_1 = require("./async-worker/async-worker.module");
const queue_module_1 = require("./queue/queue.module");
const business_data_module_1 = require("./business-data/business-data.module");
const identity_module_1 = require("./identity/identity.module");
const file_storage_module_1 = require("./file-storage/file-storage.module");
const wx_config_module_1 = require("./wx-config/wx-config.module");
const wx_auth_module_1 = require("./wx-auth/wx-auth.module");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useClass: data_source_1.DataSourceConfig,
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                },
            }),
            config_module_1.ConfigModule,
            redis_module_1.RedisModule,
            crypto_module_1.CryptoModule,
            circuit_breaker_module_1.CircuitBreakerModule,
            rate_limiter_module_1.RateLimiterModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            routes_module_1.RoutesModule,
            credentials_module_1.CredentialsModule,
            transformers_module_1.TransformersModule,
            gateway_module_1.GatewayModule,
            admin_module_1.AdminModule,
            request_logs_module_1.RequestLogsModule,
            async_worker_module_1.AsyncWorkerModule,
            queue_module_1.QueueModule,
            business_data_module_1.BusinessDataModule,
            identity_module_1.IdentityModule,
            file_storage_module_1.FileStorageModule,
            wx_config_module_1.WxConfigModule,
            wx_auth_module_1.WxAuthModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permission_guard_1.PermissionGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map