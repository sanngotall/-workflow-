import http from './http'

/**
 * 转换器 API（对齐后端 TransformerController）
 * 实际请求路径：/api/api/admin/v1/transformers
 */

export interface Transformer {
  id: string
  route_id: string
  target_url: string
  type: string
  credential_id: string | null
  mapping_rules: Record<string, any> | null
  script_code: string | null
  response_rules: Record<string, any> | null
  created_at: string
  updated_at: string
}

export function getTransformerByRoute(routeId: string) {
  return http.get<unknown, Transformer | null>(`/api/admin/v1/transformers/route/${routeId}`)
}

export function getTransformer(id: string) {
  return http.get<unknown, Transformer>(`/api/admin/v1/transformers/${id}`)
}

export function createTransformer(data: {
  route_id: string
  target_url: string
  type: string
  credential_id?: string
  mapping_rules?: Record<string, any>
  script_code?: string
  response_rules?: Record<string, any>
}) {
  return http.post<unknown, Transformer>('/api/admin/v1/transformers', data)
}

export function updateTransformer(id: string, data: Partial<{
  target_url: string
  type: string
  credential_id: string
  mapping_rules: Record<string, any>
  script_code: string
  response_rules: Record<string, any>
}>) {
  return http.put<unknown, Transformer>(`/api/admin/v1/transformers/${id}`, data)
}

export function deleteTransformer(id: string) {
  return http.delete<unknown, null>(`/api/admin/v1/transformers/${id}`)
}
