<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">转换器列表</h1>
        <p class="text-gray-500 mt-1">管理请求和响应的数据转换器</p>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <Plus class="w-4 h-4 inline mr-2" />
        新建转换器
      </button>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索转换器..."
          class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option>全部类型</option>
        <option>请求转换</option>
        <option>响应转换</option>
        <option>全链路转换</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="transformer in transformers"
        :key="transformer.id"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GitBranch class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800">{{ transformer.name }}</h3>
              <span
                class="inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1"
                :class="getTypeClass(transformer.type)"
              >
                {{ transformer.type }}
              </span>
            </div>
          </div>
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="transformer.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
          >
            {{ transformer.status === 'active' ? '启用' : '禁用' }}
          </span>
        </div>

        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ transformer.description }}</p>

        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-4 text-gray-500">
            <span class="flex items-center gap-1">
              <Zap class="w-4 h-4" />
              {{ transformer.callCount }} 次/天
            </span>
            <span class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              {{ transformer.avgTime }}ms
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button class="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Edit2 class="w-4 h-4 inline mr-1" />
            编辑
          </button>
          <button class="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Play class="w-4 h-4 inline mr-1" />
            测试
          </button>
          <button class="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 class="w-4 h-4 inline mr-1" />
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Search, GitBranch, Zap, Clock, Edit2, Play, Trash2 } from 'lucide-vue-next'

interface Transformer {
  id: number
  name: string
  type: string
  status: string
  description: string
  callCount: number
  avgTime: number
}

const searchQuery = ref('')

const transformers = ref<Transformer[]>([
  { id: 1, name: 'Dify 请求转换', type: '请求转换', status: 'active', description: '将标准请求转换为 Dify API 格式，支持参数映射和头部处理', callCount: 12456, avgTime: 15 },
  { id: 2, name: 'n8n Webhook 转换', type: '响应转换', status: 'active', description: '将 n8n 响应数据转换为统一返回格式', callCount: 8932, avgTime: 23 },
  { id: 3, name: 'JSON 数据转换', type: '全链路转换', status: 'active', description: '通用 JSON 字段映射和数据格式转换', callCount: 34567, avgTime: 8 },
  { id: 4, name: 'XML 转 JSON', type: '请求转换', status: 'disabled', description: '将 XML 请求体转换为 JSON 格式', callCount: 2345, avgTime: 45 },
  { id: 5, name: '加密解密转换', type: '全链路转换', status: 'active', description: '对敏感字段进行 AES-256 加密和解密处理', callCount: 15678, avgTime: 12 },
  { id: 6, name: '签名验证转换', type: '请求转换', status: 'active', description: '验证请求签名并提取验签参数', callCount: 9876, avgTime: 18 }
])

const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    '请求转换': 'bg-blue-100 text-blue-600',
    '响应转换': 'bg-green-100 text-green-600',
    '全链路转换': 'bg-purple-100 text-purple-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}
</script>
