<template>
  <div class="space-y-6" v-if="transit && project">
    <button @click="router.push(`/projects/${project.id}`)" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
      <ChevronLeft class="w-4 h-4" /> 返回 {{ project.name }}
    </button>

    <!-- 头部 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-800">{{ transit.name }}</h1>
            <span
              class="px-2 py-1 text-xs font-medium rounded-md"
              :class="transit.downstreamType === 'dify' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'"
            >
              {{ transit.downstreamType }}
            </span>
            <span class="px-2 py-1 text-xs font-medium rounded-full" :class="transit.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
              {{ transit.status === 'active' ? '运行中' : '已暂停' }}
            </span>
          </div>
          <p class="text-xs text-gray-400 font-mono mt-1">{{ transit.id }} · 创建于 {{ transit.createdAt }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="openEditModal"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >编辑</button>
          <button
            @click="toggleStatus"
            :disabled="togglingStatus"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ togglingStatus ? '处理中...' : (transit.status === 'active' ? '暂停' : '启用') }}
          </button>
          <button
            @click="handleDelete"
            :disabled="deleting"
            class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deleting ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
        <div>
          <p class="text-sm text-gray-500">今日调用</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ formatNumber(transit.todayCalls) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">错误率</p>
          <p class="text-2xl font-bold mt-1" :class="transit.errorRate > 1 ? 'text-orange-600' : 'text-gray-800'">{{ transit.errorRate }}%</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">平均延迟</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ transit.avgLatency }}ms</p>
        </div>
      </div>
    </div>

    <!-- 接入代码 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-2 mb-4">
        <Code2 class="w-5 h-5 text-primary-600" />
        <h2 class="text-lg font-semibold text-gray-800">接入代码</h2>
        <span class="text-xs text-gray-400">复制下方两段代码到你的前端项目即可</span>
      </div>
      <AccessCodePanel
        :transit-id="transit.id"
        :downstream-type="transit.downstreamType"
        :transit-name="transit.name"
      />
    </div>

    <!-- 配置详情（折叠） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        @click="showConfig = !showConfig"
        class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <span class="text-sm font-medium text-gray-700">中转配置详情</span>
        <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="showConfig ? 'rotate-180' : ''" />
      </button>
      <div v-if="showConfig" class="px-6 py-4 border-t border-gray-100 space-y-3 text-sm">
        <div class="grid grid-cols-[120px_1fr] gap-2">
          <span class="text-gray-500">路由路径</span>
          <code class="text-gray-800 font-mono text-xs">{{ transit.routePath }}</code>
        </div>
        <div class="grid grid-cols-[120px_1fr] gap-2">
          <span class="text-gray-500">下游 URL</span>
          <code class="text-gray-800 font-mono text-xs">{{ transit.downstreamUrl }}</code>
        </div>
        <div class="grid grid-cols-[120px_1fr] gap-2">
          <span class="text-gray-500">API Key</span>
          <code class="text-gray-800 font-mono text-xs">{{ transit.hasApiKey ? '••••••••（已加密存储）' : '未配置' }}</code>
        </div>
        <div class="grid grid-cols-[120px_1fr] gap-2">
          <span class="text-gray-500">翻译模板</span>
          <code class="text-gray-800 font-mono text-xs">{{ transit.template }}</code>
        </div>
      </div>
    </div>

    <!-- 编辑 Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">编辑中转</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">下游 URL</label>
            <input
              v-model="editForm.targetUrl"
              type="text"
              placeholder="https://api.dify.ai/v1/chat-messages"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p class="text-xs text-gray-400 mt-1">下游服务的完整调用地址</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">翻译模板</label>
            <select
              v-model="editForm.templateMode"
              @change="onTemplateModeChange"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option
                v-for="t in availableTemplates"
                :key="t.value"
                :value="t.value"
              >{{ t.label }}（{{ t.description }}）</option>
              <option value="__custom__">— 自定义模板 —</option>
            </select>
            <input
              v-if="editForm.templateMode === '__custom__'"
              v-model="editForm.template"
              type="text"
              placeholder="输入自定义模板名称（如 dify-chat-messages-流式）"
              class="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p class="text-xs text-gray-400 mt-1">
              {{ editForm.templateMode === '__custom__'
                ? '自定义模板名称，需确保后端已注册对应翻译逻辑'
                : '选择已注册的翻译模板，请求/响应将按该模板自动翻译' }}
            </p>
          </div>
          <div v-if="editErrorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ editErrorMsg }}</div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="closeEditModal"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >取消</button>
          <button
            @click="saveEdit"
            :disabled="savingEdit"
            class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >{{ savingEdit ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
    <p class="text-sm">加载中...</p>
  </div>

  <div v-else class="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
    <p class="text-sm">中转不存在</p>
    <button @click="router.back()" class="mt-3 text-primary-600 text-sm hover:underline">返回</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronDown, Code2, X } from 'lucide-vue-next'
import AccessCodePanel from '@/components/AccessCodePanel.vue'
import { downstreamTemplates } from '@/stores/app'
import { getProject, type Project as ApiProject } from '@/api/projects'
import { getRoute, updateRoute, deleteRoute } from '@/api/routes'
import { getTransformerByRoute, updateTransformer } from '@/api/transformers'

const route = useRoute()
const router = useRouter()

// 合并视图模型：route + transformer + 项目信息
interface TransitView {
  id: string
  name: string
  downstreamType: 'n8n' | 'dify' | string
  status: 'active' | 'paused'
  createdAt: string
  todayCalls: number
  errorRate: number
  avgLatency: number
  routePath: string
  downstreamUrl: string
  hasApiKey: boolean
  template: string
  transformerId: string | null  // 编辑功能需要：保存 transformer.id
}

const transit = ref<TransitView | null>(null)
const project = ref<ApiProject | null>(null)
const loading = ref(true)
const showConfig = ref(false)

async function loadData() {
  loading.value = true
  try {
    const routeId = route.params.transitId as string
    // 并行加载路由 + 转换器
    const [routeData, transformerData] = await Promise.all([
      getRoute(routeId),
      getTransformerByRoute(routeId).catch(() => null),
    ])

    // 加载所属项目
    const projectData = await getProject(routeData.project_id)

    // 推断下游类型（从 transformer.type 字符串判断）
    const tType = transformerData?.type || ''
    const downstreamType = tType.includes('dify') ? 'dify' : tType.includes('n8n') ? 'n8n' : 'dify'

    transit.value = {
      id: routeData.id,
      name: routeData.path.split('/').pop() || routeData.path,
      downstreamType,
      status: routeData.is_active ? 'active' : 'paused',
      createdAt: (routeData.created_at || '').split('T')[0],
      todayCalls: 0,
      errorRate: 0,
      avgLatency: 0,
      routePath: routeData.path,
      downstreamUrl: transformerData?.target_url || '未配置',
      hasApiKey: !!transformerData?.credential_id,
      template: transformerData?.type || '未配置',
      transformerId: transformerData?.id || null,
    }
    project.value = projectData
  } catch (e) {
    console.error('加载中转详情失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const formatNumber = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

// ===== 暂停/启用 =====
const togglingStatus = ref(false)
const toggleStatus = async () => {
  if (!transit.value) return
  togglingStatus.value = true
  try {
    const willActive = transit.value.status !== 'active'
    await updateRoute(transit.value.id, { is_active: willActive })
    transit.value.status = willActive ? 'active' : 'paused'
  } catch (e: any) {
    alert(e?.message || '状态切换失败')
  } finally {
    togglingStatus.value = false
  }
}

// ===== 删除 =====
const deleting = ref(false)
const handleDelete = async () => {
  if (!transit.value || !project.value) return
  if (!confirm(`确认删除中转「${transit.value.name}」？\n该操作不可恢复，关联的 transformer 也会被清理。`)) return
  deleting.value = true
  try {
    await deleteRoute(transit.value.id)
    router.push(`/projects/${project.value.id}`)
  } catch (e: any) {
    alert(e?.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

// ===== 编辑（下游 URL + 翻译模板）=====
const showEditModal = ref(false)
const savingEdit = ref(false)
const editErrorMsg = ref('')
// templateMode：下拉选中的值；预置模板时等于 template，自定义时为 '__custom__'
// template：实际提交的模板名称（自定义模式下由用户输入）
const editForm = ref({ targetUrl: '', template: '', templateMode: '' })

/**
 * 当前下游类型对应的预置模板列表
 * downstreamType 可能是 'dify' / 'n8n' / 其它字符串，安全起见用 keyof 收敛
 */
const availableTemplates = computed(() => {
  const t = transit.value?.downstreamType
  if (t === 'dify' || t === 'n8n') return downstreamTemplates[t]
  return []
})

/**
 * 模板下拉切换处理：
 * - 选预置模板：把 template 同步为该模板 value
 * - 选"自定义"：清空 template，让用户输入
 */
const onTemplateModeChange = () => {
  if (editForm.value.templateMode === '__custom__') {
    editForm.value.template = ''
  } else {
    editForm.value.template = editForm.value.templateMode
  }
}

const openEditModal = () => {
  if (!transit.value) return
  editForm.value.targetUrl = transit.value.downstreamUrl === '未配置' ? '' : transit.value.downstreamUrl
  const currentTemplate = transit.value.template === '未配置' ? '' : transit.value.template
  editForm.value.template = currentTemplate
  // 判断当前模板是否在预置列表中：是则选中对应项，否则进入自定义模式
  const presetValues = availableTemplates.value.map(t => t.value)
  editForm.value.templateMode = currentTemplate && presetValues.includes(currentTemplate)
    ? currentTemplate
    : '__custom__'
  editErrorMsg.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editErrorMsg.value = ''
}

const saveEdit = async () => {
  if (!transit.value) return
  if (!editForm.value.targetUrl.trim()) {
    editErrorMsg.value = '下游 URL 不能为空'
    return
  }
  // 自定义模式下 template 必填；预置模式下 template 已由 templateMode 同步
  const finalTemplate = editForm.value.template.trim()
  if (!finalTemplate) {
    editErrorMsg.value = '翻译模板不能为空'
    return
  }
  if (!transit.value.transformerId) {
    editErrorMsg.value = '该中转未关联 transformer，无法编辑（请在中转创建时配置）'
    return
  }
  savingEdit.value = true
  editErrorMsg.value = ''
  try {
    const updated = await updateTransformer(transit.value.transformerId, {
      target_url: editForm.value.targetUrl.trim(),
      type: finalTemplate,
    })
    // 同步本地视图
    transit.value.downstreamUrl = updated.target_url
    transit.value.template = updated.type
    transit.value.downstreamType = updated.type.includes('dify') ? 'dify' : updated.type.includes('n8n') ? 'n8n' : transit.value.downstreamType
    showEditModal.value = false
  } catch (e: any) {
    editErrorMsg.value = e?.message || '保存失败'
  } finally {
    savingEdit.value = false
  }
}
</script>
