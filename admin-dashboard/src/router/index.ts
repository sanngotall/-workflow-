import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'DashboardHome',
          component: () => import('@/pages/DashboardView.vue')
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('@/pages/ProjectsView.vue')
        },
        {
          path: 'projects/:id/routes',
          name: 'Routes',
          component: () => import('@/pages/RoutesView.vue')
        },
        {
          path: 'routes/:id/transformer',
          name: 'Transformer',
          component: () => import('@/pages/TransformersView.vue')
        },
        {
          path: 'credentials',
          name: 'Credentials',
          component: () => import('@/pages/CredentialsView.vue')
        },
        {
          path: 'console',
          name: 'Console',
          component: () => import('@/pages/ConsoleView.vue')
        },
        {
          path: 'config',
          name: 'Config',
          component: () => import('@/pages/ConfigView.vue')
        }
      ],
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }

  if (to.name === 'Login' && authStore.isLoggedIn) {
    return { name: 'DashboardHome' }
  }
})

export default router
