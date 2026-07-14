<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  unit?: string
  icon?: string
  color?: 'primary' | 'secondary' | 'accent' | 'danger'
}>()
</script>

<template>
  <div class="card p-5 hover:border-primary/30 transition-all duration-300">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-text-secondary mb-1">{{ title }}</p>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-text-main">{{ value }}</span>
          <span v-if="unit" class="text-sm text-text-muted">{{ unit }}</span>
        </div>
      </div>
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :class="{
          'bg-primary/20': color === 'primary' || !color,
          'bg-secondary/20': color === 'secondary',
          'bg-accent/20': color === 'accent',
          'bg-danger/20': color === 'danger'
        }"
      >
        <span 
          class="text-2xl"
          :class="{
            'text-primary': color === 'primary' || !color,
            'text-secondary': color === 'secondary',
            'text-accent': color === 'accent',
            'text-danger': color === 'danger'
          }"
        >
          {{ icon }}
        </span>
      </div>
    </div>
  </div>
</template>
