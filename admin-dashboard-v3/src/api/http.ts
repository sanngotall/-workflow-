import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

/**
 * 后端统一响应格式（对齐 SPEC-04 §2）
 */
export interface ApiResult<T = any> {
  success: boolean
  data: T
  error: { code: string; message: string } | null
}

/**
 * 创建 axios 实例
 * - baseURL: '/api'（由 Vite proxy 转发到后端 13000）
 * - 超时：15s
 * - 请求拦截器：自动注入 Bearer token
 * - 响应拦截器：统一解包 ApiResult，401 跳登录
 */
const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：注入 Authorization
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ddt_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一解包 + 错误处理
http.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    // 文件下载等二进制响应直接放行（responseType: 'blob'）
    // 这些响应没有 ApiResult 包裹，由调用方自行处理 Blob
    if (response.config.responseType === 'blob') {
      return response as any
    }
    const result = response.data
    // 业务成功：直接返回 data 字段，简化调用方代码
    if (result.success) {
      return result.data as any
    }
    // 业务失败：抛出含错误码的异常
    const err: any = new Error(result.error?.message || '请求失败')
    err.code = result.error?.code || 'UNKNOWN'
    err.businessError = true
    return Promise.reject(err)
  },
  (error: AxiosError<ApiResult>) => {
    const status = error.response?.status
    const bizError = error.response?.data?.error

    // 401：token 失效或未登录，清理并跳转登录
    if (status === 401) {
      localStorage.removeItem('ddt_access_token')
      localStorage.removeItem('ddt_refresh_token')
      // 避免在登录页循环跳转
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // 提取后端统一错误结构
    if (bizError) {
      const err: any = new Error(bizError.message || '请求失败')
      err.code = bizError.code || 'UNKNOWN'
      err.status = status
      err.businessError = true
      return Promise.reject(err)
    }

    // 网络或 HTTP 层错误
    const err: any = new Error(error.message || '网络错误')
    err.status = status
    return Promise.reject(err)
  },
)

export default http
