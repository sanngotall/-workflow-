import { axiosInstance } from './index'
import type { Transformer, ConnectionTestResult } from '@/types'

export const transformersApi = {
  getByRoute: async (routeId: string): Promise<Transformer | null> => {
    return axiosInstance.get(`/admin/v1/transformers/route/${routeId}`)
  },
  getById: async (id: string): Promise<Transformer> => {
    return axiosInstance.get(`/admin/v1/transformers/${id}`)
  },
  create: async (data: {
    route_id: string
    target_url: string
    type: string
    credential_id?: string
    mapping_rules?: Record<string, any>
    script_code?: string
    response_rules?: Record<string, any>
  }): Promise<Transformer> => {
    return axiosInstance.post('/admin/v1/transformers', data)
  },
  update: async (id: string, data: Partial<{
    target_url: string
    type: string
    credential_id: string
    mapping_rules: Record<string, any>
    script_code: string
    response_rules: Record<string, any>
  }>): Promise<Transformer> => {
    return axiosInstance.put(`/admin/v1/transformers/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    return axiosInstance.delete(`/admin/v1/transformers/${id}`)
  },
  testConnection: async (url: string): Promise<ConnectionTestResult> => {
    return axiosInstance.post('/admin/v1/transformers/test-connection', { url })
  }
}
