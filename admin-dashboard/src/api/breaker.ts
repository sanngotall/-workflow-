import { axiosInstance } from './index'
import type { BreakerState } from '@/types'

export const breakerApi = {
  getState: async (routeId: string): Promise<BreakerState> => {
    return axiosInstance.get(`/admin/v1/breaker/${routeId}`)
  },
  reset: async (routeId: string): Promise<void> => {
    return axiosInstance.post(`/admin/v1/breaker/${routeId}/reset`)
  },
  forceOpen: async (routeId: string): Promise<void> => {
    return axiosInstance.post(`/admin/v1/breaker/${routeId}/open`)
  },
  forceClose: async (routeId: string): Promise<void> => {
    return axiosInstance.post(`/admin/v1/breaker/${routeId}/close`)
  }
}
