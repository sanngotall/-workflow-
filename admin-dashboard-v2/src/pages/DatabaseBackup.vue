<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">备份恢复</h1>
        <p class="text-gray-500 mt-1">管理数据库备份和恢复操作</p>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <Plus class="w-4 h-4 inline mr-2" />
        新建备份
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800">备份列表</h2>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="backup in backups"
            :key="backup.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="backup.status === 'success' ? 'bg-green-50' : backup.status === 'running' ? 'bg-blue-50' : 'bg-red-50'"
                >
                  <HardDrive
                    class="w-5 h-5"
                    :class="backup.status === 'success' ? 'text-green-500' : backup.status === 'running' ? 'text-blue-500' : 'text-red-500'"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ backup.name }}</p>
                  <p class="text-xs text-gray-500">{{ backup.createdAt }} · {{ backup.size }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="text-xs px-2 py-1 rounded"
                  :class="backup.status === 'success' ? 'bg-green-100 text-green-600' : backup.status === 'running' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'"
                >
                  {{ backup.status === 'success' ? '成功' : backup.status === 'running' ? '运行中' : '失败' }}
                </span>
                <div class="flex items-center gap-2">
                  <button
                    @click="restoreBackup(backup)"
                    class="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw class="w-3.5 h-3.5" />
                    恢复
                  </button>
                  <button class="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1">
                    <Download class="w-3.5 h-3.5" />
                    下载
                  </button>
                  <button class="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-1">
                    <Trash2 class="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-500">显示 1-6 条，共 6 条</p>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">上一页</button>
            <button class="px-3 py-1 text-sm bg-primary-600 text-white rounded">1</button>
            <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">下一页</button>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">备份设置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">自动备份</label>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">开启自动备份</span>
                <button
                  @click="autoBackupEnabled = !autoBackupEnabled"
                  class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors"
                  :class="autoBackupEnabled ? 'bg-primary-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                    :class="autoBackupEnabled ? 'translate-x-6' : 'translate-x-0.5'"
                  ></span>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">备份频率</label>
              <select class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>每日</option>
                <option>每周</option>
                <option>每月</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">备份保留天数</label>
              <select class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>7 天</option>
                <option>14 天</option>
                <option>30 天</option>
                <option>90 天</option>
              </select>
            </div>
            <button class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              保存设置
            </button>
          </div>
        </div>

        <div class="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 class="text-sm font-medium text-blue-800">备份注意事项</h4>
              <ul class="text-xs text-blue-600 mt-2 space-y-1">
                <li>• 备份前请确保数据库处于稳定状态</li>
                <li>• 恢复操作将覆盖现有数据，请谨慎执行</li>
                <li>• 建议定期下载备份文件到本地存储</li>
                <li>• 自动备份会在凌晨 2 点执行</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, HardDrive, RefreshCw, Download, Trash2, Info } from 'lucide-vue-next'

const autoBackupEnabled = ref(true)

const backups = ref([
  { id: 1, name: '自动备份 - 2024-01-15', size: '2.4 GB', status: 'success', createdAt: '2024-01-15 02:00:00' },
  { id: 2, name: '手动备份 - 2024-01-14', size: '2.3 GB', status: 'success', createdAt: '2024-01-14 15:30:00' },
  { id: 3, name: '自动备份 - 2024-01-13', size: '2.2 GB', status: 'success', createdAt: '2024-01-13 02:00:00' },
  { id: 4, name: '自动备份 - 2024-01-12', size: '2.1 GB', status: 'success', createdAt: '2024-01-12 02:00:00' },
  { id: 5, name: '全量备份 - 2024-01-10', size: '5.2 GB', status: 'success', createdAt: '2024-01-10 10:00:00' },
  { id: 6, name: '自动备份 - 2024-01-09', size: '2.0 GB', status: 'failed', createdAt: '2024-01-09 02:00:00' }
])

const restoreBackup = (backup: typeof backups.value[0]) => {
  if (confirm(`确定要从备份 "${backup.name}" 恢复数据吗？这将覆盖现有数据！`)) {
    alert('恢复操作已执行')
  }
}
</script>