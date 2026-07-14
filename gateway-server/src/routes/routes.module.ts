import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteEntity } from './route.entity';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { RedisModule } from '../redis/redis.module';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [TypeOrmModule.forFeature([RouteEntity]), RedisModule, CredentialsModule],
  providers: [RouteService],
  controllers: [RouteController],
  exports: [RouteService],
})
export class RoutesModule {}
