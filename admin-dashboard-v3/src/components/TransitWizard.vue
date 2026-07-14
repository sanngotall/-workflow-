<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="appStore.closeWizard()"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">

      <!-- 头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <h2 class="text-lg font-bold text-gray-800">新建中转</h2>
            <span class="text-xs text-gray-500" v-if="step < 4">第 {{ step }} / 4 步 · {{ stepLabels[step - 1] }}</span>
            <span class="text-xs text-green-600 flex items-center gap-1" v-else>
              <CheckCircle2 class="w-3.5 h-3.5" /> 创建成功！复制下方代码即可接入
            </span>
          </div>
          <p class="text-xs text-gray-500">选项目 → 选下游 → 填连接 → 拿接入代码</p>
        </div>
        <button
          @click="appStore.closeWizard()"
          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 步骤条（最后一步隐藏） -->
      <div v-if="step < 4" class="px-6 pt-5 flex-shrink-0">
        <div class="flex items-center">
          <div
            v-for="(label, idx) in stepLabels"
            :key="idx"
            class="flex items-center flex-1 last:flex-none"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
              :class="step > idx + 1 ? 'bg-green-500 text-white' : step === idx + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'"
            >
              <Check v-if="step > idx + 1" class="w-3.5 h-3.5" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="ml-2 text-xs font-medium" :class="step >= idx + 1 ? 'text-gray-700' : 'text-gray-400'">{{ label }}</span>
            <div v-if="idx < stepLabels.length - 1" class="flex-1 h-px mx-3" :class="step > idx + 1 ? 'bg-green-500' : 'bg-gray-200'"></div>
          </div>
        </div>
      </div>

      <!-- 主体可滚动 -->
      <div class="flex-1 overflow-y-auto px-6 py-5">

        <!-- Step 1: 选/建项目 -->
        <div v-if="step === 1" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="mode = 'existing'"
              class="p-4 border-2 rounded-lg text-left transition-all"
              :class="mode === 'existing' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <FolderOpen class="w-5 h-5 mb-2" :class="mode === 'existing' ? 'text-primary-600' : 'text-gray-400'" />
              <p class="text-sm font-semibold text-gray-800">选择已有项目</p>
              <p class="text-xs text-gray-500 mt-1">把中转挂到现有项目下</p>
            </button>
            <button
              @click="mode = 'new'"
              class="p-4 border-2 rounded-lg text-left transition-all"
              :class="mode === 'new' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <Plus class="w-5 h-5 mb-2" :class="mode === 'new' ? 'text-primary-600' : 'text-gray-400'" />
              <p class="text-sm font-semibold text-gray-800">新建项目</p>
              <p class="text-xs text-gray-500 mt-1">从零开始一个新项目</p>
            </button>
          </div>

          <div v-if="mode === 'existing'" class="space-y-2 max-h-64 overflow-y-auto">
            <div v-if="localProjects.length === 0" class="text-center py-8 text-gray-400 text-sm">
              暂无项目，请选择"新建项目"
            </div>
            <div
              v-for="(project, idx) in localProjects"
              :key="project.id"
              @click="selectedProjectId = project.id"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
              :class="selectedProjectId === project.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'"
            >
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" :class="projectColor(idx)">
                {{ project.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ project.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ project.id }} · {{ envLabels['production'] }}</p>
              </div>
              <Check v-if="selectedProjectId === project.id" class="w-4 h-4 text-primary-600" />
            </div>
          </div>

          <div v-else class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
              <input
                v-model="newProjectForm.name"
                type="text"
                placeholder="如：电商客服"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
              <textarea
                v-model="newProjectForm.description"
                rows="2"
                placeholder="一句话描述这个项目"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">环境</label>
              <div class="flex gap-2">
                <button
                  v-for="env in (['development', 'staging', 'production'] as const)"
                  :key="env"
                  @click="newProjectForm.environment = env"
                  class="px-4 py-2 text-sm font-medium rounded-lg border transition-all"
                  :class="newProjectForm.environment === env ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                >
                  {{ envLabels[env] }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: 选下游类型 -->
        <div v-else-if="step === 2" class="space-y-4">
          <p class="text-sm text-gray-500 mb-4">选择你要对接的下游 AI 服务，决定了请求翻译模板和返回格式</p>
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="dt in downstreamTypes"
              :key="dt.value"
              @click="selectDownstream(dt.value)"
              class="p-6 border-2 rounded-lg text-left transition-all"
              :class="form.downstreamType === dt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" :class="dt.bgClass">
                <component :is="dt.icon" class="w-6 h-6 text-white" />
              </div>
              <p class="text-base font-semibold text-gray-800">{{ dt.label }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ dt.description }}</p>
              <p class="text-xs text-primary-600 mt-2 font-medium">{{ dt.flowHint }}</p>
            </button>
          </div>
        </div>

        <!-- Step 3: 配置连接 + 翻译 -->
        <div v-else-if="step === 3" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">下游 URL <span class="text-red-500">*</span></label>
              <input
                v-model="form.downstreamUrl"
                type="text"
                :placeholder="urlPlaceholder"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p class="text-xs text-gray-400 mt-1">由 {{ form.downstreamType === 'dify' ? 'Dify' : 'n8n' }} 平台提供</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="form.apiKey"
                  :type="showKey ? 'text' : 'password'"
                  placeholder="粘贴 API Key"
                  class="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  @click="showKey = !showKey"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showKey" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">AES-256-GCM 加密存储，不明文落盘</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">翻译模板</label>
            <select
              v-model="form.template"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option v-for="t in templates" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">{{ currentTemplateDescription }}</p>
          </div>

          <!-- 业务数据库提示：表隔离模式下，建表在项目详情页/数据库模块独立完成 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Database class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1 text-xs">
              <p class="font-medium text-blue-800">业务数据存储</p>
              <p class="text-blue-700 mt-0.5">中转创建完成后，可在项目详情页的"数据存储"Tab 配置业务表。共享 PostgreSQL 库 · 表隔离模式（每项目独立一套表）。</p>
            </div>
          </div>

          <!-- 微信小程序身份（可选，折叠） -->
          <div class="border border-amber-300 rounded-lg overflow-hidden bg-amber-50/40">
            <button
              @click="showWxSection = !showWxSection"
              class="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors"
            >
              <div class="flex items-center gap-2">
                <KeyRound class="w-4 h-4 text-amber-600" />
                <span class="text-sm font-medium text-gray-700">微信小程序身份</span>
                <span class="text-xs text-gray-400">（接入微信小程序前端时必填，其他场景可跳过）</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="form.wxAppId && form.wxAppSecret" class="text-xs text-green-600 font-medium">已填</span>
                <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="showWxSection ? 'rotate-180' : ''" />
              </div>
            </button>

            <div v-if="showWxSection" class="p-4 space-y-3 bg-white border-t border-amber-200">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">AppID</label>
                  <input
                    v-model="form.wxAppId"
                    type="text"
                    placeholder="wx1234567890abcdef"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">AppSecret</label>
                  <input
                    v-model="form.wxAppSecret"
                    type="password"
                    placeholder="小程序后台 → 开发设置中的 AppSecret"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div class="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-xs text-amber-800">
                <p class="font-medium mb-1">说明</p>
                <p>· 用于调微信 jscode2session 换取用户 openid，完成身份验证</p>
                <p>· 填写后，创建中转时自动保存到项目配置；同一项目下后续中转无需重复填写</p>
                <p>· AppSecret 通过 AES-256-GCM 加密存储，不明文落盘</p>
              </div>
            </div>
          </div>

          <!-- 自定义翻译（折叠） -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              @click="showCustomMapping = !showCustomMapping"
              class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-2">
                <Code class="w-4 h-4 text-gray-500" />
                <span class="text-sm font-medium text-gray-700">自定义字段映射</span>
                <span class="text-xs text-gray-400">（80% 用户用模板即可，无需展开）</span>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="showCustomMapping ? 'rotate-180' : ''" />
            </button>

            <div v-if="showCustomMapping" class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-xs font-medium text-gray-500">
                <div>用户前端字段</div>
                <div>翻译到下游字段</div>
              </div>
              <div v-for="(m, idx) in fieldMappings" :key="idx" class="grid grid-cols-[1fr_24px_1fr_32px] gap-2 items-center">
                <input
                  v-model="m.source"
                  type="text"
                  placeholder="如：message"
                  class="px-3 py-2 border border-gray-200 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <ArrowRight class="w-3.5 h-3.5 text-gray-400 mx-auto" />
                <input
                  v-model="m.target"
                  type="text"
                  :placeholder="form.downstreamType === 'dify' ? '如：query' : '如：json.message'"
                  class="px-3 py-2 border border-gray-200 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  @click="fieldMappings.splice(idx, 1)"
                  class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                @click="fieldMappings.push({ source: '', target: '' })"
                class="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Plus class="w-3.5 h-3.5" /> 添加映射
              </button>

              <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs font-medium text-gray-600 mb-2">翻译预览</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs text-gray-400 mb-1">用户原始请求</p>
                    <pre class="bg-gray-900 text-gray-100 rounded-md p-3 text-xs overflow-x-auto">{{ previewOriginal }}</pre>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 mb-1">翻译后下游请求</p>
                    <pre class="bg-gray-900 text-green-100 rounded-md p-3 text-xs overflow-x-auto">{{ previewTranslated }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: 创建 + 拿代码 -->
        <div v-else-if="step === 4" class="space-y-4">
          <div v-if="!createdTransitId">
            <label class="block text-sm font-medium text-gray-700 mb-2">中转名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="给这条中转起个名字"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div class="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <div class="flex justify-between"><span class="text-gray-500">所属项目</span><span class="font-medium text-gray-800">{{ finalProjectName }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">下游类型</span><span class="font-medium text-gray-800 uppercase">{{ form.downstreamType }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">翻译模板</span><span class="font-medium text-gray-800">{{ form.template }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">自定义映射</span><span class="font-medium text-gray-800">{{ fieldMappings.filter(m => m.source && m.target).length }} 条</span></div>
            </div>
            <div v-if="createErrorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ createErrorMsg }}</div>
          </div>

          <AccessCodePanel
            v-else
            :transit-id="createdTransitId"
            :downstream-type="form.downstreamType"
            :transit-name="form.name"
          />

          <!-- 创建成功后的数据存储引导 -->
          <div
            v-if="createdTransitId"
            class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
          >
            <Database class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800">配置业务数据存储</p>
              <p class="text-xs text-gray-600 mt-1">中转已创建成功。如需存储请求/返回数据，可在项目详情页"数据存储"Tab 中按表隔离模式建表（每项目独立一套表）。</p>
              <button
                @click="goConfigureDatabase"
                class="mt-3 px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >去配置数据存储 →</button>
            </div>
          </div>
        </div>

      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
        <button
          v-if="step > 1 && step < 4"
          @click="step--"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
        >
          上一步
        </button>
        <button
          v-else
          @click="appStore.closeWizard()"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
        >
          取消
        </button>

        <div class="flex items-center gap-3">
          <button
            v-if="step < 4"
            @click="handleNext"
            :disabled="!canNext"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一步
          </button>

          <template v-if="step === 4">
            <button
              v-if="!createdTransitId"
              @click="handleCreate"
              :disabled="creating"
              class="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check class="w-4 h-4" /> {{ creating ? '创建中...' : '创建中转' }}
            </button>
            <button
              v-else
              @click="goToTransitDetail"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              查看中转详情
            </button>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Check, Plus, FolderOpen, ChevronDown, ArrowRight, Trash2,
  Eye, EyeOff, Code, CheckCircle2, Workflow, MessageSquare, X,
  Database, KeyRound
} from 'lucide-vue-next'
import { useAppStore, downstreamTemplates } from '@/stores/app'
import { useRouter } from 'vue-router'
import AccessCodePanel from './AccessCodePanel.vue'
import { listProjects, createProject as apiCreateProject, type Project as ApiProject } from '@/api/projects'
import { createRoute } from '@/api/routes'
import { createCredential } from '@/api/credentials'
import { createTransformer } from '@/api/transformers'
import { saveWxConfig as saveWxConfigApi } from '@/api/wx-config'

const appStore = useAppStore()
const router = useRouter()

const step = ref(1)
const stepLabels = ['选/建项目', '选下游类型', '配置连接 + 翻译', '创建 + 拿代码']

const mode = ref<'existing' | 'new'>('existing')
// 真实项目列表（从后端拉取）
const localProjects = ref<ApiProject[]>([])
const selectedProjectId = ref<string>(appStore.wizardProjectId || '')
const showKey = ref(false)
const showCustomMapping = ref(false)
// 微信小程序身份区折叠状态（默认折叠，需用户主动展开）
const showWxSection = ref(false)
const createdTransitId = ref<string | null>(null)
const creating = ref(false)
const createErrorMsg = ref('')

// 拉取真实项目列表
async function loadProjects() {
  try {
    const data = await listProjects()
    localProjects.value = data
    // 若未预选项目，默认选第一个
    if (!selectedProjectId.value && data.length > 0) {
      selectedProjectId.value = data[0].id
    }
  } catch (e) {
    console.error('加载项目列表失败', e)
  }
}

onMounted(loadProjects)

// 卡片颜色循环（前端展示用，与后端无关）
const colorOptions = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-500 to-emerald-700',
  'bg-gradient-to-br from-purple-500 to-violet-700',
  'bg-gradient-to-br from-orange-500 to-red-700',
  'bg-gradient-to-br from-pink-500 to-rose-700',
  'bg-gradient-to-br from-cyan-500 to-blue-700',
]

