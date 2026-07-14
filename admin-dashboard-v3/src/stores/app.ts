import { defineStore } from 'pinia'
import { ref } from 'vue'

// 项目类型
export interface Project {
  id: string
  name: string
  description: string
  color: string
  status: 'active' | 'paused'
  todayCalls: number
  errorRate: number
  activeTransits: number
  environment: 'development' | 'staging' | 'production'
  rateLimit: number
  createdAt: string
}

// 中转类型
export interface Transit {
  id: string
  projectId: string
  name: string
  downstreamType: 'n8n' | 'dify'
  downstreamUrl: string
  hasApiKey: boolean
  template: string
  status: 'active' | 'paused'
  todayCalls: number
  errorRate: number
  avgLatency: number
  createdAt: string
}

// 业务数据表（表隔离：每项目在共享库内拥有独立的一套表，表名前缀 = projectId）
export interface BusinessTable {
  id: string
  projectId: string
  tableName: string                     // 实际表名，如 proj001_chat_logs
  displayName: string                   // 用户看到的名字，如 "对话记录"
  storageType: 'cache' | 'persistent'   // 临时缓存（TTL）or 长期存储
  ttlSeconds?: number                   // 仅 cache 类型有，过期自动清理
  source: 'request' | 'response' | 'mixed'  // 数据来源：请求 / 返回 / 混合
  fields: BusinessField[]
  rowCount: number
  sizeMB: number
  createdAt: string
}

export interface BusinessField {
  name: string                          // 字段名
  type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp'
  source: 'request' | 'response' | 'system'  // 来源
  enabled: boolean                      // 是否存储
  nullable: boolean
  isPrimaryKey: boolean
  description?: string                  // 从翻译模板派生时的说明
}

// 表行数据（key 为字段名）
export type TableRow = Record<string, string | number | boolean | null>

// 数据库实例（保留用于备份迁移页的运维视角，不再独立成"实例总览"页）
export interface DatabaseInstance {
  id: string
  name: string
  type: 'postgresql'
  host: string
  port: number
  status: 'healthy' | 'warning' | 'error'
  cpu: number
  memory: number
  connections: number
  maxConnections: number
  databaseCount: number
  capacityMB: number
  usedMB: number
  version: string
  region: string
}

// 模拟项目
const mockProjects: Project[] = [
  {
    id: 'proj_001', name: '电商平台', description: '电商平台核心网关服务，集成客服与下单流程',
    color: 'bg-gradient-to-br from-blue-500 to-blue-700', status: 'active',
    todayCalls: 18432, errorRate: 0.8, activeTransits: 6, environment: 'production',
    rateLimit: 1000, createdAt: '2026-01-10'
  },
  {
    id: 'proj_002', name: 'CRM 系统', description: '客户关系管理系统，对接 Dify 智能客服',
    color: 'bg-gradient-to-br from-green-500 to-emerald-700', status: 'active',
    todayCalls: 9214, errorRate: 0.3, activeTransits: 4, environment: 'production',
    rateLimit: 800, createdAt: '2026-01-05'
  },
  {
    id: 'proj_003', name: '数据分析', description: '数据分析平台 API 网关，对接 n8n 工作流',
    color: 'bg-gradient-to-br from-purple-500 to-violet-700', status: 'paused',
    todayCalls: 1240, errorRate: 1.2, activeTransits: 2, environment: 'staging',
    rateLimit: 500, createdAt: '2025-12-20'
  },
  {
    id: 'proj_004', name: '支付服务', description: '支付网关服务，支持多渠道支付和回调处理',
    color: 'bg-gradient-to-br from-orange-500 to-red-700', status: 'active',
    todayCalls: 5621, errorRate: 0.5, activeTransits: 3, environment: 'production',
    rateLimit: 2000, createdAt: '2026-01-12'
  }
]

