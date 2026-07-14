<!-- OperationLog.vue -->
<template>
  <div class="operation-log">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>操作日志</h2>
      <div class="header-actions">
        <el-button type="danger" plain @click="batchDelete">
          <el-icon>
            <Delete />
          </el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="exportLogs">
          <el-icon>
            <Download />
          </el-icon>
          导出日志
        </el-button>
        <el-button @click="refreshList">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日操作</div>
              <div class="stat-value">{{ statistics.today }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Edit />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">本周操作</div>
              <div class="stat-value">{{ statistics.week }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Calendar />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card warning" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">本月操作</div>
              <div class="stat-value">{{ statistics.month }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <DataLine />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">总操作数</div>
              <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Document />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="操作模块">
          <el-select v-model="searchForm.module" placeholder="请选择模块" clearable style="width: 120px">
            <el-option label="商品管理" value="product" />
            <el-option label="订单管理" value="order" />
            <el-option label="营销中心" value="marketing" />
            <el-option label="系统设置" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.action" placeholder="请选择类型" clearable style="width: 120px">
            <el-option label="新增" value="create" />
            <el-option label="编辑" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="导出" value="export" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
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

    <!-- 日志列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="logList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="operationTime" label="操作时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="operatorIp" label="操作IP" width="140" />
        <el-table-column prop="module" label="操作模块" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getModuleText(row.module) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">
              {{ getActionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="操作标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="操作内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="result" label="结果" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="80" align="center">
          <template #default="{ row }">
            {{ row.duration }}ms
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <span>已选择 {{ selectedRows.length }} 条日志</span>
        <el-button type="danger" size="small" @click="batchDeleteSelected">
          批量删除
        </el-button>
        <el-button type="primary" size="small" @click="batchExportSelected">
          批量导出
        </el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 日志详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`日志详情 - ${currentLog?.title}`" size="600px">
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="操作时间">
            {{ currentLog.operationTime }}
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ currentLog.operator }} ({{ currentLog.operatorIp }})
          </el-descriptions-item>
          <el-descriptions-item label="操作模块">
            {{ getModuleText(currentLog.module) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            {{ getActionText(currentLog.action) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作标题">
            {{ currentLog.title }}
          </el-descriptions-item>
          <el-descriptions-item label="操作内容">
            {{ currentLog.content }}
          </el-descriptions-item>
          <el-descriptions-item label="请求参数">
            <pre class="json-data">{{ JSON.stringify(currentLog.requestParams, null, 2) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="返回结果">
            <pre class="json-data">{{ JSON.stringify(currentLog.responseData, null, 2) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="执行结果">
            <el-tag :type="currentLog.result === 'success' ? 'success' : 'danger'">
              {{ currentLog.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentLog.errorMsg" label="错误信息">
            <span class="error-msg">{{ currentLog.errorMsg }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="执行耗时">
            {{ currentLog.duration }}ms
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            {{ currentLog.userAgent }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, Refresh, Edit, Calendar, DataLine, Document, Search, RefreshLeft } from '@element-plus/icons-vue'
import { getLogList } from '@/api/system'

// 统计数据
const statistics = reactive({
  today: 0,
  week: 0,
  month: 0,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  operator: '',
  module: '',
  action: '',
  dateRange: null
})

// 日志列表
const logList = ref<any[]>([])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref<any[]>([])

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentLog = ref<any>(null)

// 获取模块文本
const getModuleText = (module: string) => {
  const modules: Record<string, string> = {
    product: '商品管理',
    order: '订单管理',
    marketing: '营销中心',
    system: '系统设置'
  }
  return modules[module] || module
}

// 获取操作类型文本
const getActionText = (action: string) => {
  const actions: Record<string, string> = {
    create: '新增',
    update: '编辑',
    delete: '删除',
    query: '查询',
    export: '导出'
  }
  return actions[action] || action
}

// 获取操作类型样式
const getActionType = (action: string) => {
  const types: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    query: 'info',
    export: 'warning'
  }
  return types[action] || 'info'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadLogList()
}

const resetSearch = () => {
  searchForm.operator = ''
  searchForm.module = ''
  searchForm.action = ''
  searchForm.dateRange = null
  handleSearch()
}

const refreshList = () => {
  loadLogList()
}

const loadLogList = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      operator: searchForm.operator || undefined,
      module: searchForm.module || undefined,
      action: searchForm.action || undefined,
      startTime: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
      endTime: searchForm.dateRange ? searchForm.dateRange[1] : undefined
    }
    const res = await getLogList(params)
    logList.value = res.data.list || []
    total.value = res.data.total || 0
    // 更新统计数据
    if (res.data.statistics) {
      statistics.today = res.data.statistics.today || 0
      statistics.week = res.data.statistics.week || 0
      statistics.month = res.data.statistics.month || 0
      statistics.total = res.data.statistics.total || 0
    } else {
      statistics.total = total.value
    }
  } catch {
    ElMessage.error('获取日志列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadLogList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadLogList()
}

// 查看详情
const viewDetail = (row: any) => {
  currentLog.value = row
  detailDrawerVisible.value = true
}

// 批量删除
const batchDelete = () => {
  ElMessageBox.confirm('确认清空所有日志吗？此操作不可恢复', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('清空成功')
    loadLogList()
  }).catch(() => { })
}

const batchDeleteSelected = () => {
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条日志吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    selectedRows.value = []
    loadLogList()
  }).catch(() => { })
}

// 导出
const exportLogs = () => {
  ElMessage.success('导出成功')
}

const batchExportSelected = () => {
  ElMessage.success(`导出 ${selectedRows.value.length} 条日志成功`)
}

onMounted(() => {
  loadLogList()
})
</script>

<style scoped lang="scss">
.operation-log {
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

    &.primary .stat-icon {
      color: #409eff;
    }

    &.warning .stat-icon {
      color: #e6a23c;
    }

    &.success .stat-icon {
      color: #67c23a;
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

  .log-detail {
    padding: 20px;

    .json-data {
      margin: 0;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
    }

    .error-msg {
      color: #f56c6c;
    }
  }
}
</style>
