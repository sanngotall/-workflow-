import { Job } from 'bull';
import { TransformerService } from '../transformers/transformer.service';
import { RequestLogService } from '../request-logs/request-log.service';
import { RouteCacheData } from '../routes/route.service';
interface AsyncTaskData {
    taskId: string;
    route: RouteCacheData;
    body: any;
    clientIp: string;
}
export declare class AsyncWorker {
    private readonly transformerService;
    private readonly requestLogService;
    constructor(transformerService: TransformerService, requestLogService: RequestLogService);
    process(job: Job<AsyncTaskData>): Promise<void>;
}
export {};