// 模拟中转
const mockTransits: Transit[] = [
  {
    id: 'tr_001', projectId: 'proj_001', name: '客服对话-主流程',
    downstreamType: 'dify', downstreamUrl: 'https://api.dify.ai/v1/chat-messages',
    hasApiKey: true, template: 'dify-chat-messages-标准', status: 'active',
    todayCalls: 8421, errorRate: 0.5, avgLatency: 320, createdAt: '2026-01-11'
  },
  {
    id: 'tr_002', projectId: 'proj_001', name: '订单状态查询',
    downstreamType: 'n8n', downstreamUrl: 'https://n8n.example.com/webhook/order-status',
    hasApiKey: true, template: 'n8n-webhook-标准', status: 'active',
    todayCalls: 6210, errorRate: 1.1, avgLatency: 180, createdAt: '2026-01-12'
  },
  {
    id: 'tr_003', projectId: 'proj_002', name: '智能客服主入口',
    downstreamType: 'dify', downstreamUrl: 'https://api.dify.ai/v1/chat-messages',
    hasApiKey: true, template: 'dify-chat-messages-标准', status: 'active',
    todayCalls: 5188, errorRate: 0.2, avgLatency: 280, createdAt: '2026-01-06'
  },
  {
    id: 'tr_004', projectId: 'proj_004', name: '支付回调中转',
    downstreamType: 'n8n', downstreamUrl: 'https://n8n.example.com/webhook/payment-callback',
    hasApiKey: true, template: 'n8n-webhook-标准', status: 'active',
    todayCalls: 3210, errorRate: 0.4, avgLatency: 150, createdAt: '2026-01-13'
  }
]

// 模拟数据库实例（共享 PostgreSQL 实例池）
const mockInstances: DatabaseInstance[] = [
  {
    id: 'inst_001', name: 'pg-cluster-01', type: 'postgresql',
    host: '192.168.31.40', port: 5432, status: 'healthy',
    cpu: 32, memory: 58, connections: 45, maxConnections: 200,
    databaseCount: 12, capacityMB: 51200, usedMB: 18432,
    version: 'PostgreSQL 16.2', region: '华北-北京'
  },
  {
    id: 'inst_002', name: 'pg-cluster-02', type: 'postgresql',
    host: '192.168.31.41', port: 5432, status: 'warning',
    cpu: 76, memory: 82, connections: 168, maxConnections: 200,
    databaseCount: 28, capacityMB: 102400, usedMB: 78642,
    version: 'PostgreSQL 16.2', region: '华北-北京'
  },
  {
    id: 'inst_003', name: 'pg-cluster-03', type: 'postgresql',
    host: '192.168.31.42', port: 5432, status: 'healthy',
    cpu: 18, memory: 35, connections: 12, maxConnections: 200,
    databaseCount: 4, capacityMB: 51200, usedMB: 4280,
    version: 'PostgreSQL 16.2', region: '华南-广州'
  }
]

