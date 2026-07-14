<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RefreshCw, Download, Filter, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { api } from '@/api'
import { useProjectStore } from '@/stores/project'
import type { RequestLog } from '@/types'

const projectStore = useProjectStore()

const logs = ref<RequestLog[]>([])
const isLoading = ref(true)
const refreshInterval = ref<number | null>(null)

const expandedLogs = ref<Set<number>>(new Set())

const toggleExpand = (id: number) => {
  if (expandedLogs.value.has(id)) {
    expandedLogs.value.delete(id)
  } else {
    expandedLogs.value.add(id)
  }
}

const loadLogs = async () => {
  if (!projectStore.currentProjectId) return
  
  isLoading.value = true
  try {
    logs.value = await api.logs.getByProject(projectStore.currentProjectId, 50)
  } catch {
    logs.value = []
  } finally {
    isLoading.value = false
  }
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

const getStatusClass = (status: number) => {
  if (status >= 200 && status < 300) return 'text-secondary'
  if (status >= 400 && status < 500) return 'text-warning'
  if (status >= 500) return 'text-danger'
  return 'text-text-muted'
}

const getLatencyClass = (latency: number) => {
  if (latency < 100) return 'text-secondary'
  if (latency < 500) return 'text-accent'
  return 'text-danger'
}

const filteredLogs = computed(() => logs.value)

onMounted(async () => {
  await loadLogs()
  refreshInterval.value = window.setInterval(loadLogs, 3000)
})

onUnmounted(() => {
  if (refreshInterval.value) clearInterval(refreshInterval.value)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text-main">监控控制台</h1>
        <p class="text-text-secondary mt-1">实时查看请求日志与性能指标</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary flex items-center gap-2">
          <Filter class="w-4 h-4" />
          筛选
        </button>
        <button class="btn btn-secondary flex items-center gap-2">
          <Download class="w-4 h-4" />
          导出
        </button>
        <button 
          class="btn btn-primary flex items-center gap-2"
          @click="loadLogs"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          刷新
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="card overflow-hidden">
      <div class="max-h-[600px] overflow-y-auto">
        <div class="divide-y divide-bg-hover">
          <div 
            v-for="log in filteredLogs" 
            :key="log.id"
            class="p-4 hover:bg-bg-hover/30 transition-colors"
          >
            <div class="flex items-center gap-4 cursor-pointer" @click="toggleExpand(log.id)">
              <div 
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-secondary': log.http_status >= 200 && log.http_status < 300,
                  'bg-warning': log.http_status >= 400 && log.http_status < 500,
                  'bg-danger': log.http_status >= 500
                }"
              ></div>
              
              <span 
                class="badge"
                :class="{
                  'bg-secondary/20 text-secondary': log.method === 'GET',
                  'bg-primary/20 text-primary': log.method === 'POST',
                  'bg-accent/20 text-accent': log.method === 'PUT',
                  'bg-danger/20 text-danger': log.method === 'DELETE',
                  'bg-text-muted/20 text-text-muted': log.method === 'ANY'
                }"
              >
                {{ log.method }}
              </span>
              
              <span class="flex-1 font-mono text-sm text-text-main truncate">{{ log.path }}</span>
              
              <span class="text-sm text-text-muted">{{ log.environment }}</span>
              
              <span class="text-sm font-mono" :class="getStatusClass(log.http_status)">
                {{ log.http_status }}
              </span>
              
              <span class="text-sm font-mono" :class="getLatencyClass(log.latency_ms)">
                {{ log.latency_ms }}ms
              </span>
              
              <span class="text-xs text-text-muted">{{ formatTime(log.created_at) }}</span>
              
              <ChevronDown 
                v-if="!expandedLogs.has(log.id)" 
                class="w-4 h-4 text-text-muted" 
              />
              <ChevronUp 
                v-else 
                class="w-4 h-4 text-text-muted" 
              />
            </div>
            
            <Transition name="expand">
              <div v-if="expandedLogs.has(log.id)" class="mt-4 space-y-4 pl-7">
                <div v-if="log.request_body_raw" class="bg-bg-sidebar rounded-lg p-3">
                  <div class="text-xs text-text-muted mb-2">请求体</div>
                  <pre class="text-sm font-mono text-text-main overflow-x-auto">{{ log.request_body_raw }}</pre>
                </div>
                
                <div v-if="log.transformed_body_raw" class="bg-bg-sidebar rounded-lg p-3">
                  <div class="text-xs text-text-muted mb-2">转换后请求体</div>
                  <pre class="text-sm font-mono text-text-main overflow-x-auto">{{ log.transformed_body_raw }}</pre>
                </div>
                
                <div v-if="log.response_body_raw" class="bg-bg-sidebar rounded-lg p-3">
                  <div class="text-xs text-text-muted mb-2">响应体</div>
                  <pre class="text-sm font-mono text-text-main overflow-x-auto">{{ log.response_body_raw }}</pre>
                </div>
                
                <div class="flex items-center gap-6 text-sm">
                  <span class="text-text-muted">客户端 IP: <span class="text-text-main font-mono">{{ log.client_ip }}</span></span>
                  <span v-if="log.error_code" class="text-danger">错误码: {{ log.error_code }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
        
        <div v-if="filteredLogs.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw class="w-8 h-8 text-text-muted" />
          </div>
          <h3 class="text-lg font-semibold text-text-main mb-2">暂无日志</h3>
          <p class="text-text-secondary">网关启动后将在此显示请求日志</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
}
</style>
