<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useProjectStore } from '@/stores/project'

const projectStore = useProjectStore()

const isLoading = ref(true)

onMounted(async () => {
  if (!projectStore.projects.length) {
    await projectStore.loadProjects()
  }
  isLoading.value = false
})

onUnmounted(() => {})
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen bg-bg-main">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-text-secondary">加载中...</span>
    </div>
  </div>
  
  <div v-else class="flex h-screen bg-bg-main overflow-hidden">
    <AppSidebar />
    
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader />
      
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
