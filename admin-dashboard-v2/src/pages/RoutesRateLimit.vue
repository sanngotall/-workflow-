<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">限流规则</h1>
        <p class="text-gray-500 mt-1">配置请求速率限制，保护后端服务</p>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <Plus class="w-4 h-4 inline mr-2" />
        新建规则
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Gauge class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">全局限流</p>
            <p class="text-2xl font-bold text-gray-800">10,000 QPS</p>
          </div>
        </div>
        <p class="text-xs text-gray-500">适用于所有请求的总速率限制</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Shield class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">规则数量</p>
            <p class="text-2xl font-bold text-gray-800">24 条</p>
          </div>
        </div>
        <p class="text-xs text-gray-500">已配置的限流规则总数</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertTriangle class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">今日触发</p>
            <p class="text-2xl font-bold text-gray-800">1,234 次</p>
          </div>
        </div>
        <p class="text-xs text-gray-500">今日被限流拦截的请求次数</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">限流规则列表</h2>
        <div class="flex items-center gap-2">
          <select class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>全部类型</option>
            <option>IP 限流</option>
            <option>用户限流</option>
            <option>接口限流</option>
          </select>
        </div>
      </div>
      <div class="divide-y divide-gray-50">
        <div
          v-for="rule in rules"
          :key="rule.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="rule.iconBg">
                <component :is="rule.icon" class="w-5 h-5" :class="rule.iconColor" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-gray-800">{{ rule.name }}</h3>
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full" :class="rule.typeClass">{{ rule.type }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ rule.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-lg font-bold text-gray-800">{{ rule.limit }}<span class="text-sm font-normal text-gray-500"> / {{ rule.window }}</span></p>
                <p class="text-xs text-gray-500">限流阈值</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="rule.enabled = !rule.enabled"
                  class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out duration-200 ease-in-out"
                  :class="rule.enabled ? 'bg-primary-600' : 'bg-gray-300'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                    :class="rule.enabled ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Gauge, Shield, AlertTriangle, MoreHorizontal, Globe, User, Route } from 'lucide-vue-next'

interface Rule {
  id: number
  name: string
  type: string
  typeClass: string
  description: string
  limit: number
  window: string
  enabled: boolean
  icon: unknown
  iconBg: string
  iconColor: string
}

const rules = ref<Rule[]>([
  { id: 1, name: '全局 IP 限流', type: 'IP 限流', typeClass: 'bg-blue-100 text-blue-600', description: '每个 IP 地址每秒最多 100 次请求', limit: 100, window: '秒', enabled: true, icon: Globe, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 2, name: '登录接口限流', type: '接口限流', typeClass: 'bg-purple-100 text-purple-600', description: '防止暴力破解，登录接口每分钟最多 5 次', limit: 5, window: '分钟', enabled: true, icon: Route, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 3, name: '付费用户限流', type: '用户限流', typeClass: 'bg-green-100 text-green-600', description: '付费用户每秒最多 500 次请求', limit: 500, window: '秒', enabled: true, icon: User, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { id: 4, name: '免费用户限流', type: '用户限流', typeClass: 'bg-yellow-100 text-yellow-600', description: '免费用户每分钟最多 60 次请求', limit: 60, window: '分钟', enabled: true, icon: User, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 5, name: '短信发送限流', type: '接口限流', typeClass: 'bg-red-100 text-red-600', description: '短信发送接口每分钟最多 10 次', limit: 10, window: '分钟', enabled: true, icon: Route, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  { id: 6, name: '批量接口限流', type: '接口限流', typeClass: 'bg-orange-100 text-orange-600', description: '批量操作接口每小时最多 100 次', limit: 100, window: '小时', enabled: false, icon: Route, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
])
</script>
