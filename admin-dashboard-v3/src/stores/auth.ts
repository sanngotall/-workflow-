import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'

/**
 * 鉴权 Store（对齐 SPEC-05 §4）
 *
 * 职责：
 * - 管理 access_token / refresh_token / 当前用户信息
 * - 提供 login / logout / fetchMe 动作
 * - 暴露 isLoggedIn / isSuperAdmin 计算属性供路由守卫与组件使用
 *
 * 持久化策略：
 * - token 持久化到 localStorage（http.ts 拦截器自动注入 Authorization 头）
 * - 用户信息仅在内存，刷新页面时由 router bootstrap 调用 fetchMe 重建
 */
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('ddt_access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('ddt_refresh_token'))
  const user = ref<authApi.MeResponse | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!accessToken.value)
  const isSuperAdmin = computed(() => user.value?.global_roles?.includes('super_admin') ?? false)
  const isAdmin = computed(() => {
    const roles = user.value?.global_roles ?? []
    return roles.includes('super_admin') || roles.includes('admin')
  })

  /** 登录 */
  async function login(username: string, password: string) {
    loading.value = true
    try {
      const result = await authApi.login(username, password)
      accessToken.value = result.access_token
      refreshToken.value = result.refresh_token
      localStorage.setItem('ddt_access_token', result.access_token)
      localStorage.setItem('ddt_refresh_token', result.refresh_token)
      // 登录成功后立即拉取完整用户信息
      await fetchMe()
      return result
    } finally {
      loading.value = false
    }
  }

  /** 拉取当前用户信息（用于刷新页面后重建登录态） */
  async function fetchMe() {
    if (!accessToken.value) return null
    try {
      const me = await authApi.getMe()
      user.value = me
      return me
    } catch (e) {
      // token 失效，清理
      clearAuth()
      throw e
    }
  }

  /** 登出 */
  async function logout() {
    try {
      if (accessToken.value) {
        await authApi.logout()
      }
    } catch {
      // 即使后端调用失败也清理本地状态
    } finally {
      clearAuth()
    }
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('ddt_access_token')
    localStorage.removeItem('ddt_refresh_token')
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    login,
    logout,
    fetchMe,
    clearAuth,
  }
})
