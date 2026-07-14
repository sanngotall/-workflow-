<template>
  <div v-if="table" class="space-y-6">
    <!-- 头部 -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="$router.push(`/database/project/${projectId}`)"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          :class="table.storage_type === 'cache' ? 'bg-amber-100' : 'bg-blue-100'"
        >
          <TableIcon
            class="w-6 h-6"
            :class="table.storage_type === 'cache' ? 'text-amber-600' : 'text-blue-600'"
          />
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h1 class="text-2xl font-bold text-gray-800">{{ table.display_name }}</h1>
            <span
              class="px-2 py-0.5 text-xs font-medium rounded"
              :class="table.storage_type === 'cache' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ table.storage_type === 'cache' ? `缓存 · TTL ${formatTTL(table.ttl_seconds)}` : '长期存储' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 font-mono">{{ table.table_name }} · {{ table.row_count.toLocaleString() }} 行</p>
        </div>
      </div>
      <button
        @click="openAddRow"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        新增一行
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="`搜索 ${enabledFields.length} 个字段...`"
          class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
        />
      </div>
      <select
        v-model="searchField"
        class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">全部字段</option>
        <option v-for="f in enabledFields" :key="f.name" :value="f.name">{{ f.name }}</option>
      </select>
      <div class="ml-auto text-xs text-gray-500">
        共 {{ filteredRows.length }} 条匹配 · {{ rows.length.toLocaleString() }} 条总数
      </div>
    </div>

    <!-- 数据表格（图形化 CRUD） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap w-12">#</th>
              <th
                v-for="f in enabledFields"
                :key="f.name"
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
              >
                <div class="flex items-center gap-1">
                  <span>{{ f.name }}</span>
                  <Key v-if="f.is_primary_key" class="w-3 h-3 text-amber-500" />
                  <span
                    class="px-1 py-0.5 text-[10px] rounded"
                    :class="sourceBadgeClass(f.source)"
                  >{{ sourceLabel(f.source) }}</span>
                </div>
              </th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(row, rowIdx) in filteredRows"
              :key="rowIdx"
              class="hover:bg-gray-50 group"
            >
              <td class="px-4 py-3 text-xs text-gray-400">{{ rowIdx + 1 }}</td>
              <td
                v-for="f in enabledFields"
                :key="f.name"
                class="px-4 py-3"
                @dblclick="f.type === 'file' ? startFileEdit(rowIdx, f.name) : startEdit(rowIdx, f.name)"
              >
                <!-- file 字段：显示文件名 + 下载/替换 -->
                <div v-if="f.type === 'file'" class="flex items-center gap-2">
                  <template v-if="getFileValue(row[f.name])">
                    <a
                      href="javascript:void(0)"
                      @click.prevent="handleDownload(getFileValue(row[f.name])!.fileId, getFileValue(row[f.name])!.fileName)"
                      class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
                      :title="`下载 ${getFileValue(row[f.name])!.fileName}`"
                    >
                      <Download class="w-3.5 h-3.5" />
                      <span class="truncate max-w-[160px]">{{ getFileValue(row[f.name])!.fileName }}</span>
                      <span class="text-gray-400 text-[10px]">({{ formatFileSize(getFileValue(row[f.name])!.sizeBytes) }})</span>
                    </a>
                    <button
                      @click.stop="handleReplaceFile(rowIdx, f.name)"
                      class="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                      title="替换文件"
                    >
                      <RefreshCw class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click.stop="handleClearFile(rowIdx, f.name)"
                      class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="移除文件（保留行）"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </template>
                  <template v-else>
                    <button
                      @click.stop="handleReplaceFile(rowIdx, f.name)"
                      class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      <span>上传文件</span>
                    </button>
                  </template>
                </div>
                <!-- 编辑态（非 file 字段） -->
                <input
                  v-else-if="editingCell && editingCell.rowIdx === rowIdx && editingCell.field === f.name"
                  v-model="editingValue"
                  :type="inputType(f.type)"
                  autofocus
                  @blur="saveEdit(rowIdx, f.name)"
                  @keyup.enter="saveEdit(rowIdx, f.name)"
                  @keyup.esc="cancelEdit"
                  class="w-full px-2 py-1 border border-primary-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <!-- 只读态（非 file 字段） -->
                <span
                  v-else
                  class="block cursor-text"
                  :class="{
                    'text-gray-300 italic': row[f.name] === null || row[f.name] === undefined || row[f.name] === '',
                    'font-mono text-xs': f.type === 'json' || f.type === 'timestamp',
                    'font-mono text-blue-600': f.type === 'number',
                    'text-gray-800': f.type === 'string'
                  }"
                >
                  {{ formatCell(row[f.name], f.type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="confirmDeleteRow(rowIdx)"
                  class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="删除该行"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空态 -->
      <div v-if="filteredRows.length === 0" class="p-12 text-center">
        <Inbox class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 text-sm">
          {{ searchQuery ? '没有匹配的数据' : '这张表还没有数据' }}
        </p>
        <button
          v-if="!searchQuery"
          @click="openAddRow"
          class="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          新增第一行
        </button>
      </div>

      <!-- 双击编辑提示 -->
      <div class="px-4 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-700 flex items-center gap-2">
        <MousePointerClick class="w-3.5 h-3.5" />
        <span>双击任意单元格可直接编辑，按 Enter 保存，Esc 取消</span>
      </div>
    </div>

    <!-- 新增行 Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="showAddModal = false"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">新增一行到「{{ table.display_name }}」</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div
            v-for="f in enabledFields"
            :key="f.name"
          >
            <label class="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              {{ f.name }}
              <Key v-if="f.is_primary_key" class="w-3 h-3 text-amber-500" />
              <span class="text-xs text-gray-400">{{ f.type }}</span>
              <span v-if="f.description" class="text-xs text-gray-400">· {{ f.description }}</span>
            </label>

            <!-- file 字段：上传组件 -->
            <div v-if="f.type === 'file'" class="space-y-2">
              <template v-if="getFileValue(newRow[f.name])">
                <div class="flex items-center gap-3 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <FileText class="w-5 h-5 text-purple-600 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ getFileValue(newRow[f.name])!.fileName }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(getFileValue(newRow[f.name])!.sizeBytes) }} · {{ getFileValue(newRow[f.name])!.mimeType }}</p>
                  </div>
                  <button
                    @click="removeNewRowFile(f.name)"
                    class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    title="移除"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <button
                  @click="triggerFilePicker(f.name)"
                  class="text-xs text-primary-600 hover:text-primary-700"
                >更换文件</button>
              </template>
              <label
                v-else
                class="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
              >
                <Upload class="w-6 h-6 text-gray-400" />
                <span class="text-sm text-gray-600">点击或拖拽文件到此处上传</span>
                <span class="text-xs text-gray-400">支持 PDF/Word/Excel/PPT/图片/文本/ZIP，单文件 ≤ 50MB</span>
                <input
                  type="file"
                  class="hidden"
                  @change="handleNewRowFileSelect($event, f.name)"
                />
              </label>
            </div>

            <!-- 非 file 字段：常规输入 -->
            <input
              v-else
              v-model="newRow[f.name]"
              :type="inputType(f.type)"
              :placeholder="f.nullable ? '可空' : '必填'"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div v-if="addErrorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ addErrorMsg }}</div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button @click="showAddModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
          <button
            @click="addRow"
            :disabled="adding"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
          >{{ adding ? '新增中...' : '新增' }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载中 -->
  <div v-else-if="loading" class="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
    <p class="text-sm">加载中...</p>
  </div>

  <!-- 表不存在 -->
  <div v-else class="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
    <p class="text-gray-500">未找到该数据表</p>
    <button
      @click="$router.push(`/database/project/${projectId}`)"
      class="mt-3 text-sm text-primary-600 hover:text-primary-700"
    >返回项目存储管理</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft, Plus, Table as TableIcon, Search, Key, Trash2, X, Inbox, MousePointerClick,
  Download, Upload, FileText, RefreshCw,
} from 'lucide-vue-next'
import {
  listBusinessTables, listTableRows, createTableRow, updateTableRow, deleteTableRow,
  uploadFile, downloadFile, deleteFile,
  type BusinessTable, type BusinessField, type TableRow, type FileFieldValue,
} from '@/api/business-data'

