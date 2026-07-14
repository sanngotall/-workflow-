import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

@Module({
  imports: [
    // 注册 async-tasks 队列以注入 Queue 实例
    BullModule.registerQueue({ name: 'async-tasks' }),
  ],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
