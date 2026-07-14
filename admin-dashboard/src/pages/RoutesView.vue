<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit3, Trash2, Play, Pause, Zap, Settings } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { useNotifications } from '@/utils/notification'
import BreakerBadge from '@/components/BreakerBadge.vue'
import type { Route, BreakerState } from '@/types'

const route = useRoute()
const router = useRouter()
const { addNotification } = useNotifications()

const projectId = computed(() => route.params.id as string)
const routes = ref<Route[]>([])
const breakerStates = ref<Map<string, BreakerState>>(new Map())
const isLoading = ref(true)
const showModal = ref(false)

const form = ref({
  environment: 'prod' as const,
  method: 'POST' as const,
  path: '',
  is_async: false,
  timeout_ms: 15000
})

const environments = ['dev', 'staging', 'prod']
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'ANY']

const loadRoutes = async () => {
  isLoading.value = true
  try {
    routes.value = await api.routes.getByProject(projectId.value)
    await loadBreakerStates()
  } catch (error) {
    routes.value = []
  } finally {
    isLoading.value = false
  }
}

const loadBreakerStates = async () => {
  const states = new Map<string, BreakerState>()
  for (const routeItem of routes.value) {
    try {
      const state = await api.breaker.getState(routeItem.id)
      states.set(routeItem.id, state)
    } catch {
      states.set(routeItem.id, { route_id: routeItem.id, status: 'CLOSED', failure_count: 0 })
    }
  }
  breakerStates.value = states
}

const handleCreate = async () => {
  if (!form.value.path) {
    addNotification('warning', '警告', '请输入路由路径')
    return
  }
  
  try {
    await api.routes.create({
      project_id: projectId.value,
      ...form.value
    })
    addNotification('success', '成功', '配置已成功同步至网关集群运行时（秒级热重载已完成）')
    showModal.value = false
    form.value = { environment: 'prod', method: 'POST', path: '', is_async: false, timeout_ms: 15000 }
    await loadRoutes()
  } catch {
    addNotification('error', '错误', '创建失败')
  }
}

const toggleRoute = async (routeItem: Route) => {
  try {
    await api.routes.update(routeItem.id, { is_active: !routeItem.is_active })
    addNotification('success', '成功', '配置已成功同步至网关集群运行时（秒级热重载已完成）')
    await loadRoutes()
  } catch {
    addNotification('error', '错误', '操作失败')
  }
}

const handleDelete = async (id: string, path: string) => {
  if (!confirm(`确定要删除路由 "${path}" 吗？`)) return
  
  try {
    await api.routes.delete(id)
    addNotification('success', '成功', '路由已删除')
    await loadRoutes()
  } catch {
    addNotification('error', '错误', '删除失败')
  }
}

const resetBreaker = async (routeId: string) => {
  try {
    await api.breaker.reset(routeId)
    addNotification('success', '成功', '熔断器已重置为 CLOSED 状态')
    await loadBreakerStates()
  } catch {
    addNotification('error', '错误', '重置失败')
  }
}

const goToTransformer = (routeId: string) => {
  router.push(`/routes/${routeId}/transformer`)
}

onMounted(loadRoutes)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text-main">路由管理</h1>
        <p class="text-text-secondary mt-1">配置项目的 HTTP 路由规则</p>
      </div>
      <button 
        class="btn btn-primary" 
        @click="showModal = true"
      >
        <Plus class="w-5 h-5" />
        新建路由
      </button>
    </div>
    
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>环境</th>
              <th>方法</th>
              <th>路径</th>
              <th>状态</th>
              <th>熔断</th>
              <th>超时</th>
              <th>异步</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route in routes" :key="route.id">
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-warning/20 text-warning': route.environment === 'dev',
                    'bg-primary/20 text-primary': route.environment === 'staging',
                    'bg-secondary/20 text-secondary': route.environment === 'prod'
                  }"
                >
                  {{ route.environment }}
                </span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-secondary/20 text-secondary': route.method === 'GET',
                    'bg-primary/20 text-primary': route.method === 'POST',
                    'bg-accent/20 text-accent': route.method === 'PUT',
                    'bg-danger/20 text-danger': route.method === 'DELETE',
                    'bg-text-muted/20 text-text-muted': route.method === 'ANY'
                  }"
                >
                  {{ route.method }}
                </span>
              </td>
              <td class="font-mono text-sm">{{ route.path }}</td>
              <td>
                <button 
                  class="flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all"
                  :class="route.is_active ? 'bg-secondary/20 text-secondary' : 'bg-bg-hover text-text-muted'"
                  @click="toggleRoute(route)"
                >
                  <Play v-if="route.is_active" class="w-4 h-4" />
                  <Pause v-else class="w-4 h-4" />
                  {{ route.is_active ? '启用' : '禁用' }}
                </button>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <BreakerBadge :status="breakerStates.get(route.id)?.status || 'CLOSED'" />
                  <button
                    v-if="breakerStates.get(route.id)?.status !== 'CLOSED'"
                    class="text-xs text-accent hover:text-accent/80"
                    @click="resetBreaker(route.id)"
                  >
                    重置
                  </button>
                </div>
              </td>
              <td>{{ (route.timeout_ms / 1000).toFixed(0) }}s</td>
              <td>
                <Zap v-if="route.is_async" class="w-4 h-4 text-accent" />
                <span v-else class="text-text-muted">-</span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button 
                    class="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-main"
                    @click="goToTransformer(route.id)"
                  >
                    <Settings class="w-4 h-4" />
                  </button>
                  <button 
                    class="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-main"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button 
                    class="p-1.5 rounded-lg hover:bg-danger/20 text-text-secondary hover:text-danger"
                    @click="handleDelete(route.id, route.path)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="routes.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus class="w-8 h-8 text-text-muted" />
        </div>
        <h3 class="text-lg font-semibold text-text-main mb-2">暂无路由</h3>
        <p class="text-text-secondary">创建第一个路由开始转发流量</p>
      </div>
    </div>
    
    <Transition name="modal">
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showModal = false"
      >
        <div class="card p-6 w-full max-w-lg">
          <h3 class="text-lg font-semibold text-text-main mb-4">新建路由</h3>
          <form @submit.prevent="handleCreate" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-2">环境</label>
                <select v-model="form.environment" class="input">
                  <option v-for="env in environments" :key="env" :value="env">{{ env }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-2">方法</label>
                <select v-model="form.method" class="input">
                  <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">路径</label>
              <input
                v-model="form.path"
                type="text"
                placeholder="/api/v1/chat"
                class="input font-mono"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-2">超时 (毫秒)</label>
                <input
                  v-model.number="form.timeout_ms"
                  type="number"
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-2">异步模式</label>
                <div class="flex items-center">
                  <button type="button" @click="form.is_async = !form.is_async" class="switch">
                    <span class="switch-track" :class="{ checked: form.is_async }"></span>
                    <span class="switch-thumb" :class="{ checked: form.is_async }"></span>
                  </button>
                  <span class="ml-2 text-sm text-text-secondary">{{ form.is_async ? '是' : '否' }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn btn-secondary flex-1" @click="showModal = false">取消</button>
              <button type="submit" class="btn btn-primary flex-1">创建</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
