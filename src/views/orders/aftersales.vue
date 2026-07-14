<!-- ExceptionMonitor.vue -->
<template>
  <div class="exception-monitor">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>异常监控</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
        <el-button @click="exportReport">
          <el-icon>
            <Download />
          </el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 异常统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card danger" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日异常</div>
              <div class="stat-value">{{ statistics.today }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Warning />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card warning" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">待处理</div>
              <div class="stat-value">{{ statistics.pending }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Clock />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">处理中</div>
              <div class="stat-value">{{ statistics.processing }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Loading />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已解决</div>
              <div class="stat-value">{{ statistics.resolved }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <CircleCheck />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 异常类型分布图表 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>异常类型分布</span>
            </div>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>异常趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="异常类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="订单异常" value="order" />
            <el-option label="支付异常" value="payment" />
            <el-option label="库存异常" value="inventory" />
            <el-option label="系统异常" value="system" />
            <el-option label="物流异常" value="logistics" />
          </el-select>
        </el-form-item>
        <el-form-item label="异常级别">
          <el-select v-model="searchForm.level" placeholder="请选择级别" clearable style="width: 120px">
            <el-option label="严重" value="critical" />
            <el-option label="警告" value="warning" />
            <el-option label="提示" value="info" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间">
          <el-date-picker v-model="searchForm.dateRange" type="datetimerange" range-separator="至"
            start-placeholder="开始时间" end-placeholder="结束时间" style="width: 360px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon>
              <RefreshLeft />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 异常列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="exceptionList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="happenTime" label="发生时间" width="160" />
        <el-table-column prop="type" label="异常类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="异常标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="异常内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button v-if="row.status === 'pending'" link type="primary" size="small" @click="handleException(row)">
              处理
            </el-button>
            <el-button v-if="row.status !== 'resolved'" link type="success" size="small" @click="resolveException(row)">
              标记解决
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <span>已选择 {{ selectedRows.length }} 个异常</span>
        <el-button type="primary" size="small" @click="batchProcess">批量处理</el-button>
        <el-button type="success" size="small" @click="batchResolve">批量解决</el-button>
        <el-button type="danger" size="small" @click="batchIgnore">批量忽略</el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 异常详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`异常详情 - ${currentException?.title}`" size="60%">
      <div v-if="currentException" class="exception-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="异常ID">
              {{ currentException.id }}
            </el-descriptions-item>
            <el-descriptions-item label="发生时间">
              {{ currentException.happenTime }}
            </el-descriptions-item>
            <el-descriptions-item label="异常类型">
              {{ getTypeText(currentException.type) }}
            </el-descriptions-item>
            <el-descriptions-item label="异常级别">
              <el-tag :type="getLevelTagType(currentException.level)">
                {{ getLevelText(currentException.level) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="处理状态">
              <el-tag :type="getStatusTagType(currentException.status)">
                {{ getStatusText(currentException.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="处理人">
              {{ currentException.handler || '未分配' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 异常内容 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">异常详情</span>
          </template>
          <div class="exception-content">
            <h4>异常标题：</h4>
            <p>{{ currentException.title }}</p>
            <h4>异常内容：</h4>
            <p>{{ currentException.content }}</p>
            <h4>堆栈信息：</h4>
            <pre class="stack-trace">{{ currentException.stackTrace || '无' }}</pre>
          </div>
        </el-card>

        <!-- 关联信息 -->
        <el-card v-if="currentException.relatedData" class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">关联信息</span>
          </template>
          <pre class="related-data">{{ JSON.stringify(currentException.relatedData, null, 2) }}</pre>
        </el-card>

        <!-- 处理记录 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">处理记录</span>
          </template>
          <el-timeline>
            <el-timeline-item v-for="(log, index) in currentException.handleLogs" :key="index" :timestamp="log.time"
              placement="top">
              {{ log.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
          <el-button v-if="currentException.status === 'pending'" type="primary"
            @click="handleException(currentException)">
            处理异常
          </el-button>
          <el-button v-if="currentException.status !== 'resolved'" type="success"
            @click="resolveException(currentException)">
            标记为已解决
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 处理异常对话框 -->
    <el-dialog v-model="handleDialogVisible" title="处理异常" width="500px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-select v-model="handleForm.method" style="width: 100%">
            <el-option label="人工处理" value="manual" />
            <el-option label="自动修复" value="auto" />
            <el-option label="忽略" value="ignore" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="handleForm.remark" type="textarea" :rows="4" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import {
  Download,
  Refresh,
  Warning,
  Clock,
  Loading,
  CircleCheck,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { getExceptionList, handleException as handleExceptionApi } from '@/api/order'

// 统计数据
const statistics = reactive({
  today: 0,
  pending: 0,
  processing: 0,
  resolved: 0
})

// 搜索表单
const searchForm = reactive({
  type: '',
  level: '',
  status: '',
  dateRange: null
})

// 异常列表数据
const exceptionList = ref<any[]>([])

// 图表实例
const typeChartRef = ref<HTMLDivElement>()
const trendChartRef = ref<HTMLDivElement>()
let typeChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref<any[]>([])

// 异常详情抽屉
const detailDrawerVisible = ref(false)
const currentException = ref<any>(null)

// 处理异常对话框
const handleDialogVisible = ref(false)
const handleForm = reactive({ method: 'manual', remark: '' })

// 获取异常类型文本
const getTypeText = (type: string) => {
  const types: Record<string, string> = {
    order: '订单异常',
    payment: '支付异常',
    inventory: '库存异常',
    system: '系统异常',
    logistics: '物流异常'
  }
  return types[type] || type
}

// 获取异常类型标签样式
const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    order: 'warning',
    payment: 'danger',
    inventory: 'info',
    system: 'danger',
    logistics: 'warning'
  }
  return types[type] || 'info'
}

// 获取异常级别文本
const getLevelText = (level: string) => {
  const levels: Record<string, string> = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }
  return levels[level] || level
}

// 获取异常级别标签样式
const getLevelTagType = (level: string) => {
  const types: Record<string, string> = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return types[level] || 'info'
}

// 获取处理状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  }
  return texts[status] || status
}

// 获取处理状态标签样式
const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success'
  }
  return types[status] || 'info'
}

// 初始化异常类型分布图表
const initTypeChart = () => {
  if (!typeChartRef.value) return

  typeChart = echarts.init(typeChartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['订单异常', '支付异常', '库存异常', '系统异常', '物流异常']
    },
    series: [
      {
        name: '异常类型',
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: [
          { name: '订单异常', value: 35 },
          { name: '支付异常', value: 25 },
          { name: '库存异常', value: 20 },
          { name: '系统异常', value: 12 },
          { name: '物流异常', value: 8 }
        ],
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

  typeChart.setOption(option)
}

// 初始化异常趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['严重', '警告', '提示']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['6/7', '6/8', '6/9', '6/10', '6/11', '6/12', '6/13'],
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '异常数量'
    },
    series: [
      {
        name: '严重',
        type: 'line',
        data: [5, 7, 4, 8, 6, 9, 5],
        smooth: true,
        lineStyle: { color: '#f56c6c', width: 2 },
        areaStyle: { opacity: 0.1, color: '#f56c6c' }
      },
      {
        name: '警告',
        type: 'line',
        data: [12, 15, 10, 18, 14, 20, 12],
        smooth: true,
        lineStyle: { color: '#e6a23c', width: 2 },
        areaStyle: { opacity: 0.1, color: '#e6a23c' }
      },
      {
        name: '提示',
        type: 'line',
        data: [8, 10, 6, 12, 9, 14, 8],
        smooth: true,
        lineStyle: { color: '#909399', width: 2 },
        areaStyle: { opacity: 0.1, color: '#909399' }
      }
    ]
  }

  trendChart.setOption(option)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadExceptionList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.type = ''
  searchForm.level = ''
  searchForm.status = ''
  searchForm.dateRange = null
  handleSearch()
}

// 刷新数据
const refreshData = () => {
  loadExceptionList()
  initTypeChart()
  initTrendChart()
}

// 加载异常列表
const loadExceptionList = async () => {
  tableLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.level) params.level = searchForm.level
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.dateRange) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const res = await getExceptionList(params)
    exceptionList.value = res.data.list || []
    total.value = res.data.total || 0
    if (res.data.statistics) {
      statistics.today = res.data.statistics.today || 0
      statistics.pending = res.data.statistics.pending || 0
      statistics.processing = res.data.statistics.processing || 0
      statistics.resolved = res.data.statistics.resolved || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    tableLoading.value = false
  }
}

// 表格选中变化
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadExceptionList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadExceptionList()
}

// 查看异常详情
const viewDetail = (row: any) => {
  currentException.value = row
  detailDrawerVisible.value = true
}

// 处理异常
const handleException = (row: any) => {
  currentException.value = row
  handleForm.method = 'manual'
  handleForm.remark = ''
  handleDialogVisible.value = true
}

// 提交处理
const submitHandle = async () => {
  try {
    await handleExceptionApi({
      id: currentException.value?.id,
      method: handleForm.method,
      remark: handleForm.remark
    })
    ElMessage.success('异常处理中')
    handleDialogVisible.value = false
    if (currentException.value) {
      currentException.value.status = 'processing'
      currentException.value.handler = 'admin'
    }
    loadExceptionList()
    if (detailDrawerVisible.value) {
      detailDrawerVisible.value = false
    }
  } catch (error) {
    console.log(error)
  }
}

// 解决异常
const resolveException = (row: any) => {
  ElMessageBox.confirm('确认标记该异常为已解决吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('异常已解决')
    row.status = 'resolved'
    loadExceptionList()
    if (detailDrawerVisible.value) {
      detailDrawerVisible.value = false
    }
  }).catch(() => { })
}

// 批量处理
const batchProcess = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择异常')
    return
  }
  ElMessage.info(`批量处理 ${selectedRows.value.length} 个异常`)
}

// 批量解决
const batchResolve = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择异常')
    return
  }
  ElMessageBox.confirm(`确认解决 ${selectedRows.value.length} 个异常吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('批量解决成功')
    loadExceptionList()
  }).catch(() => { })
}

// 批量忽略
const batchIgnore = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择异常')
    return
  }
  ElMessageBox.confirm(`确认忽略 ${selectedRows.value.length} 个异常吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量忽略成功')
    loadExceptionList()
  }).catch(() => { })
}

