<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">实时监控</h1>
      <p class="text-gray-500 mt-1">实时查看网关流量和性能指标</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-800">实时请求流</h2>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-gray-500">实时</span>
          </div>
        </div>
        <div class="h-80 overflow-y-auto space-y-2">
          <div
            v-for="req in liveRequests"
            :key="req.id"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm"
          >
            <span class="px-2 py-1 rounded font-medium" :class="req.methodColor">{{ req.method }}</span>
            <span class="text-gray-700 flex-1 truncate">{{ req.path }}</span>
            <span class="text-gray-500">{{ req.status }}</span>
            <span class="text-gray-400">{{ req.time }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">性能指标</h2>
        <div class="space-y-4">
          <div v-for="metric in performanceMetrics" :key="metric.label" class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700">{{ metric.label }}</p>
              <p class="text-xs text-gray-500">{{ metric.value }}</p>
            </div>
            <div class="w-16 h-16 relative">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="24" stroke="#f1f5f9" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="24" :stroke="metric.color" stroke-width="6" fill="none" stroke-linecap="round" :stroke-dasharray="150.8" :stroke-dashoffset="150.8 - (150.8 * metric.percent) / 100" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold" :class="metric.color">{{ metric.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface LiveRequest {
  id: number
  method: string
  path: string
  status: number
  time: string
  methodColor: string
}

const liveRequests = ref<LiveRequest[]>([])

const performanceMetrics = [
  { label: 'CPU 使用率', value: '23%', percent: 23, color: '#3b82f6' },
  { label: '内存使用', value: '45%', percent: 45, color: '#10b981' },
  { label: '网络 IO', value: '67%', percent: 67, color: '#f59e0b' }
]

const methods = ['GET', 'POST', 'PUT', 'DELETE']
const paths = ['/api/v1/orders', '/api/v1/users', '/api/v1/products', '/api/v1/payments', '/api/v1/notifications']
const statuses = [200, 201, 400, 404, 500]

let counter = 0
let interval: ReturnType<typeof setInterval>

const generateRequest = (): LiveRequest => {
  const method = methods[Math.floor(Math.random() * methods.length)]
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-600',
    POST: 'bg-green-100 text-green-600',
    PUT: 'bg-yellow-100 text-yellow-600',
    DELETE: 'bg-red-100 text-red-600'
  }
  
  return {
    id: counter++,
    method,
    path: paths[Math.floor(Math.random() * paths.length)] + '/' + Math.floor(Math.random() * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    time: new Date().toLocaleTimeString(),
    methodColor: methodColors[method]
  }
}

onMounted(() => {
  for (let i = 0; i < 8; i++) {
    liveRequests.value.push(generateRequest())
  }
  
  interval = setInterval(() => {
    liveRequests.value.unshift(generateRequest())
    if (liveRequests.value.length > 20) {
      liveRequests.value.pop()
    }
  }, 1500)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
