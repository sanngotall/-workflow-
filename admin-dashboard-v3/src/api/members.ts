import http from './http'

/**
 * 项目成员 API（对齐后端 ProjectMembersController）
 * 实际请求路径：/api/projects/:projectId/members
 */

export interface ProjectMember {
  id: string
  user_id: string
  username: string
  name: string
  avatar_url: string | null
  role: string
  joined_at: string
}

export interface AvailableUser {
  id: string
  username: string
  name: string
}

export function listMembers(projectId: string) {
  return http.get<unknown, { items: ProjectMember[]; total: number }>(`/projects/${projectId}/members`)
}

export function listAvailableUsers(projectId: string, keyword?: string) {
  const params = keyword ? { keyword } : {}
  return http.get<unknown, AvailableUser[]>(`/projects/${projectId}/members/available`, { params })
}

export function addMembers(projectId: string, members: { user_id: string; role: string }[]) {
  return http.post<unknown, { added: { user_id: string; role: string }[]; skipped: { user_id: string; reason: string }[] }>(
    `/projects/${projectId}/members`,
    { members },
  )
}

export function updateMemberRole(projectId: string, memberId: string, role: string) {
  return http.put<unknown, null>(`/projects/${projectId}/members/${memberId}`, { role })
}

export function removeMember(projectId: string, memberId: string) {
  return http.delete<unknown, null>(`/projects/${projectId}/members/${memberId}`)
}
