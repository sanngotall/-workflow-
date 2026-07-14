<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">新建转换器</h1>
      <p class="text-gray-500 mt-1">创建新的数据转换规则</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">转换器名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="输入转换器名称"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">转换类型</label>
            <select
              v-model="form.type"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="request">请求转换</option>
              <option value="response">响应转换</option>
              <option value="both">全链路转换</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">转换器描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="输入转换器功能描述..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">转换脚本</label>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-600">JavaScript</span>
              <button type="button" class="text-sm text-primary-600 hover:text-primary-700">
                <Code class="w-4 h-4 inline mr-1" />
                格式化
              </button>
            </div>
            <textarea
              v-model="form.script"
              rows="12"
              class="w-full px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none resize-none"
              placeholder="// 在这里编写转换逻辑
// 示例：
function transform(input) {
  return {
    ...input,
    transformed: true
  }
}"
            ></textarea>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">超时时间 (ms)</label>
            <input
              v-model="form.timeout"
              type="number"
              placeholder="5000"
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">执行优先级</label>
            <select
              v-model="form.priority"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">启用转换器</p>
            <p class="text-xs text-gray-500">创建后立即启用此转换器</p>
          </div>
          <button
            type="button"
            @click="form.enabled = !form.enabled"
            class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
            :class="form.enabled ? 'bg-primary-600' : 'bg-gray-300'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
              :class="form.enabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button type="button" class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
            取消
          </button>
          <div class="flex items-center gap-3">
            <button type="button" class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Play class="w-4 h-4" />
              测试运行
            </button>
            <button type="submit" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              创建转换器
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Code, Play } from 'lucide-vue-next'

const form = reactive({
  name: '',
  type: 'request',
  description: '',
  script: '',
  timeout: 5000,
  retry: 3,
  priority: 'medium',
  enabled: true
})

const handleSubmit = () => {
  alert('转换器创建成功！')
}
</script>
