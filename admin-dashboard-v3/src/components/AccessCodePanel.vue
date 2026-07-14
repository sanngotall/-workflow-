<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
      <CheckCircle2 class="w-4 h-4 text-green-500" />
      <span>中转已创建，下方代码复制到你的前端项目即可接入；可按场景切换示例</span>
    </div>

    <!-- 场景切换 -->
    <div class="border border-gray-200 rounded-lg p-3 bg-white">
      <div class="flex items-center gap-2 mb-2">
        <Layers class="w-4 h-4 text-gray-500" />
        <span class="text-xs font-semibold text-gray-700">请求场景</span>
        <span class="text-xs text-gray-400">（不同业务形态对应不同接入代码）</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in scenarios"
          :key="s.key"
          @click="activeScenario = s.key"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border"
          :class="activeScenario === s.key
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50/40'"
        >
          <component :is="s.icon" class="w-3.5 h-3.5" />
          <span>{{ s.label }}</span>
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-2">{{ activeScenarioMeta.description }}</p>
    </div>

    <!-- 当前场景的代码段（可能 1~2 段）-->
    <CodeCard
      v-for="(snippet, idx) in activeSnippets"
      :key="activeScenario + '-' + idx"
      :title="snippet.title"
      :subtitle="snippet.subtitle"
      :icon="snippet.icon"
      :accent="snippet.accent"
      :code="snippet.code"
      :default-lang="requestTab"
      @lang-change="(l) => { if (idx === 0 && (l === 'curl' || l === 'fetch' || l === 'axios')) requestTab = l }"
    />

    <!-- 返回接口（流式解析，所有场景共用）-->
    <CodeCard
      title="返回接口（流式解析）"
      subtitle="网关 → 用户前端，打字机效果"
      :icon="ArrowDownCircle"
      accent="green"
      :code="responseCode"
      :default-lang="'js'"
      :lang-options="['js']"
      :copy-key="'response'"
    />

    <!-- 字段说明 -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <Info class="w-4 h-4 text-blue-500" />
        <span class="text-sm font-semibold text-blue-800">字段说明</span>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div v-for="f in fieldDocs" :key="f.name" class="flex">
          <code class="text-blue-700 font-mono font-semibold mr-2 whitespace-nowrap">{{ f.name }}</code>
          <span class="text-gray-600">{{ f.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CheckCircle2, ArrowUpCircle, ArrowDownCircle, Info,
  Layers, Upload, FileText, KeyRound, MessageSquare, Send,
} from 'lucide-vue-next'
import CodeCard from './CodeCard.vue'

/**
 * AccessCodePanel（访问代码面板）
 *
 * 设计原则：
 * 1. 场景维度（顶层切换）：标准JSON / 文件直传 / 两步上传 / 微信前置登录 / 微信单请求
 * 2. 语言维度（每段内切换）：curl / fetch / axios
 * 3. 一个场景可能有 1~2 段代码（如"微信前置登录"包含登录 + 业务调用两段）
 * 4. URL 与字段名集中在常量区，避免散落在代码模板里
 *
 * 后端契约对齐：
 * - 业务调用：POST {gatewayBase}/v1/transit/{transitId}/invoke
 * - 文件上传：POST {gatewayBase}/v1/files/upload?businessTableId=xxx
 * - 微信登录：POST {gatewayBase}/v1/transit/{transitId}/auth/wx
 */
const props = defineProps<{
  transitId: string
  downstreamType: 'n8n' | 'dify' | string
  transitName: string
}>()

// ===== 常量区（统一管理，避免硬编码散落）=====

const GATEWAY_BASE = 'https://gateway.duanduantong.com'
const invokeUrl = computed(() => `${GATEWAY_BASE}/v1/transit/${props.transitId}/invoke`)
const fileUploadUrl = computed(() => `${GATEWAY_BASE}/v1/files/upload`)
const wxAuthUrl = computed(() => `${GATEWAY_BASE}/v1/transit/${props.transitId}/auth/wx`)

// ===== 场景定义 =====

type ScenarioKey = 'standard' | 'file-direct' | 'file-two-step' | 'wx-prelogin' | 'wx-inline'
type Lang = 'curl' | 'fetch' | 'axios'

interface Snippet {
  title: string
  subtitle: string
  icon: any
  accent: 'primary' | 'green' | 'amber' | 'purple' | 'blue'
  code: Record<Lang | 'js', string>
}

const scenarios: { key: ScenarioKey; label: string; icon: any; description: string }[] = [
  {
    key: 'standard',
    label: '标准 JSON',
    icon: Send,
    description: '最常用的纯文本对话请求，body 为 application/json。',
  },
  {
    key: 'file-direct',
    label: '文件直传 (multipart)',
    icon: Upload,
    description: '用户附带文件一起提交，前端用 FormData 直接 POST 到网关，网关内部解析并落库。',
  },
  {
    key: 'file-two-step',
    label: '两步上传 (fileId)',
    icon: FileText,
    description: '先调 /files/upload 拿到 fileId，再把 fileId 作为业务字段调网关。适合需要断点续传或文件复用的场景。',
  },
  {
    key: 'wx-prelogin',
    label: '微信小程序 · 前置登录',
    icon: KeyRound,
    description: '用户前端先调 wx.login() 拿 code → 网关换 token → 业务请求带 Authorization: Bearer。安全性更高，token 可缓存复用。',
  },
  {
    key: 'wx-inline',
    label: '微信小程序 · 单请求',
    icon: MessageSquare,
    description: '业务请求 body 中直接带 wx_code，网关侧解析换 openid。一次调用搞定，适合轻量场景。',
  },
]

const activeScenario = ref<ScenarioKey>('standard')
const activeScenarioMeta = computed(() => scenarios.find(s => s.key === activeScenario.value)!)
const requestTab = ref<Lang>('fetch')

// ===== 代码段构造器（每个场景返回 1~2 段）=====

function buildSnippets(): Snippet[] {
  switch (activeScenario.value) {
    case 'standard':
      return [buildStandardSnippet()]
    case 'file-direct':
      return [buildFileDirectSnippet()]
    case 'file-two-step':
      return [buildFileUploadSnippet(), buildFileTwoStepSnippet()]
    case 'wx-prelogin':
      return [buildWxLoginSnippet(), buildWxPreloginInvokeSnippet()]
    case 'wx-inline':
      return [buildWxInlineSnippet()]
  }
}

const activeSnippets = computed<Snippet[]>(() => buildSnippets())

// ----- 场景 1: 标准 JSON -----
function buildStandardSnippet(): Snippet {
  const url = invokeUrl.value
  return {
    title: '① 请求接口',
    subtitle: '用户前端 → 网关（application/json）',
    icon: ArrowUpCircle,
    accent: 'primary',
    code: {
      curl: `curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "你好",
    "userId": "user_001"
  }'`,
      fetch: `const res = await fetch('${url}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '你好',
    userId: 'user_001'
  })
})

// 转交返回接口代码处理流`,
      axios: `import axios from 'axios'

const res = await axios.post('${url}', {
  message: '你好',
  userId: 'user_001'
}, {
  responseType: 'stream'  // 流式响应必须设置
})

// 转交返回接口代码处理流`,
      js: '',
    },
  }
}

// ----- 场景 2: 文件直传 (multipart) -----
function buildFileDirectSnippet(): Snippet {
  const url = invokeUrl.value
  return {
    title: '① 请求接口（multipart/form-data）',
    subtitle: '前端用 FormData 直接 POST 文件 + 业务字段到网关',
    icon: Upload,
    accent: 'purple',
    code: {
      curl: `# -F 每个 field 都会作为 multipart 一部分
curl -X POST '${url}' \\
  -F 'message=请帮我分析这份PDF' \\
  -F 'userId=user_001' \\
  -F 'file=@/path/to/document.pdf;type=application/pdf'`,
      fetch: `// 注意：使用 FormData 时不要手动设置 Content-Type，
// 浏览器会自动加上 multipart/form-data; boundary=...
const fd = new FormData()
fd.append('message', '请帮我分析这份PDF')
fd.append('userId', 'user_001')
fd.append('file', fileInput.files[0])  // <input type="file"> 选中的文件

const res = await fetch('${url}', {
  method: 'POST',
  body: fd  // 不要设 headers['Content-Type']
})

// 转交返回接口代码处理流`,
      axios: `import axios from 'axios'

const fd = new FormData()
fd.append('message', '请帮我分析这份PDF')
fd.append('userId', 'user_001')
fd.append('file', fileInput.files[0])

const res = await axios.post('${url}', fd, {
  responseType: 'stream',
  // 不要手动设 Content-Type，axios 会自动处理 boundary
  timeout: 60000  // 文件上传建议放宽超时
})

// 转交返回接口代码处理流`,
      js: '',
    },
  }
}

// ----- 场景 3a: 两步上传 · 第一步上传文件 -----
function buildFileUploadSnippet(): Snippet {
  const url = fileUploadUrl.value
  return {
    title: '① 上传文件 → 拿 fileId',
    subtitle: '先调文件存储接口上传，返回 fileId',
    icon: FileText,
    accent: 'purple',
    code: {
      curl: `# businessTableId 必填：网关要校验目标表含已启用的 file 字段
curl -X POST '${url}?businessTableId=YOUR_TABLE_ID' \\
  -F 'file=@/path/to/document.pdf;type=application/pdf'

# 返回示例：
# { "fileId":"8f3...","fileName":"document.pdf","mimeType":"application/pdf",
#   "sizeBytes":102400,"sha256":"abc..." }`,
      fetch: `const fd = new FormData()
fd.append('file', fileInput.files[0])

const res = await fetch(
  '${url}?businessTableId=YOUR_TABLE_ID',
  { method: 'POST', body: fd }
)
const { fileId, fileName, sizeBytes } = await res.json()

// 把 fileId 存起来，下一步调业务接口时带上`,
      axios: `import axios from 'axios'

const fd = new FormData()
fd.append('file', fileInput.files[0])

const { data } = await axios.post(
  '${url}',
  fd,
  { params: { businessTableId: 'YOUR_TABLE_ID' }, timeout: 60000 }
)
const { fileId, fileName, sizeBytes } = data`,
      js: '',
    },
  }
}

// ----- 场景 3b: 两步上传 · 第二步业务调用 -----
function buildFileTwoStepSnippet(): Snippet {
  const url = invokeUrl.value
  return {
    title: '② 业务请求（带 fileId）',
    subtitle: '业务接口 body 中带 fileId 引用上一步上传的文件',
    icon: Send,
    accent: 'primary',
    code: {
      curl: `curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "请分析这份文档",
    "userId": "user_001",
    "fileId": "8f3..."  /* 上一步返回的 fileId */
  }'`,
      fetch: `const res = await fetch('${url}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '请分析这份文档',
    userId: 'user_001',
    fileId  // 上一步拿到的 fileId
  })
})

// 转交返回接口代码处理流`,
      axios: `import axios from 'axios'

const res = await axios.post('${url}', {
  message: '请分析这份文档',
  userId: 'user_001',
  fileId  // 上一步拿到的 fileId
}, { responseType: 'stream' })

// 转交返回接口代码处理流`,
      js: '',
    },
  }
}

// ----- 场景 4a: 微信前置登录 · 登录换 token -----
function buildWxLoginSnippet(): Snippet {
  const url = wxAuthUrl.value
  return {
    title: '① 微信登录 → 拿 token',
    subtitle: '前端调 wx.login() 拿 code → POST 网关 /auth/wx 换 token',
    icon: KeyRound,
    accent: 'amber',
    code: {
      curl: `# 网关内部用 code 调微信 jscode2session 换 openid/session_key
# 返回示例：{ "token":"eyJ...","expiresIn":7200,"openid":"o..." }
curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "wxCode": "0a3xxx...",  /* wx.login() 返回的 code */
    "userId": "user_001"
  }'`,
      fetch: `// === 微信小程序前端代码 ===
// 1. 调 wx.login 拿临时 code
const { code: wxCode } = await new Promise((resolve, reject) => {
  wx.login({ success: resolve, fail: reject })
})

// 2. POST 网关换 token（建议缓存到 storage，避免每次都登录）
const res = await fetch('${url}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wxCode, userId: 'user_001' })
})
const { token, expiresIn } = await res.json()
wx.setStorageSync('ddt_token', token)  // 缓存 token`,
      axios: `// === 微信小程序前端代码（axios 适配 wx.request 需额外封装，此处用 wx.request 直写）===
const { code: wxCode } = await new Promise((resolve, reject) => {
  wx.login({ success: resolve, fail: reject })
})

wx.request({
  url: '${url}',
  method: 'POST',
  header: { 'Content-Type': 'application/json' },
  data: { wxCode, userId: 'user_001' },
  success: (res) => {
    const { token, expiresIn } = res.data
    wx.setStorageSync('ddt_token', token)
  }
})`,
      js: '',
    },
  }
}

// ----- 场景 4b: 微信前置登录 · 业务调用 -----
function buildWxPreloginInvokeSnippet(): Snippet {
  const url = invokeUrl.value
  return {
    title: '② 业务请求（带 Bearer Token）',
    subtitle: '业务接口在 Authorization 头携带上一步拿到的 token',
    icon: Send,
    accent: 'primary',
    code: {
      curl: `curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer \${TOKEN}' \\
  -d '{
    "message": "你好",
    "userId": "user_001"
  }'`,
      fetch: `// 从缓存读 token
const token = wx.getStorageSync('ddt_token')

const res = await fetch('${url}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`  // 关键：带鉴权头
  },
  body: JSON.stringify({
    message: '你好',
    userId: 'user_001'
  })
})

// 转交返回接口代码处理流`,
      axios: `// 实际项目中建议用 axios 拦截器统一注入 token
const token = wx.getStorageSync('ddt_token')

const res = await axios.post('${url}', {
  message: '你好',
  userId: 'user_001'
}, {
  headers: { 'Authorization': \`Bearer \${token}\` },
  responseType: 'stream'
})

// 转交返回接口代码处理流`,
      js: '',
    },
  }
}

