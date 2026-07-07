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
      <el-table :data="filteredList" border stripe v-loading="tableLoading">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Search, RefreshLeft, Money, Document, Coin, List } from '@element-plus/icons-vue'

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

const stats = reactive({
  todayAmount: 156890,
  todayCount: 2345,
  monthAmount: 3256780,
  monthCount: 45678
})

const searchForm = reactive({
  orderNo: '',
  paymentMethod: '',
  transactionType: '',
  dateRange: null as [Date, Date] | null
})

const allTransactions = ref<TransactionItem[]>([
  { transactionId: 'TX20250701001', orderNo: 'ORD20250701001', member: '张三', amount: 5999, paymentMethod: 'wechat', transactionType: 'payment', status: 'success', transactionTime: '2025-07-01 10:15:23' },
  { transactionId: 'TX20250701002', orderNo: 'ORD20250701002', member: '李四', amount: 128, paymentMethod: 'alipay', transactionType: 'payment', status: 'success', transactionTime: '2025-07-01 10:32:45' },
  { transactionId: 'TX20250701003', orderNo: 'ORD20250701003', member: '王五', amount: -599, paymentMethod: 'wechat', transactionType: 'refund', status: 'success', transactionTime: '2025-07-01 11:05:12' },
  { transactionId: 'TX20250701004', orderNo: 'ORD20250701004', member: '赵六', amount: 2999, paymentMethod: 'bank', transactionType: 'payment', status: 'processing', transactionTime: '2025-07-01 11:28:36' },
  { transactionId: 'TX20250701005', orderNo: 'ORD20250701005', member: '孙七', amount: 4500, paymentMethod: 'alipay', transactionType: 'payment', status: 'success', transactionTime: '2025-07-01 12:00:01' },
  { transactionId: 'TX20250701006', orderNo: 'ORD20250701006', member: '周八', amount: 88, paymentMethod: 'wechat', transactionType: 'payment', status: 'success', transactionTime: '2025-07-01 13:15:44' },
  { transactionId: 'TX20250701007', orderNo: 'ORD20250701007', member: '吴九', amount: -1200, paymentMethod: 'alipay', transactionType: 'refund', status: 'success', transactionTime: '2025-07-01 14:22:18' },
  { transactionId: 'TX20250701008', orderNo: 'ORD20250701008', member: '郑十', amount: 239, paymentMethod: 'wechat', transactionType: 'payment', status: 'fail', transactionTime: '2025-07-01 14:55:30' },
  { transactionId: 'TX20250702001', orderNo: 'ORD20250702001', member: '张三', amount: 1899, paymentMethod: 'alipay', transactionType: 'payment', status: 'success', transactionTime: '2025-07-02 09:10:15' },
  { transactionId: 'TX20250702002', orderNo: 'ORD20250702002', member: '李四', amount: 350, paymentMethod: 'wechat', transactionType: 'payment', status: 'success', transactionTime: '2025-07-02 10:42:08' },
  { transactionId: 'TX20250702003', orderNo: 'ORD20250702003', member: '王五', amount: 7800, paymentMethod: 'bank', transactionType: 'payment', status: 'success', transactionTime: '2025-07-02 11:30:00' },
  { transactionId: 'TX20250702004', orderNo: 'ORD20250702004', member: '赵六', amount: -230, paymentMethod: 'wechat', transactionType: 'refund', status: 'processing', transactionTime: '2025-07-02 13:18:22' },
  { transactionId: 'TX20250702005', orderNo: 'ORD20250702005', member: '孙七', amount: 50000, paymentMethod: 'bank', transactionType: 'withdraw', status: 'processing', transactionTime: '2025-07-02 14:00:00' },
  { transactionId: 'TX20250703001', orderNo: 'ORD20250703001', member: '周八', amount: 159, paymentMethod: 'alipay', transactionType: 'payment', status: 'success', transactionTime: '2025-07-03 08:25:33' },
  { transactionId: 'TX20250703002', orderNo: 'ORD20250703002', member: '吴九', amount: 2699, paymentMethod: 'wechat', transactionType: 'payment', status: 'fail', transactionTime: '2025-07-03 09:15:47' },
  { transactionId: 'TX20250703003', orderNo: 'ORD20250703003', member: '郑十', amount: -159, paymentMethod: 'alipay', transactionType: 'refund', status: 'success', transactionTime: '2025-07-03 10:30:11' },
  { transactionId: 'TX20250703004', orderNo: 'ORD20250703004', member: '张三', amount: 200000, paymentMethod: 'bank', transactionType: 'withdraw', status: 'success', transactionTime: '2025-07-03 11:00:00' },
  { transactionId: 'TX20250703005', orderNo: 'ORD20250703005', member: '李四', amount: 89.9, paymentMethod: 'wechat', transactionType: 'payment', status: 'success', transactionTime: '2025-07-03 15:42:19' },
  { transactionId: 'TX20250704001', orderNo: 'ORD20250704001', member: '王五', amount: 3299, paymentMethod: 'alipay', transactionType: 'payment', status: 'success', transactionTime: '2025-07-04 10:05:07' },
  { transactionId: 'TX20250704002', orderNo: 'ORD20250704002', member: '赵六', amount: 45, paymentMethod: 'wechat', transactionType: 'payment', status: 'success', transactionTime: '2025-07-04 11:22:55' },
  { transactionId: 'TX20250704003', orderNo: 'ORD20250704003', member: '孙七', amount: -3299, paymentMethod: 'alipay', transactionType: 'refund', status: 'fail', transactionTime: '2025-07-04 14:10:38' },
  { transactionId: 'TX20250704004', orderNo: 'ORD20250704004', member: '周八', amount: 1000, paymentMethod: 'bank', transactionType: 'withdraw', status: 'success', transactionTime: '2025-07-04 16:30:00' },
  { transactionId: 'TX20250705001', orderNo: 'ORD20250705001', member: '吴九', amount: 560, paymentMethod: 'wechat', transactionType: 'payment', status: 'success', transactionTime: '2025-07-05 09:00:12' }
])

const filteredList = computed(() => {
  let list = allTransactions.value
  if (searchForm.orderNo) {
    list = list.filter(item => item.orderNo.includes(searchForm.orderNo))
  }
  if (searchForm.paymentMethod) {
    list = list.filter(item => item.paymentMethod === searchForm.paymentMethod)
  }
  if (searchForm.transactionType) {
    list = list.filter(item => item.transactionType === searchForm.transactionType)
  }
  total.value = list.length
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

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
}

const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.paymentMethod = ''
  searchForm.transactionType = ''
  searchForm.dateRange = null
  currentPage.value = 1
}

const refreshList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    ElMessage.success('已刷新')
  }, 500)
}

const exportData = () => {
  ElMessage.success('报表导出中，请稍后下载')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

onMounted(() => {
  tableLoading.value = false
  total.value = allTransactions.value.length
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
