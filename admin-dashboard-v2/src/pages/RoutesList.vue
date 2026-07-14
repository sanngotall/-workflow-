<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">路由列表</h1>
        <p class="text-gray-500 mt-1">管理所有网关路由配置</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索路由..."
            class="w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus class="w-4 h-4 inline mr-2" />
          新建路由
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeFilter === filter.value ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
      >
        {{ filter.label }}
        <span class="ml-1.5 px-2 py-0.5 text-xs rounded-full" :class="activeFilter === filter.value ? 'bg-primary-200' : 'bg-gray-100'">{{ filter.count }}</span>
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
        <div class="col-span-1">ID</div>
        <div class="col-span-3">路径</div>
        <div class="col-span-2">目标</div>
        <div class="col-span-2">方法</div>
        <div class="col-span-1">状态</div>
        <div class="col-span-2">操作</div>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-for="route in filteredRoutes"
          :key="route.id"
          class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
        >
          <div class="col-span-1 text-sm text-gray-500">#{{ route.id }}</div>
          <div class="col-span-3">
            <p class="text-sm font-medium text-gray-800">{{ route.path }}</p>
            <p class="text-xs text-gray-500">{{ route.description }}</p>
          </div>
          <div class="col-span-2 text-sm text-gray-600">{{ route.target }}</div>
          <div class="col-span-2 flex items-center gap-2">
            <span
              v-for="method in route.methods"
              :key="method"
              class="px-2 py-1 text-xs font-medium rounded"
              :class="getMethodClass(method)"
            >
              {{ method }}
            </span>
          </div>
          <div class="col-span-1">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusClass(route.status)"
            >
              {{ route.status }}
            </span>
          </div>
          <div class="col-span-2 flex items-center gap-2">
            <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
              <Edit2 class="w-4 h-4" />
            </button>
            <button class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="复制">
              <Copy class="w-4 h-4" />
            </button>
            <button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, Edit2, Copy, Trash2 } from 'lucide-vue-next'

interface Route {
  id: number
  path: string
  target: string
  methods: string[]
  status: string
  description: string
}

const searchQuery = ref('')
const activeFilter = ref('all')

const filters = [
  { label: '全部', value: 'all', count: 12 },
  { label: '运行中', value: 'running', count: 8 },
  { label: '待部署', value: 'pending', count: 2 },
  { label: '已停用', value: 'stopped', count: 2 }
]

const routes = ref<Route[]>([
  { id: 1, path: '/api/v1/users', target: 'http://localhost:3000', methods: ['GET', 'POST'], status: '运行中', description: '用户管理接口' },
  { id: 2, path: '/api/v1/orders', target: 'http://localhost:3001', methods: ['GET', 'POST', 'PUT'], status: '运行中', description: '订单管理接口' },
  { id: 3, path: '/api/v1/products', target: 'http://localhost:3002', methods: ['GET'], status: '待部署', description: '商品查询接口' },
  { id: 4, path: '/api/v1/payments', target: 'http://localhost:3003', methods: ['POST'], status: '运行中', description: '支付接口' },
  { id: 5, path: '/api/v1/notifications', target: 'http://localhost:3004', methods: ['POST'], status: '已停用', description: '通知服务接口' },
  { id: 6, path: '/api/v1/reports', target: 'http://localhost:3005', methods: ['GET'], status: '运行中', description: '报表接口' },
  { id: 7, path: '/api/v1/config', target: 'http://localhost:3006', methods: ['GET', 'PUT'], status: '运行中', description: '配置管理接口' },
  { id: 8, path: '/api/v1/health', target: 'http://localhost:3007', methods: ['GET'], status: '运行中', description: '健康检查接口' },
  { id: 9, path: '/api/v1/logs', target: 'http://localhost:3008', methods: ['GET'], status: '待部署', description: '日志查询接口' },
  { id: 10, path: '/api/v1/metrics', target: 'http://localhost:3009', methods: ['GET'], status: '运行中', description: '监控指标接口' },
  { id: 11, path: '/api/v1/auth', target: 'http://localhost:3010', methods: ['POST'], status: '运行中', description: '认证接口' },
  { id: 12, path: '/api/v1/admin', target: 'http://localhost:3011', methods: ['GET', 'POST', 'PUT', 'DELETE'], status: '已停用', description: '管理后台接口' }
])

const filteredRoutes = computed(() => {
  return routes.value.filter(route => {
    const matchesSearch = !searchQuery.value || route.path.toLowerCase().includes(searchQuery.value.toLowerCase()) || route.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = activeFilter.value === 'all' || route.status === filters.find(f => f.value === activeFilter.value)?.label
    return matchesSearch && matchesFilter
  })
})

const getMethodClass = (method: string): string => {
  const classes: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-600',
    POST: 'bg-green-100 text-green-600',
    PUT: 'bg-yellow-100 text-yellow-600',
    DELETE: 'bg-red-100 text-red-600'
  }
  return classes[method] || 'bg-gray-100 text-gray-600'
}

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    '运行中': 'bg-green-100 text-green-600',
    '待部署': 'bg-yellow-100 text-yellow-600',
    '已停用': 'bg-gray-100 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}
</script>