// 导出报告
const exportReport = () => {
  ElMessage.success('报告导出成功')
}

// 窗口大小变化时重新调整图表
const handleResize = () => {
  typeChart?.resize()
  trendChart?.resize()
}

// 初始化
onMounted(() => {
  initTypeChart()
  initTrendChart()
  loadExceptionList()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  typeChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped lang="scss">
.exception-monitor {
  min-height: 100vh;

  .page-header {
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

  .stat-row {
    margin-bottom: 20px;
  }

  .stat-card {
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stat-info {
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }
      }

      .stat-icon {
        color: #c0c4cc;
      }
    }

    &.danger .stat-icon {
      color: #f56c6c;
    }

    &.warning .stat-icon {
      color: #e6a23c;
    }

    &.primary .stat-icon {
      color: #409eff;
    }

    &.success .stat-icon {
      color: #67c23a;
    }
  }

  .chart-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .card-header {
      font-size: 16px;
      font-weight: 500;
    }

    .chart-container {
      width: 100%;
      height: 350px;
    }
  }

  .filter-card,
  .table-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .batch-actions {
    margin-top: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  // 异常详情样式
  .exception-detail {
    padding: 20px;

    .detail-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-title {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .exception-content {
      h4 {
        margin: 12px 0 8px;
        color: #303133;
      }

      p {
        margin: 0;
        padding: 8px 12px;
        background: #f5f7fa;
        border-radius: 4px;
        color: #606266;
      }
    }

    .stack-trace,
    .related-data {
      margin: 0;
      padding: 12px;
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
    }

    .detail-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
