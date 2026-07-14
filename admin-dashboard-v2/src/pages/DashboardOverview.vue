<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">控制台概览</h1>
        <p class="text-gray-500 mt-1">实时监控网关运行状态与关键指标</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw class="w-4 h-4 inline mr-2" />
          刷新数据
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ stat.value }}</p>
            <div class="flex items-center mt-2" :class="stat.trend >= 0 ? 'text-green-500' : 'text-red-500'">
              <TrendingUp v-if="stat.trend >= 0" class="w-4 h-4" />
              <TrendingDown v-else class="w-4 h-4" />
              <span class="text-sm ml-1">{{ Math.abs(stat.trend) }}%</span>
              <span class="text-xs text-gray-400 ml-1">较昨日</span>
            </div>
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-800">请求流量趋势</h2>
          <div class="flex items-center gap-2">
            <button
              v-for="period in periods"
              :key="period.value"
              @click="activePeriod = period.value"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              :class="activePeriod === period.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="h-64 flex items-end justify-between gap-2">
          <div
            v-for="(bar, index) in chartData"
            :key="index"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <div class="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-400" :style="{ height: bar + '%' }"></div>
            <span class="text-xs text-gray-500">{{ index + 1 }}时</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">路由状态分布</h2>
        <div class="space-y-4">
          <div v-for="item in routeStatus" :key="item.label" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" :class="item.color"></div>
              <span class="text-sm text-gray-700">{{ item.label }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :class="item.barColor" :style="{ width: item.percent + '%' }"></div>
              </div>
              <span class="text-sm font-medium text-gray-800">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">最近访问日志</h2>
        <div class="space-y-4">
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="log.statusColor">
                <component :is="log.methodIcon" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ log.path }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ log.time }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{{ log.responseTime }}ms</span>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="log.statusBadge"
              >
                {{ log.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">系统健康状态</h2>
        <div class="space-y-4">
          <div
            v-for="health in healthStatus"
            :key="health.label"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="health.iconBg">
                <component :is="health.icon" class="w-5 h-5" :class="health.iconColor" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ health.label }}</p>
                <p class="text-xs text-gray-500">{{ health.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :class="health.statusDot"></div>
              <span class="text-sm font-medium" :class="health.statusText">{{ health.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Database,
  Wifi
} from 'lucide-vue-next'

const activePeriod = ref('24h')

const periods = [
  { label: '6小时', value: '6h' },
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' }
]

const stats = [
  { label: '今日请求数', value: '128,456', trend: 12.5, icon: Zap, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { label: '活跃路由', value: '89', trend: 5.2, icon: Globe, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  { label: '平均响应时间', value: '23ms', trend: -8.3, icon: Clock, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  { label: '成功率', value: '99.8%', trend: 0.1, icon: Shield, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
]

const chartData = [45, 62, 48, 75, 52, 88, 95, 72, 65, 82, 78, 90, 85, 70, 65, 80, 75, 88, 92, 85, 78, 65, 55, 48]

const routeStatus = [
  { label: '运行中', percent: 75, color: 'bg-green-500', barColor: 'bg-green-500' },
  { label: '待部署', percent: 15, color: 'bg-yellow-500', barColor: 'bg-yellow-500' },
  { label: '已停用', percent: 8, color: 'bg-gray-400', barColor: 'bg-gray-400' },
  { label: '异常', percent: 2, color: 'bg-red-500', barColor: 'bg-red-500' }
]

const recentLogs = [
  { id: 1, path: '/api/v1/orders', method: 'POST', methodIcon: ArrowUpRight, status: 200, statusColor: 'bg-green-500', statusBadge: 'bg-green-100 text-green-600', responseTime: 15, time: '2分钟前' },
  { id: 2, path: '/api/v1/users', method: 'GET', methodIcon: ArrowDownRight, status: 200, statusColor: 'bg-blue-500', statusBadge: 'bg-green-100 text-green-600', responseTime: 8, time: '5分钟前' },
  { id: 3, path: '/api/v1/products', method: 'GET', methodIcon: ArrowDownRight, status: 404, statusColor: 'bg-orange-500', statusBadge: 'bg-orange-100 text-orange-600', responseTime: 3, time: '8分钟前' },
  { id: 4, path: '/api/v1/payments', method: 'POST', methodIcon: ArrowUpRight, status: 500, statusColor: 'bg-red-500', statusBadge: 'bg-red-100 text-red-600', responseTime: 120, time: '12分钟前' },
  { id: 5, path: '/api/v1/notifications', method: 'POST', methodIcon: ArrowUpRight, status: 200, statusColor: 'bg-green-500', statusBadge: 'bg-green-100 text-green-600', responseTime: 22, time: '15分钟前' }
]

const healthStatus = [
  { label: '网关服务', description: 'Node.js Cluster', status: '正常', icon: Server, iconBg: 'bg-green-100', iconColor: 'text-green-600', statusDot: 'bg-green-500', statusText: 'text-green-600' },
  { label: 'Redis 缓存', description: 'Cluster Mode', status: '正常', icon: Database, iconBg: 'bg-red-100', iconColor: 'text-red-600', statusDot: 'bg-green-500', statusText: 'text-green-600' },
  { label: 'PostgreSQL', description: '主从复制', status: '正常', icon: Database, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', statusDot: 'bg-green-500', statusText: 'text-green-600' },
  { label: '网络连接', description: 'FRP Tunnel', status: '正常', icon: Wifi, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', statusDot: 'bg-green-500', statusText: 'text-green-600' }
]
</script>