function projectColor(idx: number) {
  return colorOptions[idx % colorOptions.length]
}

const envLabels: Record<string, string> = {
  development: '开发环境',
  staging: '预发环境',
  production: '生产环境'
}

const newProjectForm = reactive({
  name: '',
  description: '',
  environment: 'production' as 'development' | 'staging' | 'production'
})

const form = reactive<{
  name: string
  downstreamType: '' | 'n8n' | 'dify'
  downstreamUrl: string
  apiKey: string
  template: string
  // 微信小程序身份（可选）：填了则在创建中转时同步保存到项目 wx_configs
  wxAppId: string
  wxAppSecret: string
}>({
  name: '',
  downstreamType: '',
  downstreamUrl: '',
  apiKey: '',
  template: '',
  wxAppId: '',
  wxAppSecret: '',
})

const fieldMappings = ref<{ source: string; target: string }[]>([
  { source: 'message', target: '' },
  { source: 'userId', target: '' }
])

const downstreamTypes = [
  {
    value: 'n8n' as const,
    label: 'n8n',
    description: '工作流自动化平台，适合复杂多步骤流程',
    flowHint: '请求 → n8n Webhook → 工作流执行',
    icon: Workflow,
    bgClass: 'bg-gradient-to-br from-orange-500 to-red-500'
  },
  {
    value: 'dify' as const,
    label: 'Dify',
    description: 'LLM 应用开发平台，适合 AI 对话与工作流',
    flowHint: '请求 → Dify API → LLM 流式响应',
    icon: MessageSquare,
    bgClass: 'bg-gradient-to-br from-blue-500 to-purple-600'
  }
]

