<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">访问日志</h1>
        <p class="text-gray-500 mt-1">查看所有请求的详细日志记录</p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="selectedProjectId"
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">选择项目</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select
          v-model="filterMethod"
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部方法</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select
          v-model="filterStatus"
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部状态</option>
          <option value="2">2xx 成功</option>
          <option value="4">4xx 客户端错误</option>
          <option value="5">5xx 服务端错误</option>
        </select>
        <button
          @click="loadLogs"
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw class="w-4 h-4 inline mr-1" />
          刷新
        </button>
      </div>
    </div>

    <!-- 未选择项目提示 -->
    <div v-if="!selectedProjectId" class="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
      <p class="text-amber-700">请先在右上角选择一个项目以查看日志</p>
    </div>

    <template v-else>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">共 {{ total }} 条记录</span>
            <span v-if="loading" class="text-xs text-gray-400">加载中...</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">时间</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">方法</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">路径</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">环境</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">错误码</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">耗时</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="logs.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-400">暂无日志记录</td>
              </tr>
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatTime(log.created_at) }}</td>
                <td class="px-6 py-4 text-sm font-medium" :class="getMethodClass(log.method)">{{ log.method }}</td>
                <td class="px-6 py-4 text-sm text-gray-800 max-w-xs truncate" :title="log.path">{{ log.path }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">{{ log.environment }}</span>
                </td>
                <td class="px-6 py-4 text-sm" :class="getStatusClass(log.http_status)">{{ log.http_status }}</td>
                <td class="px-6 py-4 text-sm">
                  <span v-if="log.error_code" class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600 font-mono">{{ log.error_code }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ log.latency_ms }}ms</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ log.client_ip || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">
            显示 {{ offset + 1 }}-{{ offset + logs.length }} 条（共 {{ total }} 条）
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentPage === 1 || loading"
            >
              上一页
            </button>
            <span class="text-sm text-gray-600">第 {{ currentPage }} 页</span>
            <button
              @click="nextPage"
              class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="offset + pageSize >= total || loading"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { listLogs, type RequestLog } from '@/api/request-logs'

const appStore = useAppStore()
const projects = computed(() => appStore.projects)

const selectedProjectId = ref<string>('')
const filterMethod = ref<string>('')
const filterStatus = ref<string>('')

const logs = ref<RequestLog[]>([])
const total = ref(0)
const offset = ref(0)
const pageSize = ref(50)
const loading = ref(false)

const currentPage = computed(() => Math.floor(offset.value / pageSize.value) + 1)

function getMethodClass(method: string): string {
  const map: Record<string, string> = {
    GET: 'text-blue-600',
    POST: 'text-green-600',
    PUT: 'text-yellow-600',
    DELETE: 'text-red-600',
  }
  return map[method] || 'text-gray-600'
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600'
  if (status >= 300 && status < 400) return 'text-blue-600'
  if (status >= 400 && status < 500) return 'text-orange-600'
  return 'text-red-600'
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

async function loadLogs() {
  if (!selectedProjectId.value) return
  loading.value = true
  try {
    const result = await listLogs(selectedProjectId.value, {
      method: filterMethod.value || undefined,
      limit: pageSize.value,
      offset: offset.value,
    })
    // 客户端按状态码段筛选（后端只支持精确状态码）
    let rows = result.rows
    if (filterStatus.value) {
      const prefix = Number(filterStatus.value)
      rows = rows.filter((r) => Math.floor(r.http_status / 100) === prefix)
    }
    logs.value = rows
    total.value = result.total
  } catch (err: any) {
    console.error('加载日志失败:', err)
    logs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (offset.value >= pageSize.value) {
    offset.value -= pageSize.value
    loadLogs()
  }
}

function nextPage() {
  if (offset.value + pageSize.value < total.value) {
    offset.value += pageSize.value
    loadLogs()
  }
}

onMounted(async () => {
  if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id
  }
  await loadLogs()
})

watch(selectedProjectId, () => {
  offset.value = 0
  loadLogs()
})

watch([filterMethod, filterStatus], () => {
  offset.value = 0
  loadLogs()
})
</script>
