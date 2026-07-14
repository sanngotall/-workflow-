<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit3, Trash2, Shield } from 'lucide-vue-next'
import { api } from '@/api'
import { useNotifications } from '@/utils/notification'
import { useProjectStore } from '@/stores/project'
import type { Credential } from '@/types'

const projectStore = useProjectStore()
const { addNotification } = useNotifications()

const credentials = ref<Credential[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const showEditModal = ref(false)

const form = ref({
  name: '',
  type: 'Bearer' as 'Bearer' | 'Basic' | 'Custom',
  secret: ''
})

const editForm = ref({
  id: '',
  name: '',
  type: 'Bearer' as 'Bearer' | 'Basic' | 'Custom',
  secret: ''
})

const credentialTypes = ['Bearer', 'Basic', 'Custom']

const loadCredentials = async () => {
  isLoading.value = true
  try {
    credentials.value = await api.credentials.getByProject(projectStore.currentProjectId || '')
  } catch {
    credentials.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreate = async () => {
  if (!form.value.name || !form.value.secret) {
    addNotification('warning', '警告', '请填写完整信息')
    return
  }
  
  try {
    await api.credentials.create({
      project_id: projectStore.currentProjectId || '',
      ...form.value
    })
    addNotification('success', '成功', '凭证创建成功')
    showModal.value = false
    form.value = { name: '', type: 'Bearer', secret: '' }
    await loadCredentials()
  } catch {
    addNotification('error', '错误', '创建失败')
  }
}

const handleEdit = async () => {
  if (!editForm.value.name) {
    addNotification('warning', '警告', '请填写名称')
    return
  }
  
  const payload: { name?: string; type?: string; secret?: string } = {
    name: editForm.value.name,
    type: editForm.value.type
  }
  
  if (editForm.value.secret) {
    payload.secret = editForm.value.secret
  }
  
  try {
    await api.credentials.update(editForm.value.id, payload)
    addNotification('success', '成功', '凭证更新成功')
    showEditModal.value = false
    await loadCredentials()
  } catch {
    addNotification('error', '错误', '更新失败')
  }
}

const openEditModal = (credential: Credential) => {
  editForm.value = {
    id: credential.id,
    name: credential.name,
    type: credential.type,
    secret: ''
  }
  showEditModal.value = true
}

const handleDelete = async (id: string, name: string) => {
  if (!confirm(`确定要删除凭证 "${name}" 吗？`)) return
  
  try {
    await api.credentials.delete(id)
    addNotification('success', '成功', '凭证已删除')
    await loadCredentials()
  } catch {
    addNotification('error', '错误', '删除失败')
  }
}

onMounted(loadCredentials)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text-main">凭证管理</h1>
        <p class="text-text-secondary mt-1">管理第三方服务的安全凭证（AES-256-GCM 加密存储）</p>
      </div>
      <button 
        class="btn btn-primary" 
        @click="showModal = true"
      >
        <Plus class="w-5 h-5" />
        新建凭证
      </button>
    </div>
    
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>密钥</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="credential in credentials" :key="credential.id">
              <td class="font-medium">{{ credential.name }}</td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-primary/20 text-primary': credential.type === 'Bearer',
                    'bg-accent/20 text-accent': credential.type === 'Basic',
                    'bg-secondary/20 text-secondary': credential.type === 'Custom'
                  }"
                >
                  {{ credential.type }}
                </span>
              </td>
              <td class="font-mono text-sm text-text-muted">******</td>
              <td>{{ credential.created_at.split('T')[0] }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button 
                    class="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-main"
                    @click="openEditModal(credential)"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button 
                    class="p-1.5 rounded-lg hover:bg-danger/20 text-text-secondary hover:text-danger"
                    @click="handleDelete(credential.id, credential.name)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="credentials.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield class="w-8 h-8 text-text-muted" />
        </div>
        <h3 class="text-lg font-semibold text-text-main mb-2">暂无凭证</h3>
        <p class="text-text-secondary">创建凭证用于访问下游服务</p>
      </div>
    </div>
    
    <Transition name="modal">
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showModal = false"
      >
        <div class="card p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold text-text-main mb-4">新建凭证</h3>
          <form @submit.prevent="handleCreate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">凭证名称</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="例如：Dify API Key"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">凭证类型</label>
              <select v-model="form.type" class="input">
                <option v-for="type in credentialTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">密钥</label>
              <input
                v-model="form.secret"
                type="password"
                placeholder="输入密钥"
                class="input font-mono"
              />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn btn-secondary flex-1" @click="showModal = false">取消</button>
              <button type="submit" class="btn btn-primary flex-1">创建</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
    
    <Transition name="modal">
      <div 
        v-if="showEditModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showEditModal = false"
      >
        <div class="card p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold text-text-main mb-4">编辑凭证</h3>
          <form @submit.prevent="handleEdit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">凭证名称</label>
              <input
                v-model="editForm.name"
                type="text"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">凭证类型</label>
              <select v-model="editForm.type" class="input">
                <option v-for="type in credentialTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">新密钥</label>
              <input
                v-model="editForm.secret"
                type="password"
                placeholder="无需修改请留空"
                class="input font-mono"
              />
              <p class="text-xs text-text-muted mt-1">密钥将通过 AES-256-GCM 加密存储</p>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn btn-secondary flex-1" @click="showEditModal = false">取消</button>
              <button type="submit" class="btn btn-primary flex-1">保存</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
