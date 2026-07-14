import http from './http'

/**
 * 微信小程序配置 API（对齐后端 WxConfigController）
 * 实际请求路径：/api/admin/v1/projects/:projectId/wx-config
 *
 * 安全说明：响应中不返回明文 app_secret / jwt_secret，只返回 has_* 标志。
 * 保存时三个字段（app_id / app_secret / jwt_secret）均为必填。
 */

export interface WxConfig {
  id: string
  app_id: string
  has_app_secret: boolean
  has_jwt_secret: boolean
  created_at: string
  updated_at: string
}

/** 获取项目微信配置（未配置时返回 null） */
export function getWxConfig(projectId: string) {
  return http.get<unknown, WxConfig | null>(`/api/admin/v1/projects/${projectId}/wx-config`)
}

/** 创建或更新微信配置（upsert，三字段必填） */
export function saveWxConfig(projectId: string, data: {
  app_id: string
  app_secret: string
  jwt_secret: string
}) {
  return http.put<unknown, WxConfig>(`/api/admin/v1/projects/${projectId}/wx-config`, data)
}

/** 删除微信配置 */
export function deleteWxConfig(projectId: string) {
  return http.delete<unknown, { deleted: boolean }>(`/api/admin/v1/projects/${projectId}/wx-config`)
}
