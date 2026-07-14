<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'waiting' | 'active' | 'completed' | 'failed'
}>()

const config = computed(() => {
  switch (props.status) {
    case 'waiting':
      return { label: '等待中', class: 'bg-warning/20 text-warning' }
    case 'active':
      return { label: '执行中', class: 'bg-primary/20 text-primary' }
    case 'completed':
      return { label: '已完成', class: 'bg-secondary/20 text-secondary' }
    case 'failed':
      return { label: '失败', class: 'bg-danger/20 text-danger' }
    default:
      return { label: '未知', class: 'bg-text-muted/20 text-text-muted' }
  }
})
</script>

<template>
  <span class="badge" :class="config.class">{{ config.label }}</span>
</template>
