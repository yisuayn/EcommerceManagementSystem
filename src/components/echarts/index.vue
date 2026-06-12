<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as echarts from 'echarts';
import type { EChartsOption } from "echarts";

// 定义图表类型
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'gauge'

interface Props {
    type: ChartType  // 图表类型
    data: any[]     // 数据
    width?: string
    height?: string
    title?: string
    xAxisData?: string[] | number[]  // x轴数据（折线图、柱状图需要）
    yAxisName?: string  // y轴名称
    seriesName?: string // 系列名称
    colors?: string[]   // 自定义颜色
    [key: string]: any  // 其他额外配置
}
const props = withDefaults(defineProps<Props>(), {
    width: '100%',
    height: '400px',
    title: '',
    xAxisData: () => [],
    yAxisName: '',
    seriesName: '数据',
    colors: () => ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

// 根据不同图表类型生成配置
const generateOption = (): EChartsOption => {
    const baseOption: any = {
        title: props.title ? { text: props.title, left: 'center' } : undefined,
        color: props.colors,
        tooltip: {
            trigger: props.type === 'pie' ? 'item' : 'axis'
        },
        grid: props.type !== 'pie' ? {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        } : undefined
    }
    // 根据不同类型返回不同配置
    switch (props.type) {
        case 'line':
            return {
                ...baseOption,
                xAxis: {
                    type: 'category',
                    data: props.xAxisData,
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value',
                    name: props.yAxisName
                },
                series: [{
                    name: props.seriesName,
                    type: 'line',
                    data: props.data,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8
                }]
            }

        case 'bar':
            return {
                ...baseOption,
                xAxis: {
                    type: 'category',
                    data: props.xAxisData,
                    axisLabel: {
                        rotate: props.xAxisData?.length > 8 ? 45 : 0
                    }
                },
                yAxis: {
                    type: 'value',
                    name: props.yAxisName
                },
                series: [{
                    name: props.seriesName,
                    type: 'bar',
                    data: props.data,
                    barWidth: '60%',
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0]
                    }
                }]
            }

        case 'pie':
            return {
                ...baseOption,
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                series: [{
                    name: props.seriesName,
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {d}%'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontWeight: 'bold'
                        }
                    },
                    data: props.data
                }]
            }
        case 'scatter':
            return {
                ...baseOption,
                xAxis: {
                    type: 'value',
                    name: props.xAxisData?.[0] || 'X轴'
                },
                yAxis: {
                    type: 'value',
                    name: props.yAxisName || 'Y轴'
                },
                series: [{
                    name: props.seriesName,
                    type: 'scatter',
                    data: props.data,
                    symbolSize: 10,
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }]
            }

        case 'radar':
            return {
                ...baseOption,
                radar: {
                    indicator: props.xAxisData?.map(item => ({
                        name: item,
                        max: Math.max(...props.data)
                    })) || [],
                    shape: 'circle',
                    center: ['50%', '50%'],
                    radius: '65%'
                },
                series: [{
                    name: props.seriesName,
                    type: 'radar',
                    data: [{
                        value: props.data,
                        name: props.seriesName,
                        areaStyle: {
                            color: 'rgba(84, 112, 198, 0.3)'
                        }
                    }]
                }]
            }

        case 'gauge':
            return {
                ...baseOption,
                series: [{
                    name: props.seriesName,
                    type: 'gauge',
                    center: ['50%', '50%'],
                    radius: '70%',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    progress: {
                        show: true,
                        width: 18,
                        itemStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 1,
                                y2: 0,
                                colorStops: [
                                    { offset: 0, color: '#5470c6' },
                                    { offset: 1, color: '#fac858' }
                                ]
                            }
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            width: 18
                        }
                    },
                    axisTick: {
                        show: true,
                        splitNumber: 5,
                        length: 8,
                        lineStyle: {
                            width: 1
                        }
                    },
                    axisLabel: {
                        distance: 10,
                        fontSize: 12
                    },
                    pointer: {
                        show: true,
                        length: '60%',
                        width: 8
                    },
                    detail: {
                        valueAnimation: true,
                        fontSize: 20,
                        offsetCenter: [0, 30]
                    },
                    title: {
                        show: true,
                        offsetCenter: [0, -20]
                    },
                    data: [{ value: props.data[0], name: props.seriesName }]
                }]
            }

        default:
            return {}
    }
}

// 初始化图表
const initChart = () => {
    if (chartRef.value) {
        if (chartInstance) {
            chartInstance.dispose()
        }
        chartInstance = echarts.init(chartRef.value)
        chartInstance.setOption(generateOption())
        window.addEventListener('resize', handleResize)
    }
}

// 更新图表
const updateChart = () => {
    if (chartInstance) {
        chartInstance.setOption(generateOption(), true)
    }
}

const handleResize = () => {
    chartInstance?.resize()
}

// 监听数据或类型变化
watch(() => [props.type, props.data, props.xAxisData], () => {
    nextTick(() => {
        updateChart()
    })
}, { deep: true })

onMounted(() => {
    initChart()
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
})
</script>

<template>
    <div ref="chartRef" :style="{ width, height }"></div>
</template>