// ----- 场景 5: 微信单请求（wx_code 内联）-----
function buildWxInlineSnippet(): Snippet {
  const url = invokeUrl.value
  return {
    title: '① 请求接口（body 内带 wx_code）',
    subtitle: '一次调用搞定，网关侧解析 wx_code 换 openid',
    icon: MessageSquare,
    accent: 'amber',
    code: {
      curl: `curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "你好",
    "userId": "user_001",
    "wxCode": "0a3xxx..."  /* wx.login() 返回的临时 code */
  }'`,
      fetch: `// 1. 调 wx.login 拿 code
const { code: wxCode } = await new Promise((resolve, reject) => {
  wx.login({ success: resolve, fail: reject })
})

// 2. 业务请求 body 中带 wxCode（网关侧解析换 openid）
const res = await fetch('${url}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '你好',
    userId: 'user_001',
    wxCode  // 关键：身份验证字段
  })
})

// 转交返回接口代码处理流`,
      axios: `import axios from 'axios'

const { code: wxCode } = await new Promise((resolve, reject) => {
  wx.login({ success: resolve, fail: reject })
})

const res = await axios.post('${url}', {
  message: '你好',
  userId: 'user_001',
  wxCode
}, { responseType: 'stream' })

// 转交返回接口代码处理流`,
      js: '',
    },
  }
}

