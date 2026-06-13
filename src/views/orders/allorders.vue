<template>
  <div class="order-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportOrders">
          <el-icon>
            <Download />
          </el-icon>
          导出订单
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
        <el-card class="stat-card" shadow="hover" @click="filterByStatus('all')">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">总订单</div>
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

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card warning" shadow="hover" @click="filterByStatus('pending')">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">待支付</div>
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
        <el-card class="stat-card primary" shadow="hover" @click="filterByStatus('shipped')">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">待发货</div>
              <div class="stat-value">{{ statistics.shipped }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Van />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success" shadow="hover" @click="filterByStatus('completed')">
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
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="买家昵称">
          <el-input v-model="searchForm.buyerName" placeholder="请输入买家昵称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待支付" value="pending" />
            <el-option label="待发货" value="shipped" />
            <el-option label="待收货" value="delivering" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="退款中" value="refunding" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="searchForm.payMethod" placeholder="请选择方式" clearable style="width: 120px">
            <el-option label="微信支付" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="银行卡" value="card" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
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

    <!-- 订单列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="orderList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" width="180" fixed="left" />
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column prop="buyerName" label="买家" width="120" />
        <el-table-column prop="productName" label="商品" min-width="200" show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatNumber(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100" align="center">
          <template #default="{ row }">
            {{ getPayMethodText(row.payMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button v-if="row.status === 'pending'" link type="success" size="small" @click="handlePayment(row)">
              去支付
            </el-button>
            <el-button v-if="row.status === 'shipped'" link type="primary" size="small" @click="openShipDialog(row)">
              发货
            </el-button>
            <el-button v-if="row.status === 'pending'" link type="danger" size="small" @click="cancelOrder(row)">
              取消
            </el-button>
            <el-button v-if="row.status === 'delivering'" link type="primary" size="small" @click="confirmReceipt(row)">
              确认收货
            </el-button>
            <el-button v-if="row.status === 'completed'" link type="warning" size="small" @click="applyRefund(row)">
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <span>已选择 {{ selectedRows.length }} 个订单</span>
        <el-button type="primary" size="small" @click="batchShip">批量发货</el-button>
        <el-button type="danger" size="small" @click="batchCancel">批量取消</el-button>
        <el-button type="warning" size="small" @click="batchExport">批量导出</el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 订单详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`订单详情 - ${currentOrder?.orderNo}`" size="60%">
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单状态 -->
        <el-steps :active="getStepActive(currentOrder.status)" finish-status="success" align-center>
          <el-step title="提交订单" />
          <el-step title="支付成功" />
          <el-step title="商家发货" />
          <el-step title="确认收货" />
          <el-step title="订单完成" />
        </el-steps>

        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">
              {{ currentOrder.orderNo }}
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              {{ currentOrder.createTime }}
            </el-descriptions-item>
            <el-descriptions-item label="买家昵称">
              {{ currentOrder.buyerName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentOrder.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">
              {{ currentOrder.address }}
            </el-descriptions-item>
            <el-descriptions-item label="订单备注">
              {{ currentOrder.remark || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">商品信息</span>
          </template>
          <el-table :data="currentOrder.products" border>
            <el-table-column prop="productName" label="商品名称" min-width="200" />
            <el-table-column prop="skuCode" label="SKU编码" width="140" />
            <el-table-column prop="price" label="单价" width="120" align="right">
              <template #default="{ row }">
                ¥{{ formatNumber(row.price) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" align="center" />
            <el-table-column prop="total" label="小计" width="120" align="right">
              <template #default="{ row }">
                ¥{{ formatNumber(row.total) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="amount-summary">
            <div>商品总额：¥{{ formatNumber(currentOrder.productAmount) }}</div>
            <div>运费：¥{{ formatNumber(currentOrder.shippingFee) }}</div>
            <div>优惠：-¥{{ formatNumber(currentOrder.discount) }}</div>
            <div class="total">实付：¥{{ formatNumber(currentOrder.totalAmount) }}</div>
          </div>
        </el-card>

        <!-- 物流信息 -->
        <el-card v-if="currentOrder.status !== 'pending'" class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">物流信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流公司">
              {{ currentOrder.logisticsCompany || '待发货' }}
            </el-descriptions-item>
            <el-descriptions-item label="物流单号">
              {{ currentOrder.trackingNo || '待发货' }}
            </el-descriptions-item>
          </el-descriptions>
          <div class="tracking-info">
            <el-timeline>
              <el-timeline-item v-for="(track, index) in currentOrder.trackingInfo" :key="index" :timestamp="track.time"
                placement="top">
                {{ track.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>

        <!-- 支付信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span class="card-title">支付信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="支付方式">
              {{ getPayMethodText(currentOrder.payMethod) }}
            </el-descriptions-item>
            <el-descriptions-item label="支付时间">
              {{ currentOrder.payTime || '未支付' }}
            </el-descriptions-item>
            <el-descriptions-item label="支付单号">
              {{ currentOrder.payNo || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
          <el-button v-if="currentOrder.status === 'shipped'" type="primary" @click="openShipDialog(currentOrder)">
            发货
          </el-button>
          <el-button v-if="currentOrder.status === 'pending'" type="success" @click="handlePayment(currentOrder)">
            去支付
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="100px">
        <el-form-item label="物流公司" prop="logisticsCompany">
          <el-select v-model="shipForm.logisticsCompany" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="邮政EMS" value="邮政EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNo">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item label="发货备注" prop="remark">
          <el-input v-model="shipForm.remark" type="textarea" :rows="3" placeholder="请输入发货备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确认发货</el-button>
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
  Document,
  Clock,
  Van,
  CircleCheck,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 12580,
  pending: 1250,
  shipped: 890,
  completed: 9850
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  productName: '',
  buyerName: '',
  status: '',
  payMethod: '',
  dateRange: null
})

// 订单列表数据
const orderList = ref([
  {
    id: 1,
    orderNo: 'ORD202406130001',
    createTime: '2024-06-13 10:30:00',
    buyerName: '张三',
    phone: '138****1234',
    address: '北京市朝阳区xxx街道xxx号',
    productName: 'iPhone 15 Pro Max 256GB',
    quantity: 1,
    totalAmount: 9999,
    productAmount: 9999,
    shippingFee: 0,
    discount: 0,
    payMethod: 'wechat',
    status: 'pending',
    remark: '请尽快发货',
    products: [
      {
        productName: 'iPhone 15 Pro Max 256GB',
        skuCode: 'SKU001',
        price: 9999,
        quantity: 1,
        total: 9999
      }
    ],
    payTime: null,
    payNo: null,
    logisticsCompany: null,
    trackingNo: null,
    trackingInfo: []
  },
  {
    id: 2,
    orderNo: 'ORD202406130002',
    createTime: '2024-06-13 09:15:00',
    buyerName: '李四',
    phone: '139****5678',
    address: '上海市浦东新区xxx路xxx号',
    productName: '华为 Mate 60 Pro',
    quantity: 2,
    totalAmount: 13998,
    productAmount: 13998,
    shippingFee: 0,
    discount: 0,
    payMethod: 'alipay',
    status: 'shipped',
    remark: '',
    products: [
      {
        productName: '华为 Mate 60 Pro',
        skuCode: 'SKU002',
        price: 6999,
        quantity: 2,
        total: 13998
      }
    ],
    payTime: '2024-06-13 09:20:00',
    payNo: 'PAY202406130001',
    logisticsCompany: '顺丰速运',
    trackingNo: 'SF1234567890',
    trackingInfo: [
      { time: '2024-06-13 14:00:00', content: '您的订单已发货' },
      { time: '2024-06-13 10:00:00', content: '商家正在处理订单' }
    ]
  },
  {
    id: 3,
    orderNo: 'ORD202406130003',
    createTime: '2024-06-13 08:00:00',
    buyerName: '王五',
    phone: '152****9012',
    address: '广州市天河区xxx大道xxx号',
    productName: '小米 14 Ultra',
    quantity: 1,
    totalAmount: 6499,
    productAmount: 6499,
    shippingFee: 0,
    discount: 0,
    payMethod: 'wechat',
    status: 'completed',
    remark: '',
    products: [
      {
        productName: '小米 14 Ultra',
        skuCode: 'SKU003',
        price: 6499,
        quantity: 1,
        total: 6499
      }
    ],
    payTime: '2024-06-13 08:05:00',
    payNo: 'PAY202406130002',
    logisticsCompany: '中通快递',
    trackingNo: 'ZT1234567890',
    trackingInfo: [
      { time: '2024-06-13 16:00:00', content: '已签收' },
      { time: '2024-06-13 14:00:00', content: '派送中' },
      { time: '2024-06-13 10:00:00', content: '已发货' }
    ]
  }
])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref<any[]>([])

// 订单详情抽屉
const detailDrawerVisible = ref(false)
const currentOrder = ref<any>(null)

// 发货对话框
const shipDialogVisible = ref(false)
const shipFormRef = ref()
const shipForm = reactive({
  logisticsCompany: '',
  trackingNo: '',
  remark: ''
})

const shipRules = {
  logisticsCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  trackingNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 获取支付方式文本
const getPayMethodText = (method: string) => {
  const methods: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    card: '银行卡'
  }
  return methods[method] || method
}

// 获取订单状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    shipped: 'primary',
    delivering: 'info',
    completed: 'success',
    cancelled: 'danger',
    refunding: 'danger'
  }
  return types[status] || 'info'
}

// 获取订单状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待支付',
    shipped: '待发货',
    delivering: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中'
  }
  return texts[status] || status
}

// 获取步骤激活状态
const getStepActive = (status: string) => {
  const steps: Record<string, number> = {
    pending: 0,
    shipped: 1,
    delivering: 2,
    completed: 3
  }
  return steps[status] || 0
}

// 按状态筛选
const filterByStatus = (status: string) => {
  if (status === 'all') {
    searchForm.status = ''
  } else {
    searchForm.status = status
  }
  handleSearch()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadOrderList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.productName = ''
  searchForm.buyerName = ''
  searchForm.status = ''
  searchForm.payMethod = ''
  searchForm.dateRange = null
  handleSearch()
}

// 刷新列表
const refreshList = () => {
  loadOrderList()
}

// 加载订单列表
const loadOrderList = () => {
  tableLoading.value = true
  // 模拟API请求
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
  loadOrderList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadOrderList()
}

// 查看订单详情
const viewDetail = (row: any) => {
  currentOrder.value = row
  detailDrawerVisible.value = true
}

// 去支付
const handlePayment = (row: any) => {
  ElMessageBox.confirm(`确认支付订单 ${row.orderNo} 吗？`, '提示', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('支付成功')
    row.status = 'shipped'
    loadOrderList()
  }).catch(() => { })
}

// 打开发货对话框
const openShipDialog = (row: any) => {
  currentOrder.value = row
  shipForm.logisticsCompany = ''
  shipForm.trackingNo = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

// 提交发货
const submitShip = async () => {
  await shipFormRef.value?.validate()

  ElMessageBox.confirm('确认发货吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    if (currentOrder.value) {
      currentOrder.value.status = 'delivering'
      currentOrder.value.logisticsCompany = shipForm.logisticsCompany
      currentOrder.value.trackingNo = shipForm.trackingNo
    }
    loadOrderList()
  }).catch(() => { })
}

// 确认收货
const confirmReceipt = (row: any) => {
  ElMessageBox.confirm(`确认收货订单 ${row.orderNo} 吗？`, '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('收货成功')
    row.status = 'completed'
    loadOrderList()
  }).catch(() => { })
}

// 取消订单
const cancelOrder = (row: any) => {
  ElMessageBox.confirm(`确认取消订单 ${row.orderNo} 吗？`, '提示', {
    confirmButtonText: '确认取消',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('订单已取消')
    row.status = 'cancelled'
    loadOrderList()
  }).catch(() => { })
}

// 申请退款
const applyRefund = (row: any) => {
  ElMessageBox.confirm(`确认申请退款订单 ${row.orderNo} 吗？`, '提示', {
    confirmButtonText: '确认申请',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('退款申请已提交')
    row.status = 'refunding'
    loadOrderList()
  }).catch(() => { })
}

// 批量发货
const batchShip = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择订单')
    return
  }
  ElMessage.info(`批量发货 ${selectedRows.value.length} 个订单`)
}

// 批量取消
const batchCancel = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择订单')
    return
  }
  ElMessageBox.confirm(`确认取消 ${selectedRows.value.length} 个订单吗？`, '提示', {
    confirmButtonText: '确认取消',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量取消成功')
    loadOrderList()
  }).catch(() => { })
}

// 批量导出
const batchExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择订单')
    return
  }
  ElMessage.success(`导出 ${selectedRows.value.length} 个订单成功`)
}

// 导出订单
const exportOrders = () => {
  ElMessage.success('订单导出成功')
}

// 初始化
onMounted(() => {
  loadOrderList()
})
</script>

<style scoped lang="scss">
.order-list {
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

  // 订单详情样式
  .order-detail {
    padding: 20px;

    .detail-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-title {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .amount-summary {
      margin-top: 16px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      text-align: right;

      div {
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;
      }

      .total {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }
    }

    .tracking-info {
      margin-top: 16px;
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
