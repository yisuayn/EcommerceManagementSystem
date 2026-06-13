<!-- AfterSale.vue -->
<template>
  <div class="after-sale">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>售后管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportAfterSale">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
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
        <el-card class="stat-card" shadow="hover" @click="filterByType('all')">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">售后总数</div>
              <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Service />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card warning" shadow="hover" @click="filterByType('pending')">
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
        <el-card class="stat-card primary" shadow="hover" @click="filterByType('processing')">
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
        <el-card class="stat-card success" shadow="hover" @click="filterByType('completed')">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已完成</div>
              <div class="stat-value">{{ statistics.completed }}</div>
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

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="售后单号">
          <el-input v-model="searchForm.afterSaleNo" placeholder="请输入售后单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="买家昵称">
          <el-input v-model="searchForm.buyerName" placeholder="请输入买家昵称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="售后类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 120px">
            <el-option label="仅退款" value="refund" />
            <el-option label="退货退款" value="return" />
            <el-option label="换货" value="exchange" />
            <el-option label="维修" value="repair" />
          </el-select>
        </el-form-item>
        <el-form-item label="售后状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待审核" value="pending" />
            <el-option label="审核通过" value="approved" />
            <el-option label="待退货" value="waiting_return" />
            <el-option label="待收货" value="waiting_receive" />
            <el-option label="已完成" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" style="width: 260px" />
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

    <!-- 售后列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="afterSaleList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="afterSaleNo" label="售后单号" width="160" fixed="left" />
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="createTime" label="申请时间" width="160" />
        <el-table-column prop="buyerName" label="买家" width="100" />
        <el-table-column prop="productName" label="商品" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="售后类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="refundAmount" label="退款金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatNumber(row.refundAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button v-if="row.status === 'pending'" link type="success" size="small" @click="approveAfterSale(row)">
              通过
            </el-button>
            <el-button v-if="row.status === 'pending'" link type="danger" size="small" @click="rejectAfterSale(row)">
              拒绝
            </el-button>
            <el-button v-if="row.status === 'waiting_return'" link type="primary" size="small"
              @click="confirmReturn(row)">
              确认退货
            </el-button>
            <el-button v-if="row.status === 'waiting_receive'" link type="primary" size="small"
              @click="confirmReceive(row)">
              确认收货
            </el-button>
            <el-button v-if="row.status === 'approved'" link type="primary" size="small" @click="processRefund(row)">
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <span>已选择 {{ selectedRows.length }} 个售后单</span>
        <el-button type="success" size="small" @click="batchApprove">批量通过</el-button>
        <el-button type="danger" size="small" @click="batchReject">批量拒绝</el-button>
        <el-button type="primary" size="small" @click="batchExport">批量导出</el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 售后详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`售后详情 - ${currentAfterSale?.afterSaleNo}`" size="60%">
      <div v-if="currentAfterSale" class="after-sale-detail">
        <!-- 售后流程 -->
        <el-steps :active="getStepActive(currentAfterSale.status)" finish-status="success" align-center>
          <el-step title="提交申请" />
          <el-step title="平台审核" />
          <el-step title="买家发货" />
          <el-step title="商家收货" />
          <el-step title="退款完成" />
        </el-steps>

        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="售后单号">
              {{ currentAfterSale.afterSaleNo }}
            </el-descriptions-item>
            <el-descriptions-item label="订单号">
              {{ currentAfterSale.orderNo }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ currentAfterSale.createTime }}
            </el-descriptions-item>
            <el-descriptions-item label="售后类型">
              {{ getTypeText(currentAfterSale.type) }}
            </el-descriptions-item>
            <el-descriptions-item label="买家昵称">
              {{ currentAfterSale.buyerName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentAfterSale.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="申请原因" :span="2">
              {{ currentAfterSale.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="问题描述" :span="2">
              {{ currentAfterSale.description || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">商品信息</span>
          </template>
          <el-table :data="[currentAfterSale]" border>
            <el-table-column prop="productName" label="商品名称" min-width="200" />
            <el-table-column prop="skuCode" label="SKU编码" width="140" />
            <el-table-column prop="price" label="单价" width="120" align="right">
              <template #default="{ row }">
                ¥{{ formatNumber(row.price) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" align="center" />
            <el-table-column prop="refundAmount" label="退款金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ formatNumber(row.refundAmount) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 凭证信息 -->
        <el-card v-if="currentAfterSale.images?.length" class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">凭证图片</span>
          </template>
          <div class="image-list">
            <el-image v-for="(img, index) in currentAfterSale.images" :key="index" :src="img"
              :preview-src-list="currentAfterSale.images" fit="cover" class="proof-image" />
          </div>
        </el-card>

        <!-- 物流信息（退货时显示） -->
        <el-card v-if="currentAfterSale.returnTrackingNo" class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">退货物流</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流公司">
              {{ currentAfterSale.returnLogisticsCompany }}
            </el-descriptions-item>
            <el-descriptions-item label="物流单号">
              {{ currentAfterSale.returnTrackingNo }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 审核意见 -->
        <el-card v-if="currentAfterSale.auditRemark" class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">审核意见</span>
          </template>
          <div class="audit-remark">
            {{ currentAfterSale.auditRemark }}
          </div>
        </el-card>

        <!-- 操作记录 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">操作记录</span>
          </template>
          <el-timeline>
            <el-timeline-item v-for="(log, index) in currentAfterSale.operationLogs" :key="index" :timestamp="log.time"
              placement="top">
              {{ log.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
          <el-button v-if="currentAfterSale.status === 'pending'" type="success"
            @click="approveAfterSale(currentAfterSale)">
            审核通过
          </el-button>
          <el-button v-if="currentAfterSale.status === 'pending'" type="danger"
            @click="rejectAfterSale(currentAfterSale)">
            拒绝申请
          </el-button>
          <el-button v-if="currentAfterSale.status === 'approved'" type="primary"
            @click="processRefund(currentAfterSale)">
            确认退款
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="auditType === 'approve' ? '审核通过' : '拒绝申请'" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.remark" type="textarea" :rows="4"
            :placeholder="auditType === 'approve' ? '请输入审核通过意见' : '请输入拒绝原因'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button :type="auditType === 'approve' ? 'success' : 'danger'" @click="submitAudit">
          {{ auditType === 'approve' ? '确认通过' : '确认拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Refresh,
  Service,
  Clock,
  Loading,
  CircleCheck,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 1258,
  pending: 45,
  processing: 68,
  completed: 1145
})

// 搜索表单
const searchForm = reactive({
  afterSaleNo: '',
  orderNo: '',
  buyerName: '',
  type: '',
  status: '',
  dateRange: null
})

// 售后列表数据
const afterSaleList = ref([
  {
    id: 1,
    afterSaleNo: 'AS202406130001',
    orderNo: 'ORD202406130001',
    createTime: '2024-06-13 10:30:00',
    buyerName: '张三',
    phone: '138****1234',
    productName: 'iPhone 15 Pro Max 256GB',
    skuCode: 'SKU001',
    price: 9999,
    quantity: 1,
    refundAmount: 9999,
    type: 'refund',
    status: 'pending',
    reason: '商品质量问题',
    description: '手机屏幕有划痕，无法正常使用',
    images: ['https://picsum.photos/200/150?random=1'],
    auditRemark: '',
    returnLogisticsCompany: null,
    returnTrackingNo: null,
    operationLogs: [
      { time: '2024-06-13 10:30:00', content: '买家提交售后申请' }
    ]
  },
  {
    id: 2,
    afterSaleNo: 'AS202406130002',
    orderNo: 'ORD202406130002',
    createTime: '2024-06-13 09:15:00',
    buyerName: '李四',
    phone: '139****5678',
    productName: '华为 Mate 60 Pro',
    skuCode: 'SKU002',
    price: 6999,
    quantity: 1,
    refundAmount: 6999,
    type: 'return',
    status: 'waiting_return',
    reason: '商品与描述不符',
    description: '收到的商品颜色与下单不一致',
    images: ['https://picsum.photos/200/150?random=2'],
    auditRemark: '同意退货，请尽快寄回商品',
    returnLogisticsCompany: '顺丰速运',
    returnTrackingNo: 'SF9876543210',
    operationLogs: [
      { time: '2024-06-13 09:15:00', content: '买家提交售后申请' },
      { time: '2024-06-13 10:00:00', content: '审核通过，等待买家发货' },
      { time: '2024-06-13 14:00:00', content: '买家已发货，物流单号：SF9876543210' }
    ]
  },
  {
    id: 3,
    afterSaleNo: 'AS202406130003',
    orderNo: 'ORD202406130003',
    createTime: '2024-06-12 16:00:00',
    buyerName: '王五',
    phone: '152****9012',
    productName: '小米 14 Ultra',
    skuCode: 'SKU003',
    price: 6499,
    quantity: 1,
    refundAmount: 6499,
    type: 'exchange',
    status: 'completed',
    reason: '尺寸不合适',
    description: '鞋子尺码偏大，需要换小一码',
    images: [],
    auditRemark: '同意换货',
    returnLogisticsCompany: '中通快递',
    returnTrackingNo: 'ZT1234567890',
    operationLogs: [
      { time: '2024-06-12 16:00:00', content: '买家提交售后申请' },
      { time: '2024-06-12 17:00:00', content: '审核通过' },
      { time: '2024-06-13 09:00:00', content: '买家已发货' },
      { time: '2024-06-13 15:00:00', content: '商家已收货并换货' },
      { time: '2024-06-13 16:00:00', content: '售后完成' }
    ]
  }
])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref<any[]>([])

// 售后详情抽屉
const detailDrawerVisible = ref(false)
const currentAfterSale = ref<any>(null)

// 审核对话框
const auditDialogVisible = ref(false)
const auditType = ref<'approve' | 'reject'>('approve')
const auditForm = reactive({ remark: '' })

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 获取售后类型文本
const getTypeText = (type: string) => {
  const types: Record<string, string> = {
    refund: '仅退款',
    return: '退货退款',
    exchange: '换货',
    repair: '维修'
  }
  return types[type] || type
}

// 获取售后类型标签样式
const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    refund: 'warning',
    return: 'primary',
    exchange: 'success',
    repair: 'info'
  }
  return types[type] || 'info'
}

// 获取售后状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '审核通过',
    waiting_return: '待退货',
    waiting_receive: '待收货',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 获取售后状态标签样式
const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'primary',
    waiting_return: 'info',
    waiting_receive: 'info',
    completed: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取步骤激活状态
const getStepActive = (status: string) => {
  const steps: Record<string, number> = {
    pending: 0,
    approved: 1,
    waiting_return: 2,
    waiting_receive: 3,
    completed: 4
  }
  return steps[status] || 0
}

// 按类型筛选
const filterByType = (type: string) => {
  if (type === 'all') {
    searchForm.status = ''
  } else {
    searchForm.status = type
  }
  handleSearch()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadAfterSaleList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.afterSaleNo = ''
  searchForm.orderNo = ''
  searchForm.buyerName = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = null
  handleSearch()
}

// 刷新列表
const refreshList = () => {
  loadAfterSaleList()
}

// 加载售后列表
const loadAfterSaleList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 表格选中变化
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadAfterSaleList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadAfterSaleList()
}

// 查看售后详情
const viewDetail = (row: any) => {
  currentAfterSale.value = row
  detailDrawerVisible.value = true
}

// 审核通过
const approveAfterSale = (row: any) => {
  auditType.value = 'approve'
  auditForm.remark = ''
  currentAfterSale.value = row
  auditDialogVisible.value = true
}

// 拒绝申请
const rejectAfterSale = (row: any) => {
  auditType.value = 'reject'
  auditForm.remark = ''
  currentAfterSale.value = row
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = () => {
  if (auditType.value === 'approve') {
    ElMessage.success('审核通过')
    if (currentAfterSale.value) {
      currentAfterSale.value.status = 'approved'
    }
  } else {
    if (!auditForm.remark) {
      ElMessage.warning('请填写拒绝原因')
      return
    }
    ElMessage.success('已拒绝申请')
    if (currentAfterSale.value) {
      currentAfterSale.value.status = 'rejected'
    }
  }
  auditDialogVisible.value = false
  loadAfterSaleList()
  if (detailDrawerVisible.value) {
    detailDrawerVisible.value = false
  }
}

// 确认退货
const confirmReturn = (row: any) => {
  ElMessageBox.confirm('确认已收到买家退货吗？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('退货已确认')
    row.status = 'waiting_receive'
    loadAfterSaleList()
  }).catch(() => { })
}

// 确认收货（换货场景）
const confirmReceive = (row: any) => {
  ElMessageBox.confirm('确认收到买家退回的商品吗？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('收货确认成功')
    row.status = 'completed'
    loadAfterSaleList()
  }).catch(() => { })
}

// 处理退款
const processRefund = (row: any) => {
  ElMessageBox.confirm(`确认退款 ¥${formatNumber(row.refundAmount)} 给买家吗？`, '提示', {
    confirmButtonText: '确认退款',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('退款成功')
    row.status = 'completed'
    loadAfterSaleList()
    if (detailDrawerVisible.value) {
      detailDrawerVisible.value = false
    }
  }).catch(() => { })
}

// 批量通过
const batchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择售后单')
    return
  }
  ElMessageBox.confirm(`确认通过 ${selectedRows.value.length} 个售后申请吗？`, '提示', {
    confirmButtonText: '确认通过',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('批量通过成功')
    loadAfterSaleList()
  }).catch(() => { })
}

// 批量拒绝
const batchReject = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择售后单')
    return
  }
  ElMessageBox.confirm(`确认拒绝 ${selectedRows.value.length} 个售后申请吗？`, '提示', {
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量拒绝成功')
    loadAfterSaleList()
  }).catch(() => { })
}

// 批量导出
const batchExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择售后单')
    return
  }
  ElMessage.success(`导出 ${selectedRows.value.length} 个售后单成功`)
}

// 导出数据
const exportAfterSale = () => {
  ElMessage.success('售后数据导出成功')
}

// 初始化
onMounted(() => {
  loadAfterSaleList()
})
</script>

<style scoped lang="scss">
.after-sale {
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

  .amount {
    color: #f56c6c;
    font-weight: bold;
  }

  // 售后详情样式
  .after-sale-detail {
    padding: 20px;

    .detail-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-title {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .image-list {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .proof-image {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        cursor: pointer;
      }
    }

    .audit-remark {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      color: #606266;
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
