<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">备份与迁移</h1>
        <p class="text-gray-500 mt-1">业务数据表的备份策略、手动备份与表结构变更历史</p>
      </div>
      <button
        @click="openBackupModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        立即备份
      </button>
    </div>

    <!-- 顶部统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">备份总数</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ backups.length }}</p>
        <p class="text-xs text-gray-400 mt-1">最近 30 天</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">自动备份表</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ autoBackupCount }}</p>
        <p class="text-xs text-gray-400 mt-1">共 {{ persistentCount }} 张长期表</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">备份总大小</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ formatMB(totalBackupSize) }}</p>
        <p class="text-xs text-gray-400 mt-1">压缩后</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">迁移记录</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ migrations.length }}</p>
        <p class="text-xs text-gray-400 mt-1">表结构变更</p>
      </div>
    </div>

    <!-- 双栏 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左：备份历史 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">备份历史</h2>
        </div>
        <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <div
            v-for="b in backups"
            :key="b.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center"
                  :class="b.success ? 'bg-green-100' : 'bg-red-100'"
                >
                  <Archive class="w-4 h-4" :class="b.success ? 'text-green-600' : 'text-red-600'" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ b.tableName }}</p>
                  <p class="text-xs text-gray-500">{{ b.projectName }} · {{ b.time }}</p>
                </div>
              </div>
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="b.type === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
              >
                {{ b.type === 'auto' ? '自动' : '手动' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <span class="text-gray-500">{{ formatMB(b.size) }}</span>
                <span
                  v-if="b.success"
                  class="text-green-600 flex items-center gap-1"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  成功
                </span>
                <span
                  v-else
                  class="text-red-600 flex items-center gap-1"
                >
                  <AlertTriangle class="w-3 h-3" />
                  失败
                </span>
              </div>
              <div v-if="b.success" class="flex items-center gap-2">
                <button class="text-gray-500 hover:text-gray-700">下载</button>
                <button class="text-primary-600 hover:text-primary-700">恢复</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：迁移记录 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">表结构变更（Migration）</h2>
        </div>
        <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <div
            v-for="m in migrations"
            :key="m.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center"
                  :class="migrationBgClass(m.action)"
                >
                  <component :is="migrationIcon(m.action)" class="w-4 h-4" :class="migrationIconClass(m.action)" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800 font-mono">{{ m.id }}</p>
                  <p class="text-xs text-gray-500">{{ m.tableName }} · {{ m.time }}</p>
                </div>
              </div>
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="m.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ m.success ? '已执行' : '已回滚' }}
              </span>
            </div>
            <div class="ml-12 bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-100 overflow-x-auto">
              <div v-for="(line, i) in m.statements" :key="i" class="whitespace-pre">{{ line }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 备份策略 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">备份策略（长期存储表）</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">表名</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">所属项目</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">频率</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">保留</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">下次执行</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in persistentTables" :key="t.id" class="hover:bg-gray-50">
              <td class="px-6 py-3 text-sm font-medium text-gray-800">{{ t.displayName }}</td>
              <td class="px-6 py-3 text-sm text-gray-600">{{ projectName(t.projectId) }}</td>
              <td class="px-6 py-3 text-sm text-gray-600">每日 03:00</td>
              <td class="px-6 py-3 text-sm text-gray-600">保留 30 天</td>
              <td class="px-6 py-3 text-sm text-gray-600">2026-06-28 03:00</td>
              <td class="px-6 py-3">
                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">已启用</span>
              </td>
              <td class="px-6 py-3 text-right">
                <button class="text-xs text-primary-600 hover:text-primary-700">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 立即备份 Modal -->
    <div
      v-if="showBackupModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="showBackupModal = false"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">立即备份</h3>
          <button @click="showBackupModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择数据表</label>
            <select v-model="backupForm.tableId" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">请选择...</option>
              <option v-for="t in persistentTables" :key="t.id" :value="t.id">{{ t.displayName }}（{{ projectName(t.projectId) }}）</option>
            </select>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-800">压缩</p>
              <p class="text-xs text-gray-500">使用 gzip 压缩减小体积</p>
            </div>
            <button class="relative w-12 h-6 rounded-full transition-colors" :class="backupForm.compress ? 'bg-primary-600' : 'bg-gray-300'" @click="backupForm.compress = !backupForm.compress">
              <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="backupForm.compress ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
          <p class="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <Info class="w-3.5 h-3.5 inline mr-1" />
            备份将通过 pg_dump 完成该表的逻辑备份
          </p>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button @click="showBackupModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
          <button
            @click="doBackup"
            :disabled="!backupForm.tableId"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >开始备份</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, X, Archive, CheckCircle2, AlertTriangle, Info, Table as TableIcon, FilePlus, FileMinus, Pencil } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const showBackupModal = ref(false)
const backupForm = ref({ tableId: '', compress: true })

const persistentTables = computed(() => appStore.businessTables.filter(t => t.storageType === 'persistent'))
const persistentCount = computed(() => persistentTables.value.length)
const autoBackupCount = computed(() => persistentTables.value.length) // mock：所有长期表默认开启自动备份

const projectName = (id: string) => appStore.getProject(id)?.name || id

interface BackupRecord {
  id: number
  tableName: string
  projectName: string
  time: string
  size: number
  type: 'auto' | 'manual'
  success: boolean
}

const backups = ref<BackupRecord[]>([
  { id: 1, tableName: '对话记录', projectName: '电商平台', time: '2026-06-27 03:00:12', size: 412, type: 'auto', success: true },
  { id: 2, tableName: '客户对话', projectName: 'CRM 系统', time: '2026-06-27 03:00:08', size: 156, type: 'auto', success: true },
  { id: 3, tableName: '对话记录', projectName: '电商平台', time: '2026-06-26 14:23:45', size: 408, type: 'manual', success: true },
  { id: 4, tableName: '客户对话', projectName: 'CRM 系统', time: '2026-06-26 03:00:15', size: 148, type: 'auto', success: false }
])

const totalBackupSize = computed(() => backups.value.reduce((s, b) => s + (b.success ? b.size : 0), 0))

interface MigrationRecord {
  id: string
  tableName: string
  time: string
  action: 'create' | 'alter' | 'drop'
  success: boolean
  statements: string[]
}

const migrations = ref<MigrationRecord[]>([
  {
    id: '20260627_add_user_avatar',
    tableName: 'proj001_chat_logs', time: '2026-06-27 10:23', action: 'alter', success: true,
    statements: ['ALTER TABLE proj001_chat_logs ADD COLUMN model VARCHAR(64);']
  },
  {
    id: '20260625_create_session_cache',
    tableName: 'proj001_session_cache', time: '2026-06-25 15:08', action: 'create', success: true,
    statements: ['CREATE TABLE proj001_session_cache (', '  id VARCHAR(64) PRIMARY KEY,', '  user_id VARCHAR(64) NOT NULL,', '  context JSONB,', '  last_active TIMESTAMP NOT NULL', ');']
  }
])

const formatMB = (mb: number) => {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
  return mb + ' MB'
}

const migrationIcon = (action: string) => ({
  create: FilePlus, alter: Pencil, drop: FileMinus
}[action] || TableIcon)
const migrationBgClass = (action: string) => ({
  create: 'bg-green-100', alter: 'bg-amber-100', drop: 'bg-red-100'
}[action] || 'bg-gray-100')
const migrationIconClass = (action: string) => ({
  create: 'text-green-600', alter: 'text-amber-600', drop: 'text-red-600'
}[action] || 'text-gray-600')

const openBackupModal = () => { showBackupModal.value = true }

const doBackup = () => {
  const t = persistentTables.value.find(x => x.id === backupForm.value.tableId)
  if (!t) return
  backups.value.unshift({
    id: backups.value.length + 1,
    tableName: t.displayName,
    projectName: projectName(t.projectId),
    time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    size: Math.floor(Math.random() * 500) + 100,
    type: 'manual',
    success: true
  })
  showBackupModal.value = false
  backupForm.value = { tableId: '', compress: true }
}
</script>
