import axios from 'axios'
import { triggerGlobalNotification } from '@/utils/notification'

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const projectId = localStorage.getItem('currentProjectId')
  if (projectId && !config.url?.includes('project_id')) {
    config.headers['X-Project-ID'] = projectId
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    const { success, data, error } = response.data
    if (success) return data

    triggerGlobalNotification(error.code, error.message)
    return Promise.reject(error)
  },
  (error) => {
    const errBody = error.response?.data?.error
    // 仅当后端返回业务错误码时弹全局通知；
    // 无 code 的原生 404/路由未实现等由业务层自行 catch，避免未实现接口刷屏
    if (errBody?.code) {
      triggerGlobalNotification(errBody.code, errBody?.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export { axiosInstance }
export { api } from './api'
