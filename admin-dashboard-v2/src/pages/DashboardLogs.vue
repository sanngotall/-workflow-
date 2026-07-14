<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">访问日志</h1>
        <p class="text-gray-500 mt-1">查看所有请求的详细日志记录</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>全部级别</option>
          <option>INFO</option>
          <option>WARN</option>
          <option>ERROR</option>
        </select>
        <input type="date" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">共 {{ logs.length }} 条记录</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Download class="w-4 h-4 inline mr-1" />
            导出
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">时间</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">级别</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">方法</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">路径</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">耗时</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-600">{{ log.time }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="log.levelClass">{{ log.level }}</span>
              </td>
              <td class="px-6 py-4 text-sm font-medium" :class="log.methodClass">{{ log.method }}</td>
              <td class="px-6 py-4 text-sm text-gray-800">{{ log.path }}</td>
              <td class="px-6 py-4 text-sm" :class="log.statusClass">{{ log.status }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ log.duration }}ms</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ log.ip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm text-gray-500">显示 1-{{ logs.length }} 条</span>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" :disabled="currentPage === 1">
            上一页
          </button>
          <span class="text-sm text-gray-600">{{ currentPage }}</span>
          <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" :disabled="currentPage === totalPages">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'

interface Log {
  id: number
  time: string
  level: string
  levelClass: string
  method: string
  methodClass: string
  path: string
  status: number
  statusClass: string
  duration: number
  ip: string
}

const currentPage = ref(1)
const totalPages = ref(10)

const logs = ref<Log[]>([
  { id: 1, time: '2024-01-15 14:30:22', level: 'INFO', levelClass: 'bg-blue-100 text-blue-600', method: 'GET', methodClass: 'text-blue-600', path: '/api/v1/users', status: 200, statusClass: 'text-green-600', duration: 12, ip: '192.168.1.100' },
  { id: 2, time: '2024-01-15 14:30:21', level: 'INFO', levelClass: 'bg-blue-100 text-blue-600', method: 'POST', methodClass: 'text-green-600', path: '/api/v1/orders', status: 201, statusClass: 'text-green-600', duration: 45, ip: '192.168.1.101' },
  { id: 3, time: '2024-01-15 14:30:20', level: 'WARN', levelClass: 'bg-yellow-100 text-yellow-600', method: 'GET', methodClass: 'text-blue-600', path: '/api/v1/products/999', status: 404, statusClass: 'text-orange-600', duration: 5, ip: '192.168.1.102' },
  { id: 4, time: '2024-01-15 14:30:19', level: 'ERROR', levelClass: 'bg-red-100 text-red-600', method: 'POST', methodClass: 'text-green-600', path: '/api/v1/payments', status: 500, statusClass: 'text-red-600', duration: 156, ip: '192.168.1.103' },
  { id: 5, time: '2024-01-15 14:30:18', level: 'INFO', levelClass: 'bg-blue-100 text-blue-600', method: 'PUT', methodClass: 'text-yellow-600', path: '/api/v1/users/123', status: 200, statusClass: 'text-green-600', duration: 28, ip: '192.168.1.100' },
  { id: 6, time: '2024-01-15 14:30:17', level: 'INFO', levelClass: 'bg-blue-100 text-blue-600', method: 'DELETE', methodClass: 'text-red-600', path: '/api/v1/products/45', status: 204, statusClass: 'text-green-600', duration: 15, ip: '192.168.1.104' },
  { id: 7, time: '2024-01-15 14:30:16', level: 'INFO', levelClass: 'bg-blue-100 text-blue-600', method: 'GET', methodClass: 'text-blue-600', path: '/api/v1/notifications', status: 200, statusClass: 'text-green-600', duration: 8, ip: '192.168.1.105' },
  { id: 8, time: '2024-01-15 14:30:15', level: 'WARN', levelClass: 'bg-yellow-100 text-yellow-600', method: 'POST', methodClass: 'text-green-600', path: '/api/v1/orders', status: 400, statusClass: 'text-orange-600', duration: 12, ip: '192.168.1.101' }
])
</script>
