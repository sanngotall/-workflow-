<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">实时监控</h1>
        <p class="text-gray-500 mt-1">实时查看网关流量和性能指标</p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="selectedProjectId"
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">选择项目</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <button
          @click="togglePolling"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="polling ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'"
        >
          {{ polling ? '停止' : '开始' }}轮询
        </button>
      </div>
    </div>

    <!-- 未选择项目提示 -->
    <div v-if="!selectedProjectId" class="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
      <p class="text-amber-700">请先在右上角选择一个项目以查看实时数据</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 实时请求流 -->
        <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">实时请求流</h2>
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="polling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
              ></div>
              <span class="text-sm text-gray-500">{{ polling ? '实时' : '已停止' }}</span>
              <span class="text-xs text-gray-400 ml-2">每 3s 刷新</span>
            </div>
          </div>
          <div class="h-96 overflow-y-auto space-y-2">
            <div v-if="liveRequests.length === 0" class="text-gray-400 text-sm py-8 text-center">
              暂无请求记录
            </div>
            <div
              v-for="req in liveRequests"
              :key="req.id"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm"
            >
              <span class="px-2 py-1 rounded font-medium text-xs" :class="getMethodClass(req.method)">{{ req.method }}</span>
              <span class="text-gray-700 flex-1 truncate" :title="req.path">{{ req.path }}</span>
              <span class="text-xs" :class="getStatusClass(req.http_status)">{{ req.http_status }}</span>
              <span class="text-gray-500 text-xs">{{ req.latency_ms }}ms</span>
              <span class="text-gray-400 text-xs w-24 text-right">{{ formatRelativeTime(req.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- 性能指标（从 stats 拉取） -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800 mb-6">性能指标（近 24h）</h2>
          <div v-if="!stats" class="text-gray-400 text-sm py-8 text-center">暂无数据</div>
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">总请求数</p>
                <p class="text-xs text-gray-500">近 24 小时</p>
              </div>
              <span class="text-2xl font-bold text-gray-800">{{ stats.total }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">平均响应时间</p>
                <p class="text-xs text-gray-500">毫秒</p>
              </div>
              <span class="text-2xl font-bold text-blue-600">{{ stats.avg_latency_ms }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">P95 响应时间</p>
                <p class="text-xs text-gray-500">毫秒</p>
              </div>
              <span class="text-2xl font-bold text-amber-600">{{ stats.p95_latency_ms }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">错误请求数</p>
                <p class="text-xs text-gray-500">http_status ≥ 400</p>
              </div>
              <span class="text-2xl font-bold text-red-600">{{ stats.error_count }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">成功率</p>
                <p class="text-xs text-gray-500">%</p>
              </div>
              <span class="text-2xl font-bold text-green-600">{{ successRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { listLogs, getLogStats, type RequestLog, type LogStats } from '@/api/request-logs'

const appStore = useAppStore()
const projects = computed(() => appStore.projects)

const selectedProjectId = ref<string>('')
const liveRequests = ref<RequestLog[]>([])
const stats = ref<LogStats | null>(null)
const polling = ref(false)
let interval: ReturnType<typeof setInterval> | null = null
let statsInterval: ReturnType<typeof setInterval> | null = null

const successRate = computed(() => {
  if (!stats.value || stats.value.total === 0) return '0'
  return ((stats.value.total - stats.value.error_count) / stats.value.total * 100).toFixed(2)
})

function getMethodClass(method: string): string {
  const map: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-600',
    POST: 'bg-green-100 text-green-600',
    PUT: 'bg-yellow-100 text-yellow-600',
    DELETE: 'bg-red-100 text-red-600',
  }
  return map[method] || 'bg-gray-100 text-gray-600'
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600'
  if (status >= 300 && status < 400) return 'text-blue-600'
  if (status >= 400 && status < 500) return 'text-orange-600'
  return 'text-red-600'
}

function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now()
    const t = new Date(iso).getTime()
    const diff = Math.floor((now - t) / 1000)
    if (diff < 60) return `${diff}秒前`
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return new Date(iso).toLocaleString('zh-CN')
  } catch {
    return iso
  }
}

async function pollOnce() {
  if (!selectedProjectId.value) return
  try {
    // 拉最新 50 条日志
    const result = await listLogs(selectedProjectId.value, { limit: 50, offset: 0 })
    liveRequests.value = result.rows
  } catch (err) {
    // 静默失败，不打断轮询
  }
}

async function loadStats() {
  if (!selectedProjectId.value) return
  try {
    stats.value = await getLogStats(selectedProjectId.value, 24)
  } catch {
    stats.value = null
  }
}

function startPolling() {
  if (interval) return
  polling.value = true
  pollOnce()
  loadStats()
  // 日志每 3s 轮询一次
  interval = setInterval(pollOnce, 3000)
  // 统计每 30s 刷新一次（避免高频聚合查询压力）
  statsInterval = setInterval(loadStats, 30000)
}

function stopPolling() {
  polling.value = false
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  if (statsInterval) {
    clearInterval(statsInterval)
    statsInterval = null
  }
}

function togglePolling() {
  if (polling.value) {
    stopPolling()
  } else {
    startPolling()
  }
}

onMounted(async () => {
  if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id
  }
  if (selectedProjectId.value) {
    startPolling()
  }
})

watch(selectedProjectId, () => {
  liveRequests.value = []
  stats.value = null
  if (selectedProjectId.value) {
    startPolling()
  } else {
    stopPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>
