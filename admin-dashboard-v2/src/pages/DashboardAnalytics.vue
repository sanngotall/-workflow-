<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">数据分析</h1>
        <p class="text-gray-500 mt-1">深入分析网关运行数据和趋势</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>最近 7 天</option>
          <option>最近 30 天</option>
          <option>最近 90 天</option>
          <option>自定义</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">总请求数</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">1,234,567</p>
        <p class="text-sm text-green-500 mt-2 flex items-center gap-1">
          <TrendingUp class="w-4 h-4" />
          +12.5% 较上周
        </p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">成功请求</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">1,232,100</p>
        <p class="text-sm text-green-500 mt-2 flex items-center gap-1">
          <TrendingUp class="w-4 h-4" />
          99.8% 成功率
        </p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">失败请求</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">2,467</p>
        <p class="text-sm text-red-500 mt-2 flex items-center gap-1">
          <TrendingDown class="w-4 h-4" />
          -5.2% 较上周
        </p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">平均响应时间</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">23ms</p>
        <p class="text-sm text-green-500 mt-2 flex items-center gap-1">
          <TrendingDown class="w-4 h-4" />
          -8.3% 较上周
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">请求趋势</h2>
        <div class="h-64 flex items-end justify-between gap-1">
          <div
            v-for="(bar, index) in trendData"
            :key="index"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <div class="w-full relative">
              <div
                class="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                :style="{ height: bar.requests / 100 + '%', minHeight: '10px' }"
              ></div>
              <div
                class="w-full absolute bottom-0 bg-green-400 rounded-t-lg opacity-60"
                :style="{ height: bar.success / 100 + '%', minHeight: '8px' }"
              ></div>
            </div>
            <span class="text-xs text-gray-500">{{ index + 1 }}</span>
          </div>
        </div>
        <div class="flex items-center justify-center gap-6 mt-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-blue-500 rounded"></div>
            <span class="text-sm text-gray-600">总请求</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-400 rounded"></div>
            <span class="text-sm text-gray-600">成功请求</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">响应时间分布</h2>
        <div class="space-y-4">
          <div v-for="bucket in responseTimeBuckets" :key="bucket.label" class="flex items-center gap-4">
            <span class="text-sm text-gray-600 w-24">{{ bucket.label }}</span>
            <div class="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-end pr-2"
                :style="{ width: bucket.percent + '%' }"
              >
                <span v-if="bucket.percent > 10" class="text-xs text-white font-medium">{{ bucket.count }}</span>
              </div>
            </div>
            <span class="text-sm text-gray-500 w-16 text-right">{{ bucket.percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">热门路由 TOP 10</h2>
        <div class="space-y-3">
          <div
            v-for="(route, index) in topRoutes"
            :key="route.path"
            class="flex items-center gap-4"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              :class="index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ route.path }}</p>
              <div class="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full"
                  :style="{ width: route.percent + '%' }"
                ></div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-800">{{ formatCount(route.count) }}</p>
              <p class="text-xs text-gray-500">{{ route.percent }}%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">错误分布</h2>
        <div class="space-y-4">
          <div v-for="error in errorDistribution" :key="error.code" class="flex items-center gap-4">
            <div class="w-16">
              <span class="text-lg font-bold" :class="error.color">{{ error.code }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-700">{{ error.label }}</span>
                <span class="text-sm font-medium text-gray-800">{{ error.count }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :class="error.barColor" :style="{ width: error.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const trendData = ref([
  { requests: 85, success: 84 },
  { requests: 92, success: 91 },
  { requests: 78, success: 77 },
  { requests: 95, success: 94 },
  { requests: 88, success: 87 },
  { requests: 76, success: 75 },
  { requests: 90, success: 89 },
  { requests: 82, success: 81 },
  { requests: 96, success: 95 },
  { requests: 89, success: 88 },
  { requests: 73, success: 72 },
  { requests: 80, success: 79 }
])

const responseTimeBuckets = ref([
  { label: '0-10ms', count: 456789, percent: 37 },
  { label: '10-25ms', count: 567890, percent: 46 },
  { label: '25-50ms', count: 123456, percent: 10 },
  { label: '50-100ms', count: 67890, percent: 5 },
  { label: '100ms+', count: 18532, percent: 2 }
])

const topRoutes = ref([
  { path: '/api/v1/users', count: 234567, percent: 19 },
  { path: '/api/v1/orders', count: 198765, percent: 16 },
  { path: '/api/v1/products', count: 156789, percent: 13 },
  { path: '/api/v1/auth/login', count: 123456, percent: 10 },
  { path: '/api/v1/notifications', count: 98765, percent: 8 },
  { path: '/api/v1/reports', count: 76543, percent: 6 },
  { path: '/api/v1/config', count: 54321, percent: 4 },
  { path: '/api/v1/health', count: 45678, percent: 4 },
  { path: '/api/v1/metrics', count: 34567, percent: 3 },
  { path: '/api/v1/payments', count: 23456, percent: 2 }
])

const errorDistribution = ref([
  { code: '400', label: '错误请求', count: 567, percent: 23, color: 'text-orange-500', barColor: 'bg-orange-500' },
  { code: '401', label: '未授权', count: 345, percent: 14, color: 'text-yellow-500', barColor: 'bg-yellow-500' },
  { code: '403', label: '禁止访问', count: 234, percent: 9, color: 'text-amber-500', barColor: 'bg-amber-500' },
  { code: '404', label: '未找到', count: 876, percent: 35, color: 'text-blue-500', barColor: 'bg-blue-500' },
  { code: '500', label: '服务器错误', count: 345, percent: 14, color: 'text-red-500', barColor: 'bg-red-500' },
  { code: '502', label: '网关错误', count: 100, percent: 5, color: 'text-rose-500', barColor: 'bg-rose-500' }
])

const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}
</script>
