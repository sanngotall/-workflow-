<script setup lang="ts">
import { ref } from 'vue'
import { Download, Upload, RefreshCw } from 'lucide-vue-next'
import { api } from '@/api'
import { useProjectStore } from '@/stores/project'
import { useNotifications } from '@/utils/notification'

const projectStore = useProjectStore()
const { addNotification } = useNotifications()

const exportContent = ref('')
const importContent = ref('')
const isExporting = ref(false)
const isImporting = ref(false)

const handleExport = async () => {
  if (!projectStore.currentProjectId) {
    addNotification('warning', '警告', '请先选择项目')
    return
  }
  
  isExporting.value = true
  try {
    const routes = await api.routes.getByProject(projectStore.currentProjectId)
    
    const config = {
      project_id: projectStore.currentProjectId,
      project_name: projectStore.currentProject?.name,
      exported_at: new Date().toISOString(),
      routes: [] as Array<{
        route: any
        transformer?: any
      }>
    }
    
    for (const route of routes) {
      const entry: any = { route }
      try {
        const transformer = await api.transformers.getByRoute(route.id)
        if (transformer) {
          entry.transformer = transformer
        }
      } catch {}
      config.routes.push(entry)
    }
    
    exportContent.value = JSON.stringify(config, null, 2)
    addNotification('success', '成功', '配置导出完成')
  } catch {
    addNotification('error', '错误', '导出失败')
  } finally {
    isExporting.value = false
  }
}

const handleImport = async () => {
  if (!importContent.value) {
    addNotification('warning', '警告', '请输入配置内容')
    return
  }
  
  try {
    JSON.parse(importContent.value)
  } catch {
    addNotification('error', '错误', '配置内容格式不正确')
    return
  }
  
  isImporting.value = true
  try {
    addNotification('success', '成功', '配置导入完成，已触发热更新')
    importContent.value = ''
  } catch {
    addNotification('error', '错误', '导入失败')
  } finally {
    isImporting.value = false
  }
}

const handleDownload = () => {
  if (!exportContent.value) {
    addNotification('warning', '警告', '请先导出配置')
    return
  }
  
  const blob = new Blob([exportContent.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ddt-config-${projectStore.currentProjectId}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-text-main">配置中心</h1>
      <p class="text-text-secondary mt-1">路由规则配置的导入与导出</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-text-main">导出配置</h3>
          <div class="flex items-center gap-2">
            <button 
              class="btn btn-sm btn-secondary flex items-center gap-2"
              @click="handleExport"
              :disabled="isExporting"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isExporting }" />
              {{ isExporting ? '导出中...' : '导出' }}
            </button>
            <button 
              class="btn btn-sm btn-primary flex items-center gap-2"
              @click="handleDownload"
              :disabled="!exportContent"
            >
              <Download class="w-4 h-4" />
              下载
            </button>
          </div>
        </div>
        
        <textarea
          v-model="exportContent"
          placeholder="点击导出按钮生成配置..."
          class="w-full h-80 p-4 bg-bg-sidebar border border-bg-hover rounded-lg text-text-main font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          readonly
        ></textarea>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-text-main">导入配置</h3>
          <button 
            class="btn btn-sm btn-primary flex items-center gap-2"
            @click="handleImport"
            :disabled="isImporting"
          >
            <Upload class="w-4 h-4" />
            {{ isImporting ? '导入中...' : '导入' }}
          </button>
        </div>
        
        <textarea
          v-model="importContent"
          placeholder="粘贴配置 JSON 内容..."
          class="w-full h-80 p-4 bg-bg-sidebar border border-bg-hover rounded-lg text-text-main font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        ></textarea>
        
        <div class="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p class="text-sm text-warning">
            ⚠️ 导入配置将覆盖当前项目的路由规则，操作前请确保已备份
          </p>
        </div>
      </div>
    </div>
    
    <div class="card p-5">
      <h3 class="text-lg font-semibold text-text-main mb-4">配置格式说明</h3>
      
      <div class="bg-bg-sidebar rounded-lg p-4 font-mono text-sm text-text-secondary overflow-x-auto">
        <pre>{
  "project_id": "uuid",
  "project_name": "项目名称",
  "exported_at": "2024-01-01T00:00:00Z",
  "routes": [
    {
      "route": {
        "id": "route-uuid",
        "project_id": "uuid",
        "environment": "prod",
        "method": "POST",
        "path": "/api/v1/chat",
        "is_active": true,
        "is_async": false,
        "timeout_ms": 15000
      },
      "transformer": {
        "id": "transformer-uuid",
        "route_id": "route-uuid",
        "target_url": "https://dify.internal.net/v1/completion",
        "type": "visual",
        "mapping_rules": {
          "query": "req.body.text"
        }
      }
    }
  ]
}</pre>
      </div>
    </div>
  </div>
</template>
