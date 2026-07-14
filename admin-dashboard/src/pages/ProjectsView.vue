<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit3, Trash2, Eye, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useNotifications } from '@/utils/notification'
import type { Project } from '@/types'

const router = useRouter()
const { addNotification } = useNotifications()

const projects = ref<Project[]>([])
const isLoading = ref(true)
const showModal = ref(false)

const form = ref({
  name: '',
  description: ''
})

const loadProjects = async () => {
  isLoading.value = true
  try {
    projects.value = await api.projects.getAll()
  } catch (error) {
    projects.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreate = async () => {
  if (!form.value.name) {
    addNotification('warning', '警告', '请输入项目名称')
    return
  }
  
  try {
    await api.projects.create(form.value)
    addNotification('success', '成功', '项目创建成功')
    showModal.value = false
    form.value = { name: '', description: '' }
    await loadProjects()
  } catch {
    addNotification('error', '错误', '创建失败')
  }
}

const handleDelete = async (id: string, name: string) => {
  if (!confirm(`确定要删除项目 "${name}" 吗？此操作不可撤销。`)) return
  
  try {
    await api.projects.delete(id)
    addNotification('success', '成功', '项目已删除')
    await loadProjects()
  } catch {
    addNotification('error', '错误', '删除失败')
  }
}

const goToRoutes = (projectId: string) => {
  router.push(`/projects/${projectId}/routes`)
}

onMounted(loadProjects)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text-main">项目管理</h1>
        <p class="text-text-secondary mt-1">管理网关的项目资源隔离</p>
      </div>
      <button 
        class="btn btn-primary" 
        @click="showModal = true"
      >
        <Plus class="w-5 h-5" />
        新建项目
      </button>
    </div>
    
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="card p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
        @click="goToRoutes(project.id)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <span class="text-primary text-xl font-bold">{{ project.name.charAt(0) }}</span>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              class="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-main"
              @click.stop
            >
              <Edit3 class="w-4 h-4" />
            </button>
            <button 
              class="p-2 rounded-lg hover:bg-danger/20 text-text-secondary hover:text-danger"
              @click.stop="handleDelete(project.id, project.name)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h3 class="text-lg font-semibold text-text-main mb-1">{{ project.name }}</h3>
        <p class="text-sm text-text-muted mb-4 line-clamp-2">{{ project.description || '暂无描述' }}</p>
        
        <div class="flex items-center justify-between text-sm">
          <span class="text-text-muted">{{ project.created_at.split('T')[0] }}</span>
          <button class="flex items-center gap-1 text-primary hover:text-primary/80">
            <Eye class="w-4 h-4" />
            查看路由
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!isLoading && projects.length === 0" class="card p-12 text-center">
      <div class="w-16 h-16 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
        <Plus class="w-8 h-8 text-text-muted" />
      </div>
      <h3 class="text-lg font-semibold text-text-main mb-2">暂无项目</h3>
      <p class="text-text-secondary mb-6">创建第一个项目开始使用网关</p>
      <button class="btn btn-primary" @click="showModal = true">
        <Plus class="w-5 h-5" />
        新建项目
      </button>
    </div>
    
    <Transition name="modal">
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showModal = false"
      >
        <div class="card p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold text-text-main mb-4">新建项目</h3>
          <form @submit.prevent="handleCreate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">项目名称</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="输入项目名称"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">项目描述</label>
              <textarea
                v-model="form.description"
                placeholder="输入项目描述（可选）"
                class="input"
                rows="3"
              ></textarea>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn btn-secondary flex-1" @click="showModal = false">取消</button>
              <button type="submit" class="btn btn-primary flex-1">创建</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
