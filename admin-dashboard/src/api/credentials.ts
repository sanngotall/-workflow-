import { axiosInstance } from './index'
import type { Credential } from '@/types'

export const credentialsApi = {
  getByProject: async (projectId: string): Promise<Credential[]> => {
    return axiosInstance.get(`/admin/v1/credentials/project/${projectId}`)
  },
  getById: async (id: string): Promise<Credential> => {
    return axiosInstance.get(`/admin/v1/credentials/${id}`)
  },
  create: async (data: { project_id: string; name: string; type: string; secret: string }): Promise<Credential> => {
    return axiosInstance.post('/admin/v1/credentials', data)
  },
  update: async (id: string, data: { name?: string; type?: string; secret?: string }): Promise<Credential> => {
    return axiosInstance.put(`/admin/v1/credentials/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    return axiosInstance.delete(`/admin/v1/credentials/${id}`)
  }
}
