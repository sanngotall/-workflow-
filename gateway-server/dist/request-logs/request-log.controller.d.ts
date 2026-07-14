import { RequestLogService, LogStats } from './request-log.service';
import { RequestLogEntity } from './request-log.entity';
export declare class RequestLogController {
    private readonly requestLogService;
    constructor(requestLogService: RequestLogService);
    listLogs(projectId: string, routeId?: string, method?: string, httpStatus?: string, errorCode?: string, limit?: string, offset?: string): Promise<{
        success: boolean;
        data: {
            rows: RequestLogEntity[];
            total: number;
            limit: number;
            offset: number;
        };
        error: null;
    }>;
    getStats(projectId: string, sinceHours?: string): Promise<{
        success: true;
        data: LogStats;
        error: null;
    }>;
}
