<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">控制台概览</h1>
        <p class="text-gray-500 mt-1">实时监控网关运行状态与关键指标</p>
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
          @click="loadData"
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw class="w-4 h-4 inline mr-2" />
          刷新数据
        </button>
      </div>
    </div>

    <!-- 未选择项目提示 -->
    <div v-if="!selectedProjectId" class="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
      <p class="text-amber-700">请先在右上角选择一个项目以查看监控数据</p>
    </div>

    <template v-else>
      <!-- 加载中 -->
      <div v-if="loading" class="bg-white rounded-xl p-12 text-center">
        <RefreshCw class="w-8 h-8 mx-auto animate-spin text-gray-400" />
        <p class="text-gray-500 mt-3">加载中...</p>
      </div>

      <template v-else>
        <!-- 顶部统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="stat in statsCards"
            :key="stat.label"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ stat.label }}</p>
                <p class="text-3xl font-bold text-gray-800 mt-2">{{ stat.value }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ stat.sub }}</p>
              </div>
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="stat.bgColor"
              >
                <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
              </div>
            </div>
          </div>
        </div>

        <!-- 状态码分布 + 错误码 Top5 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-800 mb-6">状态码分布（近 24h）</h2>
            <div v-if="Object.keys(stats?.status_distribution || {}).length === 0" class="text-gray-400 text-sm py-8 text-center">
              暂无数据
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(count, status) in stats?.status_distribution"
                :key="status"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full" :class="getStatusColor(String(status))"></div>
                  <span class="text-sm text-gray-700">{{ status }}</span>
                  <span class="text-xs text-gray-400">{{ getStatusLabel(String(status)) }}</span>
                </div>
                <div class="flex items-center gap-3 flex-1 ml-4">
                  <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="getStatusBarColor(String(status))"
                      :style="{ width: getPercent(Number(count), stats?.total || 1) + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-800 w-12">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-800 mb-6">错误码 Top5（近 24h）</h2>
            <div v-if="!stats?.top_errors || stats.top_errors.length === 0" class="text-gray-400 text-sm py-8 text-center">
              暂无错误
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(err, idx) in stats.top_errors"
                :key="err.error_code"
                class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{{ idx + 1 }}</span>
                  <span class="text-sm font-mono font-medium text-red-700">{{ err.error_code }}</span>
                </div>
                <span class="text-sm font-medium text-gray-800">{{ err.count }} 次</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统健康状态 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800 mb-6">系统健康状态</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="health in healthStatus"
              :key="health.label"
              class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="health.iconBg">
                <component :is="health.icon" class="w-5 h-5" :class="health.iconColor" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ health.label }}</p>
                <p class="text-xs text-gray-500">{{ health.description }}</p>
              </div>
              <div class="ml-auto flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-sm font-medium text-green-600">正常</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  RefreshCw,
  Zap,
  Globe,
  Shield,
  Clock,
  Server,
  Database,
  Wifi,
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { getLogStats, type LogStats } from '@/api/request-logs'

const appStore = useAppStore()
const projects = computed(() => appStore.projects)

const selectedProjectId = ref<string>('')
const loading = ref(false)
const stats = ref<LogStats | null>(null)

const statsCards = computed(() => {
  if (!stats.value) return []
  const s = stats.value
  const successCount = s.total - s.error_count
  const successRate = s.total > 0 ? ((successCount / s.total) * 100).toFixed(2) : '0'
  return [
    {
      label: '总请求数',
      value: s.total.toLocaleString(),
      sub: '近 24 小时',
      icon: Zap,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      label: '错误请求数',
      value: s.error_count.toLocaleString(),
      sub: `占比 ${s.total > 0 ? ((s.error_count / s.total) * 100).toFixed(2) : 0}%`,
      icon: Globe,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: '平均响应时间',
      value: `${s.avg_latency_ms}ms`,
      sub: `P95: ${s.p95_latency_ms}ms`,
      icon: Clock,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: '成功率',
      value: `${successRate}%`,
      sub: `${successCount.toLocaleString()} 次成功`,
      icon: Shield,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ]
})

const healthStatus = [
  { label: '网关服务', description: 'Node.js + Fastify', icon: Server, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { label: 'Redis 缓存', description: '路由匹配 + 限流', icon: Database, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  { label: 'PostgreSQL', description: '配置持久化', icon: Database, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { label: '网络连接', description: 'Nginx 反向代理', icon: Wifi, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
]

function getStatusColor(status: string): string {
  const s = Number(status)
  if (s >= 200 && s < 300) return 'bg-green-500'
  if (s >= 300 && s < 400) return 'bg-blue-500'
  if (s >= 400 && s < 500) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getStatusBarColor(status: string): string {
  const s = Number(status)
  if (s >= 200 && s < 300) return 'bg-green-500'
  if (s >= 300 && s < 400) return 'bg-blue-500'
  if (s >= 400 && s < 500) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getStatusLabel(status: string): string {
  const s = Number(status)
  if (s >= 200 && s < 300) return '成功'
  if (s >= 300 && s < 400) return '重定向'
  if (s >= 400 && s < 500) return '客户端错误'
  if (s >= 500) return '服务端错误'
  return ''
}

function getPercent(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

async function loadData() {
  if (!selectedProjectId.value) return
  loading.value = true
  try {
    stats.value = await getLogStats(selectedProjectId.value, 24)
  } catch (err: any) {
    console.error('加载统计数据失败:', err)
    stats.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 默认选第一个项目
  if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id
  }
  await loadData()
})

watch(selectedProjectId, () => {
  loadData()
})
</script>
