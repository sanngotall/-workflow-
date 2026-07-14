import { Repository } from 'typeorm';
import { RequestLogEntity } from './request-log.entity';
interface CreateLogDto {
    project_id: string;
    route_id?: string;
    environment: string;
    client_ip?: string;
    method: string;
    path: string;
    request_body_raw?: string;
    transformed_body_raw?: string;
    response_body_raw?: string;
    http_status: number;
    error_code?: string;
    latency_ms: number;
}
export interface LogStats {
    total: number;
    error_count: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    status_distribution: Record<string, number>;
    top_errors: Array<{
        error_code: string;
        count: number;
    }>;
}
export declare class RequestLogService {
    private readonly requestLogRepository;
    constructor(requestLogRepository: Repository<RequestLogEntity>);
    create(dto: CreateLogDto): Promise<RequestLogEntity>;
    findByProjectId(projectId: string, limit?: number): Promise<RequestLogEntity[]>;
    findByRouteId(routeId: string, limit?: number): Promise<RequestLogEntity[]>;
    listLogs(options: {
        projectId: string;
        routeId?: string;
        method?: string;
        httpStatus?: number;
        errorCode?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        rows: RequestLogEntity[];
        total: number;
    }>;
    getStats(projectId: string, sinceHours?: number): Promise<LogStats>;
}
export {};
