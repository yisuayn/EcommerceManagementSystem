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

const fatehalldata = async () => {
    try {
        const res = await dashboardApi()
        console.log(res);
    } catch (error) {
        console.log(error);
    }
}
onMounted(() => {//guaizaishuju ,dom渲染完
    // fatehalldata()
})
</script>