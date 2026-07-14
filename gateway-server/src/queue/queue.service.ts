import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

// 异步任务队列统计/详情返回结构，与前端 types 对齐
export interface QueueStats {
  waiting: number;
  active: number;
  failed: number;
  completed: number;
}

export interface AsyncTask {
  id: string;
  route_id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  attempts: number;
  created_at: string;
  completed_at?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('async-tasks') private readonly asyncTaskQueue: Queue,
  ) {}

  // 队列整体计数，对应 BullMQ getJobCounts
  async getStats(): Promise<QueueStats> {
    const counts = await this.asyncTaskQueue.getJobCounts();
    return {
      waiting: counts.waiting,
      active: counts.active,
      failed: counts.failed,
      completed: counts.completed,
    };
  }

  // 按状态拉取任务列表
  async getTasks(status?: string, limit = 50): Promise<AsyncTask[]> {
    const types: any[] = status
      ? [status]
      : ['waiting', 'active', 'completed', 'failed'];
    const jobs = await this.asyncTaskQueue.getJobs(types, 0, limit);
    return jobs.map((job) => this.toAsyncTask(job));
  }

  // 取单个任务详情，不存在返回 null
  async getTaskById(id: string): Promise<AsyncTask | null> {
    const job = await this.asyncTaskQueue.getJob(id);
    if (!job) {
      return null;
    }
    return this.toAsyncTask(job);
  }

  // 将 BullMQ Job 映射为前端契约的 AsyncTask
  private toAsyncTask(job: Job): AsyncTask {
    const routeId =
      job.data?.route?.route?.id || job.data?.route?.id || '';
    return {
      id: String(job.id),
      route_id: routeId,
      status: (job.finishedOn
        ? job.failedReason
          ? 'failed'
          : 'completed'
        : job.processedOn
          ? 'active'
          : 'waiting') as AsyncTask['status'],
      attempts: job.attemptsMade || 0,
      created_at: job.timestamp
        ? new Date(job.timestamp).toISOString()
        : new Date().toISOString(),
      completed_at: job.finishedOn
        ? new Date(job.finishedOn).toISOString()
        : undefined,
    };
  }
}
