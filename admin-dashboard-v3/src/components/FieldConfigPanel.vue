<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click.self="$emit('close')"
  >
    <div class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">
            {{ isEdit ? '编辑字段配置' : '配置新表' }}
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">从中转翻译模板派生字段，勾选需要存储的字段</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- 基本信息 -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">显示名称</label>
              <input
                v-model="form.displayName"
                type="text"
                placeholder="例如：对话记录"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">实际表名（只读）</label>
              <input
                :value="form.tableName"
                type="text"
                readonly
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">存储类型</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="opt in storageTypes"
                  :key="opt.value"
                  @click="form.storageType = opt.value"
                  class="flex flex-col items-start gap-1 p-3 border-2 rounded-lg transition-all text-left"
                  :class="form.storageType === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <component :is="opt.icon" class="w-4 h-4" :class="opt.iconClass" />
                  <span class="text-sm font-medium text-gray-800">{{ opt.label }}</span>
                  <span class="text-xs text-gray-500">{{ opt.description }}</span>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">数据来源</label>
              <select
                v-model="form.source"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="request">仅请求存储</option>
                <option value="response">仅返回存储</option>
                <option value="mixed">请求 + 返回</option>
              </select>
            </div>
          </div>

          <!-- 缓存 TTL（仅 cache 类型显示） -->
          <div v-if="form.storageType === 'cache'" class="p-4 bg-amber-50 rounded-lg">
            <label class="block text-sm font-medium text-gray-700 mb-2">TTL 过期时间</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.ttlSeconds"
                type="number"
                min="60"
                class="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span class="text-sm text-gray-600">秒</span>
              <div class="ml-auto flex items-center gap-2">
                <button
                  v-for="preset in ttlPresets"
                  :key="preset.value"
                  @click="form.ttlSeconds = preset.value"
                  class="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50"
                >{{ preset.label }}</button>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">数据行将在 TTL 到期后自动删除（{{ formatTTL(form.ttlSeconds) }}）</p>
          </div>
        </div>

        <!-- 字段配置 -->
        <div class="border-t border-gray-100 pt-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-sm font-semibold text-gray-800">字段配置</p>
              <p class="text-xs text-gray-500">从中转的请求/返回 JSON Schema 派生，勾选要存储的字段</p>
            </div>
            <button
              @click="addField"
              class="text-xs text-primary-600 hover:text-primary-700"
            >+ 添加自定义字段</button>
          </div>

          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-12">存</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">字段名</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">类型</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">来源</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">说明</th>
                  <th class="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-12">主键</th>
                  <th class="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-12"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(f, i) in form.fields" :key="i" class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-center">
                    <input
                      v-model="f.enabled"
                      type="checkbox"
                      class="rounded text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="f.name"
                      type="text"
                      class="w-full px-2 py-1 border border-transparent hover:border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-400"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <select
                      v-model="f.type"
                      @change="onTypeChange(f)"
                      class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                      :class="f.type === 'file' ? 'border-purple-300 bg-purple-50' : ''"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="json">json</option>
                      <option value="timestamp">timestamp</option>
                      <option value="file">file（文件存储）</option>
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 text-[10px] rounded"
                      :class="sourceBadgeClass(f.source)"
                    >{{ sourceLabel(f.source) }}</span>
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="f.description"
                      type="text"
                      placeholder="—"
                      class="w-full px-2 py-1 border border-transparent hover:border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-400"
                    />
                  </td>
                  <td class="px-3 py-2 text-center">
                    <input
                      v-model="f.isPrimaryKey"
                      type="checkbox"
                      :disabled="f.type === 'file'"
                      class="rounded text-amber-500 focus:ring-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                      :title="f.type === 'file' ? 'file 类型不可作为主键' : ''"
                    />
                  </td>
                  <td class="px-3 py-2 text-right">
                    <button
                      v-if="!f.isPrimaryKey"
                      @click="form.fields.splice(i, 1)"
                      class="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            已启用 {{ enabledFieldCount }} / {{ form.fields.length }} 个字段
          </p>

          <!-- file 字段使用提示（仅当存在 file 类型字段时显示） -->
          <div
            v-if="hasFileField"
            class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-2"
          >
            <FileText class="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div class="text-xs text-purple-800 space-y-1">
              <p class="font-semibold">文件存储字段说明</p>
              <ul class="list-disc list-inside space-y-0.5 text-purple-700">
                <li>file 字段值在物理表里以 JSONB 存储：<code class="px-1 bg-purple-100 rounded">{ fileId, fileName, mimeType, sizeBytes, sha256 }</code></li>
                <li>文件实体落本地磁盘 <code class="px-1 bg-purple-100 rounded">./storage/files</code>，相同 sha256 自动去重</li>
                <li>file 类型不可作为主键，必须允许 NULL（建议设为可空）</li>
                <li>cache 表的 file 字段会随 TTL 自动清理索引；磁盘文件按引用计数判定是否物理删除</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</div>
      </div>

      <!-- 底部 -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <p class="text-xs text-gray-500">
          建表后将自动创建 <code class="px-1 py-0.5 bg-gray-100 rounded text-gray-700">{{ form.tableName }}</code>
        </p>
        <div class="flex items-center gap-3">
          <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
          <button
            @click="save"
            :disabled="!canSave || saving"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >{{ saving ? '保存中...' : (isEdit ? '保存配置' : '创建表') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, ref } from 'vue'
import { X, Trash2, Database, Clock, FileText } from 'lucide-vue-next'
import {
  listBusinessTables, createBusinessTable, updateBusinessTable,
  type BusinessField,
} from '@/api/business-data'

const props = defineProps<{ projectId: string; tableId?: string | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const isEdit = computed(() => !!props.tableId)
const saving = ref(false)
const errorMsg = ref('')

// 表前缀（proj_001 → proj001）
const tablePrefix = computed(() => props.projectId.replace('_', '').toLowerCase())

// 字段类型（前端 form 字段，camelCase；提交时映射为后端 snake_case）
interface FormField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file'
  source: 'request' | 'response' | 'system'
  enabled: boolean
  nullable: boolean
  isPrimaryKey: boolean
  description?: string
}

// 表单
const form = reactive<{
  displayName: string
  tableName: string
  storageType: 'cache' | 'persistent'
  ttlSeconds: number
  source: 'request' | 'response' | 'mixed'
  fields: FormField[]
}>({
  displayName: '',
  tableName: '',
  storageType: 'persistent',
  ttlSeconds: 1800,
  source: 'mixed',
  fields: []
})

// 显示名称变化时，自动派生表名
watch(() => form.displayName, (name) => {
  if (!isEdit.value) {
    const slug = name ? name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').toLowerCase() : 'new_table'
    form.tableName = `${tablePrefix.value}_${slug}`
  }
})

// 加载已有表数据（编辑模式）
async function loadExistingTable() {
  if (!props.tableId) {
    // 新建模式：从中转翻译模板派生默认字段
    form.displayName = '新数据表'
    form.fields = [
      { name: 'id', type: 'number', source: 'system', enabled: true, nullable: false, isPrimaryKey: true, description: '自增主键' },
      { name: 'session_id', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '会话 ID' },
      { name: 'user_query', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '用户提问内容' },
      { name: 'ai_reply', type: 'string', source: 'response', enabled: false, nullable: true, isPrimaryKey: false, description: 'AI 回复内容' },
      { name: 'tokens_used', type: 'number', source: 'response', enabled: false, nullable: true, isPrimaryKey: false, description: '消耗 token 数' },
      { name: 'created_at', type: 'timestamp', source: 'system', enabled: true, nullable: false, isPrimaryKey: false, description: '记录创建时间' }
    ]
    return
  }
  // 编辑模式：从后端拉取表元数据
  try {
    const allTables = await listBusinessTables(props.projectId)
    const existing = allTables.find(t => t.id === props.tableId)
    if (!existing) return
    form.displayName = existing.display_name
    form.tableName = existing.table_name
    form.storageType = existing.storage_type
    form.ttlSeconds = existing.ttl_seconds || 1800
    form.source = existing.source
    form.fields = existing.fields.map(f => ({
      name: f.name,
      type: f.type,
      source: f.source,
      enabled: f.enabled,
      nullable: f.nullable,
      isPrimaryKey: f.is_primary_key,
      description: f.description,
    }))
  } catch (e) {
    console.error('加载表元数据失败', e)
  }
}

onMounted(loadExistingTable)

const storageTypes = [
  { value: 'persistent' as const, label: '长期存储', description: '永久保留', icon: Database, iconClass: 'text-blue-600' },
  { value: 'cache' as const, label: '临时缓存', description: 'TTL 过期', icon: Clock, iconClass: 'text-amber-600' }
]

const ttlPresets = [
  { value: 300, label: '5min' },
  { value: 1800, label: '30min' },
  { value: 3600, label: '1h' },
  { value: 86400, label: '1天' }
]

const enabledFieldCount = computed(() => form.fields.filter(f => f.enabled).length)
const hasFileField = computed(() => form.fields.some(f => f.type === 'file' && f.enabled))
const canSave = computed(() => form.displayName && form.fields.some(f => f.enabled))

/**
 * 字段类型切换处理：file 类型有特殊约束
 * - file 不能作为主键（强制 false 并禁用 checkbox）
 * - file 必须允许 NULL（物理列允许为空，避免上传前/删除后无值）
 * - file 默认 nullable=true（用户可保留），这里只做兜底
 */
const onTypeChange = (f: FormField) => {
  if (f.type === 'file') {
    f.isPrimaryKey = false
    f.nullable = true
  }
}

const addField = () => {
  form.fields.push({
    name: `field_${form.fields.length + 1}`,
    type: 'string',
    source: 'request',
    enabled: true,
    nullable: true,
    isPrimaryKey: false,
    description: ''
  })
}

// form 内部字段（camelCase）→ 后端 BusinessField（snake_case）
function toApiFields(fields: FormField[]): BusinessField[] {
  return fields.map(f => ({
    name: f.name,
    type: f.type,
    source: f.source,
    enabled: f.enabled,
    nullable: f.nullable,
    is_primary_key: f.isPrimaryKey,
    description: f.description,
  }))
}

const save = async () => {
  if (!canSave.value) return
  saving.value = true
  errorMsg.value = ''
  try {
    if (isEdit.value && props.tableId) {
      await updateBusinessTable(props.tableId, {
        display_name: form.displayName,
        storage_type: form.storageType,
        ttl_seconds: form.storageType === 'cache' ? form.ttlSeconds : null,
        source: form.source,
        fields: toApiFields(form.fields),
      })
    } else {
      await createBusinessTable(props.projectId, {
        display_name: form.displayName,
        storage_type: form.storageType,
        ttl_seconds: form.storageType === 'cache' ? form.ttlSeconds : null,
        source: form.source,
        fields: toApiFields(form.fields),
      })
    }
    emit('saved')
  } catch (e: any) {
    errorMsg.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const formatTTL = (s: number) => {
  if (s >= 3600) return (s / 3600) + ' 小时'
  if (s >= 60) return (s / 60) + ' 分钟'
  return s + ' 秒'
}

const sourceLabel = (s: string) => ({ request: '请求', response: '返回', system: '系统' }[s] || s)
const sourceBadgeClass = (s: string) => ({
  request: 'bg-blue-100 text-blue-700',
  response: 'bg-green-100 text-green-700',
  system: 'bg-gray-100 text-gray-600'
}[s] || 'bg-gray-100 text-gray-600')
</script>
