export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  project_id: string;
  environment: 'dev' | 'staging' | 'prod';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ANY';
  path: string;
  is_active: boolean;
  is_async: boolean;
  timeout_ms: number;
  created_at: string;
  updated_at: string;
}

export interface Transformer {
  id: string;
  route_id: string;
  credential_id?: string;
  target_url: string;
  type: 'visual' | 'script';
  mapping_rules?: Record<string, any>;
  script_code?: string;
  response_rules?: Record<string, any>;
  updated_at: string;
}

export interface Credential {
  id: string;
  project_id: string;
  name: string;
  type: 'Bearer' | 'Basic' | 'Custom';
  secret?: string;
  created_at: string;
}

export interface RequestLog {
  id: number;
  project_id: string;
  route_id?: string;
  environment: string;
  client_ip: string;
  method: string;
  path: string;
  request_body_raw?: string;
  transformed_body_raw?: string;
  response_body_raw?: string;
  http_status: number;
  error_code?: string;
  latency_ms: number;
  created_at: string;
}

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

export interface BreakerState {
  route_id: string;
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failure_count: number;
  last_failure_time?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms?: number;
}

export type Environment = 'dev' | 'staging' | 'prod';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ANY';
export type CredentialType = 'Bearer' | 'Basic' | 'Custom';
