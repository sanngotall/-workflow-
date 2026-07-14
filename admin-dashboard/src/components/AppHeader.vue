<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Search, User, LogOut, Menu, ChevronDown } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
  showUserMenu.value = false
}
</script>

<template>
  <header class="h-16 bg-bg-card border-b border-bg-hover flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="搜索路由、项目..."
          class="w-64 pl-10 pr-4 py-2 bg-bg-sidebar border border-bg-hover rounded-lg text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <button class="relative p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-main transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
      </button>
      
      <button
        class="relative flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-hover text-text-main transition-colors"
        @click="showUserMenu = !showUserMenu"
      >
        <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <User class="w-4 h-4 text-primary" />
        </div>
        <span class="text-sm font-medium">管理员</span>
        <ChevronDown class="w-4 h-4 text-text-secondary" />
      </button>
    </div>
    
    <Transition name="dropdown">
      <div
        v-if="showUserMenu"
        class="absolute right-6 top-16 w-48 bg-bg-card border border-bg-hover rounded-lg shadow-xl py-2 z-50"
      >
        <button
          class="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-bg-hover hover:text-text-main transition-colors"
          @click="logout"
        >
          <LogOut class="w-4 h-4 inline-block mr-2" />
          退出登录
        </button>
      </div>
    </Transition>
    
    <button class="lg:hidden p-2 rounded-lg hover:bg-bg-hover text-text-secondary">
      <Menu class="w-5 h-5" />
    </button>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
