import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RoutesModule } from '../routes/routes.module';
import { TransformersModule } from '../transformers/transformers.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { ProjectsModule } from '../projects/projects.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RoutesModule,
    TransformersModule,
    CredentialsModule,
    ProjectsModule,
    RedisModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
