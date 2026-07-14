import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface NavItem {
  id: string
  label: string
  icon: string
  path?: string
  children?: NavItem[]
}

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentTopNav = ref('dashboard')
  const currentSideNav = ref('')

  const topNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '控制台',
      icon: 'LayoutDashboard'
    },
    {
      id: 'projects',
      label: '项目管理',
      icon: 'FolderOpen'
    },
    {
      id: 'database',
      label: '数据库管理',
      icon: 'Database'
    },
    {
      id: 'routes',
      label: '路由管理',
      icon: 'Route'
    },
    {
      id: 'credentials',
      label: '凭证管理',
      icon: 'Key'
    },
    {
      id: 'transformers',
      label: '转换器',
      icon: 'GitBranch'
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: 'Settings'
    }
  ]

  const sideNavItems: Record<string, NavItem[]> = {
    dashboard: [
      { id: 'overview', label: '概览', icon: 'PieChart', path: '/dashboard/overview' },
      { id: 'realtime', label: '实时监控', icon: 'Activity', path: '/dashboard/realtime' },
      { id: 'logs', label: '访问日志', icon: 'FileText', path: '/dashboard/logs' },
      { id: 'analytics', label: '数据分析', icon: 'BarChart3', path: '/dashboard/analytics' }
    ],
    routes: [
      { id: 'list', label: '路由列表', icon: 'List', path: '/routes/list' },
      { id: 'create', label: '新建路由', icon: 'Plus', path: '/routes/create' },
      { id: 'groups', label: '路由分组', icon: 'Layers', path: '/routes/groups' },
      { id: 'rate-limit', label: '限流规则', icon: 'Gauge', path: '/routes/rate-limit' }
    ],
    credentials: [
      { id: 'list', label: '凭证列表', icon: 'KeyRound', path: '/credentials/list' },
      { id: 'create', label: '新建凭证', icon: 'PlusCircle', path: '/credentials/create' },
      { id: 'audit', label: '审计日志', icon: 'ShieldCheck', path: '/credentials/audit' }
    ],
    transformers: [
      { id: 'list', label: '转换器列表', icon: 'GitBranch', path: '/transformers/list' },
      { id: 'create', label: '新建转换器', icon: 'GitMerge', path: '/transformers/create' },
      { id: 'templates', label: '模板库', icon: 'FileText', path: '/transformers/templates' }
    ],
    projects: [
      { id: 'list', label: '项目列表', icon: 'Folder', path: '/projects/list' },
      { id: 'members', label: '成员管理', icon: 'Users', path: '/projects/members' }
    ],
    database: [
      { id: 'overview', label: '数据库概览', icon: 'Database', path: '/database/overview' },
      { id: 'tables', label: '数据表管理', icon: 'Table', path: '/database/tables' },
      { id: 'query', label: 'SQL查询', icon: 'Terminal', path: '/database/query' },
      { id: 'backup', label: '备份恢复', icon: 'HardDrive', path: '/database/backup' }
    ],
    settings: [
      { id: 'general', label: '基本设置', icon: 'Settings', path: '/settings/general' },
      { id: 'security', label: '安全设置', icon: 'Lock', path: '/settings/security' },
      { id: 'monitoring', label: '监控告警', icon: 'Bell', path: '/settings/monitoring' },
      { id: 'about', label: '关于系统', icon: 'Info', path: '/settings/about' }
    ]
  }

  const currentSideNavList = computed(() => {
    return sideNavItems[currentTopNav.value] || []
  })

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setTopNav = (id: string) => {
    currentTopNav.value = id
    const sideItems = sideNavItems[id]
    if (sideItems && sideItems.length > 0) {
      currentSideNav.value = sideItems[0].id
    } else {
      currentSideNav.value = ''
    }
  }

  const setSideNav = (id: string) => {
    currentSideNav.value = id
  }

  return {
    sidebarCollapsed,
    currentTopNav,
    currentSideNav,
    topNavItems,
    sideNavItems,
    currentSideNavList,
    toggleSidebar,
    setTopNav,
    setSideNav
  }
})