const templates = computed(() => {
  if (!form.downstreamType) return []
  return downstreamTemplates[form.downstreamType]
})

const currentTemplateDescription = computed(() => {
  const t = templates.value.find(t => t.value === form.template)
  return t?.description || ''
})

const urlPlaceholder = computed(() => {
  if (form.downstreamType === 'dify') return 'https://api.dify.ai/v1/chat-messages'
  if (form.downstreamType === 'n8n') return 'https://your-n8n.com/webhook/xxx'
  return ''
})

const finalProjectName = computed(() => {
  if (mode.value === 'existing') {
    return localProjects.value.find(p => p.id === selectedProjectId.value)?.name || ''
  }
  return newProjectForm.name || '（未命名项目）'
})

const previewOriginal = computed(() => {
  const obj: Record<string, string> = {}
  fieldMappings.value.forEach(m => {
    if (m.source) obj[m.source] = '<value>'
  })
  if (Object.keys(obj).length === 0) return '{\n  "message": "你好"\n}'
  return JSON.stringify(obj, null, 2)
})

const previewTranslated = computed(() => {
  const obj: Record<string, string> = {}
  fieldMappings.value.forEach(m => {
    if (m.source && m.target) obj[m.target] = '<value>'
  })
  if (form.downstreamType === 'dify' && form.template === 'dify-chat-messages-标准') {
    return JSON.stringify({
      inputs: {},
      query: obj.query || '<message>',
      response_mode: 'streaming',
      user: obj.user || '<userId>'
    }, null, 2)
  }
  if (Object.keys(obj).length === 0) return '{\n  "json": {\n    "message": "你好"\n  }\n}'
  return JSON.stringify({ json: obj }, null, 2)
})

