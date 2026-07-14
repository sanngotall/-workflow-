<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50 sticky top-0">
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
          v-for="item in topNavItems"
          :key="item.id"
          @click="handleTopNavClick(item.id)"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
          :class="[
            appStore.currentTopNav === item.id
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="appStore.openWizard()"
        class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
      >
        <Plus class="w-4 h-4" />
        <span>新建中转</span>
      </button>

      <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div class="h-8 w-px bg-gray-200"></div>

      <!-- 用户菜单（下拉） -->
      <div class="relative" @click.stop="userMenuOpen = !userMenuOpen">
        <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded-lg hover:bg-gray-50">
          <div class="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User class="w-5 h-5 text-white" />
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-gray-800">{{ authStore.user?.name || '加载中' }}</p>
            <p class="text-xs text-gray-500">{{ authStore.user?.email || '' }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400" />
        </div>

        <!-- 下拉菜单 -->
        <div
          v-if="userMenuOpen"
          class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          @click.stop
        >
          <div class="px-4 py-2 border-b border-gray-100">
            <p class="text-sm font-medium text-gray-800">{{ authStore.user?.name }}</p>
            <p class="text-xs text-gray-500">@{{ authStore.user?.username }}</p>
            <div class="flex gap-1 mt-1.5">
              <span
                v-for="role in (authStore.user?.global_roles || [])"
                :key="role"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
              >
                {{ role === 'super_admin' ? '超级管理员' : '管理员' }}
              </span>
            </div>
          </div>
          <button
            @click="handleChangePassword"
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <KeyRound class="w-4 h-4" />
            <span>修改密码</span>
          </button>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut class="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- 修改密码弹窗 -->
  <div v-if="passwordDialogOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click="passwordDialogOpen = false">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" @click.stop>
      <h3 class="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
          <input v-model="pwdForm.oldPassword" type="password" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input v-model="pwdForm.newPassword" type="password" placeholder="至少 8 位，含字母和数字" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
          <input v-model="pwdForm.confirmPassword" type="password" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
        </div>
        <div v-if="pwdError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ pwdError }}</div>
        <div v-if="pwdSuccess" class="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">密码修改成功，请重新登录</div>
      </div>
      <div class="flex gap-2 mt-6">
        <button @click="passwordDialogOpen = false" class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">取消</button>
        <button @click="submitChangePassword" :disabled="pwdLoading" class="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
          {{ pwdLoading ? '提交中...' : '确认修改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Zap, Bell, User, ChevronDown, Plus, LayoutDashboard, FolderOpen, Database, Settings2, KeyRound, LogOut } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { changeMyPassword } from '@/api/auth'

const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()

const userMenuOpen = ref(false)
const passwordDialogOpen = ref(false)
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

// 点击外部关闭菜单
function handleDocClick() { userMenuOpen.value = false }
onMounted(() => document.addEventListener('click', handleDocClick))
onUnmounted(() => document.removeEventListener('click', handleDocClick))

function handleChangePassword() {
  userMenuOpen.value = false
  pwdError.value = ''
  pwdSuccess.value = false
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  passwordDialogOpen.value = true
}

async function submitChangePassword() {
  pwdError.value = ''
  pwdSuccess.value = false
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    pwdError.value = '请填写旧密码和新密码'
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = '两次输入的新密码不一致'
    return
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pwdForm.newPassword)) {
    pwdError.value = '新密码至少 8 位且必须包含字母和数字'
    return
  }
  pwdLoading.value = true
  try {
    await changeMyPassword(authStore.user!.id, pwdForm.oldPassword, pwdForm.newPassword)
    pwdSuccess.value = true
    // 修改密码后 token 失效，1.5s 后自动跳转登录
    setTimeout(async () => {
      await authStore.logout()
      passwordDialogOpen.value = false
      router.push('/login')
    }, 1500)
  } catch (e: any) {
    pwdError.value = e?.message || '修改失败'
  } finally {
    pwdLoading.value = false
  }
}

async function handleLogout() {
  userMenuOpen.value = false
  await authStore.logout()
  router.push('/login')
}

const topNavItems = [
  { id: 'dashboard' as const, label: '控制台', icon: LayoutDashboard },
  { id: 'projects' as const, label: '项目管理', icon: FolderOpen },
  { id: 'database' as const, label: '数据库', icon: Database },
  { id: 'advanced' as const, label: '高级模式', icon: Settings2 }
]

const handleTopNavClick = (id: 'dashboard' | 'projects' | 'database' | 'advanced') => {
  appStore.setTopNav(id)
  if (id === 'dashboard') router.push('/dashboard/overview')
  else if (id === 'projects') router.push('/projects')
  else if (id === 'database') router.push('/database')
  else if (id === 'advanced') router.push('/advanced')
}

const goHome = () => {
  appStore.setTopNav('dashboard')
  router.push('/dashboard/overview')
}
</script>
