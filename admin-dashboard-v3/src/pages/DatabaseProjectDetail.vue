<template>
  <div v-if="project" class="space-y-6">
    <!-- 头部 -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <button @click="$router.push('/database')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700"
        >
          {{ project.name.charAt(0) }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ project.name }}</h1>
          <p class="text-sm text-gray-500">数据存储管理 · 表前缀 <code class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{{ tablePrefix }}</code></p>
        </div>
      </div>
      <button
        @click="openConfigModal()"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        配置新表
      </button>
    </div>

    <!-- 4 指标 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">数据表</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ tables.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">长期存储表</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ persistentCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">临时缓存表</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ cacheCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">总数据量</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ totalRows.toLocaleString() }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ formatMB(totalSize) }}</p>
      </div>
    </div>

    <!-- 表列表 -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">数据表</h2>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          v-for="t in tables"
          :key="t.id"
          class="flex items-center justify-between p-5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-11 h-11 rounded-lg flex items-center justify-center"
              :class="t.storage_type === 'cache' ? 'bg-amber-100' : 'bg-blue-100'"
            >
              <TableIcon
                class="w-5 h-5"
                :class="t.storage_type === 'cache' ? 'text-amber-600' : 'text-blue-600'"
              />
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <p class="text-base font-semibold text-gray-800">{{ t.display_name }}</p>
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="t.storage_type === 'cache' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ t.storage_type === 'cache' ? `缓存 · TTL ${formatTTL(t.ttl_seconds)}` : '长期存储' }}
                </span>
                <span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {{ sourceLabel(t.source) }}
                </span>
              </div>
              <p class="text-xs text-gray-500 font-mono">{{ t.table_name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ t.fields.filter(f => f.enabled).length }} / {{ t.fields.length }} 个字段已启用
              </p>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-800">{{ t.row_count.toLocaleString() }} 行</p>
              <p class="text-xs text-gray-400">{{ formatMB(t.size_mb) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="goTable(t.id)"
                class="px-3 py-1.5 text-xs text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                查看数据
              </button>
              <button
                @click="openConfigModal(t)"
                class="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                字段配置
              </button>
              <button
                @click="confirmRemove(t)"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!loading && tables.length === 0" class="p-12 text-center">
          <TableIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 text-sm mb-3">该项目还没有数据表</p>
          <button
            @click="openConfigModal()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            配置第一张表
          </button>
        </div>
      </div>
    </div>

    <!-- 字段配置 Modal -->
    <FieldConfigPanel
      v-if="showConfigModal"
      :project-id="projectId"
      :table-id="editingTableId"
      @close="showConfigModal = false"
      @saved="onTableSaved"
    />
  </div>

  <!-- 加载中 -->
  <div v-else-if="loading" class="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
    <p class="text-sm">加载中...</p>
  </div>

  <!-- 项目不存在 -->
  <div v-else class="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
    <p class="text-gray-500">未找到该项目</p>
    <button @click="$router.push('/database')" class="mt-3 text-sm text-primary-600 hover:text-primary-700">返回项目列表</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Table as TableIcon, Trash2 } from 'lucide-vue-next'
import FieldConfigPanel from '@/components/FieldConfigPanel.vue'
import { getProject, type Project as ApiProject } from '@/api/projects'
import { listBusinessTables, deleteBusinessTable, type BusinessTable } from '@/api/business-data'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.projectId as string)
const project = ref<ApiProject | null>(null)
const tables = ref<BusinessTable[]>([])
const loading = ref(true)

const tablePrefix = computed(() => projectId.value.replace('_', '').toLowerCase())

const persistentCount = computed(() => tables.value.filter(t => t.storage_type === 'persistent').length)
const cacheCount = computed(() => tables.value.filter(t => t.storage_type === 'cache').length)
const totalRows = computed(() => tables.value.reduce((s, t) => s + t.row_count, 0))
const totalSize = computed(() => tables.value.reduce((s, t) => s + t.size_mb, 0))

const showConfigModal = ref(false)
const editingTableId = ref<string | null>(null)

async function loadData() {
  loading.value = true
  try {
    const [projectData, tablesData] = await Promise.all([
      getProject(projectId.value),
      listBusinessTables(projectId.value),
    ])
    project.value = projectData
    tables.value = tablesData
  } catch (e) {
    console.error('加载项目数据存储失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const formatMB = (mb: number) => {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
  return mb.toFixed(1) + ' MB'
}

const formatTTL = (s?: number | null) => {
  if (!s) return '-'
  if (s >= 3600) return (s / 3600) + 'h'
  if (s >= 60) return (s / 60) + 'min'
  return s + 's'
}

const sourceLabel = (s: string) => ({
  request: '请求存储',
  response: '返回存储',
  mixed: '请求+返回'
}[s] || s)

const goTable = (tableId: string) => {
  router.push(`/database/project/${projectId.value}/table/${tableId}`)
}

const openConfigModal = (table?: BusinessTable) => {
  editingTableId.value = table?.id || null
  showConfigModal.value = true
}

// 表配置保存后重新加载列表
const onTableSaved = async () => {
  showConfigModal.value = false
  editingTableId.value = null
  try {
    tables.value = await listBusinessTables(projectId.value)
  } catch (e) {
    console.error('重新加载表列表失败', e)
  }
}

const confirmRemove = async (t: BusinessTable) => {
  if (!confirm(`确认删除表 "${t.display_name}"？所有数据将丢失。`)) return
  try {
    await deleteBusinessTable(t.id)
    tables.value = tables.value.filter(x => x.id !== t.id)
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}
</script>
