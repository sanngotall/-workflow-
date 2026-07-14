<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: number[]
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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: {
        color: '#F1F5F9'
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.map((_, i) => `${i + 1}s`),
      axisLine: {
        lineStyle: {
          color: '#334155'
        }
      },
      axisLabel: {
        color: '#64748B'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#64748B'
      },
      splitLine: {
        lineStyle: {
          color: '#334155',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'QPS',
        type: 'line',
        smooth: true,
        data: props.data,
        lineStyle: {
          color: '#6366F1',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
          ])
        },
        itemStyle: {
          color: '#6366F1'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

watch(() => props.data, updateChart, { deep: true })

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
