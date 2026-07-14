<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">监控告警</h1>
      <p class="text-gray-500 mt-1">配置系统监控指标和告警规则</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">CPU 使用率</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">23%</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Cpu class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 rounded-full" style="width: 23%"></div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">内存使用</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">45%</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <HardDrive class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 rounded-full" style="width: 45%"></div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">错误率</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">0.2%</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertCircle class="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-red-500 rounded-full" style="width: 0.2%"></div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">响应延迟</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">23ms</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Clock class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-yellow-500 rounded-full" style="width: 15%"></div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-semibold text-gray-800">告警规则</h2>
          <div class="flex items-center gap-2">
            <button
              @click="markAllRead"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              一键已读
            </button>
            <button
              @click="showAlertLog = true"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <FileText class="w-3.5 h-3.5" />
              告警日志
            </button>
          </div>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          新建规则
        </button>
      </div>
      <div class="divide-y divide-gray-50">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="alert.severity === 'high' ? 'bg-red-100' : alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'"
              >
                <Bell
                  class="w-5 h-5"
                  :class="alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'"
                />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-gray-800">{{ alert.name }}</h3>
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="alert.severity === 'high' ? 'bg-red-100 text-red-600' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'"
                  >
                    {{ alert.severity === 'high' ? '严重' : alert.severity === 'medium' ? '警告' : '提示' }}
                  </span>
                  <span
                    v-if="!alert.read"
                    class="w-2 h-2 bg-red-500 rounded-full"
                  ></span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ alert.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-800">{{ alert.threshold }}</p>
                <p class="text-xs text-gray-500">阈值</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="alert.enabled = !alert.enabled"
                  class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
                  :class="alert.enabled ? 'bg-primary-600' : 'bg-gray-300'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                    :class="alert.enabled ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-6">通知方式</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Mail class="w-5 h-5 text-blue-500" />
              <span class="text-sm font-medium text-gray-800">邮件通知</span>
              <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">功能待开发</span>
            </div>
            <button
              type="button"
              @click="notifications.email = !notifications.email"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
              :class="notifications.email ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                :class="notifications.email ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
          <p class="text-xs text-gray-500">发送告警邮件到管理员邮箱</p>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <MessageSquare class="w-5 h-5 text-green-500" />
              <span class="text-sm font-medium text-gray-800">企业微信</span>
              <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">功能待开发</span>
            </div>
            <button
              type="button"
              @click="notifications.wechat = !notifications.wechat"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
              :class="notifications.wechat ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                :class="notifications.wechat ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
          <p class="text-xs text-gray-500">推送告警到企业微信群</p>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Phone class="w-5 h-5 text-purple-500" />
              <span class="text-sm font-medium text-gray-800">短信通知</span>
              <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">功能待开发</span>
            </div>
            <button
              type="button"
              @click="notifications.sms = !notifications.sms"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out"
              :class="notifications.sms ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                :class="notifications.sms ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
          <p class="text-xs text-gray-500">严重告警短信通知负责人</p>
        </div>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="showCreateModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">新建告警规则</h3>
          <button @click="showCreateModal = false" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">规则名称</label>
            <input
              v-model="newRule.name"
              type="text"
              placeholder="请输入规则名称"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">监控指标</label>
            <select
              v-model="newRule.metric"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="cpu">CPU 使用率</option>
              <option value="memory">内存使用率</option>
              <option value="error">错误率</option>
              <option value="latency">响应延迟</option>
              <option value="disk">磁盘使用率</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">告警级别</label>
            <div class="flex gap-3">
              <button
                v-for="level in severityOptions"
                :key="level.value"
                @click="newRule.severity = level.value"
                class="flex-1 py-2 text-sm font-medium rounded-lg border transition-colors"
                :class="newRule.severity === level.value
                  ? level.activeClass
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              >
                {{ level.label }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">阈值</label>
            <div class="flex gap-2">
              <select
                v-model="newRule.operator"
                class="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="gt">大于</option>
                <option value="lt">小于</option>
                <option value="gte">大于等于</option>
                <option value="lte">小于等于</option>
              </select>
              <input
                v-model="newRule.threshold"
                type="number"
                placeholder="阈值"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                {{ newRule.metric === 'latency' ? 'ms' : '%' }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">规则描述</label>
            <textarea
              v-model="newRule.description"
              rows="2"
              placeholder="请输入规则描述（选填）"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            ></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="createRule"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showAlertLog"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="showAlertLog = false"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 class="text-lg font-semibold text-gray-800">告警日志</h3>
          <button @click="showAlertLog = false" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-3">
            <div
              v-for="log in alertLogs"
              :key="log.id"
              class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="log.severity === 'high' ? 'bg-red-100' : log.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'"
              >
                <Bell
                  class="w-4 h-4"
                  :class="log.severity === 'high' ? 'text-red-600' : log.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-medium text-gray-800">{{ log.title }}</h4>
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
                    :class="log.severity === 'high' ? 'bg-red-100 text-red-600' : log.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'"
                  >
                    {{ log.severity === 'high' ? '严重' : log.severity === 'medium' ? '警告' : '提示' }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ log.message }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ log.time }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 border-t border-gray-100 flex-shrink-0">
          <p class="text-xs text-gray-500 text-center">共 {{ alertLogs.length }} 条告警记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Plus, Bell, MoreHorizontal, Cpu, HardDrive, AlertCircle, Clock, Mail, MessageSquare, Phone, X, CheckCircle2, FileText } from 'lucide-vue-next'

