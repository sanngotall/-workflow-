import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/pages/LoginView.vue'
import DashboardOverview from '@/pages/DashboardOverview.vue'
import DashboardAnalytics from '@/pages/DashboardAnalytics.vue'
import DashboardRealtime from '@/pages/DashboardRealtime.vue'
import DashboardLogs from '@/pages/DashboardLogs.vue'
import ProjectsHome from '@/pages/ProjectsHome.vue'
import ProjectDetail from '@/pages/ProjectDetail.vue'
import TransitDetail from '@/pages/TransitDetail.vue'
import DatabaseProjects from '@/pages/DatabaseProjects.vue'
import DatabaseProjectDetail from '@/pages/DatabaseProjectDetail.vue'
import DatabaseCache from '@/pages/DatabaseCache.vue'
import DatabaseBackup from '@/pages/DatabaseBackup.vue'
import TableDataView from '@/pages/TableDataView.vue'
import AdvancedHome from '@/pages/AdvancedHome.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 登录页（无需鉴权）
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard/overview',
      children: [
        // 控制台
        { path: '/dashboard/overview', name: 'dashboard-overview', component: DashboardOverview },
        { path: '/dashboard/analytics', name: 'dashboard-analytics', component: DashboardAnalytics },
        { path: '/dashboard/realtime', name: 'dashboard-realtime', component: DashboardRealtime },
        { path: '/dashboard/logs', name: 'dashboard-logs', component: DashboardLogs },
        // 项目管理
        { path: '/projects', name: 'projects', component: ProjectsHome },
        { path: '/projects/:id', name: 'project-detail', component: ProjectDetail },
        { path: '/projects/:id/transits/:transitId', name: 'transit-detail', component: TransitDetail },
        // 数据库（表隔离：按项目组织）
        { path: '/database', name: 'database-projects', component: DatabaseProjects },
        { path: '/database/project/:projectId', name: 'database-project-detail', component: DatabaseProjectDetail },
        { path: '/database/project/:projectId/table/:tableId', name: 'table-data-view', component: TableDataView },
        { path: '/database/cache', name: 'database-cache', component: DatabaseCache },
        { path: '/database/backup', name: 'database-backup', component: DatabaseBackup },
        // 高级模式
        { path: '/advanced/:section?', name: 'advanced', component: AdvancedHome },
        // catch-all：未匹配路径重定向到首页（避免旧路由如 /database/instances 白屏）
        { path: '/:pathMatch(.*)*', redirect: '/dashboard/overview' },
      ],
    },
  ],
})

/**
 * 全局前置守卫：未登录跳转登录页
 * - meta.public 路由（如 /login）直接放行
 * - 已登录但 user 信息缺失（刷新页面场景）：调用 fetchMe 重建
 * - 未登录访问受保护路由：跳 /login?redirect=原路径
 */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // 公开路由直接放行
  if (to.meta.public) {
    // 已登录用户访问登录页，重定向到首页
    if (to.name === 'login' && authStore.isLoggedIn) {
      return next('/')
    }
    return next()
  }

  // 未登录 → 跳转登录页
  if (!authStore.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // 已登录但 user 信息缺失（页面刷新）：重建
  if (!authStore.user) {
    try {
      await authStore.fetchMe()
    } catch {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }

  return next()
})

export default router
