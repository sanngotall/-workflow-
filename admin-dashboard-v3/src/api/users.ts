import http from './http'

/**
 * 用户管理 API（对齐后端 UsersController）
 * 实际请求路径：/api/users
 */

export interface User {
  id: string
  username: string
  email: string
  name: string
  status: string
  global_roles: string[]
}

export function listUsers(params?: { keyword?: string; status?: string; page?: number; pageSize?: number }) {
  return http.get<unknown, { items: User[]; total: number }>('/users', { params })
}

export function getUser(id: string) {
  return http.get<unknown, User>(`/users/${id}`)
}

export function createUser(data: {
  username: string
  email: string
  password: string
  name: string
  avatar_url?: string
  phone?: string
  global_role?: 'super_admin' | 'admin'
}) {
  return http.post<unknown, User>('/users', data)
}

export function updateUser(id: string, data: { name?: string; avatar_url?: string; phone?: string }) {
  return http.put<unknown, User>(`/users/${id}`, data)
}

export function updateUserStatus(id: string, status: 'active' | 'inactive' | 'disabled') {
  return http.put<unknown, null>(`/users/${id}/status`, { status })
}

/** 管理员重置其他用户密码 */
export function adminResetPassword(id: string, newPassword: string) {
  return http.put<unknown, null>(`/users/${id}/password/admin`, { new_password: newPassword })
}

export function deleteUser(id: string) {
  return http.delete<unknown, null>(`/users/${id}`)
}
