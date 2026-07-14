import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { RoutesModule } from '../routes/routes.module';
import { TransformersModule } from '../transformers/transformers.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { RateLimiterModule } from '../rate-limiter/rate-limiter.module';
import { CircuitBreakerModule } from '../circuit-breaker/circuit-breaker.module';
import { RequestLogsModule } from '../request-logs/request-logs.module';
import { ConfigModule } from '../config/config.module';
import { BullModule } from '@nestjs/bull';
import { BusinessDataModule } from '../business-data/business-data.module';

@Module({
  imports: [
    ConfigModule,
    RoutesModule,
    TransformersModule,
    CredentialsModule,
    RateLimiterModule,
    CircuitBreakerModule,
    RequestLogsModule,
    BusinessDataModule,
    BullModule.registerQueue({
      name: 'async-tasks',
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
