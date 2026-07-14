<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 cursor-pointer" @click="goHome">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
          <Zap class="w-6 h-6 text-white" />
        </div>
        <span class="text-xl font-bold text-gray-800">端端通</span>
      </div>
      <div class="h-8 w-px bg-gray-200 mx-2"></div>
      <nav class="flex items-center gap-1">
        <button
          v-for="item in appStore.topNavItems"
          :key="item.id"
          @click="handleTopNavClick(item.id)"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
          :class="[
            appStore.currentTopNav === item.id
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component :is="getIcon(item.icon)" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <div class="flex items-center gap-4">
      <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <Settings class="w-5 h-5" />
      </button>

      <div class="h-8 w-px bg-gray-200"></div>

      <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
        <div class="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <User class="w-5 h-5 text-white" />
        </div>
        <div class="text-left">
          <p class="text-sm font-medium text-gray-800">管理员</p>
          <p class="text-xs text-gray-500">admin@duanduantong.com</p>
        </div>
        <ChevronDown class="w-4 h-4 text-gray-400" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Zap, Bell, Settings, User, ChevronDown, LayoutDashboard, Route, Key, GitBranch, FolderOpen } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

const iconMap: Record<string, unknown> = {
  LayoutDashboard,
  Route,
  Key,
  GitBranch,
  FolderOpen,
  Settings
}

const getIcon = (iconName: string) => {
  return iconMap[iconName] || LayoutDashboard
}

const handleTopNavClick = (id: string) => {
  appStore.setTopNav(id)
  const sideItems = appStore.sideNavItems[id]
  if (sideItems && sideItems.length > 0) {
    router.push(sideItems[0].path || '/')
  }
}

const goHome = () => {
  appStore.setTopNav('dashboard')
  router.push('/dashboard/overview')
}
</script>
