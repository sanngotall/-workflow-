<template>
  <div class="space-y-4">
    <!-- 头部操作 -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600">
          本项目的业务数据表 · 表前缀 <code class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{{ tablePrefix }}</code>
        </p>
      </div>
      <button
        @click="goDatabaseModule"
        class="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
      >
        <Database class="w-3.5 h-3.5" />
        进入数据库模块
      </button>
    </div>

    <!-- 表卡片墙 -->
    <div v-if="tables.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="t in tables"
        :key="t.id"
        class="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="goTable(t.id)"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="t.storage_type === 'cache' ? 'bg-amber-100' : 'bg-blue-100'"
            >
              <TableIcon
                class="w-4 h-4"
                :class="t.storage_type === 'cache' ? 'text-amber-600' : 'text-blue-600'"
              />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ t.display_name }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ t.table_name }}</p>
            </div>
          </div>
          <span
            class="px-2 py-0.5 text-[10px] font-medium rounded"
            :class="t.storage_type === 'cache' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'"
          >
            {{ t.storage_type === 'cache' ? `缓存 ${formatTTL(t.ttl_seconds)}` : '长期' }}
          </span>
        </div>

        <div class="space-y-1 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-gray-500">字段</span>
            <span class="text-gray-700">{{ t.fields.filter(f => f.enabled).length }} / {{ t.fields.length }} 已启用</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">行数</span>
            <span class="text-gray-700">{{ t.row_count.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">大小</span>
            <span class="text-gray-700">{{ formatMB(t.size_mb) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="bg-white border border-gray-100 rounded-lg p-8 text-center text-gray-400 text-sm">
      加载中...
    </div>

    <!-- 空态 -->
    <div
      v-else
      class="bg-white border border-dashed border-gray-200 rounded-lg p-8 text-center"
    >
      <Database class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500 mb-3">该项目还没有配置数据表</p>
      <button
        @click="goDatabaseModule"
        class="text-xs text-primary-600 hover:text-primary-700"
      >进入数据库模块配置 →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Database, Table as TableIcon } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { listBusinessTables, type BusinessTable } from '@/api/business-data'

const props = defineProps<{ projectId: string }>()
const appStore = useAppStore()
const router = useRouter()

const tables = ref<BusinessTable[]>([])
const loading = ref(true)
const tablePrefix = computed(() => props.projectId.replace('_', '').toLowerCase())

async function loadTables() {
  loading.value = true
  try {
    tables.value = await listBusinessTables(props.projectId)
  } catch (e) {
    console.error('加载项目数据表失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadTables)

const formatMB = (mb: number) => {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
  return mb.toFixed(1) + ' MB'
}

const formatTTL = (s?: number | null) => {
  if (!s) return ''
  if (s >= 3600) return (s / 3600) + 'h'
  if (s >= 60) return (s / 60) + 'min'
  return s + 's'
}

const goDatabaseModule = () => {
  appStore.setTopNav('database')
  router.push(`/database/project/${props.projectId}`)
}

const goTable = (tableId: string) => {
  appStore.setTopNav('database')
  router.push(`/database/project/${props.projectId}/table/${tableId}`)
}
</script>
