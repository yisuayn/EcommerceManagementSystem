<template>
  <div class="refund-management">
    <div class="page-header">
      <h2>退款管理</h2>
      <div class="header-actions">
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
              <div class="stat-label">待处理</div>
              <div class="stat-value text-warning">{{ stats.pending }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">审核通过</div>
              <div class="stat-value">{{ stats.approved }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已完成</div>
              <div class="stat-value">{{ stats.completed }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><SuccessFilled /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card danger" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已拒绝</div>
              <div class="stat-value">{{ stats.rejected }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32"><CircleClose /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="退款编号">
          <el-input v-model="searchForm.refundNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="会员">
          <el-input v-model="searchForm.member" placeholder="请输入" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 130px">
            <el-option label="待审核" value="pending" />
            <el-option label="审核通过" value="approved" />
            <el-option label="已完成" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
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

    <!-- 退款列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="filteredList" border stripe v-loading="tableLoading">
        <el-table-column prop="refundNo" label="退款编号" width="170" />
        <el-table-column prop="orderNo" label="订单号" width="170" />
        <el-table-column prop="member" label="会员" width="90" align="center" />
        <el-table-column prop="amount" label="退款金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="primary" size="small" @click="openReviewDialog(row)">审核</el-button>
            </template>
            <template v-else-if="row.status === 'approved'">
              <el-button link type="success" size="small" @click="confirmRefund(row)">确认退款</el-button>
              <el-button link type="danger" size="small" @click="rejectRefund(row)">拒绝</el-button>
            </template>
            <template v-else>
              <el-button link type="info" size="small" @click="openReviewDialog(row)">详情</el-button>
            </template>
          </template>
        </el-table-column>
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

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewTitle" width="550px" @close="closeReviewDialog">
      <div v-if="currentRefund" class="review-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="退款编号">{{ currentRefund.refundNo }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ currentRefund.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="会员">{{ currentRefund.member }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">¥{{ currentRefund.amount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentRefund.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="退款原因" :span="2">{{ currentRefund.reason }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-form :model="reviewForm" ref="reviewFormRef" label-width="80px">
          <el-form-item label="审核结果" prop="result" :rules="[{ required: true, message: '请选择审核结果', trigger: 'change' }]">
            <el-radio-group v-model="reviewForm.result">
              <el-radio value="pass">通过</el-radio>
              <el-radio value="reject">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核备注" prop="remark">
            <el-input v-model="reviewForm.remark" type="textarea" :rows="3" placeholder="请输入审核备注（可选）" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, RefreshLeft, Clock, CircleCheck, SuccessFilled, CircleClose } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface RefundItem {
  id: number
  refundNo: string
  orderNo: string
  member: string
  amount: number
  reason: string
  applyTime: string
  status: string
}

const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const stats = reactive({
  pending: 12,
  approved: 8,
  completed: 156,
  rejected: 5
})

const searchForm = reactive({
  refundNo: '',
  orderNo: '',
  member: '',
  status: ''
})

const allRefunds = ref<RefundItem[]>([
  { id: 1, refundNo: 'RF20250701001', orderNo: 'ORD20250630001', member: '张三', amount: 599, reason: '商品质量问题，收到后发现屏幕有划痕', applyTime: '2025-07-01 09:15:23', status: 'pending' },
  { id: 2, refundNo: 'RF20250701002', orderNo: 'ORD20250630002', member: '李四', amount: 128, reason: '买错了，不想要了', applyTime: '2025-07-01 10:32:45', status: 'pending' },
  { id: 3, refundNo: 'RF20250701003', orderNo: 'ORD20250629001', member: '王五', amount: 2399, reason: '商品与描述不符，颜色有差异', applyTime: '2025-07-01 11:05:12', status: 'approved' },
  { id: 4, refundNo: 'RF20250701004', orderNo: 'ORD20250628001', member: '赵六', amount: 45, reason: '物流太慢，已经不需要了', applyTime: '2025-07-01 14:22:18', status: 'completed' },
  { id: 5, refundNo: 'RF20250630001', orderNo: 'ORD20250627001', member: '孙七', amount: 880, reason: '收到商品破损，包装完好但内部破损', applyTime: '2025-06-30 08:10:33', status: 'pending' },
  { id: 6, refundNo: 'RF20250630002', orderNo: 'ORD20250626001', member: '周八', amount: 159, reason: '重复下单了', applyTime: '2025-06-30 10:45:09', status: 'pending' },
  { id: 7, refundNo: 'RF20250630003', orderNo: 'ORD20250625001', member: '吴九', amount: 3299, reason: '质量问题，无法正常使用', applyTime: '2025-06-30 13:20:55', status: 'approved' },
  { id: 8, refundNo: 'RF20250629001', orderNo: 'ORD20250624001', member: '郑十', amount: 69.9, reason: '尺码不合适', applyTime: '2025-06-29 09:30:12', status: 'rejected' },
  { id: 9, refundNo: 'RF20250629002', orderNo: 'ORD20250623001', member: '张三', amount: 350, reason: '商品有异味', applyTime: '2025-06-29 15:42:38', status: 'completed' },
  { id: 10, refundNo: 'RF20250628001', orderNo: 'ORD20250622001', member: '李四', amount: 1299, reason: '少发了配件', applyTime: '2025-06-28 11:05:07', status: 'completed' },
  { id: 11, refundNo: 'RF20250628002', orderNo: 'ORD20250621001', member: '王五', amount: 230, reason: '商品价格降价了，申请差价退款', applyTime: '2025-06-28 16:18:44', status: 'rejected' },
  { id: 12, refundNo: 'RF20250627001', orderNo: 'ORD20250620001', member: '赵六', amount: 560, reason: '收到商品有使用痕迹', applyTime: '2025-06-27 10:22:19', status: 'pending' },
  { id: 13, refundNo: 'RF20250627002', orderNo: 'ORD20250619001', member: '孙七', amount: 1899, reason: '商品功能异常，按键不灵敏', applyTime: '2025-06-27 14:30:01', status: 'approved' },
  { id: 14, refundNo: 'RF20250626001', orderNo: 'ORD20250618001', member: '周八', amount: 89.9, reason: '不想要了，未拆封', applyTime: '2025-06-26 09:15:33', status: 'completed' },
  { id: 15, refundNo: 'RF20250625001', orderNo: 'ORD20250617001', member: '吴九', amount: 4500, reason: '商品严重质量问题，要求退款', applyTime: '2025-06-25 11:40:22', status: 'completed' },
  { id: 16, refundNo: 'RF20250624001', orderNo: 'ORD20250616001', member: '郑十', amount: 120, reason: '配送错误，商品不对', applyTime: '2025-06-24 15:55:08', status: 'rejected' }
])

const filteredList = computed(() => {
  let list = allRefunds.value
  if (searchForm.refundNo) {
    list = list.filter(item => item.refundNo.includes(searchForm.refundNo))
  }
  if (searchForm.orderNo) {
    list = list.filter(item => item.orderNo.includes(searchForm.orderNo))
  }
  if (searchForm.member) {
    list = list.filter(item => item.member.includes(searchForm.member))
  }
  if (searchForm.status) {
    list = list.filter(item => item.status === searchForm.status)
  }
  total.value = list.length
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '审核通过',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'primary',
    completed: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

// 审核对话框
const reviewDialogVisible = ref(false)
const reviewFormRef = ref<FormInstance>()
const currentRefund = ref<RefundItem | null>(null)
const isDetailView = ref(false)

const reviewForm = reactive({
  result: 'pass',
  remark: ''
})

const reviewTitle = computed(() => isDetailView.value ? '退款详情' : '退款审核')

const openReviewDialog = (row: RefundItem) => {
  currentRefund.value = row
  isDetailView.value = row.status !== 'pending'
  if (isDetailView.value) {
    reviewDialogVisible.value = true
  } else {
    reviewForm.result = 'pass'
    reviewForm.remark = ''
    reviewDialogVisible.value = true
  }
}

const submitReview = async () => {
  if (isDetailView.value) {
    reviewDialogVisible.value = false
    return
  }
  await reviewFormRef.value?.validate()
  if (currentRefund.value) {
    if (reviewForm.result === 'pass') {
      currentRefund.value.status = 'approved'
      stats.pending--
      stats.approved++
      ElMessage.success('审核通过，等待确认退款')
    } else {
      currentRefund.value.status = 'rejected'
      stats.pending--
      stats.rejected++
      ElMessage.success('已拒绝退款申请')
    }
  }
  reviewDialogVisible.value = false
}

const closeReviewDialog = () => {
  reviewFormRef.value?.resetFields()
  currentRefund.value = null
}

// 确认退款
const confirmRefund = (row: RefundItem) => {
  ElMessageBox.confirm(
    `确认向会员「${row.member}」退款 ¥${row.amount.toFixed(2)} 吗？\n退款编号：${row.refundNo}`,
    '确认退款',
    {
      confirmButtonText: '确认退款',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = 'completed'
    stats.approved--
    stats.completed++
    ElMessage.success('退款成功')
  }).catch(() => {})
}

const rejectRefund = (row: RefundItem) => {
  ElMessageBox.confirm(
    `确认拒绝退款申请？\n退款编号：${row.refundNo}`,
    '拒绝退款',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = 'rejected'
    stats.approved--
    stats.rejected++
    ElMessage.success('已拒绝退款')
  }).catch(() => {})
}

const handleSearch = () => {
  currentPage.value = 1
}

const resetSearch = () => {
  searchForm.refundNo = ''
  searchForm.orderNo = ''
  searchForm.member = ''
  searchForm.status = ''
  currentPage.value = 1
}

const refreshList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    ElMessage.success('已刷新')
  }, 500)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

onMounted(() => {
  tableLoading.value = false
  total.value = allRefunds.value.length
})
</script>

<style scoped lang="scss">
.refund-management {
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

    &.primary .stat-icon { color: #409eff; }
    &.success .stat-icon { color: #67c23a; }
    &.danger .stat-icon { color: #f56c6c; }
  }

  .text-warning {
    color: #e6a23c;
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

  .review-info {
    .el-descriptions {
      margin-bottom: 8px;
    }
  }
}
</style>
