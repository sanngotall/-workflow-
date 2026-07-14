<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">项目列表</h1>
        <p class="text-gray-500 mt-1">管理所有网关项目和配置</p>
      </div>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <Plus class="w-4 h-4 inline mr-2" />
        新建项目
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
      <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option>全部状态</option>
        <option>运行中</option>
        <option>已暂停</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
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

        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ project.description }}</p>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <p class="text-lg font-bold text-gray-800">{{ project.routes }}</p>
            <p class="text-xs text-gray-500">路由</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-gray-800">{{ project.transformers }}</p>
            <p class="text-xs text-gray-500">转换器</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-gray-800">{{ project.members }}</p>
            <p class="text-xs text-gray-500">成员</p>
          </div>
        </div>

        <div class="flex items-start gap-4 mb-4">
          <div
            v-for="(member, index) in project.avatars"
            :key="index"
            class="flex flex-col items-center gap-1"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
              :class="member.color"
            >
              {{ member.letter }}
            </div>
            <span class="text-xs text-gray-500 whitespace-nowrap">{{ member.role }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
          <span>创建于 {{ project.createdAt }}</span>
          <div class="relative">
            <button
              @click.stop="toggleMenu(project.id)"
              class="p-1 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal class="w-5 h-5" />
            </button>
            <div
              v-if="activeMenuId === project.id"
              class="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
            >
              <button
                @click.stop="openEditModal(project)"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Pencil class="w-4 h-4" />
                编辑
              </button>
              <button
                @click.stop="openMemberModal(project)"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Users class="w-4 h-4" />
                成员管理
              </button>
              <button
                @click.stop="deleteProject(project.id)"
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 class="w-4 h-4" />
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeCreateModal"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeCreateModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">新建项目</h3>
          <button @click="closeCreateModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
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
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">默认限流 (QPS)</label>
                <input
                  v-model="createForm.rateLimit"
                  type="number"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">环境</label>
                <select
                  v-model="createForm.environment"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="development">开发环境</option>
                  <option value="staging">预发环境</option>
                  <option value="production">生产环境</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-800">启用项目</p>
                <p class="text-xs text-gray-500">创建后立即启用此项目</p>
              </div>
              <button
                type="button"
                @click="createForm.enabled = !createForm.enabled"
                class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
                :class="createForm.enabled ? 'bg-primary-600' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                  :class="createForm.enabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
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
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showMemberModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeMemberModal"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeMemberModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">成员管理</h3>
          <button @click="closeMemberModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-600">当前项目成员</p>
            <button
              @click="openAddMemberModal"
              class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors flex items-center gap-1"
            >
              <UserPlus class="w-3.5 h-3.5" />
              添加成员
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(member, index) in memberForm.members"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
                  :class="member.color"
                >
                  {{ member.letter }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ member.name }}</p>
                  <p class="text-xs text-gray-500">{{ member.role }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <select
                  v-model="member.role"
                  :disabled="member.role === '管理员'"
                  class="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  <option value="管理员" disabled>管理员</option>
                  <option value="开发">开发</option>
                  <option value="运维">运维</option>
                  <option value="测试">测试</option>
                  <option value="运营">运营</option>
                  <option value="分析师">分析师</option>
                  <option value="编辑">编辑</option>
                  <option value="架构师">架构师</option>
                </select>
                <button
                  v-if="member.role !== '管理员'"
                  @click="removeMember(index)"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="closeMemberModal"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="saveMembers"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showAddMemberModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeAddMemberModal"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeAddMemberModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">添加成员</h3>
          <button @click="closeAddMemberModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-4 border-b border-gray-100">
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="addMemberSearch"
              type="text"
              placeholder="搜索用户..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div class="p-4 overflow-y-auto flex-1 space-y-2">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            @click="selectUser(user)"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
                :class="user.avatarColor"
              >
                {{ user.name.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ user.name }}</p>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
              </div>
            </div>
            <div
              v-if="isUserSelected(user.id)"
              class="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center"
            >
              <Check class="w-3 h-3 text-white" />
            </div>
          </div>
          <p v-if="filteredUsers.length === 0" class="text-center text-sm text-gray-400 py-8">
            暂无匹配的用户
          </p>
        </div>
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p class="text-xs text-gray-500">已选择 {{ selectedUserIds.length }} 人</p>
          <div class="flex items-center gap-2">
            <button
              @click="closeAddMemberModal"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmAddMembers"
              :disabled="selectedUserIds.length === 0"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeEditModal"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeEditModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">编辑项目</h3>
          <button @click="closeEditModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
              <input
                v-model="editForm.name"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">默认限流 (QPS)</label>
                <input
                  v-model="editForm.rateLimit"
                  type="number"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">环境</label>
                <select
                  v-model="editForm.environment"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="development">开发环境</option>
                  <option value="staging">预发环境</option>
                  <option value="production">生产环境</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-800">启用项目</p>
                <p class="text-xs text-gray-500">创建后立即启用此项目</p>
              </div>
              <button
                type="button"
                @click="editForm.enabled = !editForm.enabled"
                class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
                :class="editForm.enabled ? 'bg-primary-600' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                  :class="editForm.enabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="closeEditModal"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="saveEdit"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, X, Users, UserPlus, Check } from 'lucide-vue-next'

