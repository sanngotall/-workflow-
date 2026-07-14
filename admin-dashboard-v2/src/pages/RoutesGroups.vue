<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">路由分组</h1>
        <p class="text-gray-500 mt-1">按组管理路由，统一配置策略</p>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <Plus class="w-4 h-4 inline mr-2" />
        新建分组
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1 space-y-3">
        <div
          v-for="group in groups"
          :key="group.id"
          @click="selectedGroup = group.id"
          class="p-4 rounded-xl cursor-pointer transition-all"
          :class="selectedGroup === group.id ? 'bg-primary-50 border-2 border-primary-200' : 'bg-white border border-gray-100 hover:border-gray-200'"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-gray-800">{{ group.name }}</h3>
            <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">{{ group.count }}</span>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2">{{ group.description }}</p>
        </div>
      </div>

      <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ currentGroup?.name || '选择分组' }}</h2>
            <p class="text-sm text-gray-500">{{ currentGroup?.description || '请从左侧选择一个路由分组' }}</p>
          </div>
          <div v-if="currentGroup" class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings class="w-4 h-4 inline mr-1" />
              分组设置
            </button>
            <button class="px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
              <Plus class="w-4 h-4 inline mr-1" />
              添加路由
            </button>
          </div>
        </div>

        <div v-if="currentGroup" class="p-6">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">路由数量</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ currentGroup.count }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">统一限流</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ currentGroup.rateLimit }} QPS</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">超时时间</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ currentGroup.timeout }}s</p>
            </div>
          </div>

          <h3 class="text-sm font-semibold text-gray-700 mb-4">分组路由列表</h3>
          <div class="space-y-2">
            <div
              v-for="route in groupRoutes"
              :key="route.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <Route class="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ route.path }}</p>
                  <p class="text-xs text-gray-500">{{ route.methods.join(', ') }}</p>
                </div>
              </div>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="route.status === '运行中' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
              >
                {{ route.status }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center">
          <Layers class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">请从左侧选择一个路由分组</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Settings, Route, Layers } from 'lucide-vue-next'

interface Group {
  id: string
  name: string
  description: string
  count: number
  rateLimit: number
  timeout: number
}

interface Route {
  id: number
  path: string
  methods: string[]
  status: string
}

const selectedGroup = ref('group_001')

const groups = ref<Group[]>([
  { id: 'group_001', name: '用户服务', description: '用户相关的所有 API 接口', count: 8, rateLimit: 500, timeout: 30 },
  { id: 'group_002', name: '订单服务', description: '订单和支付相关接口', count: 12, rateLimit: 200, timeout: 60 },
  { id: 'group_003', name: '商品服务', description: '商品和库存管理接口', count: 15, rateLimit: 1000, timeout: 15 },
  { id: 'group_004', name: '第三方集成', description: '对接第三方系统的接口', count: 6, rateLimit: 100, timeout: 45 },
  { id: 'group_005', name: '系统接口', description: '系统级别的健康检查和监控接口', count: 3, rateLimit: 50, timeout: 10 },
  { id: 'group_006', name: '通知服务', description: '短信、邮件、推送等通知接口', count: 5, rateLimit: 300, timeout: 20 }
])

const groupRoutes = ref<Route[]>([
  { id: 1, path: '/api/v1/users', methods: ['GET', 'POST'], status: '运行中' },
  { id: 2, path: '/api/v1/users/:id', methods: ['GET', 'PUT', 'DELETE'], status: '运行中' },
  { id: 3, path: '/api/v1/users/login', methods: ['POST'], status: '运行中' },
  { id: 4, path: '/api/v1/users/logout', methods: ['POST'], status: '运行中' },
  { id: 5, path: '/api/v1/users/profile', methods: ['GET', 'PUT'], status: '运行中' }
])

const currentGroup = computed(() => {
  return groups.value.find(g => g.id === selectedGroup.value)
})
</script>
