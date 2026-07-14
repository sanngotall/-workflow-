import http from './http'

/**
 * 项目 API（对齐后端 ProjectController）
 *
 * 注意：后端 controller 路径为 'api/admin/v1/projects'，
 * 加上 main.ts 全局前缀 'api'，实际请求路径为 '/api/api/admin/v1/projects'。
 * 由于 http.ts baseURL 已为 '/api'，此处调用路径为 '/api/admin/v1/projects'。
 */

export interface Project {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export function listProjects() {
  return http.get<unknown, Project[]>('/api/admin/v1/projects')
}

export function getProject(id: string) {
  return http.get<unknown, Project>(`/api/admin/v1/projects/${id}`)
}

export function createProject(name: string, description?: string) {
  return http.post<unknown, Project>('/api/admin/v1/projects', { name, description })
}

export function updateProject(id: string, data: { name?: string; description?: string }) {
  return http.put<unknown, Project>(`/api/admin/v1/projects/${id}`, data)
}

export function deleteProject(id: string) {
  return http.delete<unknown, null>(`/api/admin/v1/projects/${id}`)
}