const canNext = computed(() => {
  if (step.value === 1) {
    if (mode.value === 'existing') return !!selectedProjectId.value
    return !!newProjectForm.name.trim()
  }
  if (step.value === 2) return !!form.downstreamType
  if (step.value === 3) return !!form.downstreamUrl.trim() && !!form.apiKey.trim() && !!form.template
  return true
})

const selectDownstream = (type: 'n8n' | 'dify') => {
  form.downstreamType = type
  form.template = downstreamTemplates[type][0].value
  if (type === 'dify') {
    fieldMappings.value = [
      { source: 'message', target: 'query' },
      { source: 'userId', target: 'user' }
    ]
  } else {
    fieldMappings.value = [
      { source: 'message', target: 'json.message' },
      { source: 'userId', target: 'json.userId' }
    ]
  }
}

const handleNext = async () => {
  if (step.value === 1) {
    // 新建项目时调用真实 API
    if (mode.value === 'new' && newProjectForm.name.trim()) {
      try {
        const newProject = await apiCreateProject(newProjectForm.name, newProjectForm.description || undefined)
        localProjects.value.unshift(newProject)
        selectedProjectId.value = newProject.id
      } catch (e: any) {
        console.error('创建项目失败', e)
        return
      }
    }
    if (!form.name) {
      const projectName = localProjects.value.find(p => p.id === selectedProjectId.value)?.name || ''
      form.name = `${projectName}-${new Date().getMonth() + 1}${new Date().getDate()}`
    }
  }
  step.value++
}

