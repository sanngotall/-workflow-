<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">项目数据库</h1>
        <p class="text-gray-500 mt-1">选择项目，管理其业务数据表（表隔离：每项目一套独立表）</p>
      </div>
      <button
        @click="loadAll"
        :disabled="loading"
        class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-60"
      >
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>

    <!-- 共享库信息提示 -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
      <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div class="text-sm">
        <p class="font-medium text-gray-800">共享 PostgreSQL 实例 · 表隔离模式</p>
        <p class="text-gray-600 mt-1">
          所有项目共享同一个数据库实例，每个项目在库内拥有独立的一套表（前缀如 <code class="px-1 bg-blue-100 rounded text-blue-700">proj001_chat_logs</code>）。
          建表时按"项目前缀+表名"自动命名，无需 project_id 区分数据。
        </p>
      </div>
    </div>

    <!-- 项目卡片墙 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(proj, idx) in projectsWithTables"
        :key="proj.id"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        @click="goProject(proj.id)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
              :class="projectColor(idx)"
            >
              {{ proj.name.charAt(0) }}
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800">{{ proj.name }}</h3>
              <p class="text-xs text-gray-500">{{ proj.id }}</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">
            运行中
          </span>
        </div>

        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ proj.description || '暂无描述' }}</p>

        <!-- 该项目的表统计 -->
        <div class="grid grid-cols-3 gap-3 py-3 border-t border-gray-100 text-center">
          <div>
            <p class="text-lg font-bold text-gray-800">{{ tablesByProject[proj.id]?.length || 0 }}</p>
            <p class="text-xs text-gray-500">数据表</p>
          </div>
          <div>
            <p class="text-lg font-bold text-gray-800">{{ persistentCount(proj.id) }}</p>
            <p class="text-xs text-gray-500">长期存储</p>
          </div>
          <div>
            <p class="text-lg font-bold text-gray-800">{{ cacheCount(proj.id) }}</p>
            <p class="text-xs text-gray-500">临时缓存</p>
          </div>
        </div>

        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div class="text-xs text-gray-400">
            共 {{ totalRows(proj.id).toLocaleString() }} 行数据 · {{ formatMB(totalSize(proj.id)) }}
          </div>
          <ChevronRight class="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <!-- 空态 -->
      <div
        v-if="!loading && projectsWithTables.length === 0"
        class="col-span-full bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center"
      >
        <Database class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 text-sm mb-1">还没有项目配置数据存储</p>
        <p class="text-gray-400 text-xs">在项目管理里打开项目详情，到"数据存储"Tab 配置即可</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Info, Database, ChevronRight } from 'lucide-vue-next'
import { listProjects, type Project as ApiProject } from '@/api/projects'
import { listBusinessTables, type BusinessTable } from '@/api/business-data'

const router = useRouter()
const loading = ref(false)
const projects = ref<ApiProject[]>([])
const tablesByProject = ref<Record<string, BusinessTable[]>>({})

// 仅展示有表的项目
const projectsWithTables = computed(() =>
  projects.value.filter(p => (tablesByProject.value[p.id]?.length || 0) > 0)
)

// 卡片颜色循环
const colorOptions = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-500 to-emerald-700',
  'bg-gradient-to-br from-purple-500 to-violet-700',
  'bg-gradient-to-br from-orange-500 to-red-700',
  'bg-gradient-to-br from-pink-500 to-rose-700',
  'bg-gradient-to-br from-cyan-500 to-blue-700',
]
function projectColor(idx: number) {
  return colorOptions[idx % colorOptions.length]
}

async function loadAll() {
  loading.value = true
  try {
    const projectList = await listProjects()
    projects.value = projectList
    // 并行拉取每个项目的表
    const results = await Promise.all(
      projectList.map(p =>
        listBusinessTables(p.id)
          .then(tables => ({ projectId: p.id, tables }))
          .catch(() => ({ projectId: p.id, tables: [] as BusinessTable[] }))
      )
    )
    const map: Record<string, BusinessTable[]> = {}
    results.forEach(r => { map[r.projectId] = r.tables })
    tablesByProject.value = map
  } catch (e) {
    console.error('加载数据库项目列表失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

const getTables = (projectId: string) => tablesByProject.value[projectId] || []
const persistentCount = (projectId: string) => getTables(projectId).filter((t: BusinessTable) => t.storage_type === 'persistent').length
const cacheCount = (projectId: string) => getTables(projectId).filter((t: BusinessTable) => t.storage_type === 'cache').length
const totalRows = (projectId: string) => getTables(projectId).reduce((s: number, t: BusinessTable) => s + t.row_count, 0)
const totalSize = (projectId: string) => getTables(projectId).reduce((s: number, t: BusinessTable) => s + t.size_mb, 0)

const formatMB = (mb: number) => {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
  return mb.toFixed(1) + ' MB'
}

const goProject = (projectId: string) => {
  router.push(`/database/project/${projectId}`)
}
</script>
