<template>
  <div class="space-y-6" v-if="project">
    <button @click="router.push('/projects')" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
      <ChevronLeft class="w-4 h-4" /> 返回项目列表
    </button>

    <!-- 项目头 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            :class="project.color"
          >
            {{ project.name.charAt(0) }}
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-800">{{ project.name }}</h1>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="project.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
              >
                {{ project.status === 'active' ? '运行中' : '已暂停' }}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">{{ envLabels[project.environment] }}</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">{{ project.description }}</p>
          </div>
        </div>
        <button
          @click="appStore.openWizard(project.id)"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" /> 新建中转
        </button>
      </div>

      <div class="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
        <div>
          <p class="text-sm text-gray-500">今日调用</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ formatNumber(project.todayCalls) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">错误率</p>
          <p class="text-2xl font-bold mt-1" :class="project.errorRate > 1 ? 'text-orange-600' : 'text-gray-800'">{{ project.errorRate }}%</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">活跃中转</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ project.activeTransits }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">默认限流</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ project.rateLimit }} QPS</p>
        </div>
      </div>
    </div>

    <!-- Tab -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="border-b border-gray-200 px-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-4 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2"
            :class="activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{{ tab.count }}</span>
          </button>
        </nav>
      </div>

      <!-- 中转列表 Tab -->
      <div v-if="activeTab === 'transits'" class="p-6">
        <div class="overflow-hidden border border-gray-100 rounded-lg">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">中转名称</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">下游类型</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">模板</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">今日调用</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">错误率</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">延迟</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr
                v-for="t in transits"
                :key="t.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                @click="router.push(`/projects/${project!.id}/transits/${t.id}`)"
              >
                <td class="px-5 py-3.5">
                  <p class="text-sm font-medium text-gray-800">{{ t.name }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ t.id }}</p>
                </td>
                <td class="px-5 py-3.5">
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-md"
                    :class="t.downstreamType === 'dify' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'"
                  >
                    {{ t.downstreamType }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-xs text-gray-600 font-mono">{{ t.template }}</td>
                <td class="px-5 py-3.5 text-sm text-gray-700">{{ formatNumber(t.todayCalls) }}</td>
                <td class="px-5 py-3.5 text-sm" :class="t.errorRate > 1 ? 'text-orange-600 font-medium' : 'text-gray-700'">{{ t.errorRate }}%</td>
                <td class="px-5 py-3.5 text-sm text-gray-700">{{ t.avgLatency }}ms</td>
                <td class="px-5 py-3.5">
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full" :class="t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ t.status === 'active' ? '运行中' : '已暂停' }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <span class="inline-flex items-center gap-1 text-xs text-primary-600 font-medium">
                    <Code2 class="w-3.5 h-3.5" />
                    查看接口配置
                    <ChevronRight class="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
              <tr v-if="transits.length === 0">
                <td colspan="8" class="px-5 py-16 text-center text-gray-400 text-sm">
                  <GitBranch class="w-10 h-10 mx-auto mb-2 opacity-40" />
                  该项目下还没有中转，点击右上角「新建中转」开始
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 数据存储 Tab -->
      <div v-else-if="activeTab === 'storage'" class="p-6">
        <DatabaseManage :project-id="project.id" />
      </div>

      <!-- 成员管理 Tab -->
      <div v-else-if="activeTab === 'members'" class="p-6">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-600">当前项目成员（{{ members.length }} 人）</p>
          <button
            @click="openAddMemberModal"
            class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors flex items-center gap-1"
          >
            <UserPlus class="w-3.5 h-3.5" /> 添加成员
          </button>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg" v-for="(m, idx) in members" :key="m.id">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white" :class="avatarColors[idx % avatarColors.length]">{{ (m.name || m.username).charAt(0) }}</div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ m.name }} <span class="text-xs text-gray-400">@{{ m.username }}</span></p>
                <p class="text-xs text-gray-500">加入于 {{ (m.joined_at || '').split('T')[0] }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <select
                :value="m.role"
                @change="onChangeRole(m.id, ($event.target as HTMLSelectElement).value)"
                class="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option v-for="(label, key) in roleLabels" :key="key" :value="key">{{ label }}</option>
              </select>
              <button
                @click="onRemoveMember(m.id, m.name)"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="移除成员"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div v-if="members.length === 0" class="text-center py-8 text-gray-400 text-sm">
            <Users class="w-8 h-8 mx-auto mb-2 opacity-40" />
            暂无成员，点击「添加成员」开始
          </div>
        </div>
      </div>
    </div>

    <!-- 添加成员 Modal -->
    <div
      v-if="addMemberModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="addMemberModalOpen = false"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">添加成员到「{{ project.name }}」</h3>
          <button @click="addMemberModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <!-- 搜索框 -->
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="availableKeyword"
              type="text"
              placeholder="搜索用户名/姓名..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              @input="onAvailableKeywordChange"
            />
          </div>

          <!-- 角色选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分配角色</label>
            <select
              v-model="addRole"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="(label, key) in roleLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>

          <!-- 可选用户列表 -->
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-if="availableLoading" class="text-center py-6 text-gray-400 text-sm">加载中...</div>
            <div
              v-for="u in availableUsers"
              :key="u.id"
              @click="togglePickUser(u.id)"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
              :class="pickedUserIds.includes(u.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'"
            >
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-purple-500">{{ (u.name || u.username).charAt(0) }}</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{{ u.name || u.username }}</p>
                <p class="text-xs text-gray-500">@{{ u.username }}</p>
              </div>
              <Check v-if="pickedUserIds.includes(u.id)" class="w-4 h-4 text-primary-600" />
            </div>
            <div v-if="!availableLoading && availableUsers.length === 0" class="text-center py-6 text-gray-400 text-sm">
              没有可选用户（所有用户已加入或无账户）
            </div>
          </div>

          <div v-if="addMemberError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ addMemberError }}</div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button @click="addMemberModalOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
          <button
            @click="confirmAddMembers"
            :disabled="pickedUserIds.length === 0 || addingMembers"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >{{ addingMembers ? '添加中...' : `添加 ${pickedUserIds.length} 人` }}</button>
        </div>
      </div>
    </div>

    <!-- 微信配置 Tab -->
    <div v-else-if="activeTab === 'wx'" class="p-6">
      <div class="max-w-2xl space-y-5">
        <!-- 状态提示 -->
        <div
          class="rounded-lg p-3 flex items-center gap-2 text-sm"
          :class="wxConfig ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
        >
          <KeyRound class="w-4 h-4 shrink-0" />
          <span v-if="wxConfig">已配置微信小程序（AppID: {{ wxConfig.app_id }}，更新于 {{ formatWxDate(wxConfig.updated_at) }}）</span>
          <span v-else>未配置微信小程序，下方填写 AppID / AppSecret / JWTSecret 后保存即可启用微信登录</span>
        </div>

        <!-- 表单 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">AppID</label>
            <input
              v-model="wxForm.app_id"
              type="text"
              placeholder="wx1234567890abcdef"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
            <p class="text-xs text-gray-400 mt-1">微信小程序后台 → 开发管理 → 开发设置中的 AppID</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">AppSecret</label>
            <input
              v-model="wxForm.app_secret"
              type="password"
              :placeholder="wxConfig ? '已配置，如需更新请重新输入' : '请输入 AppSecret'"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
            <p class="text-xs text-gray-400 mt-1">用于调微信 jscode2session 换取 openid，AES-256-GCM 加密存储</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">JWTSecret</label>
            <input
              v-model="wxForm.jwt_secret"
              type="password"
              :placeholder="wxConfig ? '已配置，如需更新请重新输入' : '请输入 JWT 签名密钥'"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
            <p class="text-xs text-gray-400 mt-1">专用于签发该项目的微信用户 token，与系统 JWT 独立（多租户隔离）</p>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="wxErrorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ wxErrorMsg }}</div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="saveWxConfig"
            :disabled="wxSaving"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >{{ wxSaving ? '保存中...' : (wxConfig ? '更新配置' : '保存配置') }}</button>
          <button
            v-if="wxConfig"
            @click="deleteWxConfig"
            :disabled="wxDeleting"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >{{ wxDeleting ? '删除中...' : '删除配置' }}</button>
        </div>

        <!-- 安全提示 -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
          <p class="font-medium mb-1">接入说明</p>
          <p>1. 配置保存后，该项目下所有中转的「微信小程序」场景即可使用</p>
          <p>2. 用户前端调 wx.login() 拿 code → 网关用 AppID+AppSecret 调微信换 openid → 用 JWTSecret 签发 token</p>
          <p>3. 每次保存会全量覆盖三个字段，密钥无法查看历史值，请妥善保管</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
    <p class="text-sm">项目不存在</p>
    <button @click="router.push('/projects')" class="mt-3 text-primary-600 text-sm hover:underline">返回项目列表</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus, ChevronLeft, ChevronRight, GitBranch, UserPlus,
  List, Database, Users, Search, Check, X, Trash2, Code2, KeyRound,
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import DatabaseManage from '@/components/DatabaseManage.vue'
import { getProject } from '@/api/projects'
import { listRoutesByProject, type Route } from '@/api/routes'
import { getTransformerByRoute, type Transformer } from '@/api/transformers'
import {
  listMembers, listAvailableUsers, addMembers, updateMemberRole, removeMember,
  type ProjectMember, type AvailableUser,
} from '@/api/members'
import { getWxConfig, saveWxConfig as saveWxConfigApi, deleteWxConfig as deleteWxConfigApi, type WxConfig } from '@/api/wx-config'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const projectId = computed(() => route.params.id as string)

// 项目信息（后端字段 + 前端补全统计字段）
const project = ref<any>(null)
// 中转列表（route + transformer 合并）
interface TransitItem {
  id: string
  name: string
  downstreamType: string
  template: string
  status: 'active' | 'paused'
  todayCalls: number
  errorRate: number
  avgLatency: number
}
const transits = ref<TransitItem[]>([])
// 成员列表
const members = ref<ProjectMember[]>([])

// 微信小程序配置状态
const wxConfig = ref<WxConfig | null>(null)
const wxForm = ref({ app_id: '', app_secret: '', jwt_secret: '' })
const wxSaving = ref(false)
const wxDeleting = ref(false)
const wxErrorMsg = ref('')

const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    // 并行加载项目信息 + 中转列表 + 成员列表 + 微信配置
    const [projectData, routesData, membersData, wxData] = await Promise.all([
      getProject(projectId.value),
      listRoutesByProject(projectId.value),
      listMembers(projectId.value).catch(() => ({ items: [], total: 0 })),
      getWxConfig(projectId.value).catch(() => null),
    ])

    // 补全项目统计字段（后端暂无这些字段）
    project.value = {
      ...projectData,
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      status: 'active',
      todayCalls: 0,
      errorRate: 0,
      activeTransits: routesData.length,
      environment: 'production',
      rateLimit: 1000,
    }

    members.value = (membersData as any).items || []
    wxConfig.value = wxData as WxConfig | null
    if (wxConfig.value) {
      wxForm.value.app_id = wxConfig.value.app_id
    }

    // 批量拉取每个 route 的 transformer，合并展示
    const transitItems: TransitItem[] = await Promise.all(
      routesData.map(async (r: Route) => {
        let transformer: Transformer | null = null
        try {
          transformer = await getTransformerByRoute(r.id)
        } catch {
          // 该路由可能未配置 transformer
        }
        return {
          id: r.id,
          name: r.path,
          downstreamType: transformer?.type || '-',
          template: transformer?.type || '-',
          status: r.is_active ? 'active' : 'paused',
          todayCalls: 0,
          errorRate: 0,
          avgLatency: 0,
        }
      }),
    )
    transits.value = transitItems
  } catch (e: any) {
    console.error('加载项目详情失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// ===== 微信小程序配置操作函数 =====
const formatWxDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const saveWxConfig = async () => {
  wxErrorMsg.value = ''
  if (!wxForm.value.app_id.trim()) {
    wxErrorMsg.value = 'AppID 不能为空'
    return
  }
  if (!wxForm.value.app_secret.trim()) {
    wxErrorMsg.value = 'AppSecret 不能为空'
    return
  }
  if (!wxForm.value.jwt_secret.trim()) {
    wxErrorMsg.value = 'JWTSecret 不能为空'
    return
  }
  wxSaving.value = true
  try {
    const saved = await saveWxConfigApi(projectId.value, {
      app_id: wxForm.value.app_id.trim(),
      app_secret: wxForm.value.app_secret.trim(),
      jwt_secret: wxForm.value.jwt_secret.trim(),
    })
    wxConfig.value = saved
    // 清空密钥输入框（安全考虑，不保留在内存）
    wxForm.value.app_secret = ''
    wxForm.value.jwt_secret = ''
  } catch (e: any) {
    wxErrorMsg.value = e?.message || '保存失败'
  } finally {
    wxSaving.value = false
  }
}

const deleteWxConfig = async () => {
  if (!wxConfig.value) return
  if (!confirm('确认删除微信小程序配置？\n删除后该项目的微信登录将不可用。')) return
  wxDeleting.value = true
  wxErrorMsg.value = ''
  try {
    await deleteWxConfigApi(projectId.value)
    wxConfig.value = null
    wxForm.value = { app_id: '', app_secret: '', jwt_secret: '' }
  } catch (e: any) {
    wxErrorMsg.value = e?.message || '删除失败'
  } finally {
    wxDeleting.value = false
  }
}

const tabs = computed(() => [
  { id: 'transits' as const, label: '中转列表', icon: markRaw(List), count: transits.value.length },
  { id: 'storage' as const, label: '数据存储', icon: markRaw(Database) },
  { id: 'members' as const, label: '成员管理', icon: markRaw(Users), count: members.value.length },
  { id: 'wx' as const, label: '微信配置', icon: markRaw(KeyRound) },
])

const activeTab = ref<'transits' | 'storage' | 'members' | 'wx'>('transits')

const envLabels: Record<string, string> = {
  development: '开发环境',
  staging: '预发环境',
  production: '生产环境'
}

const roleLabels: Record<string, string> = {
  admin: '管理员',
  architect: '架构师',
  developer: '开发',
  editor: '编辑',
  ops: '运维',
  tester: '测试',
  operator: '操作员',
  analyst: '分析师',
  viewer: '访客',
}

const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500']

const formatNumber = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

// ============== 成员管理：添加成员 Modal ==============
const addMemberModalOpen = ref(false)
const availableKeyword = ref('')
const availableUsers = ref<AvailableUser[]>([])
const availableLoading = ref(false)
const pickedUserIds = ref<string[]>([])
const addRole = ref<string>('viewer')
const addingMembers = ref(false)
const addMemberError = ref('')

// 打开添加成员弹窗：拉取可选用户列表
async function openAddMemberModal() {
  addMemberModalOpen.value = true
  addMemberError.value = ''
  pickedUserIds.value = []
  addRole.value = 'viewer'
  availableKeyword.value = ''
  await loadAvailableUsers()
}

// 拉取可选用户（带搜索关键字）
async function loadAvailableUsers() {
  availableLoading.value = true
  try {
    const list = await listAvailableUsers(
      projectId.value,
      availableKeyword.value || undefined,
    )
    availableUsers.value = list || []
  } catch (e: any) {
    console.error('加载可选用户失败', e)
    availableUsers.value = []
  } finally {
    availableLoading.value = false
  }
}

// 关键字变化时防抖搜索（简化：直接重新拉取）
let searchTimer: ReturnType<typeof setTimeout> | null = null
function onAvailableKeywordChange() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadAvailableUsers()
  }, 300)
}

