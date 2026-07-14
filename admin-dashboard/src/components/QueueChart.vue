<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  stats: {
    waiting: number
    active: number
    failed: number
    completed: number
  }
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        color: '#94A3B8'
      }
    },
    series: [
      {
        name: '队列任务',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#1E293B',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#F1F5F9'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: props.stats.waiting, name: '等待中', itemStyle: { color: '#F59E0B' } },
          { value: props.stats.active, name: '执行中', itemStyle: { color: '#6366F1' } },
          { value: props.stats.completed, name: '已完成', itemStyle: { color: '#10B981' } },
          { value: props.stats.failed, name: '失败', itemStyle: { color: '#EF4444' } }
        ]
      }
    ]
  }
  
  chartInstance.setOption(option)
}

watch(() => props.stats, updateChart, { deep: true })

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="w-full h-64"></div>
</template>
