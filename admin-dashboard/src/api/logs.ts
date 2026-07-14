import { axiosInstance } from './index'
import type { RequestLog } from '@/types'

export const logsApi = {
  getByProject: async (projectId: string, limit?: number): Promise<RequestLog[]> => {
    const params = limit ? { limit } : {}
    return axiosInstance.get(`/admin/v1/request-logs/project/${projectId}`, { params })
  },
  getByRoute: async (routeId: string, limit?: number): Promise<RequestLog[]> => {
    const params = limit ? { limit } : {}
    return axiosInstance.get(`/admin/v1/request-logs/route/${routeId}`, { params })
  }
}
