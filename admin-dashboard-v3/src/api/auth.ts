import http from './http'

/**
 * 鉴权 API（对齐 SPEC-05 §4 / 后端 AuthController）
 * 后端路由前缀：/api/auth（main.ts 全局前缀 + controller）
 */

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: string
    username: string
    name: string
    avatar_url: string | null
    global_roles: string[]
  }
}

export interface MeResponse {
  id: string
  username: string
  email: string
  name: string
  avatar_url: string | null
  phone: string | null
  status: string
  last_login_at: string | null
  global_roles: string[]
}

/** 登录（@Public 接口） */
export function login(username: string, password: string) {
  return http.post<unknown, LoginResponse>('/auth/login', { username, password })
}

/** 刷新 token（@Public 接口） */
export function refresh(refreshToken: string) {
  return http.post<unknown, LoginResponse>('/auth/refresh', { refresh_token: refreshToken })
}

/** 登出（加入黑名单） */
export function logout() {
  return http.post<unknown, null>('/auth/logout')
}

/** 获取当前用户信息 */
export function getMe() {
  return http.get<unknown, MeResponse>('/auth/me')
}

/** 本人修改密码 */
export function changeMyPassword(userId: string, oldPassword: string, newPassword: string) {
  return http.put<unknown, null>(`/users/${userId}/password`, {
    old_password: oldPassword,
    new_password: newPassword,
  })
}
