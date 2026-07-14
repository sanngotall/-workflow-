<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">数据表管理</h1>
        <p class="text-gray-500 mt-1">查看和管理数据库中的所有数据表</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        <Plus class="w-4 h-4 inline mr-2" />
        新建表
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索表名..."
              class="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>全部</option>
            <option>系统表</option>
            <option>业务表</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">表名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">字段数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">行数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="table in tables"
              :key="table.name"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <Table class="w-5 h-5 text-gray-400" />
                  <span class="text-sm font-medium text-gray-800">{{ table.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ table.columns }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ table.rows.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ table.size }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ table.createdAt }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button class="text-gray-400 hover:text-primary-600 transition-colors">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button class="text-gray-400 hover:text-primary-600 transition-colors">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button class="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">显示 1-{{ tables.length }} 条，共 {{ tables.length }} 条</p>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">上一页</button>
          <button class="px-3 py-1 text-sm bg-primary-600 text-white rounded">1</button>
          <button class="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">下一页</button>
        </div>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeCreateModal"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeCreateModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">新建数据表</h3>
          <button @click="closeCreateModal" class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">表名</label>
            <div class="flex items-center gap-3">
              <input
                v-model="createForm.tableName"
                type="text"
                placeholder="请输入表名（小写英文，下划线分隔）"
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span class="text-xs text-gray-500">例如: user_info</span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="block text-sm font-medium text-gray-700">字段列表</label>
              <button
                @click="addField"
                class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-1"
              >
                <Plus class="w-4 h-4" />
                添加字段
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(field, index) in createForm.fields"
                :key="index"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xs font-medium text-gray-500">字段 {{ index + 1 }}</span>
                  <button
                    v-if="createForm.fields.length > 1"
                    @click="removeField(index)"
                    class="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">字段名</label>
                    <input
                      v-model="field.name"
                      type="text"
                      placeholder="字段名"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">数据类型</label>
                    <select
                      v-model="field.type"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="INT">INT</option>
                      <option value="BIGINT">BIGINT</option>
                      <option value="VARCHAR">VARCHAR</option>
                      <option value="TEXT">TEXT</option>
                      <option value="DATE">DATE</option>
                      <option value="DATETIME">DATETIME</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="FLOAT">FLOAT</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="JSON">JSON</option>
                      <option value="UUID">UUID</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">长度/精度</label>
                    <input
                      v-model="field.length"
                      type="text"
                      placeholder="如: 255"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">默认值</label>
                    <input
                      v-model="field.defaultValue"
                      type="text"
                      placeholder="默认值"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-6 mt-3">
                  <label class="flex items-center gap-2">
                    <input
                      v-model="field.primaryKey"
                      type="checkbox"
                      class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span class="text-xs text-gray-600">主键</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input
                      v-model="field.autoIncrement"
                      type="checkbox"
                      :disabled="!field.primaryKey"
                      class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span class="text-xs text-gray-600">自增</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input
                      v-model="field.notNull"
                      type="checkbox"
                      class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span class="text-xs text-gray-600">NOT NULL</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input
                      v-model="field.unique"
                      type="checkbox"
                      class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span class="text-xs text-gray-600">UNIQUE</span>
                  </label>
                </div>

                <div class="mt-3">
                  <label class="block text-xs font-medium text-gray-600 mb-1">字段注释</label>
                  <input
                    v-model="field.comment"
                    type="text"
                    placeholder="字段描述"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 class="text-sm font-medium text-blue-800 mb-2">生成的 SQL</h4>
              <pre class="text-xs text-blue-600 font-mono overflow-x-auto">{{ generateSql() }}</pre>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            @click="closeCreateModal"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="createTable"
            :disabled="!createForm.tableName || createForm.fields.length === 0"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建表
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Search, Table, Eye, Edit3, Trash2, X } from 'lucide-vue-next'

interface Field {
  name: string
  type: string
  length: string
  defaultValue: string
  primaryKey: boolean
  autoIncrement: boolean
  notNull: boolean
  unique: boolean
  comment: string
}