// 切换用户选中
function togglePickUser(userId: string) {
  const idx = pickedUserIds.value.indexOf(userId)
  if (idx >= 0) {
    pickedUserIds.value.splice(idx, 1)
  } else {
    pickedUserIds.value.push(userId)
  }
}

// 确认添加成员：调用 addMembers API
async function confirmAddMembers() {
  if (pickedUserIds.value.length === 0) return
  addingMembers.value = true
  addMemberError.value = ''
  try {
    const payload = pickedUserIds.value.map(uid => ({ user_id: uid, role: addRole.value }))
    const result = await addMembers(projectId.value, payload)
    addMemberModalOpen.value = false
    // 重新拉取成员列表
    const fresh = await listMembers(projectId.value).catch(() => ({ items: [], total: 0 }))
    members.value = (fresh as any).items || []
    // 提示跳过情况
    if (result.skipped?.length > 0) {
      console.warn('部分用户被跳过', result.skipped)
    }
  } catch (e: any) {
    addMemberError.value = e?.response?.data?.message || e?.message || '添加成员失败'
  } finally {
    addingMembers.value = false
  }
}

// 修改成员角色
async function onChangeRole(memberId: string, role: string) {
  try {
    await updateMemberRole(projectId.value, memberId, role)
    // 局部更新
    const m = members.value.find(x => x.id === memberId)
    if (m) m.role = role
  } catch (e: any) {
    console.error('修改成员角色失败', e)
    alert(e?.response?.data?.message || e?.message || '修改成员角色失败')
  }
}

// 移除成员
async function onRemoveMember(memberId: string, name: string) {
  if (!confirm(`确定将「${name || '该成员'}」从项目中移除？`)) return
  try {
    await removeMember(projectId.value, memberId)
    members.value = members.value.filter(m => m.id !== memberId)
  } catch (e: any) {
    console.error('移除成员失败', e)
    alert(e?.response?.data?.message || e?.message || '移除成员失败')
  }
}
</script>