/**
 * 生成微信用户 token 的 JWT 签名密钥
 * 用户无需感知此值，自动生成 64 位 hex 随机串，加密存库
 * 专用于该项目，与系统 JWT_SECRET 独立（多租户隔离）
 */
function generateWxJwtSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const handleCreate = async () => {
  if (!form.name.trim() || !selectedProjectId.value || !form.downstreamType) return
  if (!form.downstreamUrl.trim() || !form.apiKey.trim() || !form.template) return
  // 微信身份校验：要么两个都不填，要么两个都填
  if ((form.wxAppId.trim() && !form.wxAppSecret.trim()) || (!form.wxAppId.trim() && form.wxAppSecret.trim())) {
    createErrorMsg.value = '微信 AppID 和 AppSecret 必须同时填写，或同时留空'
    return
  }

  creating.value = true
  createErrorMsg.value = ''
  try {
    // 1. 创建路由（path 自动生成，使用中转名 slug）
    const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '') || 'transit'
    const routePath = `/transit/${slug}-${Date.now().toString(36)}`
    const route = await createRoute({
      project_id: selectedProjectId.value,
      environment: 'production',
      method: 'POST',
      path: routePath,
      is_async: false,
      timeout_ms: 30000,
    })

    // 2. 创建凭证（API Key 加密存储）
    const credential = await createCredential({
      project_id: selectedProjectId.value,
      name: `${form.name}-apikey`,
      type: form.downstreamType === 'dify' ? 'bearer' : 'api_key',
      secret: form.apiKey,
    })

    // 3. 创建转换器（关联 route + credential + target_url + mapping_rules）
    const mappingRules: Record<string, string> = {}
    fieldMappings.value.forEach(m => {
      if (m.source && m.target) mappingRules[m.source] = m.target
    })

    await createTransformer({
      route_id: route.id,
      target_url: form.downstreamUrl,
      type: form.template,
      credential_id: credential.id,
      mapping_rules: mappingRules,
    })

    // 4. 若用户填写了微信小程序身份，同步保存到项目 wx_configs
    //    JWTSecret 自动生成（用户无需感知），专用于该项目签发微信用户 token
    if (form.wxAppId.trim() && form.wxAppSecret.trim()) {
      const wxJwtSecret = generateWxJwtSecret()
      try {
        await saveWxConfigApi(selectedProjectId.value, {
          app_id: form.wxAppId.trim(),
          app_secret: form.wxAppSecret.trim(),
          jwt_secret: wxJwtSecret,
        })
      } catch (e: any) {
        // wx 配置保存失败不阻断中转创建（中转本身已创建成功）
        // 仅提示用户后续可在项目"微信配置"tab 手动补填
        console.warn('微信配置保存失败，中转已创建', e)
        createErrorMsg.value = `中转已创建，但微信配置保存失败：${e?.message || '未知错误'}。可稍后在项目"微信配置"Tab 补填。`
      }
    }

    createdTransitId.value = route.id
    // 表隔离模式下，业务表配置在项目详情页 / 数据库模块独立完成，向导不创建库
  } catch (e: any) {
    createErrorMsg.value = e?.message || '创建中转失败'
    console.error('创建中转失败', e)
  } finally {
    creating.value = false
  }
}

const goToTransitDetail = () => {
  if (createdTransitId.value && selectedProjectId.value) {
    appStore.closeWizard()
    router.push(`/projects/${selectedProjectId.value}/transits/${createdTransitId.value}`)
  }
}

// 跳转到项目详情页"数据存储"Tab 配置业务表
const goConfigureDatabase = () => {
  if (!selectedProjectId.value) return
  appStore.closeWizard()
  appStore.setTopNav('database')
  router.push(`/database/project/${selectedProjectId.value}`)
}
</script>
