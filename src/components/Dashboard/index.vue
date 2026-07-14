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
import { ref, onMounted } from 'vue';
import { dashboardApi } from "@/api/dashboard"
import UniversalChart, { type ChartType } from '@/components/echarts/index.vue'

// 统计数据 - 初始硬编码，后续被API数据替换
const statsData = ref([
    { title: '今日订单', value: '0', trend: 0, icon: ShoppingCart, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: '商品总数', value: '0', trend: 0, icon: Goods, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: '用户总数', value: '0', trend: 0, icon: User, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: '今日收入', value: '¥0', trend: 0, icon: Money, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

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

// 图表数据
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月']
const lineData = ref([65, 72, 88, 95, 110, 135, 158, 142])

const products = ['手机', '电脑', '平板', '耳机', '手表', '相机']
const barData = ref([325, 268, 198, 345, 156, 98])

const pieData = ref([
    { name: '电商平台', value: 45 },
    { name: '实体店', value: 28 },
    { name: '直播带货', value: 18 },
    { name: '其他渠道', value: 9 }
])

const scatterData = ref<any[]>([])
const radarIndicators = ref<string[]>([])
const radarData = ref<any[]>([])
const gaugeValue = ref(0)

const fatehalldata = async () => {
    try {
        const res = await dashboardApi()
        const data = res.data || {}

        // Update stats data from API
        if (data.stats) {
            const iconMap = [ShoppingCart, Goods, User, Money]
            const gradients = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            ]
            const titles = ['今日订单', '商品总数', '用户总数', '今日收入']
            statsData.value = (data.stats || []).map((item: any, index: number) => ({
                title: titles[index] || item.title,
                value: item.value || '0',
                trend: item.trend || 0,
                icon: iconMap[index] || ShoppingCart,
                gradient: gradients[index] || gradients[0]
            }))
        }

        // Update chart data from API
        if (data.months) months.length = 0 && months.push(...data.months)
        if (data.lineData) lineData.value = data.lineData
        if (data.products) products.length = 0 && products.push(...data.products)
        if (data.barData) barData.value = data.barData
        if (data.pieData) pieData.value = data.pieData
        if (data.scatterData) scatterData.value = data.scatterData
        if (data.radarIndicators) radarIndicators.value = data.radarIndicators
        if (data.radarData) radarData.value = data.radarData
        if (data.gaugeValue !== undefined) gaugeValue.value = data.gaugeValue
    } catch (error) {
        console.log(error);
    }
}

// 获取中文名称
const getTypeName = (type: ChartType) => {
    return chartTypeMap.get(type) || type
}

onMounted(() => {
    fatehalldata()
})
</script>