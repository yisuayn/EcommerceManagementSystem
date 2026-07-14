<template>
  <div class="data-report">
    <!-- 页面标题 -->
    <div class="report-header">
      <h2>数据报表</h2>
      <div class="header-actions">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" :shortcuts="dateShortcuts" @change="handleDateChange" />
        <el-button type="primary" @click="exportReport">
          <el-icon>
            <Download />
          </el-icon>
          导出报表
        </el-button>
        <el-button @click="refreshData">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="indicator-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="indicator-card" shadow="hover">
          <div class="indicator-content">
            <div class="indicator-icon">
              <el-icon :size="32">
                <Money />
              </el-icon>
            </div>
            <div class="indicator-info">
              <div class="indicator-label">销售额</div>
              <div class="indicator-value">¥{{ formatNumber(salesData.totalSales) }}</div>
              <div class="indicator-trend" :class="salesData.trend >= 0 ? 'up' : 'down'">
                <el-icon>
                  <CaretTop v-if="salesData.trend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                {{ Math.abs(salesData.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="indicator-card" shadow="hover">
          <div class="indicator-content">
            <div class="indicator-icon">
              <el-icon :size="32">
                <ShoppingCart />
              </el-icon>
            </div>
            <div class="indicator-info">
              <div class="indicator-label">订单数</div>
              <div class="indicator-value">{{ formatNumber(salesData.totalOrders) }}</div>
              <div class="indicator-trend" :class="salesData.orderTrend >= 0 ? 'up' : 'down'">
                <el-icon>
                  <CaretTop v-if="salesData.orderTrend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                {{ Math.abs(salesData.orderTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="indicator-card" shadow="hover">
          <div class="indicator-content">
            <div class="indicator-icon">
              <el-icon :size="32">
                <User />
              </el-icon>
            </div>
            <div class="indicator-info">
              <div class="indicator-label">用户数</div>
              <div class="indicator-value">{{ formatNumber(salesData.totalUsers) }}</div>
              <div class="indicator-trend" :class="salesData.userTrend >= 0 ? 'up' : 'down'">
                <el-icon>
                  <CaretTop v-if="salesData.userTrend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                {{ Math.abs(salesData.userTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="indicator-card" shadow="hover">
          <div class="indicator-content">
            <div class="indicator-icon">
              <el-icon :size="32">
                <DataAnalysis />
              </el-icon>
            </div>
            <div class="indicator-info">
              <div class="indicator-label">转化率</div>
              <div class="indicator-value">{{ salesData.conversionRate }}%</div>
              <div class="indicator-trend" :class="salesData.conversionTrend >= 0 ? 'up' : 'down'">
                <el-icon>
                  <CaretTop v-if="salesData.conversionTrend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                {{ Math.abs(salesData.conversionTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-radio-group v-model="salesChartType" size="small" @change="updateSalesChart">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>商品销量排行</span>
            </div>
          </template>
          <div ref="productChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>分类销售占比</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>用户来源分析</span>
            </div>
          </template>
          <div ref="sourceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div ref="orderStatusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>销售明细表</span>
          <el-button type="primary" link @click="exportDetail">
            <el-icon>
              <Download />
            </el-icon>
            导出明细
          </el-button>
        </div>
      </template>

      <el-table :data="salesDetailList" border stripe v-loading="tableLoading">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量" width="100" align="center" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatNumber(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import {
  Money,
  ShoppingCart,
  User,
  DataAnalysis,
  Download,
  Refresh,
  CaretTop,
  CaretBottom
} from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/dashboard'

// 日期范围
const dateRange = ref<[Date, Date]>()
const dateShortcuts = [
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(1)
      return [start, end]
    }
  }
]

// 图表实例
const salesChartRef = ref<HTMLDivElement>()
const productChartRef = ref<HTMLDivElement>()
const categoryChartRef = ref<HTMLDivElement>()
const sourceChartRef = ref<HTMLDivElement>()
const orderStatusChartRef = ref<HTMLDivElement>()

let salesChart: echarts.ECharts | null = null
let productChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null
let orderStatusChart: echarts.ECharts | null = null

// 图表类型
const salesChartType = ref<'day' | 'week' | 'month'>('day')

// 表格数据
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const salesDetailList = ref<any[]>([])

// 销售数据
const salesData = reactive({
  totalSales: 0,
  totalOrders: 0,
  totalUsers: 0,
  conversionRate: 0,
  trend: 0,
  orderTrend: 0,
  userTrend: 0,
  conversionTrend: 0
})

// 模拟数据 - 销售趋势
const getSalesTrendData = () => {
  return salesTrendData.value
}

// 商品销量排行数据
const productRankingData = ref({
  xAxis: [],
  sales: []
})

// 分类销售占比数据
const categoryData = ref<{name: string, value: number}[]>([])

// 用户来源数据
const userSourceData = ref<{name: string, value: number}[]>([])

// 订单状态分布数据
const orderStatusData = ref<{name: string, value: number}[]>([])

// 销售趋势数据
const salesTrendData = ref({
  xAxis: [],
  sales: [],
  orders: []
})

