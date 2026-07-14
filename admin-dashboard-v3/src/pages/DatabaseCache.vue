<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">缓存管理</h1>
        <p class="text-gray-500 mt-1">所有项目的临时缓存表（TTL 自动过期）</p>
      </div>
    </div>

    <!-- 顶部统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">缓存表总数</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ cacheTables.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">活跃缓存行数</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ totalRows.toLocaleString() }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">占用空间</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ formatMB(totalSize) }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">最近清理</p>
        <p class="text-3xl font-bold text-gray-800 mt-2 text-base">{{ lastCleanup }}</p>
      </div>
    </div>

    <!-- 缓存表列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">缓存表明细</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">缓存表</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">所属项目</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">TTL</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">行数</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">大小</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">最近写入</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in cacheTables" :key="t.id" class="hover:bg-gray-50">
              <td class="px-6 py-3">
                <div class="flex items-center gap-2">
                  <Clock class="w-4 h-4 text-amber-500" />
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ t.displayName }}</p>
                    <p class="text-xs text-gray-400 font-mono">{{ t.tableName }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-3 text-sm text-gray-600">{{ projectName(t.projectId) }}</td>
              <td class="px-6 py-3">
                <span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">{{ formatTTL(t.ttlSeconds) }}</span>
              </td>
              <td class="px-6 py-3 text-right text-sm text-gray-700">{{ t.rowCount.toLocaleString() }}</td>
              <td class="px-6 py-3 text-right text-sm text-gray-700">{{ formatMB(t.sizeMB) }}</td>
              <td class="px-6 py-3 text-sm text-gray-500">2026-06-27 11:15</td>
              <td class="px-6 py-3 text-right">
                <button
                  @click="$router.push(`/database/project/${t.projectId}/table/${t.id}`)"
                  class="text-xs text-primary-600 hover:text-primary-700 mr-3"
                >查看</button>
                <button
                  @click="clearCache(t.id)"
                  class="text-xs text-red-500 hover:text-red-600"
                >清空</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="cacheTables.length === 0" class="p-12 text-center">
        <Clock class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 text-sm">还没有缓存表</p>
        <p class="text-gray-400 text-xs mt-1">在项目存储管理里配置「临时缓存」类型的表即可</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const cacheTables = computed(() => appStore.businessTables.filter(t => t.storageType === 'cache'))
const totalRows = computed(() => cacheTables.value.reduce((s, t) => s + t.rowCount, 0))
const totalSize = computed(() => cacheTables.value.reduce((s, t) => s + t.sizeMB, 0))
const lastCleanup = '11:15:22'

const projectName = (id: string) => appStore.getProject(id)?.name || id

const formatMB = (mb: number) => {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
  return mb.toFixed(1) + ' MB'
}

const formatTTL = (s?: number) => {
  if (!s) return '-'
  if (s >= 3600) return (s / 3600) + 'h'
  if (s >= 60) return (s / 60) + 'min'
  return s + 's'
}

const clearCache = (tableId: string) => {
  if (!confirm('确认清空该缓存表的所有数据？')) return
  // mock 清空：把 rowCount 归零（实际数据还在 store 里，简化处理）
  const t = appStore.getBusinessTable(tableId)
  if (t) {
    // 清空行数据
    const rows = appStore.getTableRows(tableId)
    rows.splice(0, rows.length)
    appStore.updateBusinessTable(tableId, { rowCount: 0, sizeMB: 0 })
  }
}
</script>
