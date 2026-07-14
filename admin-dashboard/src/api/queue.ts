import { axiosInstance } from './index'
import type { QueueStats, AsyncTask } from '@/types'

export const queueApi = {
  getStats: async (): Promise<QueueStats> => {
    return axiosInstance.get('/admin/v1/queue/stats')
  },
  getTasks: async (status?: string, limit?: number): Promise<AsyncTask[]> => {
    const params: Record<string, any> = {}
    if (status) params.status = status
    if (limit) params.limit = limit
    return axiosInstance.get('/admin/v1/queue/tasks', { params })
  },
  getTaskById: async (id: string): Promise<AsyncTask> => {
    return axiosInstance.get(`/admin/v1/queue/tasks/${id}`)
  }
}
