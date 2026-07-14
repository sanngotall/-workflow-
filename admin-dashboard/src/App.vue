<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotifications } from '@/utils/notification'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'

const { notifications, removeNotification } = useNotifications()
const authStore = useAuthStore()
const projectStore = useProjectStore()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await projectStore.loadProjects()
  }
})
</script>

<template>
  <router-view />
  
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="notification">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-[400px]"
        :class="{
          'bg-secondary/20 border border-secondary/50': n.type === 'success',
          'bg-danger/20 border border-danger/50': n.type === 'error',
          'bg-accent/20 border border-accent/50': n.type === 'warning',
          'bg-primary/20 border border-primary/50': n.type === 'info'
        }"
      >
        <button
          class="text-text-secondary hover:text-text-main transition-colors"
          @click="removeNotification(n.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
        <div class="flex-1">
          <div class="font-medium text-sm" :class="{
            'text-secondary': n.type === 'success',
            'text-danger': n.type === 'error',
            'text-accent': n.type === 'warning',
            'text-primary': n.type === 'info'
          }">
            {{ n.title }}
          </div>
          <div class="text-sm text-text-secondary mt-0.5">{{ n.message }}</div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
