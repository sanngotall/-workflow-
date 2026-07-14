import http from './http'

/**
 * 业务数据存储 API（对齐后端 BusinessDataController）
 * 实际请求路径：/api/api/admin/v1/...
 *
 * 接口对齐 SPEC-04 §6 全部 12 个接口。
 */

export interface BusinessField {
  id?: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file'
  source: 'request' | 'response' | 'system'
  enabled: boolean
  nullable: boolean
  is_primary_key: boolean
  description?: string
}

/** file 类型字段值结构（对齐 SPEC-04 §6.6.1 响应） */
export interface FileFieldValue {
  fileId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  sha256: string
}

export interface BusinessTable {
  id: string
  project_id: string
  table_name: string
  display_name: string
  storage_type: 'persistent' | 'cache'
  ttl_seconds: number | null
  source: 'request' | 'response' | 'mixed'
  fields: BusinessField[]
  row_count: number
  size_mb: number
  created_at: string
  updated_at: string
}

export type TableRow = Record<string, string | number | boolean | null>

export interface TableRowsResult {
  items: TableRow[]
  total: number
}

// ===== 6.1 业务表元数据 CRUD =====

export function listBusinessTables(projectId: string, storageType?: 'persistent' | 'cache') {
  const params = storageType ? { storage_type: storageType } : {}
  return http.get<unknown, BusinessTable[]>(`/api/admin/v1/projects/${projectId}/business-tables`, { params })
}

export function createBusinessTable(projectId: string, data: {
  display_name: string
  storage_type: 'persistent' | 'cache'
  ttl_seconds?: number | null
  source: 'request' | 'response' | 'mixed'
  fields: BusinessField[]
}) {
  return http.post<unknown, BusinessTable>(`/api/admin/v1/projects/${projectId}/business-tables`, data)
}

export function updateBusinessTable(tableId: string, data: {
  display_name?: string
  storage_type?: 'persistent' | 'cache'
  ttl_seconds?: number | null
  source?: 'request' | 'response' | 'mixed'
  fields?: BusinessField[]
}) {
  return http.patch<unknown, BusinessTable>(`/api/admin/v1/business-tables/${tableId}`, data)
}

export function deleteBusinessTable(tableId: string) {
  return http.delete<unknown, null>(`/api/admin/v1/business-tables/${tableId}`, { params: { confirm: 'true' } })
}

// ===== 6.2 业务表数据图形化 CRUD =====

export function listTableRows(tableId: string, params?: {
  search?: string
  field?: string
  limit?: number
  offset?: number
  order_by?: string
}) {
  return http.get<unknown, TableRowsResult>(`/api/admin/v1/business-tables/${tableId}/rows`, { params })
}

export function createTableRow(tableId: string, row: TableRow) {
  return http.post<unknown, TableRow>(`/api/admin/v1/business-tables/${tableId}/rows`, row)
}

export function updateTableRow(tableId: string, rowId: string, patch: TableRow) {
  return http.patch<unknown, TableRow>(`/api/admin/v1/business-tables/${tableId}/rows/${rowId}`, patch)
}

export function deleteTableRow(tableId: string, rowId: string) {
  return http.delete<unknown, null>(`/api/admin/v1/business-tables/${tableId}/rows/${rowId}`)
}

// ===== 6.3 缓存管理 =====

export function listCacheTables() {
  return http.get<unknown, BusinessTable[]>('/api/admin/v1/database/cache-tables')
}

export function clearCacheTable(tableId: string) {
  return http.post<unknown, null>(`/api/admin/v1/business-tables/${tableId}/clear`)
}

// ===== 6.4 备份与迁移 =====

export function backupTable(tableId: string, data?: { gzip?: boolean; description?: string }) {
  return http.post<unknown, any>(`/api/admin/v1/business-tables/${tableId}/backup`, data || {})
}

export function listBackups(projectId: string, type?: 'backup' | 'migration') {
  const params = type ? { type } : {}
  return http.get<unknown, any[]>(`/api/admin/v1/projects/${projectId}/backups`, { params })
}

// ===== 6.6 文件存储（对齐 SPEC-04 §6.6）=====

/**
 * 上传文件（multipart/form-data）
 * - 用于 file 类型字段的文件上传
 * - 后端会按 sha256 去重，相同文件物理只存一份
 *
 * @param businessTableId 关联业务表 ID（必须含已启用的 file 类型字段）
 * @param file File 对象
 * @param expiresAt 可选过期时间（cache 表会自动 TTL 清理）
 * @returns FileFieldValue 适合直接作为行写入的 file 字段值
 */
export function uploadFile(
  businessTableId: string,
  file: File,
  expiresAt?: Date,
): Promise<FileFieldValue> {
  const formData = new FormData()
  formData.append('file', file)
  const params: Record<string, string> = { businessTableId }
  if (expiresAt) params.expiresAt = expiresAt.toISOString()
  // 文件上传超时放宽到 60s
  return http.post<unknown, FileFieldValue>(
    '/api/admin/v1/files/upload',
    formData,
    {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    },
  )
}

/**
 * 下载文件（返回 Blob）
 * - 直接走二进制流，不经过 ApiResult 拦截器解包
 * - 调用方可使用 URL.createObjectURL 生成下载链接
 *
 * @param fileId 文件 ID（来自 file 字段值 fileId）
 */
export async function downloadFile(fileId: string): Promise<Blob> {
  // 拦截器对 blob 响应直接放行（见 http.ts），返回完整 AxiosResponse
  const response = await http.get(`/api/admin/v1/files/${fileId}/download`, {
    responseType: 'blob',
  })
  return (response as any).data as Blob
}

/**
 * 删除文件索引
 * - 后端按 sha256 查引用计数，无引用才删磁盘文件
 * - 通常用于用户主动撤销上传或编辑 file 字段替换新文件时
 *
 * @param fileId 文件 ID
 */
export function deleteFile(fileId: string) {
  return http.delete<unknown, { deleted: boolean; physicalRemoved: boolean }>(
    `/api/admin/v1/files/${fileId}`,
  )
}
