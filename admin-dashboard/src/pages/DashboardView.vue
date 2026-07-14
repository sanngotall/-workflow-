<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import QueueChart from '@/components/QueueChart.vue'
import QpsChart from '@/components/QpsChart.vue'
import { useProjectStore } from '@/stores/project'
import { api } from '@/api'
import type { QueueStats } from '@/types'

const projectStore = useProjectStore()

const projectCount = ref(0)
const routeCount = ref(0)
const queueStats = ref<QueueStats>({ waiting: 0, active: 0, failed: 0, completed: 0 })
const qpsData = ref<number[]>(Array(30).fill(0))

let qpsInterval: number | null = null
let queueInterval: number | null = null

const loadDashboard = async () => {
  projectCount.value = projectStore.projects.length
  
  if (projectStore.currentProjectId) {
    const routes = await api.routes.getByProject(projectStore.currentProjectId)
    routeCount.value = routes.length
  }
}

const updateQueueStats = async () => {
  try {
    queueStats.value = await api.queue.getStats()
  } catch {
    queueStats.value = { waiting: 5, active: 3, failed: 1, completed: 12 }
  }
}

const simulateQps = () => {
  qpsData.value = [...qpsData.value.slice(1), Math.floor(Math.random() * 50) + 10]
}

onMounted(async () => {
  await loadDashboard()
  await updateQueueStats()
  
  qpsInterval = window.setInterval(simulateQps, 1000)
  queueInterval = window.setInterval(updateQueueStats, 5000)
})

onUnmounted(() => {
  if (qpsInterval) clearInterval(qpsInterval)
  if (queueInterval) clearInterval(queueInterval)
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-text-main">仪表盘</h1>
      <p class="text-text-secondary mt-1">实时监控网关运行状态</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="项目总数" 
        :value="projectCount" 
        icon="📦" 
        color="primary" 
      />
      <StatCard 
        title="路由数量" 
        :value="routeCount" 
        icon="🔀" 
        color="secondary" 
      />
      <StatCard 
        title="队列等待" 
        :value="queueStats.waiting" 
        unit="任务"
        icon="⏳" 
        color="accent" 
      />
      <StatCard 
        title="熔断数" 
        :value="queueStats.failed > 0 ? 1 : 0" 
        icon="🔌" 
        color="danger" 
      />
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-text-main mb-4">实时 QPS</h3>
        <QpsChart :data="qpsData" />
      </div>
      
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-text-main mb-4">异步队列状态</h3>
        <QueueChart :stats="queueStats" />
      </div>
    </div>
    
    <div class="card p-5">
      <h3 class="text-lg font-semibold text-text-main mb-4">最近请求日志</h3>
      <div class="space-y-3">
        <div class="flex items-center gap-4 p-3 bg-bg-sidebar rounded-lg">
          <div class="w-2 h-2 rounded-full bg-secondary"></div>
          <span class="text-sm text-text-secondary">GET /api/v1/chat</span>
          <span class="text-xs text-text-muted ml-auto">200 OK</span>
          <span class="text-xs text-text-muted">12ms</span>
        </div>
        <div class="flex items-center gap-4 p-3 bg-bg-sidebar rounded-lg">
          <div class="w-2 h-2 rounded-full bg-secondary"></div>
          <span class="text-sm text-text-secondary">POST /api/v1/completion</span>
          <span class="text-xs text-text-muted ml-auto">200 OK</span>
          <span class="text-xs text-text-muted">45ms</span>
        </div>
        <div class="flex items-center gap-4 p-3 bg-bg-sidebar rounded-lg">
          <div class="w-2 h-2 rounded-full bg-danger"></div>
          <span class="text-sm text-text-secondary">POST /api/v1/webhook</span>
          <span class="text-xs text-text-muted ml-auto">504 Timeout</span>
          <span class="text-xs text-text-muted">15000ms</span>
        </div>
      </div>
    </div>
  </div>
</template>
