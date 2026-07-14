<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- 头部 -->
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <component :is="icon" class="w-5 h-5 shrink-0" :class="accentIconClass" />
        <div class="min-w-0">
          <div class="text-sm font-semibold text-gray-800 truncate">{{ title }}</div>
          <div v-if="subtitle" class="text-xs text-gray-400 truncate">{{ subtitle }}</div>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <!-- 语言切换 -->
        <button
          v-for="l in effectiveLangOptions"
          :key="l"
          @click="onLangChange(l)"
          class="px-3 py-1 text-xs font-medium rounded transition-colors"
          :class="activeLang === l ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'"
        >
          {{ l }}
        </button>
        <button
          @click="copy"
          class="ml-2 px-3 py-1 text-xs rounded transition-colors flex items-center gap-1"
          :class="accentButtonClass"
        >
          <Copy class="w-3 h-3" />
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
    </div>
    <!-- 代码体 -->
    <pre class="bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto leading-relaxed"><code>{{ currentCode }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy } from 'lucide-vue-next'

/**
 * CodeCard（代码卡片）
 *
 * 通用代码展示组件，由父组件 AccessCodePanel 复用：
 * - 支持多语言切换（curl/fetch/axios/js）
 * - 支持单语言模式（直接传 string）
 * - 支持不同 accent 主题色（与卡片左侧图标和复制按钮联动）
 * - 复制成功 1.5s 后恢复文案
 */
type Lang = 'curl' | 'fetch' | 'axios' | 'js'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon: any
  accent?: 'primary' | 'green' | 'amber' | 'purple' | 'blue'
  // 多语言模式：Record<Lang, string>；单语言模式：直接 string
  code: Record<Lang, string> | string
  defaultLang?: Lang
  langOptions?: Lang[]
  copyKey?: string
}>(), {
  accent: 'primary',
  defaultLang: 'fetch',
})

const emit = defineEmits<{ langChange: [lang: Lang] }>()

// 单语言模式：langOptions 收缩为 [默认 lang] 或从 string 推导
const isStringCode = computed(() => typeof props.code === 'string')

const effectiveLangOptions = computed<Lang[]>(() => {
  if (props.langOptions && props.langOptions.length > 0) return props.langOptions
  if (isStringCode.value) {
    return props.defaultLang ? [props.defaultLang] : ['js']
  }
  return ['curl', 'fetch', 'axios']
})

// 当前激活语言：默认取 defaultLang；若不在 effectiveLangOptions 中则取首项
const activeLang = ref<Lang>(
  effectiveLangOptions.value.includes(props.defaultLang)
    ? props.defaultLang
    : effectiveLangOptions.value[0]
)

// 当父组件 defaultLang 变化时（如 AccessCodePanel 第一段切换语言时联动），同步本地
watch(() => props.defaultLang, (l) => {
  if (l && effectiveLangOptions.value.includes(l)) {
    activeLang.value = l
  }
})

const currentCode = computed(() => {
  if (isStringCode.value) return props.code as string
  return (props.code as Record<Lang, string>)[activeLang.value] || ''
})

const onLangChange = (l: Lang) => {
  activeLang.value = l
  emit('langChange', l)
}

// accent → 图标/按钮颜色映射
const accentIconClass = computed(() => ({
  primary: 'text-primary-600',
  green: 'text-green-600',
  amber: 'text-amber-600',
  purple: 'text-purple-600',
  blue: 'text-blue-600',
}[props.accent]))

const accentButtonClass = computed(() => ({
  primary: 'text-primary-600 hover:bg-primary-50',
  green: 'text-green-600 hover:bg-green-50',
  amber: 'text-amber-600 hover:bg-amber-50',
  purple: 'text-purple-600 hover:bg-purple-50',
  blue: 'text-blue-600 hover:bg-blue-50',
}[props.accent]))

// 复制
const copied = ref(false)
const copy = async () => {
  try {
    await navigator.clipboard.writeText(currentCode.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = currentCode.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>
