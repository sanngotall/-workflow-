<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">基本设置</h1>
      <p class="text-gray-500 mt-1">配置系统基本参数和运行环境</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">系统信息</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500">系统版本</p>
          <p class="text-lg font-semibold text-gray-800 mt-1">v1.0.0</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500">部署环境</p>
          <p class="text-lg font-semibold text-gray-800 mt-1">Production</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500">运行时间</p>
          <p class="text-lg font-semibold text-gray-800 mt-1">15 天 8 小时</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500">最后更新</p>
          <p class="text-lg font-semibold text-gray-800 mt-1">2024-01-15</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">网关配置</h2>
      <form class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">网关端口</label>
            <input
              v-model="config.port"
              type="number"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">最大连接数</label>
            <input
              v-model="config.maxConnections"
              type="number"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">请求超时 (秒)</label>
            <input
              v-model="config.timeout"
              type="number"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">默认限流 (QPS)</label>
            <input
              v-model="config.defaultRateLimit"
              type="number"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">启用 HTTPS</p>
            <p class="text-xs text-gray-500">使用 TLS/SSL 加密传输</p>
          </div>
          <button
            type="button"
            @click="config.httpsEnabled = !config.httpsEnabled"
            class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
            :class="config.httpsEnabled ? 'bg-primary-600' : 'bg-gray-300'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
              :class="config.httpsEnabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">启用请求日志</p>
            <p class="text-xs text-gray-500">记录所有进出网关的请求</p>
          </div>
          <button
            type="button"
            @click="config.logEnabled = !config.logEnabled"
            class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
            :class="config.logEnabled ? 'bg-primary-600' : 'bg-gray-300'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
              :class="config.logEnabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-end">
          <button class="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            保存配置
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const config = reactive({
  port: 8080,
  maxConnections: 10000,
  timeout: 30,
  defaultRateLimit: 1000,
  httpsEnabled: true,
  logEnabled: true
})
</script>
