<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">新建路由</h1>
      <p class="text-gray-500 mt-1">创建新的网关路由配置</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">路由名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="输入路由名称"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">路由路径</label>
            <div class="flex items-center">
              <span class="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">/</span>
              <input
                v-model="form.path"
                type="text"
                placeholder="api/v1/users"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">目标地址</label>
            <input
              v-model="form.target"
              type="text"
              placeholder="http://localhost:3000"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">HTTP 方法</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="method in methods"
                :key="method"
                type="button"
                @click="toggleMethod(method)"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="form.methods.includes(method) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                {{ method }}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">路由描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="输入路由描述..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div class="pt-4 border-t border-gray-100">
          <h3 class="text-sm font-medium text-gray-700 mb-4">高级配置</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">超时时间 (ms)</label>
              <input
                v-model="form.timeout"
                type="number"
                placeholder="30000"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">限流 (QPS)</label>
              <input
                v-model="form.rateLimit"
                type="number"
                placeholder="1000"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">重试次数</label>
              <input
                v-model="form.retry"
                type="number"
                placeholder="3"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button type="button" class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
            取消
          </button>
          <div class="flex items-center gap-3">
            <button type="button" class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              保存草稿
            </button>
            <button type="submit" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              创建路由
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']

const form = reactive({
  name: '',
  path: '',
  target: '',
  methods: [] as string[],
  description: '',
  timeout: 30000,
  rateLimit: 1000,
  retry: 3
})

const toggleMethod = (method: string) => {
  const index = form.methods.indexOf(method)
  if (index > -1) {
    form.methods.splice(index, 1)
  } else {
    form.methods.push(method)
  }
}

const handleSubmit = () => {
  alert('路由创建成功！')
}
</script>
