import http from './http'

/**
 * 请求日志统计（对齐后端 LogStats 接口）
 */
export interface LogStats {
  /** 总请求数 */
  total: number
  /** 错误请求数（http_status >= 400） */
  error_count: number
  /** 平均耗时（毫秒） */
  avg_latency_ms: number
  /** P95 耗时（毫秒） */
  p95_latency_ms: number
  /** 状态码分布，如 { "200": 120, "404": 5, "500": 2 } */
  status_distribution: Record<string, number>
  /** 错误码 Top5，按出现次数降序 */
  top_errors: Array<{ error_code: string; count: number }>
}

/**
 * 请求日志行（对齐后端 RequestLogEntity）
 */
export interface RequestLog {
  id: number
  project_id: string
  route_id: string | null
  environment: string
  client_ip: string | null
  method: string
  path: string
  request_body_raw: string | null
  transformed_body_raw: string | null
  response_body_raw: string | null
  http_status: number
  error_code: string | null
  latency_ms: number
  created_at: string
}

export interface ListLogsResult {
  rows: RequestLog[]
  total: number
  limit: number
  offset: number
}

/**
 * 分页查询日志（对齐 SPEC-04 §7.1）
 * 路径前缀双层：/api（http baseURL）+ /api/admin/v1/projects/:projectId/logs → /api/api/admin/v1/projects/:projectId/logs
 */
export function listLogs(
  projectId: string,
  params: {
    routeId?: string
    method?: string
    httpStatus?: number
    errorCode?: string
    limit?: number
    offset?: number
  } = {},
) {
  return http.get<unknown, ListLogsResult>(
    `/api/admin/v1/projects/${projectId}/logs`,
    { params },
  )
}

/**
 * 聚合统计（对齐 SPEC-04 §7.2）
 * 用于 DashboardOverview 顶部卡片 + 状态码分布
 */
export function getLogStats(projectId: string, sinceHours: number = 24) {
  return http.get<unknown, LogStats>(
    `/api/admin/v1/projects/${projectId}/logs/stats`,
    { params: { sinceHours } },
  )
}
