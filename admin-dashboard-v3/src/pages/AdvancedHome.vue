<template>
  <div class="space-y-6">
    <!-- 提示条 -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-medium text-amber-800">高级模式</p>
        <p class="text-xs text-amber-700 mt-0.5">以下为低频高级配置。日常操作请回到
          <button @click="goHome" class="underline font-medium text-amber-800 hover:text-amber-900">主界面</button>。
        </p>
      </div>
    </div>

    <div>
      <h1 class="text-2xl font-bold text-gray-800">{{ currentTitle }}</h1>
      <p class="text-gray-500 mt-1">{{ currentDescription }}</p>
    </div>

    <!-- 凭证审计 -->
    <div v-if="section === 'credentials'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">凭证审计日志</h2>
        <button class="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">导出日志</button>
      </div>
      <p class="text-xs text-gray-500 mb-4">所有 API Key 的创建、查看、轮换、删除操作均会记录在此</p>
      <div class="space-y-2">
        <div v-for="log in credentialLogs" :key="log.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="log.bgClass">
            <component :is="log.icon" class="w-4 h-4 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-800">{{ log.action }}</p>
            <p class="text-xs text-gray-500">{{ log.transitName }} · {{ log.time }}</p>
          </div>
          <span class="text-xs text-gray-400">{{ log.operator }}</span>
        </div>
      </div>
    </div>

    <!-- 转换器模板库 -->
    <div v-else-if="section === 'templates'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">转换器模板库</h2>
        <button class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">新建模板</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="t in templateList" :key="t.value" class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-800">{{ t.label }}</p>
            <span class="px-2 py-0.5 text-xs font-medium rounded-md" :class="t.type === 'dify' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'">{{ t.type }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3">{{ t.description }}</p>
          <div class="flex items-center gap-3">
            <button class="text-xs text-primary-600 hover:underline">编辑</button>
            <button class="text-xs text-gray-400 hover:text-red-500">删除</button>
            <span class="ml-auto text-xs text-gray-400">使用 {{ t.usage }} 次</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局限流 -->
    <div v-else-if="section === 'ratelimit'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">全局限流规则</h2>
      <p class="text-xs text-gray-500 mb-4">优先级低于中转级限流。中转未配置时回退到此处</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-xs text-gray-500">全局 QPS 上限</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">5000</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-xs text-gray-500">单 IP QPS</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">200</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-xs text-gray-500">熔断阈值</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">10%</p>
        </div>
      </div>
      <button class="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">编辑规则</button>
    </div>

    <!-- 路由分组 -->
    <div v-else-if="section === 'groups'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">路由分组</h2>
        <button class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">新建分组</button>
      </div>
      <p class="text-xs text-gray-500 mb-4">把多条中转按业务分组，便于批量管理</p>
      <div class="text-center py-16 text-gray-400">
        <Layers class="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p class="text-sm">暂无分组</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AlertTriangle, ShieldCheck, FileText, Gauge, Layers,
  KeyRound, Eye, RefreshCw, Trash2
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
appStore.setTopNav('advanced')

const section = computed(() => {
  const s = route.params.section as string
  return ['credentials', 'templates', 'ratelimit', 'groups'].includes(s) ? s : 'credentials'
})

const sectionMeta: Record<string, { title: string; description: string; icon: ReturnType<typeof markRaw> }> = {
  credentials: { title: '凭证审计日志', description: 'API Key 的操作记录追踪', icon: markRaw(ShieldCheck) },
  templates: { title: '转换器模板库', description: '管理请求翻译模板', icon: markRaw(FileText) },
  ratelimit: { title: '全局限流规则', description: '全局流量控制策略', icon: markRaw(Gauge) },
  groups: { title: '路由分组', description: '按业务批量管理中转', icon: markRaw(Layers) }
}

const currentTitle = computed(() => sectionMeta[section.value]?.title || '')
const currentDescription = computed(() => sectionMeta[section.value]?.description || '')

const goHome = () => {
  appStore.setTopNav('projects')
  router.push('/projects')
}

const credentialLogs = [
  { id: 1, action: 'API Key 创建', transitName: '客服对话-主流程', time: '10 分钟前', operator: '管理员', icon: markRaw(KeyRound), bgClass: 'bg-green-500' },
  { id: 2, action: 'API Key 查看', transitName: '订单状态查询', time: '1 小时前', operator: '张三', icon: markRaw(Eye), bgClass: 'bg-blue-500' },
  { id: 3, action: 'API Key 轮换', transitName: '智能客服主入口', time: '昨天 18:24', operator: '管理员', icon: markRaw(RefreshCw), bgClass: 'bg-amber-500' },
  { id: 4, action: 'API Key 删除', transitName: '旧版中转', time: '3 天前', operator: '李四', icon: markRaw(Trash2), bgClass: 'bg-red-500' }
]

const templateList = [
  { value: 'dify-chat-messages-标准', label: 'Dify Chat Messages 标准', type: 'dify', description: '适配 dify /v1/chat-messages，含 conversation_id', usage: 12 },
  { value: 'dify-workflow-标准', label: 'Dify Workflow 标准', type: 'dify', description: '适配 dify /v1/workflows/run，含 inputs 字段', usage: 4 },
  { value: 'n8n-webhook-标准', label: 'n8n Webhook 标准', type: 'n8n', description: '适配 n8n webhook 触发器，自动注入 json 字段', usage: 8 },
  { value: 'n8n-workflow-标准', label: 'n8n Workflow 标准', type: 'n8n', description: '适配 n8n 工作流 API，支持多步骤传参', usage: 3 }
]
</script>