const route = useRoute()

const projectId = computed(() => route.params.projectId as string)
const tableId = computed(() => route.params.tableId as string)
const table = ref<BusinessTable | null>(null)
const loading = ref(true)

const enabledFields = computed<BusinessField[]>(() => table.value?.fields.filter(f => f.enabled) || [])

const searchQuery = ref('')
const searchField = ref('')

const rows = ref<TableRow[]>([])
const primaryKeyField = computed(() => enabledFields.value.find(f => f.is_primary_key))

const filteredRows = computed(() => {
  if (!searchQuery.value) return rows.value
  const q = String(searchQuery.value).toLowerCase()
  return rows.value.filter(row => {
    if (searchField.value) {
      return String(row[searchField.value] ?? '').toLowerCase().includes(q)
    }
    return enabledFields.value.some(f =>
      String(row[f.name] ?? '').toLowerCase().includes(q)
    )
  })
})

async function loadData() {
  loading.value = true
  try {
    // 拉取项目下所有表，过滤出当前表
    const allTables = await listBusinessTables(projectId.value)
    table.value = allTables.find(t => t.id === tableId.value) || null
    if (!table.value) return
    // 拉取行数据
    const result = await listTableRows(tableId.value, { limit: 200 })
    rows.value = result.items || []
  } catch (e) {
    console.error('加载表数据失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// 双击编辑
const editingCell = ref<{ rowIdx: number; field: string } | null>(null)
const editingValue = ref<string | number>('')

const startEdit = (rowIdx: number, field: string) => {
  const row = filteredRows.value[rowIdx]
  if (!row) return
  editingCell.value = { rowIdx, field }
  editingValue.value = row[field] as string | number
}

const saveEdit = async (rowIdx: number, field: string) => {
  if (!editingCell.value) return
  const filteredRow = filteredRows.value[rowIdx]
  if (!filteredRow || !primaryKeyField.value) {
    editingCell.value = null
    return
  }
  const rowId = String(filteredRow[primaryKeyField.value.name])
  try {
    await updateTableRow(tableId.value, rowId, { [field]: editingValue.value })
    // 本地同步更新
    filteredRow[field] = editingValue.value
  } catch (e: any) {
    alert(e?.message || '保存失败')
  }
  editingCell.value = null
}

const cancelEdit = () => {
  editingCell.value = null
}

// 删除行
const confirmDeleteRow = async (rowIdx: number) => {
  const filteredRow = filteredRows.value[rowIdx]
  if (!filteredRow || !primaryKeyField.value) return
  if (!confirm('确认删除该行？')) return
  const rowId = String(filteredRow[primaryKeyField.value.name])
  try {
    await deleteTableRow(tableId.value, rowId)
    rows.value = rows.value.filter(r => r !== filteredRow)
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

// 新增行
const showAddModal = ref(false)
const newRow = ref<TableRow>({})
const adding = ref(false)
const addErrorMsg = ref('')

const openAddRow = () => {
  newRow.value = {}
  enabledFields.value.forEach(f => {
    if (f.type === 'timestamp') {
      newRow.value[f.name] = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    } else if (f.type === 'number' && !f.is_primary_key) {
      newRow.value[f.name] = 0
    } else if (f.type === 'boolean') {
      newRow.value[f.name] = false
    } else if (f.type === 'file') {
      // file 字段初始为 null，用户通过上传组件选择
      newRow.value[f.name] = null
    } else {
      newRow.value[f.name] = ''
    }
  })
  addErrorMsg.value = ''
  showAddModal.value = true
}

const addRow = async () => {
  adding.value = true
  addErrorMsg.value = ''
  try {
    const created = await createTableRow(tableId.value, { ...newRow.value })
    rows.value.unshift(created)
    showAddModal.value = false
  } catch (e: any) {
    addErrorMsg.value = e?.message || '新增失败'
  } finally {
    adding.value = false
  }
}

// ===== file 字段处理 =====

/**
 * 兼容解析 file 字段值
 * - 后端 JSONB 返回时通常是对象 { fileId, fileName, ... }
 * - 部分场景可能是 JSON 字符串
 * - null/undefined/空字符串视为无文件
 */
const getFileValue = (raw: unknown): FileFieldValue | null => {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'object') return raw as FileFieldValue
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' && parsed.fileId ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

/** 格式化文件大小（B / KB / MB） */
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 触发浏览器下载文件
 * 调用 downloadFile API 拿到 Blob，再生成临时 URL 触发 a 标签点击下载
 */
const handleDownload = async (fileId: string, fileName: string) => {
  try {
    const blob = await downloadFile(fileId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // 延迟释放，避免下载尚未启动
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e: any) {
    alert(e?.message || '下载失败')
  }
}

/**
 * 隐藏 file picker 触发器
 * 用于行内 file 字段的替换 / 新增行 modal 中的"更换文件"按钮
 * 通过动态创建 <input type="file"> 触发系统选择器
 */
const triggerHiddenFilePicker = (onSelect: (file: File) => void) => {
  const input = document.createElement('input')
  input.type = 'file'
  // 不限制 accept，后端有 MIME 白名单兜底
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) onSelect(file)
  }
  input.click()
}

/**
 * 上传文件到当前业务表
 * @returns FileFieldValue 上传成功后的文件索引对象
 */
const uploadToCurrentTable = async (file: File): Promise<FileFieldValue> => {
  return await uploadFile(tableId.value, file)
}

/**
 * 行内 file 字段：替换/上传新文件
 * 1. 调用 uploadFile 上传 → 拿到 FileFieldValue
 * 2. 调用 updateTableRow PATCH 更新该行该字段
 * 3. 本地同步
 */
const handleReplaceFile = async (rowIdx: number, fieldName: string) => {
  const filteredRow = filteredRows.value[rowIdx]
  if (!filteredRow || !primaryKeyField.value) return
  const rowId = String(filteredRow[primaryKeyField.value.name])

  triggerHiddenFilePicker(async (file) => {
    try {
      const fileValue = await uploadToCurrentTable(file)
      await updateTableRow(tableId.value, rowId, { [fieldName]: fileValue } as any)
      // 本地同步（filteredRows 是 computed，写入 rows）
      const targetRow = rows.value.find(r => String(r[primaryKeyField.value!.name]) === rowId)
      if (targetRow) targetRow[fieldName] = fileValue as any
    } catch (e: any) {
      alert(e?.message || '文件上传失败')
    }
  })
}

/**
 * 双击 file 字段等同于点击"替换/上传文件"
 */
const startFileEdit = (rowIdx: number, fieldName: string) => {
  handleReplaceFile(rowIdx, fieldName)
}

/**
 * 行内 file 字段：清空文件引用（保留行）
 * 流程：
 *   1. 拿到原 fileValue.fileId
 *   2. PATCH 行字段值为 null（解绑行 ↔ 文件）
 *   3. 调 deleteFile 删 file_index 记录（后端按 sha256 引用计数判定是否物理删磁盘）
 * 注意：步骤 2 必须先成功，避免文件索引已删但行还引用导致悬空指针
 */
const handleClearFile = async (rowIdx: number, fieldName: string) => {
  const filteredRow = filteredRows.value[rowIdx]
  if (!filteredRow || !primaryKeyField.value) return
  const existingFile = getFileValue(filteredRow[fieldName])
  if (!existingFile) return
  if (!confirm(`确认移除文件「${existingFile.fileName}」？\n行保留，文件实体按引用计数清理。`)) return
  const rowId = String(filteredRow[primaryKeyField.value.name])
  try {
    // 1. 先解绑行字段
    await updateTableRow(tableId.value, rowId, { [fieldName]: null } as any)
    // 2. 再删文件索引（即使失败也不影响行已解绑）
    try {
      await deleteFile(existingFile.fileId)
    } catch (e) {
      console.warn('删除文件索引失败（行已解绑，可由 TTL 兜底清理）', e)
    }
    // 3. 本地同步
    const targetRow = rows.value.find(r => String(r[primaryKeyField.value!.name]) === rowId)
    if (targetRow) targetRow[fieldName] = null
  } catch (e: any) {
    alert(e?.message || '移除失败')
  }
}

/**
 * 新增行 modal：点击"更换文件"按钮（已有文件时显示）
 */
const triggerFilePicker = (_fieldName: string) => {
  triggerHiddenFilePicker(async (file) => {
    try {
      const fileValue = await uploadToCurrentTable(file)
      newRow.value[_fieldName] = fileValue as any
    } catch (e: any) {
      alert(e?.message || '文件上传失败')
    }
  })
}

/**
 * 新增行 modal：首次选择文件（通过 label 内嵌 input 触发）
 */
const handleNewRowFileSelect = async (event: Event, fieldName: string) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const fileValue = await uploadToCurrentTable(file)
    newRow.value[fieldName] = fileValue as any
  } catch (e: any) {
    alert(e?.message || '文件上传失败')
  } finally {
    // 清空 input value 允许同一文件再次选择
    input.value = ''
  }
}

/**
 * 新增行 modal：移除已选文件
 * - 此时行尚未落库，直接调 deleteFile 删 file_index 避免悬空
 */
const removeNewRowFile = async (fieldName: string) => {
  const existingFile = getFileValue(newRow.value[fieldName])
  if (!existingFile) {
    newRow.value[fieldName] = null
    return
  }
  newRow.value[fieldName] = null
  try {
    await deleteFile(existingFile.fileId)
  } catch (e) {
    console.warn('移除已上传文件索引失败（可由 TTL 兜底清理）', e)
  }
}

// 辅助函数
const formatTTL = (s?: number | null) => {
  if (!s) return '-'
  if (s >= 3600) return (s / 3600) + 'h'
  if (s >= 60) return (s / 60) + 'min'
  return s + 's'
}

const formatCell = (val: unknown, type: string) => {
  if (val === null || val === undefined || val === '') return '—'
  if (type === 'json' && typeof val === 'string') {
    return val.length > 50 ? val.slice(0, 50) + '...' : val
  }
  return String(val)
}

const inputType = (type: string) => ({
  number: 'number',
  timestamp: 'text',
  boolean: 'checkbox',
  string: 'text',
  json: 'text'
}[type] || 'text')

const sourceLabel = (s: string) => ({
  request: '请求',
  response: '返回',
  system: '系统'
}[s] || s)

const sourceBadgeClass = (s: string) => ({
  request: 'bg-blue-100 text-blue-700',
  response: 'bg-green-100 text-green-700',
  system: 'bg-gray-100 text-gray-600'
}[s] || 'bg-gray-100 text-gray-600')
</script>
