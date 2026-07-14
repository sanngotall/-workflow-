<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">成员管理</h1>
        <p class="text-gray-500 mt-1">管理项目成员和权限</p>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        <UserPlus class="w-4 h-4 inline mr-2" />
        添加成员
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索成员..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>全部角色</option>
          <option>管理员</option>
          <option>开发者</option>
          <option>观察者</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 text-xs font-semibold text-gray-500 uppercase">成员</th>
              <th class="text-left py-3 text-xs font-semibold text-gray-500 uppercase">角色</th>
              <th class="text-left py-3 text-xs font-semibold text-gray-500 uppercase">加入时间</th>
              <th class="text-left py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
              <th class="text-right py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50 transition-colors">
              <td class="py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    :class="member.avatarColor"
                  >
                    {{ member.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ member.name }}</p>
                    <p class="text-xs text-gray-500">{{ member.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getRoleClass(member.role)"
                >
                  {{ member.role }}
                </span>
              </td>
              <td class="py-4 text-sm text-gray-600">{{ member.joinedAt }}</td>
              <td class="py-4">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'"></div>
                  <span class="text-sm text-gray-600">{{ member.status === 'active' ? '在线' : '离线' }}</span>
                </div>
              </td>
              <td class="py-4 text-right">
                <div class="relative inline-block">
                  <button
                    @click.stop="toggleMenu(member.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreHorizontal class="w-4 h-4" />
                  </button>
                  <div
                    v-if="activeMenuId === member.id"
                    class="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                  >
                    <button
                      @click.stop="openPermissionModal(member)"
                      :disabled="member.role === '管理员'"
                      class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Shield class="w-4 h-4" />
                      权限管理
                    </button>
                    <button
                      @click.stop="deleteMember(member.id)"
                      :disabled="member.role === '管理员'"
                      class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 class="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showPermissionModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closePermissionModal"
    >
      <div class="absolute inset-0 bg-black/50" @click="closePermissionModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">权限管理</h3>
          <button @click="closePermissionModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium text-white"
              :class="permissionForm.avatarColor"
            >
              {{ permissionForm.name.charAt(0) }}
            </div>
            <div>
              <p class="text-base font-medium text-gray-800">{{ permissionForm.name }}</p>
              <p class="text-sm text-gray-500">{{ permissionForm.email }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">角色设置</label>
            <select
              v-model="permissionForm.role"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="开发者">开发者</option>
              <option value="观察者">观察者</option>
            </select>
          </div>
          <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-700">
              <span class="font-medium">提示：</span>只有管理员用户才能更改成员权限
            </p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="closePermissionModal"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="savePermission"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">角色说明</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-red-50 rounded-lg border border-red-100">
          <div class="flex items-center gap-2 mb-2">
            <Shield class="w-5 h-5 text-red-500" />
            <span class="text-sm font-semibold text-red-700">管理员</span>
          </div>
          <p class="text-xs text-red-600">拥有项目的完全控制权，可以管理成员、配置和所有操作</p>
        </div>
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div class="flex items-center gap-2 mb-2">
            <Code class="w-5 h-5 text-blue-500" />
            <span class="text-sm font-semibold text-blue-700">开发者</span>
          </div>
          <p class="text-xs text-blue-600">可以创建和编辑路由、转换器，但不能管理成员和系统设置</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <Eye class="w-5 h-5 text-gray-500" />
            <span class="text-sm font-semibold text-gray-700">观察者</span>
          </div>
          <p class="text-xs text-gray-600">只能查看项目配置和监控数据，不能进行任何修改</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { UserPlus, Search, MoreHorizontal, Shield, Code, Eye, Trash2, X } from 'lucide-vue-next'

interface Member {
  id: number
  name: string
  email: string
  role: string
  joinedAt: string
  status: string
  avatarColor: string
}

const searchQuery = ref('')
const activeMenuId = ref<number | null>(null)
const showPermissionModal = ref(false)
const editingMemberId = ref<number | null>(null)

const permissionForm = reactive({
  name: '',
  email: '',
  role: '',
  avatarColor: ''
})

const members = ref<Member[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', joinedAt: '2024-01-10', status: 'active', avatarColor: 'bg-blue-500' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '开发者', joinedAt: '2024-01-12', status: 'active', avatarColor: 'bg-green-500' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '开发者', joinedAt: '2024-01-15', status: 'inactive', avatarColor: 'bg-purple-500' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '观察者', joinedAt: '2024-01-18', status: 'active', avatarColor: 'bg-orange-500' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: '开发者', joinedAt: '2024-01-20', status: 'active', avatarColor: 'bg-pink-500' },
  { id: 6, name: '孙八', email: 'sunba@example.com', role: '观察者', joinedAt: '2024-01-22', status: 'inactive', avatarColor: 'bg-teal-500' }
])

const getRoleClass = (role: string): string => {
  const classes: Record<string, string> = {
    '管理员': 'bg-red-100 text-red-600',
    '开发者': 'bg-blue-100 text-blue-600',
    '观察者': 'bg-gray-100 text-gray-600'
  }
  return classes[role] || 'bg-gray-100 text-gray-600'
}

const toggleMenu = (id: number) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const closeMenu = () => {
  activeMenuId.value = null
}

const openPermissionModal = (member: Member) => {
  editingMemberId.value = member.id
  permissionForm.name = member.name
  permissionForm.email = member.email
  permissionForm.role = member.role
  permissionForm.avatarColor = member.avatarColor
  showPermissionModal.value = true
  activeMenuId.value = null
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  editingMemberId.value = null
}

const savePermission = () => {
  if (!editingMemberId.value) return

  const member = members.value.find(m => m.id === editingMemberId.value)
  if (member) {
    member.role = permissionForm.role
  }

  closePermissionModal()
}

const deleteMember = (id: number) => {
  if (confirm('确定要删除这个成员吗？')) {
    const index = members.value.findIndex(m => m.id === id)
    if (index > -1) {
      members.value.splice(index, 1)
    }
  }
  activeMenuId.value = null
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative') && !target.closest('.inline-block')) {
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
