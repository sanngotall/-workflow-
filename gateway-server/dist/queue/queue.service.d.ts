import { Queue } from 'bull';
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
export declare class QueueService {
    private readonly asyncTaskQueue;
    constructor(asyncTaskQueue: Queue);
    getStats(): Promise<QueueStats>;
    getTasks(status?: string, limit?: number): Promise<AsyncTask[]>;
    getTaskById(id: string): Promise<AsyncTask | null>;
    private toAsyncTask;
}
