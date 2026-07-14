<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">数据库概览</h1>
        <p class="text-gray-500 mt-1">监控数据库运行状态与关键指标</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">数据库状态</p>
            <div class="flex items-center mt-2">
              <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span class="text-lg font-bold text-gray-800">正常运行</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <Database class="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">数据库类型</p>
            <p class="text-lg font-bold text-gray-800 mt-2">PostgreSQL</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Server class="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">数据总量</p>
            <p class="text-lg font-bold text-gray-800 mt-2">2.4 GB</p>
          </div>
          <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <HardDrive class="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">表数量</p>
            <p class="text-lg font-bold text-gray-800 mt-2">12</p>
          </div>
          <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
            <Table class="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">数据库连接信息</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <span class="text-gray-500">主机地址</span>
            <span class="text-gray-800 font-medium">192.168.31.40</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <span class="text-gray-500">端口</span>
            <span class="text-gray-800 font-medium">5432</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <span class="text-gray-500">数据库名</span>
            <span class="text-gray-800 font-medium">duanduantong</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <span class="text-gray-500">用户名</span>
            <span class="text-gray-800 font-medium">postgres</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <span class="text-gray-500">连接数</span>
            <span class="text-gray-800 font-medium">15/100</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">数据表概览</h2>
        <div class="space-y-3">
          <div
            v-for="table in tables"
            :key="table.name"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <Table class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-sm font-medium text-gray-800">{{ table.name }}</p>
                <p class="text-xs text-gray-500">{{ table.rows.toLocaleString() }} 行数据</p>
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">{{ table.size }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Database, Server, HardDrive, Table } from 'lucide-vue-next'

const tables = ref([
  { name: 'projects', rows: 100, size: '156 KB' },
  { name: 'routes', rows: 500, size: '782 KB' },
  { name: 'credentials', rows: 80, size: '45 KB' },
  { name: 'transformers', rows: 120, size: '234 KB' },
  { name: 'project_members', rows: 350, size: '189 KB' },
  { name: 'users', rows: 200, size: '98 KB' }
])
</script>