import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueueService } from './queue.service';

// 异步队列监控接口，对应 spec/04 3.2 节
@Controller('api/admin/v1/queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('stats')
  async getStats() {
    const data = await this.queueService.getStats();
    return { success: true, data, error: null };
  }

  @Get('tasks')
  async getTasks(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.queueService.getTasks(status, limit);
    return { success: true, data, error: null };
  }

  @Get('tasks/:id')
  async getTaskById(@Param('id') id: string) {
    const data = await this.queueService.getTaskById(id);
    return { success: true, data, error: null };
  }
}
