import { QueueService } from './queue.service';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    getStats(): Promise<{
        success: boolean;
        data: import("./queue.service").QueueStats;
        error: null;
    }>;
    getTasks(status?: string, limit?: number): Promise<{
        success: boolean;
        data: import("./queue.service").AsyncTask[];
        error: null;
    }>;
    getTaskById(id: string): Promise<{
        success: boolean;
        data: import("./queue.service").AsyncTask | null;
        error: null;
    }>;
}
