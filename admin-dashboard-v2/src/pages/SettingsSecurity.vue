<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">安全设置</h1>
      <p class="text-gray-500 mt-1">配置系统安全策略和访问控制</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">访问控制</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">IP 白名单</p>
            <p class="text-xs text-gray-500 mt-1">仅允许白名单内的 IP 地址访问管理后台</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="openConfigModal('whitelist')"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              title="配置"
            >
              <MoreHorizontal class="w-5 h-5" />
            </button>
            <button
              type="button"
              @click="security.ipWhitelist = !security.ipWhitelist"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
              :class="security.ipWhitelist ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                :class="security.ipWhitelist ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">IP 黑名单</p>
            <p class="text-xs text-gray-500 mt-1">禁止黑名单内的 IP 地址访问管理后台</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="openConfigModal('blacklist')"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              title="配置"
            >
              <MoreHorizontal class="w-5 h-5" />
            </button>
            <button
              type="button"
              @click="security.ipBlacklist = !security.ipBlacklist"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
              :class="security.ipBlacklist ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                :class="security.ipBlacklist ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">双因素认证</p>
            <p class="text-xs text-gray-500 mt-1">强制所有管理员启用双因素认证</p>
          </div>
          <button
            type="button"
            @click="security.twoFactor = !security.twoFactor"
            class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
            :class="security.twoFactor ? 'bg-primary-600' : 'bg-gray-300'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
              :class="security.twoFactor ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">登录失败锁定</p>
            <p class="text-xs text-gray-500 mt-1">连续失败 5 次后锁定账户 30 分钟</p>
          </div>
          <button
            type="button"
            @click="security.loginLock = !security.loginLock"
            class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
            :class="security.loginLock ? 'bg-primary-600' : 'bg-gray-300'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
              :class="security.loginLock ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">加密设置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">加密算法</label>
          <select class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>AES-256-GCM (推荐)</option>
            <option>AES-128-CBC</option>
            <option>RSA-2048</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密钥轮换周期</label>
          <select class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>90 天</option>
            <option>180 天</option>
            <option>365 天</option>
          </select>
        </div>
      </div>
      <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div class="flex items-start gap-3">
          <Key class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-blue-800">密钥管理</p>
            <p class="text-xs text-blue-700 mt-1">系统使用 AES-256-GCM 算法加密所有敏感数据，密钥存储在独立的密钥管理系统中。</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">会话管理</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">会话超时（分钟）</label>
          <input
            v-model="security.sessionTimeout"
            type="number"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">最大并发会话数</label>
          <input
            v-model="security.maxSessions"
            type="number"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end">
      <button class="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        保存设置
      </button>
    </div>

    <div
      v-if="configModalVisible"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeConfigModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ currentConfigType === 'whitelist' ? 'IP 白名单配置' : 'IP 黑名单配置' }}
          </h3>
          <button @click="closeConfigModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">添加 IP 地址</label>
            <div class="flex gap-2">
              <input
                v-model="newIpInput"
                type="text"
                placeholder="例如：192.168.1.100 或 192.168.1.0/24"
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                @keyup.enter="addIp"
              />
              <button
                @click="addIp"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">IP 列表</span>
              <span class="text-xs text-gray-500">共 {{ currentIpList.length }} 条</span>
            </div>
            <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              <div
                v-for="(ip, index) in currentIpList"
                :key="index"
                class="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <Globe class="w-4 h-4 text-gray-400" />
                  <span class="text-sm font-mono text-gray-700">{{ ip }}</span>
                </div>
                <button
                  @click="removeIp(index)"
                  class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <div v-if="currentIpList.length === 0" class="px-4 py-8 text-center">
                <p class="text-sm text-gray-400">暂无 IP 地址</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="closeConfigModal"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="saveConfig"
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
import { reactive, ref, computed } from 'vue'
import { Key, MoreHorizontal, X, Globe, Trash2 } from 'lucide-vue-next'

const security = reactive({
  ipWhitelist: false,
  ipBlacklist: true,
  twoFactor: true,
  loginLock: true,
  sessionTimeout: 30,
  maxSessions: 5
})

const whitelistIps = ref<string[]>([
  '192.168.1.100',
  '192.168.1.101',
  '10.0.0.0/24'
])

const blacklistIps = ref<string[]>([
  '192.168.1.200',
  '10.0.1.50'
])

const configModalVisible = ref(false)
const currentConfigType = ref<'whitelist' | 'blacklist'>('whitelist')
const newIpInput = ref('')
const tempIpList = ref<string[]>([])

const currentIpList = computed(() => tempIpList.value)

const openConfigModal = (type: 'whitelist' | 'blacklist') => {
  currentConfigType.value = type
  tempIpList.value = type === 'whitelist' ? [...whitelistIps.value] : [...blacklistIps.value]
  configModalVisible.value = true
}

const closeConfigModal = () => {
  configModalVisible.value = false
  newIpInput.value = ''
}

const addIp = () => {
  if (newIpInput.value.trim() && !tempIpList.value.includes(newIpInput.value.trim())) {
    tempIpList.value.push(newIpInput.value.trim())
    newIpInput.value = ''
  }
}

const removeIp = (index: number) => {
  tempIpList.value.splice(index, 1)
}

const saveConfig = () => {
  if (currentConfigType.value === 'whitelist') {
    whitelistIps.value = [...tempIpList.value]
  } else {
    blacklistIps.value = [...tempIpList.value]
  }
  closeConfigModal()
}
</script>