interface AlertRule {
  id: number
  name: string
  severity: string
  description: string
  threshold: string
  enabled: boolean
  read: boolean
}

interface AlertLog {
  id: number
  title: string
  severity: string
  message: string
  time: string
}

const alerts = ref<AlertRule[]>([
  { id: 1, name: 'CPU 使用率过高', severity: 'high', description: '当 CPU 使用率超过 80% 时触发告警', threshold: '> 80%', enabled: true, read: false },
  { id: 2, name: '内存使用率过高', severity: 'high', description: '当内存使用率超过 85% 时触发告警', threshold: '> 85%', enabled: true, read: false },
  { id: 3, name: '错误率异常', severity: 'high', description: '当请求错误率超过 5% 时触发告警', threshold: '> 5%', enabled: true, read: true },
  { id: 4, name: '响应延迟过高', severity: 'medium', description: '当平均响应时间超过 500ms 时触发告警', threshold: '> 500ms', enabled: true, read: true },
  { id: 5, name: '磁盘空间不足', severity: 'medium', description: '当磁盘使用率超过 90% 时触发告警', threshold: '> 90%', enabled: false, read: true },
  { id: 6, name: '证书即将过期', severity: 'low', description: '当 SSL 证书剩余时间少于 30 天时提醒', threshold: '< 30天', enabled: true, read: true }
])

const notifications = reactive({
  email: true,
  wechat: true,
  sms: false
})

const showCreateModal = ref(false)
const showAlertLog = ref(false)

const newRule = reactive({
  name: '',
  metric: 'cpu',
  severity: 'medium',
  operator: 'gt',
  threshold: '',
  description: ''
})

const severityOptions = [
  { value: 'high', label: '严重', activeClass: 'bg-red-50 border-red-200 text-red-600' },
  { value: 'medium', label: '警告', activeClass: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
  { value: 'low', label: '提示', activeClass: 'bg-blue-50 border-blue-200 text-blue-600' }
]

const alertLogs = ref<AlertLog[]>([
  { id: 1, title: 'CPU 使用率过高', severity: 'high', message: 'CPU 使用率达到 85%，超过阈值 80%', time: '2024-01-15 14:32:18' },
  { id: 2, title: '内存使用率过高', severity: 'high', message: '内存使用率达到 88%，超过阈值 85%', time: '2024-01-15 13:45:22' },
  { id: 3, title: '响应延迟过高', severity: 'medium', message: '平均响应时间达到 620ms，超过阈值 500ms', time: '2024-01-15 11:20:33' },
  { id: 4, title: '错误率异常', severity: 'high', message: '请求错误率达到 6.2%，超过阈值 5%', time: '2024-01-14 22:15:47' },
  { id: 5, title: '证书即将过期', severity: 'low', message: 'SSL 证书将在 28 天后过期，请及时更新', time: '2024-01-14 09:00:00' }
])

const markAllRead = () => {
  alerts.value.forEach(alert => {
    alert.read = true
  })
}

const createRule = () => {
  if (!newRule.name || !newRule.threshold) return

  const unit = newRule.metric === 'latency' ? 'ms' : '%'
  const opText = newRule.operator === 'gt' ? '>' : newRule.operator === 'lt' ? '<' : newRule.operator === 'gte' ? '>=' : '<='

  const newAlert: AlertRule = {
    id: Date.now(),
    name: newRule.name,
    severity: newRule.severity,
    description: newRule.description || `${newRule.name}触发告警`,
    threshold: `${opText} ${newRule.threshold}${unit}`,
    enabled: true,
    read: true
  }

  alerts.value.unshift(newAlert)
  showCreateModal.value = false

  newRule.name = ''
  newRule.metric = 'cpu'
  newRule.severity = 'medium'
  newRule.operator = 'gt'
  newRule.threshold = ''
  newRule.description = ''
}
</script>