interface Project {
  id: string
  name: string
  description: string
  status: string
  color: string
  routes: number
  transformers: number
  members: number
  avatars: { letter: string; name: string; color: string; role: string }[]
  createdAt: string
}

interface UserItem {
  id: number
  name: string
  email: string
  avatarColor: string
}

const searchQuery = ref('')
const activeMenuId = ref<string | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showMemberModal = ref(false)
const showAddMemberModal = ref(false)
const editingProjectId = ref<string | null>(null)
const memberProjectId = ref<string | null>(null)
const addMemberSearch = ref('')
const selectedUserIds = ref<number[]>([])

const createForm = reactive({
  name: '',
  description: '',
  rateLimit: 1000,
  environment: 'production',
  enabled: true
})

const memberForm = reactive({
  members: [] as { letter: string; name: string; color: string; role: string }[]
})

const editForm = reactive({
  name: '',
  description: '',
  rateLimit: 1000,
  environment: 'production',
  enabled: true
})

const allUsers = ref<UserItem[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', avatarColor: 'bg-blue-500' },
  { id: 2, name: '李四', email: 'lisi@example.com', avatarColor: 'bg-green-500' },
  { id: 3, name: '王五', email: 'wangwu@example.com', avatarColor: 'bg-purple-500' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', avatarColor: 'bg-orange-500' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', avatarColor: 'bg-pink-500' },
  { id: 6, name: '孙八', email: 'sunba@example.com', avatarColor: 'bg-teal-500' },
  { id: 7, name: '周九', email: 'zhoujiu@example.com', avatarColor: 'bg-indigo-500' },
  { id: 8, name: '吴十', email: 'wushi@example.com', avatarColor: 'bg-amber-500' },
  { id: 9, name: '郑十一', email: 'zheng11@example.com', avatarColor: 'bg-rose-500' },
  { id: 10, name: '冯十二', email: 'feng12@example.com', avatarColor: 'bg-cyan-500' }
])

const filteredUsers = computed(() => {
  if (!addMemberSearch.value) return allUsers.value
  const query = addMemberSearch.value.toLowerCase()
  return allUsers.value.filter(
    u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
  )
})

const projects = ref<Project[]>([
  {
    id: 'proj_001',
    name: '电商平台',
    description: '电商平台核心网关服务，包含用户、订单、商品等接口',
    status: 'active',
    color: 'bg-gradient-to-br from-blue-500 to-blue-700',
    routes: 24,
    transformers: 8,
    members: 5,
    avatars: [
      { letter: '张', name: '张三', color: 'bg-blue-500', role: '管理员' },
      { letter: '李', name: '李四', color: 'bg-green-500', role: '开发' },
      { letter: '王', name: '王五', color: 'bg-purple-500', role: '运维' }
    ],
    createdAt: '2024-01-10'
  },
  {
    id: 'proj_002',
    name: 'CRM 系统',
    description: '客户关系管理系统 API 网关，集成 Dify 智能客服',
    status: 'active',
    color: 'bg-gradient-to-br from-green-500 to-emerald-700',
    routes: 18,
    transformers: 12,
    members: 3,
    avatars: [
      { letter: '赵', name: '赵六', color: 'bg-orange-500', role: '管理员' },
      { letter: '钱', name: '钱七', color: 'bg-pink-500', role: '运营' }
    ],
    createdAt: '2024-01-05'
  },
  {
    id: 'proj_003',
    name: '数据分析',
    description: '数据分析平台 API 网关，对接 n8n 工作流',
    status: 'paused',
    color: 'bg-gradient-to-br from-purple-500 to-violet-700',
    routes: 12,
    transformers: 6,
    members: 2,
    avatars: [
      { letter: '孙', name: '孙八', color: 'bg-yellow-500', role: '管理员' },
      { letter: '周', name: '周九', color: 'bg-teal-500', role: '分析师' }
    ],
    createdAt: '2023-12-20'
  },
  {
    id: 'proj_004',
    name: '支付服务',
    description: '支付网关服务，支持多渠道支付和回调处理',
    status: 'active',
    color: 'bg-gradient-to-br from-orange-500 to-red-700',
    routes: 8,
    transformers: 4,
    members: 4,
    avatars: [
      { letter: '吴', name: '吴十', color: 'bg-red-500', role: '管理员' },
      { letter: '郑', name: '郑十一', color: 'bg-indigo-500', role: '开发' },
      { letter: '冯', name: '冯十二', color: 'bg-cyan-500', role: '测试' },
      { letter: '陈', name: '陈', color: 'bg-amber-500', role: '运维' }
    ],
    createdAt: '2024-01-12'
  },
  {
    id: 'proj_005',
    name: '内容管理',
    description: 'CMS 内容管理系统 API 网关',
    status: 'active',
    color: 'bg-gradient-to-br from-pink-500 to-rose-700',
    routes: 15,
    transformers: 5,
    members: 2,
    avatars: [
      { letter: '林', name: '林', color: 'bg-pink-500', role: '管理员' },
      { letter: '黄', name: '黄', color: 'bg-lime-500', role: '编辑' }
    ],
    createdAt: '2023-11-28'
  },
  {
    id: 'proj_006',
    name: '物联网平台',
    description: 'IoT 物联网设备管理平台网关',
    status: 'paused',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-700',
    routes: 32,
    transformers: 15,
    members: 6,
    avatars: [
      { letter: '杨', name: '杨', color: 'bg-blue-600', role: '管理员' },
      { letter: '刘', name: '刘', color: 'bg-green-600', role: '开发' },
      { letter: '谢', name: '谢', color: 'bg-purple-600', role: '架构师' }
    ],
    createdAt: '2023-10-15'
  }
])

