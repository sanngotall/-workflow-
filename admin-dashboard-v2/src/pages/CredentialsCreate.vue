<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">新建凭证</h1>
      <p class="text-gray-500 mt-1">创建新的访问凭证</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">凭证名称 <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="输入凭证名称"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">凭证类型</label>
            <select
              v-model="form.type"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="apikey">API Key</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="oauth">OAuth 2.0</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">凭证描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="描述凭证的用途..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Client ID / Username</label>
            <div class="flex">
              <input
                v-model="form.clientId"
                type="text"
                placeholder="自动生成或手动输入"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
              <button type="button" @click="generateClientId" class="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                <RefreshCw class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Secret / Password</label>
            <div class="flex">
              <input
                v-model="form.secret"
                :type="showSecret ? 'text' : 'password'"
                placeholder="自动生成或手动输入"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
              <button type="button" @click="showSecret = !showSecret" class="px-3 py-2.5 bg-gray-100 border border-l-0 border-gray-200 text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                <Eye v-if="!showSecret" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
              <button type="button" @click="generateSecret" class="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                <RefreshCw class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">有效期</label>
            <select
              v-model="form.validity"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="30">30 天</option>
              <option value="90">90 天</option>
              <option value="180">180 天</option>
              <option value="365">1 年</option>
              <option value="unlimited">永久有效</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">绑定项目</label>
            <select
              v-model="form.project"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">全部项目</option>
              <option value="proj_001">电商平台</option>
              <option value="proj_002">CRM 系统</option>
              <option value="proj_003">数据分析</option>
            </select>
          </div>
        </div>

        <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <div class="flex items-start gap-3">
            <AlertTriangle class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-yellow-800">安全提示</p>
              <p class="text-xs text-yellow-700 mt-1">凭证创建后，Secret 只会显示一次，请妥善保存。系统使用 AES-256-GCM 加密存储所有凭证信息。</p>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button type="button" class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
            取消
          </button>
          <button type="submit" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            创建凭证
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-vue-next'

const showSecret = ref(false)

const form = reactive({
  name: '',
  type: 'apikey',
  description: '',
  clientId: '',
  secret: '',
  validity: '365',
  project: ''
})

const generateClientId = () => {
  form.clientId = 'cli_' + Math.random().toString(36).substring(2, 15)
}

const generateSecret = () => {
  form.secret = 'sk_' + Math.random().toString(36).substring(2, 30)
}

const handleSubmit = () => {
  alert('凭证创建成功！')
}
</script>
