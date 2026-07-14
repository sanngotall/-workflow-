import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AsyncWorker } from './async-worker.service';
import { TransformersModule } from '../transformers/transformers.module';
import { RequestLogsModule } from '../request-logs/request-logs.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'async-tasks',
    }),
    TransformersModule,
    RequestLogsModule,
  ],
  providers: [AsyncWorker],
})
export class AsyncWorkerModule {}
