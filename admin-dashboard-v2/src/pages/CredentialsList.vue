<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">凭证列表</h1>
        <p class="text-gray-500 mt-1">管理所有网关访问凭证</p>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <Plus class="w-4 h-4 inline mr-2" />
        新建凭证
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="credential in credentials"
        :key="credential.id"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ credential.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ credential.type }}</p>
          </div>
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="credential.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
          >
            {{ credential.status === 'active' ? '有效' : '过期' }}
          </span>
        </div>
        
        <div class="space-y-3">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider">Client ID</p>
            <p class="text-sm font-mono text-gray-700">{{ credential.clientId }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider">Secret</p>
            <div class="flex items-center gap-2">
              <p class="text-sm font-mono text-gray-700">{{ maskedSecret }}</p>
              <button class="text-primary-600 hover:text-primary-700" @click="showSecret = !showSecret">
                <Eye v-if="showSecret" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider">过期时间</p>
            <p class="text-sm text-gray-600">{{ credential.expiresAt }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <button class="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Edit2 class="w-4 h-4 inline mr-1" />
            编辑
          </button>
          <button class="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Copy class="w-4 h-4 inline mr-1" />
            复制
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
import { Plus, Eye, EyeOff, Edit2, Copy, Trash2 } from 'lucide-vue-next'

interface Credential {
  id: number
  name: string
  type: string
  clientId: string
  secret: string
  status: string
  expiresAt: string
}

const showSecret = ref(false)
const maskedSecret = ref('****************')

const credentials = ref<Credential[]>([
  { id: 1, name: 'Dify API Key', type: 'API Key', clientId: 'cli_abc123def456', secret: 'sk_xxxxxxxxxxxxxxxx', status: 'active', expiresAt: '2025-12-31' },
  { id: 2, name: 'n8n Webhook', type: 'Bearer Token', clientId: 'n8n_webhook_token', secret: 'wh_xxxxxxxxxxxxxxxx', status: 'active', expiresAt: '2025-06-30' },
  { id: 3, name: '内部服务凭证', type: 'Basic Auth', clientId: 'internal_service', secret: 'basic_xxxxxxxxxxxxxx', status: 'expired', expiresAt: '2024-01-15' },
  { id: 4, name: '第三方支付', type: 'API Key', clientId: 'pay_merchant_key', secret: 'pay_xxxxxxxxxxxxxxxx', status: 'active', expiresAt: '2025-09-30' },
  { id: 5, name: '短信服务', type: 'Bearer Token', clientId: 'sms_provider_token', secret: 'sms_xxxxxxxxxxxxxxxx', status: 'active', expiresAt: '2025-03-15' },
  { id: 6, name: '邮件服务', type: 'SMTP Auth', clientId: 'smtp_user_credentials', secret: 'smtp_xxxxxxxxxxxxxx', status: 'active', expiresAt: '2025-12-31' }
])
</script>
