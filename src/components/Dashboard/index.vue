<!-- 可在 Dashboard 页面使用 -->
<template>
    <div class="dashboard">
        <div class="stats-grid">
            <div v-for="stat in statsData" :key="stat.title" class="stat-card">
                <div class="stat-icon" :style="{ background: stat.gradient }">
                    <el-icon :size="28">
                        <component :is="stat.icon" />
                    </el-icon>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-title">{{ stat.title }}</div>
                    <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                        {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
                        <el-icon>
                            <ArrowUp v-if="stat.trend > 0" />
                            <ArrowDown v-else />
                        </el-icon>
                        <span>较昨日</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="app">
            <div class="chart-controls">
                <div class="button-group">
                    <button v-for="type in chartTypes" :key="type" @click="currentType = type"
                        :class="{ active: currentType === type }">
                        {{ getTypeName(type) }}
                    </button>
                </div>
            </div>

            <!-- 折线图 -->
            <UniversalChart v-if="currentType === 'line'" type="line" :data="lineData" :xAxisData="months"
                title="月度销售趋势" yAxisName="销售额(万元)" seriesName="销售额" />

            <!-- 柱状图 -->
            <UniversalChart v-if="currentType === 'bar'" type="bar" :data="barData" :xAxisData="products" title="产品销售排行"
                yAxisName="销量(件)" seriesName="销量" />

            <!-- 饼图 -->
            <UniversalChart v-if="currentType === 'pie'" type="pie" :data="pieData" title="市场份额分布" seriesName="市场份额" />

            <!-- 散点图 -->
            <UniversalChart v-if="currentType === 'scatter'" type="scatter" :data="scatterData" :xAxisData="['身高(cm)']"
                yAxisName="体重(kg)" seriesName="身高体重分布" />

            <!-- 雷达图 -->
            <UniversalChart v-if="currentType === 'radar'" type="radar" :data="radarData" :xAxisData="radarIndicators"
                title="能力评估雷达图" seriesName="能力值" />

            <!-- 仪表盘 -->
            <UniversalChart v-if="currentType === 'gauge'" type="gauge" :data="[gaugeValue]" title="完成率"
                seriesName="完成进度" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Goods, User, Money, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import "./dashboard.scss"
import { onMounted } from 'vue';
import { dashboardApi } from "@/api/dashboard"

const statsData = [
    { title: '今日订单', value: '1,234', trend: 12.5, icon: ShoppingCart, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: '商品总数', value: '8,942', trend: 3.2, icon: Goods, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: '用户总数', value: '15,678', trend: 8.7, icon: User, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: '今日收入', value: '¥89,234', trend: -2.3, icon: Money, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
]

import { ref } from 'vue'
import UniversalChart, { type ChartType } from '@/components/echarts/index.vue'

const currentType = ref<ChartType>('line')
const chartTypes: ChartType[] = ['line', 'bar', 'pie', 'scatter', 'radar', 'gauge']
// 定义图表类型映射
const chartTypeMap = new Map<ChartType, string>([
    ['line', '折线图'],
    ['bar', '柱状图'],
    ['pie', '饼图'],
    ['scatter', '散点图'],
    ['radar', '雷达图'],
    ['gauge', '仪表盘']
])

// 折线图数据
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月']
const lineData = [65, 72, 88, 95, 110, 135, 158, 142]

// 柱状图数据
const products = ['手机', '电脑', '平板', '耳机', '手表', '相机']
const barData = [325, 268, 198, 345, 156, 98]

// 饼图数据
const pieData = [
    { name: '电商平台', value: 45 },
    { name: '实体店', value: 28 },
    { name: '直播带货', value: 18 },
    { name: '其他渠道', value: 9 }
]

// 散点图数据
const scatterData = [
    [160, 55], [165, 60], [170, 65], [175, 70],
    [180, 75], [172, 68], [168, 62], [178, 72]
]

// 雷达图数据
const radarIndicators = ['技术能力', '沟通能力', '管理能力', '创新能力', '执行力', '学习能力']
const radarData = [92, 78, 85, 88, 90, 95]

// 仪表盘数据
const gaugeValue = 75
const fatehalldata = async () => {
    try {
        const res = await dashboardApi()
        console.log(res);
    } catch (error) {
        console.log(error);
    }
}

// 获取中文名称
const getTypeName = (type: ChartType) => {
    return chartTypeMap.get(type) || type
    // 或 return chartTypeNames[type]
}

onMounted(() => {//guaizaishuju ,dom渲染完
    // fatehalldata()
})
</script>