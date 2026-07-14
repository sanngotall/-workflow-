<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">模板库</h1>
        <p class="text-gray-500 mt-1">使用预定义模板快速创建转换器</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>全部分类</option>
          <option>数据转换</option>
          <option>安全加密</option>
          <option>协议适配</option>
          <option>格式转换</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="template in templates"
        :key="template.id"
        class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer"
      >
        <div class="h-32 flex items-center justify-center" :class="template.bgColor">
          <component :is="template.icon" class="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-base font-semibold text-gray-800">{{ template.name }}</h3>
            <span class="px-2 py-0.5 text-xs font-medium rounded-full" :class="template.tagClass">{{ template.tag }}</span>
          </div>
          <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ template.description }}</p>
          <div class="flex items-center gap-2">
            <button class="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
              使用模板
            </button>
            <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Eye class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Eye, GitBranch, Shield, Zap, FileJson, ArrowLeftRight, RefreshCw, Code } from 'lucide-vue-next'

interface Template {
  id: number
  name: string
  tag: string
  tagClass: string
  description: string
  icon: unknown
  bgColor: string
}

const templates = ref<Template[]>([
  { id: 1, name: 'Dify API 适配', tag: '协议适配', tagClass: 'bg-blue-100 text-blue-600', description: '将标准 REST 请求转换为 Dify 兼容的 API 格式，支持流式响应', icon: GitBranch, bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { id: 2, name: 'n8n Webhook 转换', tag: '协议适配', tagClass: 'bg-green-100 text-green-600', description: '适配 n8n Webhook 格式，支持请求验证和响应转换', icon: Zap, bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { id: 3, name: 'AES-256 加密', tag: '安全加密', tagClass: 'bg-purple-100 text-purple-600', description: '对请求/响应中的敏感字段进行 AES-256-GCM 加密', icon: Shield, bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 4, name: 'JSON Schema 校验', tag: '数据转换', tagClass: 'bg-yellow-100 text-yellow-600', description: '使用 JSON Schema 验证请求体格式，自动拒绝无效请求', icon: FileJson, bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500' },
  { id: 5, name: '字段映射转换', tag: '数据转换', tagClass: 'bg-pink-100 text-pink-600', description: '配置式字段重命名和数据映射，支持嵌套结构', icon: ArrowLeftRight, bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500' },
  { id: 6, name: 'XML JSON 互转', tag: '格式转换', tagClass: 'bg-indigo-100 text-indigo-600', description: 'XML 与 JSON 格式互相转换，支持自定义映射规则', icon: RefreshCw, bgColor: 'bg-gradient-to-br from-indigo-500 to-violet-500' },
  { id: 7, name: '自定义代码模板', tag: '高级', tagClass: 'bg-gray-100 text-gray-600', description: '从零开始编写自定义转换逻辑，完全控制转换过程', icon: Code, bgColor: 'bg-gradient-to-br from-gray-600 to-gray-800' },
  { id: 8, name: '请求签名验证', tag: '安全加密', tagClass: 'bg-red-100 text-red-600', description: '验证 HMAC 签名，确保请求完整性和来源可信', icon: Shield, bgColor: 'bg-gradient-to-br from-red-500 to-orange-500' },
  { id: 9, name: '分页参数转换', tag: '数据转换', tagClass: 'bg-teal-100 text-teal-600', description: '统一分页参数格式，适配不同后端的分页约定', icon: FileJson, bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-500' }
])
</script>
