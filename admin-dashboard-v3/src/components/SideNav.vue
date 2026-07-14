<template>
  <aside
    class="bg-sidebar-bg text-white flex flex-col transition-all duration-300 fixed left-0 top-16 bottom-0 z-40"
    :class="appStore.sidebarCollapsed ? 'w-16' : 'w-60'"
  >
    <nav class="flex-1 py-4 overflow-y-auto">
      <div class="px-3">
        <p
          v-if="!appStore.sidebarCollapsed"
          class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2"
        >
          {{ currentSectionLabel }}
        </p>
        <ul class="space-y-1">
          <li v-for="item in currentSideItems" :key="item.id">
            <router-link
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
              :class="[
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span
                v-if="!appStore.sidebarCollapsed"
                class="text-sm font-medium truncate"
              >
                {{ item.label }}
              </span>
              <div
                v-if="isActive(item.path) && !appStore.sidebarCollapsed"
                class="ml-auto w-1.5 h-1.5 bg-white rounded-full"
              ></div>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div class="p-3 border-t border-gray-700">
      <button
        @click="appStore.toggleSidebar"
        class="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-sidebar-hover hover:text-white transition-all"
        :title="appStore.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <component :is="appStore.sidebarCollapsed ? ChevronRight : ChevronLeft" class="w-5 h-5" />
        <span v-if="!appStore.sidebarCollapsed" class="text-sm">收起</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChevronLeft, ChevronRight, FolderOpen,
  LayoutDashboard, BarChart3, Radio, FileText,
  Clock, Archive,
  ShieldCheck, Gauge, Layers
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()

const sections: Record<string, { id: string; label: string; path: string; icon: ReturnType<typeof markRaw> }[]> = {
  dashboard: [
    { id: 'dash-overview', label: '控制台概览', path: '/dashboard/overview', icon: markRaw(LayoutDashboard) },
    { id: 'dash-analytics', label: '数据分析', path: '/dashboard/analytics', icon: markRaw(BarChart3) },
    { id: 'dash-realtime', label: '实时监控', path: '/dashboard/realtime', icon: markRaw(Radio) },
    { id: 'dash-logs', label: '访问日志', path: '/dashboard/logs', icon: markRaw(FileText) }
  ],
  projects: [
    { id: 'projects-list', label: '项目列表', path: '/projects', icon: markRaw(FolderOpen) }
  ],
  database: [
    { id: 'db-projects', label: '项目数据库', path: '/database', icon: markRaw(FolderOpen) },
    { id: 'db-cache', label: '缓存管理', path: '/database/cache', icon: markRaw(Clock) },
    { id: 'db-backup', label: '备份与迁移', path: '/database/backup', icon: markRaw(Archive) }
  ],
  advanced: [
    { id: 'adv-credentials', label: '凭证审计日志', path: '/advanced/credentials', icon: markRaw(ShieldCheck) },
    { id: 'adv-templates', label: '转换器模板库', path: '/advanced/templates', icon: markRaw(FileText) },
    { id: 'adv-ratelimit', label: '全局限流规则', path: '/advanced/ratelimit', icon: markRaw(Gauge) },
    { id: 'adv-groups', label: '路由分组', path: '/advanced/groups', icon: markRaw(Layers) }
  ]
}

const currentSideItems = computed(() => {
  return sections[appStore.currentTopNav] || sections.dashboard
})

const currentSectionLabel = computed(() => {
  const labels: Record<string, string> = {
    dashboard: '控制台',
    projects: '项目管理',
    database: '数据库',
    advanced: '高级配置'
  }
  return labels[appStore.currentTopNav] || ''
})

const isActive = (path: string) => {
  // 项目数据库子路径（/database/project/...）也算「项目数据库」高亮
  if (path === '/database') {
    return route.path === '/database' || route.path.startsWith('/database/project')
  }
  return route.path === path
}
</script>
