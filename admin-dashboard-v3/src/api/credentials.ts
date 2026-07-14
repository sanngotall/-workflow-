import http from './http'

/**
 * 凭证 API（对齐后端 CredentialController）
 * 实际请求路径：/api/api/admin/v1/credentials
 * 注意：后端响应不返回 secret 字段（安全考虑）
 */

export interface Credential {
  id: string
  name: string
  type: string
  created_at: string
}

export function listCredentialsByProject(projectId: string) {
  return http.get<unknown, Credential[]>(`/api/admin/v1/credentials/project/${projectId}`)
}

export function getCredential(id: string) {
  return http.get<unknown, Credential>(`/api/admin/v1/credentials/${id}`)
}

export function createCredential(data: { project_id: string; name: string; type: string; secret: string }) {
  return http.post<unknown, Credential>('/api/admin/v1/credentials', data)
}

export function updateCredential(id: string, data: { name?: string; type?: string; secret?: string }) {
  return http.put<unknown, Credential>(`/api/admin/v1/credentials/${id}`, data)
}

export function deleteCredential(id: string) {
  return http.delete<unknown, null>(`/api/admin/v1/credentials/${id}`)
}