interface TableItem {
  name: string
  columns: number
  rows: number
  size: string
  createdAt: string
}

const searchQuery = ref('')
const showCreateModal = ref(false)

const createForm = reactive({
  tableName: '',
  fields: [] as Field[]
})

const tables = ref<TableItem[]>([
  { name: 'projects', columns: 12, rows: 100, size: '156 KB', createdAt: '2024-01-10' },
  { name: 'routes', columns: 15, rows: 500, size: '782 KB', createdAt: '2024-01-10' },
  { name: 'credentials', columns: 8, rows: 80, size: '45 KB', createdAt: '2024-01-10' },
  { name: 'transformers', columns: 10, rows: 120, size: '234 KB', createdAt: '2024-01-10' },
  { name: 'project_members', columns: 6, rows: 350, size: '189 KB', createdAt: '2024-01-10' },
  { name: 'users', columns: 10, rows: 200, size: '98 KB', createdAt: '2024-01-10' },
  { name: 'api_logs', columns: 12, rows: 12500, size: '5.2 MB', createdAt: '2024-01-10' },
  { name: 'rate_limits', columns: 5, rows: 50, size: '23 KB', createdAt: '2024-01-10' },
  { name: 'webhooks', columns: 8, rows: 30, size: '15 KB', createdAt: '2024-01-10' },
  { name: 'oauth_clients', columns: 7, rows: 10, size: '8 KB', createdAt: '2024-01-10' },
  { name: 'oauth_tokens', columns: 6, rows: 150, size: '32 KB', createdAt: '2024-01-10' },
  { name: 'system_settings', columns: 4, rows: 25, size: '5 KB', createdAt: '2024-01-10' }
])

const openCreateModal = () => {
  createForm.tableName = ''
  createForm.fields = [{
    name: '',
    type: 'INT',
    length: '',
    defaultValue: '',
    primaryKey: false,
    autoIncrement: false,
    notNull: false,
    unique: false,
    comment: ''
  }]
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const addField = () => {
  createForm.fields.push({
    name: '',
    type: 'VARCHAR',
    length: '',
    defaultValue: '',
    primaryKey: false,
    autoIncrement: false,
    notNull: false,
    unique: false,
    comment: ''
  })
}

const removeField = (index: number) => {
  createForm.fields.splice(index, 1)
}

const generateSql = () => {
  if (!createForm.tableName || createForm.fields.length === 0) {
    return '-- 请输入表名和字段'
  }

  let sql = `CREATE TABLE ${createForm.tableName} (\n`
  
  const fieldSqls = createForm.fields.map(field => {
    let fieldDef = `  ${field.name || 'field_name'} ${field.type}`
    
    if (field.length) {
      fieldDef += `(${field.length})`
    }
    
    if (field.primaryKey) {
      fieldDef += ' PRIMARY KEY'
    }
    
    if (field.autoIncrement) {
      fieldDef += ' AUTO_INCREMENT'
    }
    
    if (field.notNull) {
      fieldDef += ' NOT NULL'
    }
    
    if (field.unique) {
      fieldDef += ' UNIQUE'
    }
    
    if (field.defaultValue) {
      const value = ['INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'BOOLEAN'].includes(field.type)
        ? field.defaultValue
        : `'${field.defaultValue}'`
      fieldDef += ` DEFAULT ${value}`
    }
    
    if (field.comment) {
      fieldDef += ` COMMENT '${field.comment}'`
    }
    
    return fieldDef
  })
  
  sql += fieldSqls.join(',\n')
  sql += '\n);'
  
  return sql
}

const createTable = () => {
  if (!createForm.tableName || createForm.fields.length === 0) {
    return
  }

  tables.value.unshift({
    name: createForm.tableName,
    columns: createForm.fields.length,
    rows: 0,
    size: '0 KB',
    createdAt: new Date().toISOString().split('T')[0]
  })

  closeCreateModal()
}
</script>