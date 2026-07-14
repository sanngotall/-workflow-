<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { useNotifications } from '@/utils/notification'
import type { Transformer, Credential } from '@/types'

const route = useRoute()
const router = useRouter()
const { addNotification } = useNotifications()

const routeId = computed(() => route.params.id as string)

const transformer = ref<Transformer | null>(null)
const credentials = ref<Credential[]>([])
const isLoading = ref(true)
const testLoading = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const form = ref({
  target_url: '',
  type: 'visual' as 'visual' | 'script',
  credential_id: '',
  mapping_rules: [] as Array<{ from: string; to: string }>,
  script_code: '// 编写转换脚本\n// 输入: req.body\n// 输出: transformedBody\n\nexport default function transform(req) {\n  return req.body;\n}',
  response_rules: [] as Array<{ from: string; to: string }>
})

const addMappingRule = () => {
  form.value.mapping_rules.push({ from: '', to: '' })
}

const removeMappingRule = (index: number) => {
  form.value.mapping_rules.splice(index, 1)
}

const addResponseRule = () => {
  form.value.response_rules.push({ from: '', to: '' })
}

const removeResponseRule = (index: number) => {
  form.value.response_rules.splice(index, 1)
}

const loadTransformer = async () => {
  isLoading.value = true
  try {
    transformer.value = await api.transformers.getByRoute(routeId.value)
    if (transformer.value) {
      form.value = {
        target_url: transformer.value.target_url,
        type: transformer.value.type,
        credential_id: transformer.value.credential_id || '',
        mapping_rules: transformer.value.mapping_rules ? Object.entries(transformer.value.mapping_rules).map(([from, to]) => ({ from, to: String(to) })) : [],
        script_code: transformer.value.script_code || form.value.script_code,
        response_rules: transformer.value.response_rules ? Object.entries(transformer.value.response_rules).map(([from, to]) => ({ from, to: String(to) })) : []
      }
    }
  } catch {
    transformer.value = null
  } finally {
    isLoading.value = false
  }
}

const loadCredentials = async () => {
  try {
    credentials.value = await api.credentials.getByProject(localStorage.getItem('currentProjectId') || '')
  } catch {
    credentials.value = []
  }
}

const testConnection = async () => {
  if (!form.value.target_url) {
    addNotification('warning', '警告', '请输入目标 URL')
    return
  }
  
  testLoading.value = true
  testResult.value = null
  
  try {
    const result = await api.transformers.testConnection(form.value.target_url)
    testResult.value = result
    if (result.success) {
      addNotification('success', '成功', '连接测试通过')
    } else {
      addNotification('error', '失败', result.message)
    }
  } catch {
    testResult.value = { success: false, message: '测试失败，请检查网络连接' }
  } finally {
    testLoading.value = false
  }
}

const handleSave = async () => {
  if (!form.value.target_url) {
    addNotification('warning', '警告', '请输入目标 URL')
    return
  }
  
  const payload = {
    route_id: routeId.value,
    target_url: form.value.target_url,
    type: form.value.type,
    credential_id: form.value.credential_id || undefined,
    mapping_rules: form.value.type === 'visual' ? Object.fromEntries(form.value.mapping_rules.map(r => [r.from, r.to])) : undefined,
    script_code: form.value.type === 'script' ? form.value.script_code : undefined,
    response_rules: form.value.response_rules.length > 0 ? Object.fromEntries(form.value.response_rules.map(r => [r.from, r.to])) : undefined
  }
  
  try {
    if (transformer.value) {
      await api.transformers.update(transformer.value.id, payload)
    } else {
      await api.transformers.create(payload)
    }
    addNotification('success', '成功', '配置已成功同步至网关集群运行时（秒级热重载已完成）')
  } catch {
    addNotification('error', '错误', '保存失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await loadTransformer()
  await loadCredentials()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text-main">转换器配置</h1>
        <p class="text-text-secondary mt-1">配置请求数据的翻译规则</p>
      </div>
      <button class="btn btn-secondary" @click="goBack">返回</button>
    </div>
    
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="space-y-6">
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-text-main mb-4">基础配置</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">
              目标 URL
              <button 
                class="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                @click="testConnection"
                :disabled="testLoading"
              >
                {{ testLoading ? '测试中...' : 'Test Connection' }}
              </button>
            </label>
            <div class="relative">
              <input
                v-model="form.target_url"
                type="text"
                placeholder="https://dify.internal.net/v1/completion"
                class="input"
              />
              <div 
                v-if="testResult"
                class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs"
                :class="testResult.success ? 'bg-secondary/20 text-secondary' : 'bg-danger/20 text-danger'"
              >
                {{ testResult.success ? 'Connected' : 'Timeout' }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">转换模式</label>
              <select v-model="form.type" class="input">
                <option value="visual">Visual（声明式映射）</option>
                <option value="script">Script（动态脚本）</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">凭证</label>
              <select v-model="form.credential_id" class="input">
                <option value="">无凭证</option>
                <option v-for="cred in credentials" :key="cred.id" :value="cred.id">
                  {{ cred.name }} ({{ cred.type }})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="form.type === 'visual'" class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-text-main">请求映射规则</h3>
          <button class="btn btn-sm btn-primary" @click="addMappingRule">
            添加规则
          </button>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="(rule, index) in form.mapping_rules" 
            :key="index"
            class="flex items-center gap-3 p-3 bg-bg-sidebar rounded-lg"
          >
            <input
              v-model="rule.from"
              type="text"
              placeholder="源字段 (如 req.body.text)"
              class="input flex-1"
            />
            <span class="text-text-muted">→</span>
            <input
              v-model="rule.to"
              type="text"
              placeholder="目标字段 (如 query)"
              class="input flex-1"
            />
            <button 
              class="p-2 rounded-lg hover:bg-danger/20 text-text-secondary hover:text-danger"
              @click="removeMappingRule(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
          
          <div v-if="form.mapping_rules.length === 0" class="text-center py-6 text-text-muted">
            <p>点击上方按钮添加映射规则</p>
            <p class="text-sm mt-1">示例：req.body.text → query</p>
          </div>
        </div>
      </div>
      
      <div v-else class="card p-5">
        <h3 class="text-lg font-semibold text-text-main mb-4">脚本编辑器</h3>
        <textarea
          v-model="form.script_code"
          class="w-full h-64 p-4 bg-bg-sidebar border border-bg-hover rounded-lg text-text-main font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        ></textarea>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-text-main">响应映射规则（可选）</h3>
          <button class="btn btn-sm btn-primary" @click="addResponseRule">
            添加规则
          </button>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="(rule, index) in form.response_rules" 
            :key="index"
            class="flex items-center gap-3 p-3 bg-bg-sidebar rounded-lg"
          >
            <input
              v-model="rule.from"
              type="text"
              placeholder="源字段"
              class="input flex-1"
            />
            <span class="text-text-muted">→</span>
            <input
              v-model="rule.to"
              type="text"
              placeholder="目标字段"
              class="input flex-1"
            />
            <button 
              class="p-2 rounded-lg hover:bg-danger/20 text-text-secondary hover:text-danger"
              @click="removeResponseRule(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
          
          <div v-if="form.response_rules.length === 0" class="text-center py-6 text-text-muted">
            <p>点击上方按钮添加响应映射规则（可选）</p>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-3">
        <button class="btn btn-secondary" @click="goBack">取消</button>
        <button class="btn btn-primary" @click="handleSave">保存配置</button>
      </div>
    </div>
  </div>
</template>
