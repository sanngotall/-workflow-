<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}>()

const config = computed(() => {
  switch (props.status) {
    case 'CLOSED':
      return {
        label: '正常',
        class: 'bg-breaker-closed/20 text-breaker-closed',
        dotClass: 'bg-breaker-closed'
      }
    case 'OPEN':
      return {
        label: '熔断中',
        class: 'bg-breaker-open/20 text-breaker-open',
        dotClass: 'bg-breaker-open animate-pulse'
      }
    case 'HALF_OPEN':
      return {
        label: '半开',
        class: 'bg-breaker-halfopen/20 text-breaker-halfopen',
        dotClass: 'bg-breaker-halfopen'
      }
    default:
      return {
        label: '未知',
        class: 'bg-text-muted/20 text-text-muted',
        dotClass: 'bg-text-muted'
      }
  }
})
</script>

<template>
  <span class="badge flex items-center gap-1.5" :class="config.class">
    <span class="w-2 h-2 rounded-full" :class="config.dotClass"></span>
    {{ config.label }}
  </span>
</template>
