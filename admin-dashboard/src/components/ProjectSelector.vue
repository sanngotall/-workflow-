<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Plus, Search } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'

const projectStore = useProjectStore()

const showDropdown = ref(false)
const searchQuery = ref('')

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projectStore.projects
  return projectStore.projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectProject = (projectId: string) => {
  projectStore.setCurrentProject(projectId)
  showDropdown.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div class="relative">
    <button
      class="w-full flex items-center justify-between px-3 py-2.5 bg-bg-sidebar border border-bg-hover rounded-lg text-left hover:border-primary/50 transition-colors"
      @click="showDropdown = !showDropdown"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
          <span class="text-primary text-sm font-bold">
            {{ projectStore.currentProject?.name.charAt(0) || 'P' }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-text-main truncate">
            {{ projectStore.currentProject?.name || '请选择项目' }}
          </div>
          <div class="text-xs text-text-muted">
            {{ projectStore.currentProject?.id?.slice(0, 8) || 'No Project' }}
          </div>
        </div>
      </div>
      <ChevronDown 
        class="w-4 h-4 text-text-secondary transition-transform" 
        :class="{ 'rotate-180': showDropdown }"
      />
    </button>
    
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-bg-hover rounded-lg shadow-xl py-2 z-50 max-h-64 overflow-hidden flex flex-col"
      >
        <div class="p-2 border-b border-bg-hover">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索项目..."
              class="w-full pl-8 pr-3 py-1.5 bg-bg-sidebar border border-bg-hover rounded-md text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="project in filteredProjects"
            :key="project.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-bg-hover transition-colors"
            :class="{ 'bg-primary/10': project.id === projectStore.currentProjectId }"
            @click="selectProject(project.id)"
          >
            <div 
              class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              :class="project.id === projectStore.currentProjectId ? 'bg-primary/20 text-primary' : 'bg-bg-hover text-text-secondary'"
            >
              {{ project.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-text-main truncate">{{ project.name }}</div>
              <div class="text-xs text-text-muted">{{ project.id.slice(0, 8) }}</div>
            </div>
          </button>
          
          <div v-if="filteredProjects.length === 0" class="px-3 py-8 text-center text-text-muted text-sm">
            {{ searchQuery ? '未找到匹配的项目' : '暂无项目' }}
          </div>
        </div>
        
        <div class="p-2 border-t border-bg-hover">
          <button class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            <Plus class="w-4 h-4" />
            新建项目
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
