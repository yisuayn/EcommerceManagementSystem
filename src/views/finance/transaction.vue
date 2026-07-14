<template>
  <div class="transaction-management">
    <div class="page-header">
      <h2>交易流水</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
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
              <div class="stat-label">今日交易额</div>
              <div class="stat-value">¥{{ stats.todayAmount.toLocaleString() }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日交易笔数</div>
              <div class="stat-value">{{ stats.todayCount.toLocaleString() }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><Document /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card warning" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">本月交易额</div>
              <div class="stat-value">¥{{ stats.monthAmount.toLocaleString() }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><Coin /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">本月交易笔数</div>
              <div class="stat-value">{{ stats.monthCount.toLocaleString() }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><List /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="searchForm.paymentMethod" placeholder="全部" clearable style="width: 130px">
            <el-option label="微信" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="银行卡" value="bank" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型">
          <el-select v-model="searchForm.transactionType" placeholder="全部" clearable style="width: 130px">
            <el-option label="支付" value="payment" />
            <el-option label="退款" value="refund" />
            <el-option label="提现" value="withdraw" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 交易列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="tableLoading">
        <el-table-column prop="transactionId" label="交易编号" width="180" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="member" label="会员" width="100" align="center" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="{ 'amount-negative': row.amount < 0 }">
              {{ row.amount > 0 ? '+' : '' }}¥{{ row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100" align="center">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="transactionType" label="交易类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.transactionType)" size="small">
              {{ getTypeText(row.transactionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="transactionTime" label="交易时间" width="170" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Search, RefreshLeft, Money, Document, Coin, List } from '@element-plus/icons-vue'
import { getTransactionList } from '@/api/finance'

interface TransactionItem {
  transactionId: string
  orderNo: string
  member: string
  amount: number
  paymentMethod: string
  transactionType: string
  status: string
  transactionTime: string
}

const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const tableData = ref<TransactionItem[]>([])

const stats = reactive({
  todayAmount: 0,
  todayCount: 0,
  monthAmount: 0,
  monthCount: 0
})

const searchForm = reactive({
  orderNo: '',
  paymentMethod: '',
  transactionType: '',
  dateRange: null as [Date, Date] | null
})

const fetchData = async () => {
  tableLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo
    if (searchForm.paymentMethod) params.paymentMethod = searchForm.paymentMethod
    if (searchForm.transactionType) params.transactionType = searchForm.transactionType
    if (searchForm.dateRange) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    const res = await getTransactionList(params)
    const data = res.data || res
    tableData.value = data.list || []
    total.value = data.total || 0
    if (data.stats) {
      stats.todayAmount = data.stats.todayAmount || 0
      stats.todayCount = data.stats.todayCount || 0
      stats.monthAmount = data.stats.monthAmount || 0
      stats.monthCount = data.stats.monthCount || 0
    }
  } catch {
    ElMessage.error('获取交易列表失败')
  } finally {
    tableLoading.value = false
  }
}

const getPaymentMethodText = (method: string) => {
  const map: Record<string, string> = { wechat: '微信支付', alipay: '支付宝', bank: '银行卡' }
  return map[method] || method
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = { payment: '支付', refund: '退款', withdraw: '提现' }
  return map[type] || type
}

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = { payment: '', refund: 'warning', withdraw: 'info' }
  return map[type] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { success: '成功', fail: '失败', processing: '处理中' }
  return map[status] || status
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = { success: 'success', fail: 'danger', processing: 'warning' }
  return map[status] || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.paymentMethod = ''
  searchForm.transactionType = ''
  searchForm.dateRange = null
  currentPage.value = 1
  fetchData()
}

const refreshList = () => {
  fetchData()
}

const exportData = () => {
  ElMessage.success('报表导出中，请稍后下载')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.transaction-management {
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
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }
      }

      .stat-icon {
        color: #c0c4cc;
      }
    }

    &.primary .stat-icon { color: #409eff; }
    &.warning .stat-icon { color: #e6a23c; }
    &.success .stat-icon { color: #67c23a; }
  }

  .filter-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .table-card {
    border-radius: 8px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .amount-negative {
    color: #f56c6c;
    font-weight: 500;
  }
}
</style>
