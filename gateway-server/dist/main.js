"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const global_exception_filter_1 = require("./common/global-exception.filter");
const config_service_1 = require("./config/config.service");
async function bootstrap() {
    const fastifyAdapter = new platform_fastify_1.FastifyAdapter({
        logger: false,
        bodyLimit: 60 * 1024 * 1024,
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, fastifyAdapter, { logger: ['error', 'warn', 'log'] });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['*'],
    });
    app.setGlobalPrefix('api', {
        exclude: ['v1/transit/(.*)', 'gw/(.*)', 'health'],
    });
    const configService = app.get(config_service_1.ConfigService);
    const port = configService.port;
    await app.init();
    const fastifyInstance = fastifyAdapter.getInstance();
    await fastifyInstance.register(multipart_1.default, {
        limits: { fileSize: 50 * 1024 * 1024 },
    });
    await fastifyInstance.listen({ port, host: '0.0.0.0' });
    console.log(`Application is running on port ${port}`);
    console.log(`  API prefix: /api`);
    console.log(`  Gateway prefix: /gw/:projectId/:env/:path`);
}
bootstrap();
//# sourceMappingURL=main.js.map