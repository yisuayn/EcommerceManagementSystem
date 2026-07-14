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
      <el-table :data="tableData" border stripe v-loading="tableLoading">
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, RefreshLeft, Clock, CircleCheck, SuccessFilled, CircleClose } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getRefundList, auditRefund } from '@/api/finance'

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

const tableData = ref<RefundItem[]>([])

const stats = reactive({
  pending: 0,
  approved: 0,
  completed: 0,
  rejected: 0
})

const searchForm = reactive({
  refundNo: '',
  orderNo: '',
  member: '',
  status: ''
})

const computeStats = (list: RefundItem[]) => {
  stats.pending = list.filter(item => item.status === 'pending').length
  stats.approved = list.filter(item => item.status === 'approved').length
  stats.completed = list.filter(item => item.status === 'completed').length
  stats.rejected = list.filter(item => item.status === 'rejected').length
}

const fetchData = async () => {
  tableLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.refundNo) params.refundNo = searchForm.refundNo
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo
    if (searchForm.member) params.member = searchForm.member
    if (searchForm.status) params.status = searchForm.status
    const res = await getRefundList(params)
    const data = res.data || res
    tableData.value = data.list || []
    total.value = data.total || 0
    computeStats(data.list || [])
  } catch {
    ElMessage.error('获取退款列表失败')
  } finally {
    tableLoading.value = false
  }
}

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
    try {
      await auditRefund({
        id: currentRefund.value.id,
        action: reviewForm.result === 'pass' ? 'approve' : 'reject',
        remark: reviewForm.remark
      })
      ElMessage.success(reviewForm.result === 'pass' ? '审核通过，等待确认退款' : '已拒绝退款申请')
      reviewDialogVisible.value = false
      fetchData()
    } catch {
      ElMessage.error('审核操作失败')
    }
  }
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
  ).then(async () => {
    try {
      await auditRefund({ id: row.id, action: 'complete' })
      ElMessage.success('退款成功')
      fetchData()
    } catch {
      ElMessage.error('退款操作失败')
    }
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
  ).then(async () => {
    try {
      await auditRefund({ id: row.id, action: 'reject' })
      ElMessage.success('已拒绝退款')
      fetchData()
    } catch {
      ElMessage.error('拒绝操作失败')
    }
  }).catch(() => {})
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.refundNo = ''
  searchForm.orderNo = ''
  searchForm.member = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchData()
}

const refreshList = () => {
  fetchData()
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