// 模拟业务数据表（表隔离：表名前缀 = projectId 简写）
const mockBusinessTables: BusinessTable[] = [
  {
    id: 'bt_001', projectId: 'proj_001',
    tableName: 'proj001_chat_logs', displayName: '对话记录',
    storageType: 'persistent', source: 'mixed',
    fields: [
      { name: 'id', type: 'number', source: 'system', enabled: true, nullable: false, isPrimaryKey: true, description: '自增主键' },
      { name: 'session_id', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '会话 ID' },
      { name: 'user_query', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '用户提问内容' },
      { name: 'ai_reply', type: 'string', source: 'response', enabled: true, nullable: true, isPrimaryKey: false, description: 'AI 回复内容' },
      { name: 'model', type: 'string', source: 'response', enabled: false, nullable: true, isPrimaryKey: false, description: '使用的模型名称' },
      { name: 'tokens_used', type: 'number', source: 'response', enabled: true, nullable: true, isPrimaryKey: false, description: '消耗 token 数' },
      { name: 'created_at', type: 'timestamp', source: 'system', enabled: true, nullable: false, isPrimaryKey: false, description: '记录创建时间' }
    ],
    rowCount: 12580, sizeMB: 8.4, createdAt: '2026-01-11'
  },
  {
    id: 'bt_002', projectId: 'proj_001',
    tableName: 'proj001_session_cache', displayName: '会话缓存',
    storageType: 'cache', ttlSeconds: 1800, source: 'request',
    fields: [
      { name: 'id', type: 'string', source: 'system', enabled: true, nullable: false, isPrimaryKey: true, description: '会话 ID' },
      { name: 'user_id', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '用户标识' },
      { name: 'context', type: 'json', source: 'request', enabled: true, nullable: true, isPrimaryKey: false, description: '对话上下文' },
      { name: 'last_active', type: 'timestamp', source: 'system', enabled: true, nullable: false, isPrimaryKey: false, description: '最后活跃时间' }
    ],
    rowCount: 2310, sizeMB: 1.1, createdAt: '2026-01-12'
  },
  {
    id: 'bt_003', projectId: 'proj_002',
    tableName: 'proj002_customer_chats', displayName: '客户对话',
    storageType: 'persistent', source: 'mixed',
    fields: [
      { name: 'id', type: 'number', source: 'system', enabled: true, nullable: false, isPrimaryKey: true, description: '自增主键' },
      { name: 'customer_id', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '客户 ID' },
      { name: 'question', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '客户问题' },
      { name: 'answer', type: 'string', source: 'response', enabled: true, nullable: true, isPrimaryKey: false, description: '客服回复' },
      { name: 'satisfaction', type: 'number', source: 'response', enabled: true, nullable: true, isPrimaryKey: false, description: '满意度评分 1-5' },
      { name: 'created_at', type: 'timestamp', source: 'system', enabled: true, nullable: false, isPrimaryKey: false, description: '创建时间' }
    ],
    rowCount: 8942, sizeMB: 5.2, createdAt: '2026-01-07'
  },
  {
    id: 'bt_004', projectId: 'proj_004',
    tableName: 'proj004_payment_cache', displayName: '支付回调缓存',
    storageType: 'cache', ttlSeconds: 3600, source: 'request',
    fields: [
      { name: 'id', type: 'string', source: 'system', enabled: true, nullable: false, isPrimaryKey: true, description: '回调流水号' },
      { name: 'order_id', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '订单号' },
      { name: 'amount', type: 'number', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '金额' },
      { name: 'status', type: 'string', source: 'request', enabled: true, nullable: false, isPrimaryKey: false, description: '支付状态' },
      { name: 'received_at', type: 'timestamp', source: 'system', enabled: true, nullable: false, isPrimaryKey: false, description: '回调接收时间' }
    ],
    rowCount: 612, sizeMB: 0.3, createdAt: '2026-01-13'
  }
]

// 模拟表行数据（按 tableId 存放，用于图形化 CRUD 演示）
const mockTableRows: Record<string, TableRow[]> = {
  bt_001: [
    { id: 1, session_id: 's_001', user_query: '如何退款？', ai_reply: '请在订单页点击"申请退款"...', tokens_used: 156, created_at: '2026-06-27 09:23:11' },
    { id: 2, session_id: 's_002', user_query: '商品什么时候发货？', ai_reply: '通常下单后 24 小时内发货...', tokens_used: 132, created_at: '2026-06-27 09:45:22' },
    { id: 3, session_id: 's_003', user_query: '支持货到付款吗？', ai_reply: '部分地区支持货到付款...', tokens_used: 98, created_at: '2026-06-27 10:12:08' },
    { id: 4, session_id: 's_004', user_query: '保修期多久？', ai_reply: '整机保修一年...', tokens_used: 145, created_at: '2026-06-27 10:33:45' },
    { id: 5, session_id: 's_005', user_query: '怎么修改收货地址？', ai_reply: '在订单详情页可以修改...', tokens_used: 121, created_at: '2026-06-27 11:01:33' }
  ],
  bt_002: [
    { id: 's_001', user_id: 'u_1001', context: '{"topic":"退款"}', last_active: '2026-06-27 11:15:00' },
    { id: 's_002', user_id: 'u_1002', context: '{"topic":"发货"}', last_active: '2026-06-27 11:10:00' },
    { id: 's_003', user_id: 'u_1003', context: '{"topic":"保修"}', last_active: '2026-06-27 10:50:00' }
  ],
  bt_003: [
    { id: 1, customer_id: 'c_001', question: '我的订单在哪里查看？', answer: '在"我的订单"页面', satisfaction: 5, created_at: '2026-06-27 09:00:00' },
    { id: 2, customer_id: 'c_002', question: '如何联系人工客服？', answer: '回复"人工"即可转接', satisfaction: 4, created_at: '2026-06-27 09:30:00' },
    { id: 3, customer_id: 'c_003', question: '商品有质量问题怎么办？', answer: '可申请 7 天无理由退换', satisfaction: 5, created_at: '2026-06-27 10:00:00' }
  ],
  bt_004: [
    { id: 'cb_001', order_id: 'ord_20260627_001', amount: 299.00, status: 'success', received_at: '2026-06-27 10:23:11' },
    { id: 'cb_002', order_id: 'ord_20260627_002', amount: 1280.50, status: 'success', received_at: '2026-06-27 10:45:33' },
    { id: 'cb_003', order_id: 'ord_20260627_003', amount: 88.00, status: 'failed', received_at: '2026-06-27 11:02:08' }
  ]
}

