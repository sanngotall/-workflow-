import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

import DashboardOverview from '@/pages/DashboardOverview.vue'
import DashboardRealtime from '@/pages/DashboardRealtime.vue'
import DashboardLogs from '@/pages/DashboardLogs.vue'
import DashboardAnalytics from '@/pages/DashboardAnalytics.vue'

import RoutesList from '@/pages/RoutesList.vue'
import RoutesCreate from '@/pages/RoutesCreate.vue'
import RoutesGroups from '@/pages/RoutesGroups.vue'
import RoutesRateLimit from '@/pages/RoutesRateLimit.vue'

import CredentialsList from '@/pages/CredentialsList.vue'
import CredentialsCreate from '@/pages/CredentialsCreate.vue'
import CredentialsAudit from '@/pages/CredentialsAudit.vue'

import TransformersList from '@/pages/TransformersList.vue'
import TransformersCreate from '@/pages/TransformersCreate.vue'
import TransformersTemplates from '@/pages/TransformersTemplates.vue'

import ProjectsList from '@/pages/ProjectsList.vue'
import ProjectsMembers from '@/pages/ProjectsMembers.vue'

import DatabaseOverview from '@/pages/DatabaseOverview.vue'
import DatabaseTables from '@/pages/DatabaseTables.vue'
import DatabaseQuery from '@/pages/DatabaseQuery.vue'
import DatabaseBackup from '@/pages/DatabaseBackup.vue'

import SettingsGeneral from '@/pages/SettingsGeneral.vue'
import SettingsSecurity from '@/pages/SettingsSecurity.vue'
import SettingsMonitoring from '@/pages/SettingsMonitoring.vue'
import SettingsAbout from '@/pages/SettingsAbout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard/overview',
      children: [
        { path: '/dashboard/overview', component: DashboardOverview },
        { path: '/dashboard/realtime', component: DashboardRealtime },
        { path: '/dashboard/logs', component: DashboardLogs },
        { path: '/dashboard/analytics', component: DashboardAnalytics },

        { path: '/routes/list', component: RoutesList },
        { path: '/routes/create', component: RoutesCreate },
        { path: '/routes/groups', component: RoutesGroups },
        { path: '/routes/rate-limit', component: RoutesRateLimit },

        { path: '/credentials/list', component: CredentialsList },
        { path: '/credentials/create', component: CredentialsCreate },
        { path: '/credentials/audit', component: CredentialsAudit },

        { path: '/transformers/list', component: TransformersList },
        { path: '/transformers/create', component: TransformersCreate },
        { path: '/transformers/templates', component: TransformersTemplates },

        { path: '/projects/list', component: ProjectsList },
        { path: '/projects/members', component: ProjectsMembers },

        { path: '/database/overview', component: DatabaseOverview },
        { path: '/database/tables', component: DatabaseTables },
        { path: '/database/query', component: DatabaseQuery },
        { path: '/database/backup', component: DatabaseBackup },

        { path: '/settings/general', component: SettingsGeneral },
        { path: '/settings/security', component: SettingsSecurity },
        { path: '/settings/monitoring', component: SettingsMonitoring },
        { path: '/settings/about', component: SettingsAbout }
      ]
    }
  ]
})

export default router
