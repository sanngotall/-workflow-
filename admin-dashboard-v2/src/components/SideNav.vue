<template>
  <aside
    class="bg-sidebar-bg text-white flex flex-col transition-all duration-300"
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
          <li v-for="item in appStore.currentSideNavList" :key="item.id">
            <router-link
              :to="item.path || ''"
              @click="appStore.setSideNav(item.id)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
              :class="[
                appStore.currentSideNav === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
              ]"
            >
              <component
                :is="getIcon(item.icon)"
                class="w-5 h-5 flex-shrink-0"
              />
              <span
                v-if="!appStore.sidebarCollapsed"
                class="text-sm font-medium truncate"
              >
                {{ item.label }}
              </span>
              <div
                v-if="appStore.currentSideNav === item.id && !appStore.sidebarCollapsed"
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
        <component
          :is="appStore.sidebarCollapsed ? ChevronRight : ChevronLeft"
          class="w-5 h-5"
        />
        <span v-if="!appStore.sidebarCollapsed" class="text-sm">收起</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  PieChart,
  Activity,
  FileText,
  BarChart3,
  List,
  Plus,
  Layers,
  Gauge,
  KeyRound,
  PlusCircle,
  ShieldCheck,
  GitBranch,
  GitMerge,
  Folder,
  FolderPlus,
  Users,
  Settings,
  Lock,
  Bell,
  Info
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const iconMap: Record<string, unknown> = {
  PieChart,
  Activity,
  FileText,
  BarChart3,
  List,
  Plus,
  Layers,
  Gauge,
  KeyRound,
  PlusCircle,
  ShieldCheck,
  GitBranch,
  GitMerge,
  Folder,
  FolderPlus,
  Users,
  Settings,
  Lock,
  Bell,
  Info
}

const getIcon = (iconName: string) => {
  return iconMap[iconName] || PieChart
}

const sectionLabels: Record<string, string> = {
  dashboard: '控制台',
  routes: '路由管理',
  credentials: '凭证管理',
  transformers: '转换器',
  projects: '项目管理',
  settings: '系统设置'
}

const currentSectionLabel = computed(() => {
  return sectionLabels[appStore.currentTopNav] || ''
})
</script>