// 下游模板
export const downstreamTemplates: Record<'n8n' | 'dify', { value: string; label: string; description: string }[]> = {
  n8n: [
    { value: 'n8n-webhook-标准', label: 'n8n Webhook 标准', description: '适配 n8n webhook 触发器，自动注入 json 字段' },
    { value: 'n8n-workflow-标准', label: 'n8n Workflow 标准', description: '适配 n8n 工作流 API，支持多步骤传参' }
  ],
  dify: [
    { value: 'dify-chat-messages-标准', label: 'Dify Chat Messages 标准', description: '适配 dify /v1/chat-messages，含 conversation_id' },
    { value: 'dify-workflow-标准', label: 'Dify Workflow 标准', description: '适配 dify /v1/workflows/run，含 inputs 字段' }
  ]
}

export const useAppStore = defineStore('app', () => {
  const projects = ref<Project[]>(mockProjects)
  const transits = ref<Transit[]>(mockTransits)
  const businessTables = ref<BusinessTable[]>(mockBusinessTables)
  const instances = ref<DatabaseInstance[]>(mockInstances)
  // 表行数据按 tableId 索引，存为响应式以便 CRUD 实时反映
  const tableRows = ref<Record<string, TableRow[]>>(JSON.parse(JSON.stringify(mockTableRows)))

  // 主导航状态
  const currentTopNav = ref<'dashboard' | 'projects' | 'database' | 'advanced'>('dashboard')
  const sidebarCollapsed = ref(false)

  const setTopNav = (id: 'dashboard' | 'projects' | 'database' | 'advanced') => {
    currentTopNav.value = id
  }
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 新建中转向导状态
  const wizardOpen = ref(false)
  const wizardProjectId = ref<string | null>(null)

  const openWizard = (projectId?: string) => {
    wizardProjectId.value = projectId || null
    wizardOpen.value = true
  }
  const closeWizard = () => {
    wizardOpen.value = false
    wizardProjectId.value = null
  }

  const addProject = (p: Omit<Project, 'id' | 'color' | 'status' | 'todayCalls' | 'errorRate' | 'activeTransits' | 'createdAt'>) => {
    const colorOptions = [
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-green-500 to-emerald-700',
      'bg-gradient-to-br from-purple-500 to-violet-700',
      'bg-gradient-to-br from-orange-500 to-red-700',
      'bg-gradient-to-br from-pink-500 to-rose-700',
      'bg-gradient-to-br from-cyan-500 to-blue-700'
    ]
    const newId = `proj_${String(projects.value.length + 1).padStart(3, '0')}`
    projects.value.unshift({
      ...p,
      id: newId,
      color: colorOptions[projects.value.length % colorOptions.length],
      status: 'active',
      todayCalls: 0, errorRate: 0, activeTransits: 0,
      createdAt: new Date().toISOString().split('T')[0]
    })
    return newId
  }

  const addTransit = (t: Omit<Transit, 'id' | 'status' | 'todayCalls' | 'errorRate' | 'avgLatency' | 'createdAt'>) => {
    const newId = `tr_${String(transits.value.length + 1).padStart(3, '0')}`
    transits.value.unshift({
      ...t, id: newId, status: 'active',
      todayCalls: 0, errorRate: 0, avgLatency: 0,
      createdAt: new Date().toISOString().split('T')[0]
    })
    const project = projects.value.find(p => p.id === t.projectId)
    if (project) project.activeTransits += 1
    return newId
  }

  // 业务表 CRUD
  const addBusinessTable = (t: Omit<BusinessTable, 'id' | 'rowCount' | 'sizeMB' | 'createdAt'>) => {
    const newId = `bt_${String(businessTables.value.length + 1).padStart(3, '0')}`
    const newTable: BusinessTable = {
      ...t, id: newId,
      rowCount: 0, sizeMB: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    businessTables.value.unshift(newTable)
    tableRows.value[newId] = []
    return newId
  }

  const updateBusinessTable = (id: string, patch: Partial<BusinessTable>) => {
    const t = businessTables.value.find(t => t.id === id)
    if (t) Object.assign(t, patch)
  }

  const removeBusinessTable = (id: string) => {
    const idx = businessTables.value.findIndex(t => t.id === id)
    if (idx > -1) businessTables.value.splice(idx, 1)
    delete tableRows.value[id]
  }

  // 表行数据 CRUD（图形化操作后端调用的接口）
  const getTableRows = (tableId: string): TableRow[] => tableRows.value[tableId] || []

  const addTableRow = (tableId: string, row: TableRow) => {
    if (!tableRows.value[tableId]) tableRows.value[tableId] = []
    tableRows.value[tableId].unshift({ ...row })
    const t = businessTables.value.find(t => t.id === tableId)
    if (t) t.rowCount += 1
  }

  const updateTableRow = (tableId: string, rowIndex: number, patch: Record<string, string | number | boolean | null>) => {
    const rows = tableRows.value[tableId]
    if (rows && rows[rowIndex]) {
      rows[rowIndex] = { ...rows[rowIndex], ...patch }
    }
  }

  const removeTableRow = (tableId: string, rowIndex: number) => {
    const rows = tableRows.value[tableId]
    if (rows) {
      rows.splice(rowIndex, 1)
      const t = businessTables.value.find(t => t.id === tableId)
      if (t) t.rowCount = Math.max(0, t.rowCount - 1)
    }
  }

  const getProject = (id: string) => projects.value.find(p => p.id === id)
  const getTransitsByProject = (projectId: string) => transits.value.filter(t => t.projectId === projectId)
  const getTransit = (id: string) => transits.value.find(t => t.id === id)
  const getBusinessTablesByProject = (projectId: string) => businessTables.value.filter(t => t.projectId === projectId)
  const getBusinessTable = (id: string) => businessTables.value.find(t => t.id === id)
  const getInstance = (id: string) => instances.value.find(i => i.id === id)
  // 获取有数据表配置的项目（用于数据库模块首页卡片墙）
  const getProjectsWithTables = () => {
    const projectIds = new Set(businessTables.value.map(t => t.projectId))
    return projects.value.filter(p => projectIds.has(p.id))
  }

  return {
    projects, transits, businessTables, instances, tableRows,
    currentTopNav, sidebarCollapsed,
    setTopNav, toggleSidebar,
    wizardOpen, wizardProjectId, openWizard, closeWizard,
    addProject, addTransit,
    addBusinessTable, updateBusinessTable, removeBusinessTable,
    getTableRows, addTableRow, updateTableRow, removeTableRow,
    getProject, getTransitsByProject, getTransit,
    getBusinessTablesByProject, getBusinessTable, getInstance,
    getProjectsWithTables
  }
})
