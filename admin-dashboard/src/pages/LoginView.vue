<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/utils/notification'
import { Lock, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { addNotification } = useNotifications()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    addNotification('warning', '警告', '请输入用户名和密码')
    return
  }
  
  isLoading.value = true
  
  try {
    await authStore.login(username.value, password.value)
    addNotification('success', '登录成功', '欢迎回来')
    router.push('/')
  } catch (error) {
    addNotification('error', '登录失败', '用户名或密码错误')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-main flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <div class="card p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock class="w-8 h-8 text-primary" />
          </div>
          <h1 class="text-2xl font-bold text-text-main mb-2">DDT 管理控制台</h1>
          <p class="text-text-secondary">端端通 API 网关管理平台</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="input"
              :disabled="isLoading"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">密码</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="input pr-10"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>登录</span>
          </button>
        </form>
        
        <div class="mt-6 text-center text-sm text-text-muted">
          <p>演示模式：任意用户名密码均可登录</p>
        </div>
      </div>
    </div>
  </div>
</template>