// 初始化销售趋势图表
const initSalesChart = () => {
  if (!salesChartRef.value) return

  if (salesChart) {
    salesChart.dispose()
  }

  salesChart = echarts.init(salesChartRef.value)
  const data = getSalesTrendData()

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['销售额(万元)', '订单量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis,
      axisLabel: {
        rotate: data.xAxis.length > 15 ? 45 : 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额(万元)',
        axisLabel: {
          formatter: '{value} 万'
        }
      },
      {
        type: 'value',
        name: '订单量',
        axisLabel: {
          formatter: '{value} 单'
        }
      }
    ],
    series: [
      {
        name: '销售额(万元)',
        type: 'bar',
        data: data.sales.map(v => (v / 10000).toFixed(1)),
        barWidth: '40%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#409eff'
        },
        yAxisIndex: 0
      },
      {
        name: '订单量',
        type: 'line',
        data: data.orders,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#67c23a'
        },
        yAxisIndex: 1
      }
    ]
  }

  salesChart.setOption(option)
}

// 初始化商品销量排行图表
const initProductChart = () => {
  if (!productChartRef.value) return
  const data = productRankingData.value
  if (!data.xAxis.length) return

  if (productChart) {
    productChart.dispose()
  }

  productChart = echarts.init(productChartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '销量'
    },
    yAxis: {
      type: 'category',
      data: data.xAxis,
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: data.sales,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#409eff' },
              { offset: 1, color: '#66b1ff' }
            ]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c} 件'
        }
      }
    ]
  }

  productChart.setOption(option)
}

// 初始化分类销售占比图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  const data = categoryData.value
  if (!data.length) return

  if (categoryChart) {
    categoryChart.dispose()
  }

  categoryChart = echarts.init(categoryChartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '销售占比',
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: categoryData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        }
      }
    ]
  }

  categoryChart.setOption(option)
}

// 初始化用户来源图表
const initSourceChart = () => {
  if (!sourceChartRef.value) return
  const data = userSourceData.value
  if (!data.length) return

  if (sourceChart) {
    sourceChart.dispose()
  }

  sourceChart = echarts.init(sourceChartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '用户来源',
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
        data: data
      }
    ]
  }

  sourceChart.setOption(option)
}

// 初始化订单状态图表
const initOrderStatusChart = () => {
  if (!orderStatusChartRef.value) return
  const data = orderStatusData.value
  if (!data.length) return

  if (orderStatusChart) {
    orderStatusChart.dispose()
  }

  orderStatusChart = echarts.init(orderStatusChartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '占比(%)'
    },
    series: [
      {
        name: '占比',
        type: 'bar',
        data: data.map(item => item.value),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#409eff' },
              { offset: 1, color: '#909399' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  }

  orderStatusChart.setOption(option)
}

// 获取销售明细数据
const getSalesDetail = async () => {
  tableLoading.value = true
  try {
    const res = await dashboardApi()
    const data = res.data || {}
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    salesDetailList.value = (data.salesDetail || []).slice(start, end)
    total.value = data.salesDetail?.length || 0
  } catch (error) {
    console.log(error)
  } finally {
    tableLoading.value = false
  }
}

// 加载仪表盘/报表数据
const loadDashboardData = async () => {
  try {
    const res = await dashboardApi()
    const data = res.data || {}

    // Update summary stats
    if (data.summary) {
      salesData.totalSales = data.summary.totalSales || 0
      salesData.totalOrders = data.summary.totalOrders || 0
      salesData.totalUsers = data.summary.totalUsers || 0
      salesData.conversionRate = data.summary.conversionRate || 0
      salesData.trend = data.summary.trend || 0
      salesData.orderTrend = data.summary.orderTrend || 0
      salesData.userTrend = data.summary.userTrend || 0
      salesData.conversionTrend = data.summary.conversionTrend || 0
    }

    // Update chart data
    if (data.salesTrend) {
      salesTrendData.value = data.salesTrend
    }
    if (data.productRanking) {
      productRankingData.value = data.productRanking
    }
    if (data.categorySales) {
      categoryData.value = data.categorySales
    }
    if (data.userSource) {
      userSourceData.value = data.userSource
    }
    if (data.orderStatus) {
      orderStatusData.value = data.orderStatus
    }

    // Re-render charts
    initSalesChart()
    initProductChart()
    initCategoryChart()
    initSourceChart()
    initOrderStatusChart()
  } catch (error) {
    console.log(error)
  }
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 获取订单状态类型
const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'success'
  }
  return types[status] || 'info'
}

// 获取订单状态文本
const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待处理',
    1: '已完成'
  }
  return texts[status] || '未知'
}

// 处理日期变化
const handleDateChange = () => {
  refreshData()
}

// 更新销售图表
const updateSalesChart = () => {
  initSalesChart()
}

// 刷新数据
const refreshData = () => {
  loadDashboardData()
  getSalesDetail()
}

// 导出报表
const exportReport = () => {
  ElMessage.success('报表导出成功')
}

// 导出明细
const exportDetail = () => {
  ElMessage.success('明细导出成功')
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getSalesDetail()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getSalesDetail()
}

// 窗口大小变化时重新调整图表
const handleResize = () => {
  salesChart?.resize()
  productChart?.resize()
  categoryChart?.resize()
  sourceChart?.resize()
  orderStatusChart?.resize()
}

// 初始化
onMounted(async () => {
  await loadDashboardData()
  getSalesDetail()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  salesChart?.dispose()
  productChart?.dispose()
  categoryChart?.dispose()
  sourceChart?.dispose()
  orderStatusChart?.dispose()
})
</script>

<style scoped lang="scss">
.data-report {
  min-height: 100vh;

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 20px;

    h2 {
      font-size: 20px;
      font-weight: 500;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .indicator-row {
    margin-bottom: 20px;
  }

  .indicator-card {
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .indicator-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .indicator-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        color: white;
      }

      .indicator-info {
        flex: 1;

        .indicator-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .indicator-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .indicator-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.up {
            color: #67c23a;
          }

          &.down {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .chart-card,
  .table-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
