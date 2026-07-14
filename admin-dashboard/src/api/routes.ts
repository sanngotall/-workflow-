import { axiosInstance } from './index'
import type { Route } from '@/types'

export const routesApi = {
  getByProject: async (projectId: string): Promise<Route[]> => {
    return axiosInstance.get(`/admin/v1/routes/project/${projectId}`)
  },
  getById: async (id: string): Promise<Route> => {
    return axiosInstance.get(`/admin/v1/routes/${id}`)
  },
  create: async (data: {
    project_id: string
    environment: string
    method: string
    path: string
    is_async?: boolean
    timeout_ms?: number
  }): Promise<Route> => {
    return axiosInstance.post('/admin/v1/routes', data)
  },
  update: async (id: string, data: Partial<{
    environment: string
    method: string
    path: string
    is_active: boolean
    is_async: boolean
    timeout_ms: number
  }>): Promise<Route> => {
    return axiosInstance.put(`/admin/v1/routes/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    return axiosInstance.delete(`/admin/v1/routes/${id}`)
  }
}
