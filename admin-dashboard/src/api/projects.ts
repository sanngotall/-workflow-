import { axiosInstance } from './index'
import type { Project } from '@/types'

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return axiosInstance.get('/admin/v1/projects')
  },
  getById: async (id: string): Promise<Project> => {
    return axiosInstance.get(`/admin/v1/projects/${id}`)
  },
  create: async (data: { name: string; description?: string }): Promise<Project> => {
    return axiosInstance.post('/admin/v1/projects', data)
  },
  update: async (id: string, data: { name?: string; description?: string }): Promise<Project> => {
    return axiosInstance.put(`/admin/v1/projects/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    return axiosInstance.delete(`/admin/v1/projects/${id}`)
  }
}