const toggleMenu = (id: string) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const closeMenu = () => {
  activeMenuId.value = null
}

const colorOptions = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-500 to-emerald-700',
  'bg-gradient-to-br from-purple-500 to-violet-700',
  'bg-gradient-to-br from-orange-500 to-red-700',
  'bg-gradient-to-br from-pink-500 to-rose-700',
  'bg-gradient-to-br from-cyan-500 to-blue-700'
]

const openCreateModal = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.rateLimit = 1000
  createForm.environment = 'production'
  createForm.enabled = true
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const openMemberModal = (project: Project) => {
  memberProjectId.value = project.id
  memberForm.members = JSON.parse(JSON.stringify(project.avatars))
  showMemberModal.value = true
  activeMenuId.value = null
}

const closeMemberModal = () => {
  showMemberModal.value = false
  memberProjectId.value = null
}

const saveMembers = () => {
  if (!memberProjectId.value) return

  const project = projects.value.find(p => p.id === memberProjectId.value)
  if (project) {
    project.avatars = JSON.parse(JSON.stringify(memberForm.members))
    project.members = memberForm.members.length
  }

  closeMemberModal()
}

const removeMember = (index: number) => {
  memberForm.members.splice(index, 1)
}

const openAddMemberModal = () => {
  addMemberSearch.value = ''
  selectedUserIds.value = []
  showAddMemberModal.value = true
}

const closeAddMemberModal = () => {
  showAddMemberModal.value = false
  selectedUserIds.value = []
}

const isUserSelected = (userId: number): boolean => {
  return selectedUserIds.value.includes(userId)
}

const selectUser = (user: UserItem) => {
  const index = selectedUserIds.value.indexOf(user.id)
  if (index > -1) {
    selectedUserIds.value.splice(index, 1)
  } else {
    selectedUserIds.value.push(user.id)
  }
}

const confirmAddMembers = () => {
  const existingLetters = memberForm.members.map(m => m.letter)

  for (const userId of selectedUserIds.value) {
    const user = allUsers.value.find(u => u.id === userId)
    if (user) {
      const letter = user.name.charAt(0)
      if (!existingLetters.includes(letter)) {
        memberForm.members.push({
          letter: letter,
          name: user.name,
          color: user.avatarColor,
          role: '开发'
        })
      }
    }
  }

  closeAddMemberModal()
}

const createProject = () => {
  if (!createForm.name.trim()) {
    alert('请输入项目名称')
    return
  }

  const newId = `proj_${String(projects.value.length + 1).padStart(3, '0')}`
  const colorIndex = projects.value.length % colorOptions.length

  projects.value.unshift({
    id: newId,
    name: createForm.name,
    description: createForm.description || '暂无描述',
    status: createForm.enabled ? 'active' : 'paused',
    color: colorOptions[colorIndex],
    routes: 0,
    transformers: 0,
    members: 1,
    avatars: [
      { letter: '管', name: '管理员', color: 'bg-primary-500', role: '管理员' }
    ],
    createdAt: new Date().toISOString().split('T')[0]
  })

  closeCreateModal()
}

const openEditModal = (project: Project) => {
  editingProjectId.value = project.id
  editForm.name = project.name
  editForm.description = project.description
  editForm.rateLimit = 1000
  editForm.environment = 'production'
  editForm.enabled = project.status === 'active'
  showEditModal.value = true
  activeMenuId.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProjectId.value = null
}

const saveEdit = () => {
  if (!editingProjectId.value) return

  const project = projects.value.find(p => p.id === editingProjectId.value)
  if (project) {
    project.name = editForm.name
    project.description = editForm.description
    project.status = editForm.enabled ? 'active' : 'paused'
  }

  closeEditModal()
}

const deleteProject = (id: string) => {
  if (confirm('确定要删除这个项目吗？')) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index > -1) {
      projects.value.splice(index, 1)
    }
  }
  activeMenuId.value = null
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
