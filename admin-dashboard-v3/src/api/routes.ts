import http from './http'

/**
 * 路由（中转）API（对齐后端 RouteController）
 * 实际请求路径：/api/api/admin/v1/routes
 */

export interface Route {
  id: string
  project_id: string
  environment: string
  method: string
  path: string
  is_active: boolean
  is_async: boolean
  timeout_ms: number
  created_at: string
  updated_at: string
}

/** 列出项目下所有路由 */
export function listRoutesByProject(projectId: string) {
  return http.get<unknown, Route[]>(`/api/admin/v1/routes/project/${projectId}`)
}

export function getRoute(id: string) {
  return http.get<unknown, Route>(`/api/admin/v1/routes/${id}`)
}

export function createRoute(data: {
  project_id: string
  environment: string
  method: string
  path: string
  is_async?: boolean
  timeout_ms?: number
}) {
  return http.post<unknown, Route>('/api/admin/v1/routes', data)
}

export function updateRoute(id: string, data: Partial<{
  environment: string
  method: string
  path: string
  is_active: boolean
  is_async: boolean
  timeout_ms: number
}>) {
  return http.put<unknown, Route>(`/api/admin/v1/routes/${id}`, data)
}

export function deleteRoute(id: string) {
  return http.delete<unknown, null>(`/api/admin/v1/routes/${id}`)
}
