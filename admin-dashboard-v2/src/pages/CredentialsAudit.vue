<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">审计日志</h1>
        <p class="text-gray-500 mt-1">查看所有凭证的使用和操作记录</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>全部操作</option>
          <option>创建凭证</option>
          <option>使用凭证</option>
          <option>修改凭证</option>
          <option>删除凭证</option>
        </select>
        <button class="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          <Download class="w-4 h-4 inline mr-2" />
          导出
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">时间</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">凭证</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作人</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">IP 地址</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-600">{{ log.time }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5">
                  <component :is="getActionIcon(log.action)" class="w-4 h-4" :class="getActionColor(log.action)" />
                  <span class="text-sm text-gray-800">{{ log.action }}</span>
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-800 font-medium">{{ log.credential }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white" :class="log.operatorColor">
                    {{ log.operator.charAt(0) }}
                  </div>
                  <span class="text-sm text-gray-700">{{ log.operator }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 font-mono">{{ log.ip }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="log.status === '成功' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                >
                  {{ log.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm text-gray-500">显示 1-10 条，共 256 条记录</span>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
            上一页
          </button>
          <button class="px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg">1</button>
          <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">2</button>
          <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">3</button>
          <span class="text-gray-400">...</span>
          <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">26</button>
          <button class="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Plus, Trash2, Edit2, Key } from 'lucide-vue-next'

interface AuditLog {
  id: number
  time: string
  action: string
  credential: string
  operator: string
  operatorColor: string
  ip: string
  status: string
}

const logs = ref<AuditLog[]>([
  { id: 1, time: '2024-01-15 14:30:22', action: '使用凭证', credential: 'Dify API Key', operator: '张三', operatorColor: 'bg-blue-500', ip: '192.168.1.100', status: '成功' },
  { id: 2, time: '2024-01-15 14:28:15', action: '创建凭证', credential: '短信服务 Token', operator: '李四', operatorColor: 'bg-green-500', ip: '192.168.1.101', status: '成功' },
  { id: 3, time: '2024-01-15 14:25:08', action: '使用凭证', credential: 'n8n Webhook', operator: '王五', operatorColor: 'bg-purple-500', ip: '192.168.1.102', status: '失败' },
  { id: 4, time: '2024-01-15 14:20:33', action: '修改凭证', credential: '支付 API Key', operator: '张三', operatorColor: 'bg-blue-500', ip: '192.168.1.100', status: '成功' },
  { id: 5, time: '2024-01-15 14:15:47', action: '删除凭证', credential: '旧版测试 Key', operator: '赵六', operatorColor: 'bg-orange-500', ip: '192.168.1.103', status: '成功' },
  { id: 6, time: '2024-01-15 14:10:22', action: '使用凭证', credential: '邮件服务 SMTP', operator: '钱七', operatorColor: 'bg-pink-500', ip: '192.168.1.104', status: '成功' },
  { id: 7, time: '2024-01-15 14:05:11', action: '使用凭证', credential: 'Dify API Key', operator: '系统', operatorColor: 'bg-gray-500', ip: '127.0.0.1', status: '成功' },
  { id: 8, time: '2024-01-15 14:00:55', action: '创建凭证', credential: '内部服务凭证', operator: '张三', operatorColor: 'bg-blue-500', ip: '192.168.1.100', status: '成功' },
  { id: 9, time: '2024-01-15 13:55:30', action: '使用凭证', credential: 'CRM API', operator: '李四', operatorColor: 'bg-green-500', ip: '192.168.1.101', status: '成功' },
  { id: 10, time: '2024-01-15 13:50:18', action: '修改凭证', credential: '第三方支付', operator: '王五', operatorColor: 'bg-purple-500', ip: '192.168.1.102', status: '成功' }
])

const getActionIcon = (action: string) => {
  const icons: Record<string, unknown> = {
    '创建凭证': Plus,
    '使用凭证': Key,
    '修改凭证': Edit2,
    '删除凭证': Trash2
  }
  return icons[action] || Key
}

const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    '创建凭证': 'text-green-500',
    '使用凭证': 'text-blue-500',
    '修改凭证': 'text-yellow-500',
    '删除凭证': 'text-red-500'
  }
  return colors[action] || 'text-gray-500'
}
</script>
