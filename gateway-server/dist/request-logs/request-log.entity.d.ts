export declare class RequestLogEntity {
    id: number;
    project_id: string;
    route_id: string;
    environment: string;
    client_ip: string;
    method: string;
    path: string;
    request_body_raw: string;
    transformed_body_raw: string;
    response_body_raw: string;
    http_status: number;
    error_code: string;
    latency_ms: number;
    created_at: Date;
}
