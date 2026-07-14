import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ConfigService } from './config/config.service';
import { IS_PUBLIC_KEY } from './common/decorators';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    bodyLimit: 60 * 1024 * 1024, // 60MB：覆盖 50MB 文件上限 + multipart 开销
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { logger: ['error', 'warn', 'log'] },
  );

  // 全局 ValidationPipe：transform + whitelist + forbidNonWhitelisted
  // 配合各模块 DTO 的 class-validator 装饰器完成入参校验
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局异常过滤器：统一响应信封 { success, data, error: { code, message } }
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS（开发环境宽松，生产环境收紧）
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
  });

  // 全局路由前缀：/api（除网关入口外）
  // 网关入口采用 transitId 模型：POST /v1/transit/:transitId/invoke（对齐 SPEC-04 §2）
  // 旧的 /gw/:projectId/:environment/* 入口已废弃，保留 exclude 以兼容
  // 注意：Fastify 路由前缀通过 setGlobalPrefix 设置
  app.setGlobalPrefix('api', {
    exclude: ['v1/transit/(.*)', 'gw/(.*)', 'health'], // 网关入口与健康检查不走 /api 前缀
  });

  const configService = app.get(ConfigService);
  const port = configService.port;

  await app.init();

  // 注册 @fastify/multipart 用于文件上传（限 50MB，对齐 SPEC-04 §6.6.1）
  const fastifyInstance = fastifyAdapter.getInstance();
  await fastifyInstance.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  await fastifyInstance.listen({ port, host: '0.0.0.0' });

  console.log(`Application is running on port ${port}`);
  console.log(`  API prefix: /api`);
  console.log(`  Gateway prefix: /gw/:projectId/:env/:path`);
}

bootstrap();
