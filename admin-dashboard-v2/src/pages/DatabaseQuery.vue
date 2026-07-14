<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">SQL查询</h1>
        <p class="text-gray-500 mt-1">执行SQL查询语句，查看数据库结果</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <FolderOpen class="w-4 h-4 inline mr-2" />
          加载文件
        </button>
        <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Play class="w-4 h-4 inline mr-2" />
          执行查询
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
        <button class="px-3 py-1 text-sm bg-primary-600 text-white rounded">查询</button>
        <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 transition-colors">DDL</button>
        <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 transition-colors">DML</button>
        <div class="flex-1"></div>
        <button class="text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="relative">
        <textarea
          v-model="sqlQuery"
          class="w-full h-48 p-4 font-mono text-sm border-none outline-none resize-none bg-gray-50"
          placeholder="输入SQL查询语句..."
        ></textarea>
        <div class="absolute bottom-2 right-2 text-xs text-gray-400">
          {{ sqlQuery.length }} 字符
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">查询结果</h2>
        <button class="text-gray-400 hover:text-primary-600 transition-colors">
          <Download class="w-4 h-4" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th v-for="(col, index) in columns" :key="index" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(row, rowIndex) in results" :key="rowIndex" class="hover:bg-gray-50">
              <td v-for="(col, colIndex) in row" :key="colIndex" class="px-6 py-4 text-sm text-gray-800">
                {{ col }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="results.length === 0" class="px-6 py-12 text-center">
          <Database class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">暂无查询结果</p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">返回 5 行数据，耗时 12ms</p>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">上一页</button>
          <button class="px-3 py-1 text-sm bg-primary-600 text-white rounded">1</button>
          <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FolderOpen, Play, HelpCircle, Download, Database } from 'lucide-vue-next'

const sqlQuery = ref('')

const columns = ref(['id', 'name', 'description', 'status', 'created_at'])

const results = ref([
  { id: 1, name: '电商平台', description: '电商平台核心网关服务', status: 'active', created_at: '2024-01-10 10:30:00' },
  { id: 2, name: 'CRM 系统', description: '客户关系管理系统 API 网关', status: 'active', created_at: '2024-01-05 14:20:00' },
  { id: 3, name: '数据分析', description: '数据分析平台 API 网关', status: 'paused', created_at: '2023-12-20 09:15:00' },
  { id: 4, name: '支付服务', description: '支付网关服务', status: 'active', created_at: '2024-01-12 16:45:00' },
  { id: 5, name: '内容管理', description: 'CMS 内容管理系统 API 网关', status: 'active', created_at: '2023-11-28 11:00:00' }
])
</script>