// ===== 返回接口（流式解析，所有场景共用）=====

const responseCode = computed(() => `// 流式响应解析（打字机效果）
// 适用于 dify chat-messages / n8n webhook 流式响应
async function handleStream(res, onChunk) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') return

      try {
        const json = JSON.parse(data)
        // dify: json.answer  /  n8n: json.data
        const chunk = json.answer ?? json.data ?? ''
        if (chunk) onChunk(chunk)
      } catch (e) {
        // 忽略解析失败的行
      }
    }
  }
}

// 使用示例
const res = await fetch(/* 上面的请求接口 */)
let displayText = ''
await handleStream(res, (chunk) => {
  displayText += chunk
  document.getElementById('output').innerText = displayText
})`)

// ===== 字段说明 =====

const fieldDocs = computed(() => {
  const base = props.downstreamType === 'dify'
    ? [
        { name: 'message', desc: '用户输入文本，翻译为 dify 的 query 字段' },
        { name: 'userId', desc: '用户标识，翻译为 dify 的 user 字段，必填' },
        { name: 'conversationId', desc: '可选，会话 ID，用于多轮对话上下文' },
        { name: 'answer', desc: '返回字段，dify 流式输出的文本片段' },
      ]
    : [
        { name: 'message', desc: '用户输入文本，翻译为 n8n webhook 的 json.message' },
        { name: 'userId', desc: '用户标识，透传到 n8n 工作流' },
        { name: 'json', desc: 'n8n 接收的根字段，所有数据包裹在 json 内' },
        { name: 'data', desc: '返回字段，n8n 工作流输出的数据片段' },
      ]
  // 场景相关的额外字段说明
  if (activeScenario.value === 'file-direct' || activeScenario.value === 'file-two-step') {
    base.push(
      { name: 'file', desc: 'multipart 直传场景的文件字段（FormData 中的 file key）' },
      { name: 'fileId', desc: '两步上传场景下，业务请求引用文件索引的 ID' },
    )
  }
  if (activeScenario.value === 'wx-prelogin' || activeScenario.value === 'wx-inline') {
    base.push(
      { name: 'wxCode', desc: 'wx.login() 返回的临时登录凭证，5 分钟有效' },
      { name: 'Authorization', desc: 'Bearer Token，前置登录场景下放在请求头' },
    )
  }
  return base
})
</script>
