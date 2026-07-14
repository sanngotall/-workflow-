<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">项目列表</h1>
        <p class="text-gray-500 mt-1">选择项目进入管理，或直接创建一条新的中转</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          新建项目
        </button>
        <button
          @click="appStore.openWizard()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Zap class="w-4 h-4" />
          快速新建中转
        </button>
      </div>
    </div>

    <!-- 快速 CTA 横幅 -->
    <div class="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white shadow-sm flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">4 步搞定一条中转</h2>
        <p class="text-primary-100 text-sm mt-1">选项目 → 选 n8n/dify → 填 URL + Key → 拿到接入代码直接复制</p>
      </div>
      <button
        @click="appStore.openWizard()"
        class="px-4 py-2 bg-white text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors"
      >
        立即开始
      </button>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索项目..."
          class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select
        v-model="statusFilter"
        class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="all">全部状态</option>
        <option value="active">运行中</option>
        <option value="paused">已暂停</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        @click="goToProject(project.id)"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer relative group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
              :class="project.color"
            >
              {{ project.name.charAt(0) }}
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{{ project.name }}</h3>
              <p class="text-xs text-gray-500">{{ project.id }}</p>
            </div>
          </div>
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="project.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
          >
            {{ project.status === 'active' ? '运行中' : '已暂停' }}
          </span>
        </div>

        <p class="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{{ project.description }}</p>

        <div class="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div>
            <p class="text-lg font-bold text-gray-800">{{ formatNumber(project.todayCalls) }}</p>
            <p class="text-xs text-gray-500">今日调用</p>
          </div>
          <div>
            <p class="text-lg font-bold" :class="project.errorRate > 1 ? 'text-orange-600' : 'text-gray-800'">{{ project.errorRate }}%</p>
            <p class="text-xs text-gray-500">错误率</p>
          </div>
          <div>
            <p class="text-lg font-bold text-gray-800">{{ project.activeTransits }}</p>
            <p class="text-xs text-gray-500">活跃中转</p>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>创建于 {{ project.createdAt }}</span>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{{ envLabels[project.environment] }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredProjects.length === 0" class="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
      <FolderOpen class="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p class="text-sm">没有匹配的项目</p>
    </div>

    <!-- 新建项目 Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeCreateModal"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">新建项目</h3>
          <button @click="closeCreateModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
            <input
              v-model="createForm.name"
              type="text"
              placeholder="请输入项目名称"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
            <textarea
              v-model="createForm.description"
              rows="3"
              placeholder="请输入项目描述"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            ></textarea>
          </div>
          <div v-if="createErrorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ createErrorMsg }}</div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="closeCreateModal"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="createProject"
            :disabled="creating"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {{ creating ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, X, Zap, FolderOpen } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import { listProjects, createProject as apiCreateProject, type Project as ApiProject } from '@/api/projects'

const appStore = useAppStore()
const router = useRouter()
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'paused'>('all')
const showCreateModal = ref(false)
const creating = ref(false)
const createErrorMsg = ref('')
const loading = ref(false)

const createForm = reactive({
  name: '',
  description: '',
})

// 项目卡片展示用的合并类型（后端字段 + 前端补全的统计字段）
interface ProjectCard {
  id: string
  name: string
  description: string
  color: string
  status: 'active' | 'paused'
  todayCalls: number
  errorRate: number
  activeTransits: number
  environment: 'development' | 'staging' | 'production'
  rateLimit: number
  createdAt: string
}

// 卡片颜色循环
const colorOptions = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-500 to-emerald-700',
  'bg-gradient-to-br from-purple-500 to-violet-700',
  'bg-gradient-to-br from-orange-500 to-red-700',
  'bg-gradient-to-br from-pink-500 to-rose-700',
  'bg-gradient-to-br from-cyan-500 to-blue-700',
]

const envLabels: Record<string, string> = {
  development: '开发环境',
  staging: '预发环境',
  production: '生产环境'
}

// 后端 Project → 前端 ProjectCard（补全统计字段为 0，后端暂无这些字段）
function toProjectCard(p: ApiProject, index: number): ProjectCard {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '暂无描述',
    color: colorOptions[index % colorOptions.length],
    status: 'active',
    todayCalls: 0,
    errorRate: 0,
    activeTransits: 0,
    environment: 'production',
    rateLimit: 1000,
    createdAt: (p.created_at || '').split('T')[0],
  }
}

const projects = ref<ProjectCard[]>([])

async function loadProjects() {
  loading.value = true
  try {
    const data = await listProjects()
    projects.value = data.map((p, i) => toProjectCard(p, i))
  } catch (e: any) {
    console.error('加载项目失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)

const filteredProjects = computed(() => {
  let list = projects.value
  if (statusFilter.value !== 'all') {
    list = list.filter(p => p.status === statusFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }
  return list
})

const goToProject = (id: string) => {
  router.push(`/projects/${id}`)
}

const openCreateModal = () => {
  createForm.name = ''
  createForm.description = ''
  createErrorMsg.value = ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

async function createProject() {
  if (!createForm.name.trim()) return
  creating.value = true
  createErrorMsg.value = ''
  try {
    const newProject = await apiCreateProject(createForm.name, createForm.description || undefined)
    projects.value.unshift(toProjectCard(newProject, 0))
    closeCreateModal()
  } catch (e: any) {
    createErrorMsg.value = e?.message || '创建失败'
  } finally {
    creating.value = false
  }
}

const formatNumber = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>
