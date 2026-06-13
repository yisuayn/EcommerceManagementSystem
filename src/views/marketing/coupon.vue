<!-- CouponManagement.vue -->
<template>
  <div class="coupon-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>优惠券管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新建优惠券
        </el-button>
        <el-button @click="exportCoupons">
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
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">优惠券总数</div>
              <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Ticket />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">进行中</div>
              <div class="stat-value">{{ statistics.active }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Promotion />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card warning" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日发放</div>
              <div class="stat-value">{{ statistics.todaySend }}</div>
            </div>
            <div class="stat-icon">
              <el-icon :size="32">
                <Present />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日使用</div>
              <div class="stat-value">{{ statistics.todayUsed }}</div>
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
        <el-form-item label="优惠券名称">
          <el-input v-model="searchForm.name" placeholder="请输入优惠券名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="优惠券类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 120px">
            <el-option label="满减券" value="full_reduction" />
            <el-option label="折扣券" value="discount" />
            <el-option label="现金券" value="cash" />
            <el-option label="运费券" value="shipping" />
          </el-select>
        </el-form-item>
        <el-form-item label="发放方式">
          <el-select v-model="searchForm.sendType" placeholder="请选择方式" clearable style="width: 120px">
            <el-option label="手动领取" value="manual" />
            <el-option label="系统发放" value="auto" />
            <el-option label="活动赠送" value="activity" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
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

    <!-- 优惠券列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="couponList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="优惠券名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="优惠内容" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.type === 'discount'">{{ row.value }}折</span>
            <span v-else-if="row.type === 'cash'">¥{{ row.value }}</span>
            <span v-else-if="row.type === 'full_reduction'">满{{ row.condition }}减{{ row.value }}</span>
            <span v-else>¥{{ row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalQuantity" label="发放总量" width="100" align="center" />
        <el-table-column prop="receivedCount" label="已领取" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-warning': row.receivedCount / row.totalQuantity > 0.8 }">
              {{ row.receivedCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="usedCount" label="已使用" width="100" align="center" />
        <el-table-column prop="userLimit" label="限领数量" width="100" align="center" />
        <el-table-column prop="validDays" label="有效期" width="120" align="center">
          <template #default="{ row }">
            {{ row.validDays }}天
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" size="small" @click="sendCoupon(row)">
              发放
            </el-button>
            <el-button v-if="row.status === 'active'" link type="warning" size="small" @click="toggleStatus(row)">
              禁用
            </el-button>
            <el-button v-if="row.status === 'disabled'" link type="success" size="small" @click="toggleStatus(row)">
              启用
            </el-button>
            <el-button link type="danger" size="small" @click="deleteCoupon(row)">
              删除
            </el-button>
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

    <!-- 新建/编辑优惠券对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? '新建优惠券' : '编辑优惠券'" width="600px"
      @close="closeDialog">
      <el-form :model="couponForm" :rules="couponRules" ref="formRef" label-width="120px">
        <el-form-item label="优惠券名称" prop="name" required>
          <el-input v-model="couponForm.name" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type" required>
          <el-radio-group v-model="couponForm.type" @change="onTypeChange">
            <el-radio label="full_reduction">满减券</el-radio>
            <el-radio label="discount">折扣券</el-radio>
            <el-radio label="cash">现金券</el-radio>
            <el-radio label="shipping">运费券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="couponForm.type === 'full_reduction'" label="满减条件" prop="condition" required>
          <el-input-number v-model="couponForm.condition" :min="0" :precision="0" style="width: 100%">
            <template #append>元</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="优惠金额/折扣" prop="value" required>
          <el-input-number v-model="couponForm.value" :min="couponForm.type === 'discount' ? 1 : 0"
            :max="couponForm.type === 'discount' ? 10 : 999999" :precision="couponForm.type === 'discount' ? 1 : 2"
            style="width: 100%">
            <template #append>
              <span v-if="couponForm.type === 'discount'">折</span>
              <span v-else>元</span>
            </template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="发放总量" prop="totalQuantity" required>
          <el-input-number v-model="couponForm.totalQuantity" :min="1" :max="999999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="每人限领" prop="userLimit">
          <el-input-number v-model="couponForm.userLimit" :min="1" :max="99" style="width: 100%" />
        </el-form-item>

        <el-form-item label="有效期类型" prop="validType" required>
          <el-radio-group v-model="couponForm.validType">
            <el-radio label="days">领取后N天有效</el-radio>
            <el-radio label="range">固定时间段有效</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="couponForm.validType === 'days'" label="有效天数" prop="validDays" required>
          <el-input-number v-model="couponForm.validDays" :min="1" :max="365" style="width: 100%">
            <template #append>天</template>
          </el-input-number>
        </el-form-item>

        <el-form-item v-if="couponForm.validType === 'range'" label="有效期范围" prop="validRange" required>
          <el-date-picker v-model="couponForm.validRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" style="width: 100%" />
        </el-form-item>

        <el-form-item label="适用商品" prop="applyType">
          <el-radio-group v-model="couponForm.applyType">
            <el-radio label="all">全部商品</el-radio>
            <el-radio label="category">指定分类</el-radio>
            <el-radio label="product">指定商品</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="couponForm.applyType === 'category'" label="适用分类" prop="categories">
          <el-cascader v-model="couponForm.categories" :options="categoryOptions"
            :props="{ multiple: true, expandTrigger: 'hover' }" placeholder="请选择适用分类" style="width: 100%" />
        </el-form-item>

        <el-form-item v-if="couponForm.applyType === 'product'" label="适用商品" prop="products">
          <el-select v-model="couponForm.products" multiple filterable placeholder="请选择适用商品" style="width: 100%">
            <el-option v-for="product in productList" :key="product.id" :label="product.name" :value="product.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="使用说明" prop="description">
          <el-input v-model="couponForm.description" type="textarea" :rows="3" placeholder="请输入使用说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 发放优惠券对话框 -->
    <el-dialog v-model="sendDialogVisible" title="发放优惠券" width="500px">
      <el-form :model="sendForm" :rules="sendRules" ref="sendFormRef" label-width="100px">
        <el-form-item label="发放方式" prop="sendType">
          <el-radio-group v-model="sendForm.sendType">
            <el-radio label="manual">手动发放</el-radio>
            <el-radio label="batch">批量发放</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="sendForm.sendType === 'manual'" label="用户" prop="userId" required>
          <el-select v-model="sendForm.userId" filterable remote placeholder="请输入用户昵称或ID" style="width: 100%">
            <el-option v-for="user in userList" :key="user.id" :label="`${user.nickname} (${user.id})`"
              :value="user.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="sendForm.sendType === 'batch'" label="发放数量" prop="quantity" required>
          <el-input-number v-model="sendForm.quantity" :min="1" :max="10000" style="width: 100%" />
        </el-form-item>

        <el-form-item label="发放说明" prop="remark">
          <el-input v-model="sendForm.remark" type="textarea" :rows="3" placeholder="请输入发放说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSend">确认发放</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Refresh,
  Ticket,
  Promotion,
  Present,
  CircleCheck,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 28,
  active: 12,
  todaySend: 156,
  todayUsed: 89
})

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  sendType: '',
  status: ''
})

// 优惠券列表
const couponList = ref([
  {
    id: 1,
    name: '新人专享券',
    type: 'cash',
    value: 10,
    condition: 0,
    totalQuantity: 10000,
    receivedCount: 8520,
    usedCount: 6321,
    userLimit: 1,
    validDays: 30,
    validType: 'days',
    status: 'active',
    applyType: 'all',
    description: '新用户专享优惠券'
  },
  {
    id: 2,
    name: '满100减20',
    type: 'full_reduction',
    value: 20,
    condition: 100,
    totalQuantity: 5000,
    receivedCount: 3250,
    usedCount: 2150,
    userLimit: 2,
    validDays: 15,
    validType: 'days',
    status: 'active',
    applyType: 'all',
    description: '全场通用，满100元减20元'
  },
  {
    id: 3,
    name: '8折优惠券',
    type: 'discount',
    value: 8,
    condition: 0,
    totalQuantity: 3000,
    receivedCount: 2150,
    usedCount: 1450,
    userLimit: 1,
    validDays: 7,
    validType: 'days',
    status: 'pending',
    applyType: 'category',
    description: '指定分类商品8折'
  }
])

// 分类选项
const categoryOptions = ref([
  {
    value: '1', label: '手机数码', children: [
      { value: '11', label: '手机' },
      { value: '12', label: '电脑' }
    ]
  },
  { value: '2', label: '服装鞋帽' }
])

// 商品列表
const productList = ref([
  { id: 1, name: 'iPhone 15 Pro Max' },
  { id: 2, name: '华为 Mate 60 Pro' },
  { id: 3, name: '小米 14 Ultra' }
])

// 用户列表
const userList = ref([
  { id: 1001, nickname: '张三' },
  { id: 1002, nickname: '李四' },
  { id: 1003, nickname: '王五' }
])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref<any[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref()
const couponForm = reactive({
  name: '',
  type: 'full_reduction',
  condition: 0,
  value: 0,
  totalQuantity: 100,
  userLimit: 1,
  validType: 'days',
  validDays: 30,
  validRange: null,
  applyType: 'all',
  categories: [],
  products: [],
  description: ''
})

// 表单验证规则
const couponRules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入优惠金额', trigger: 'blur' }],
  totalQuantity: [{ required: true, message: '请输入发放总量', trigger: 'blur' }]
}

// 发放相关
const sendDialogVisible = ref(false)
const sendFormRef = ref()
const sendForm = reactive({
  sendType: 'manual',
  userId: null,
  quantity: 1,
  remark: ''
})

const sendRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入发放数量', trigger: 'blur' }]
}

// 获取类型文本
const getTypeText = (type: string) => {
  const types: Record<string, string> = {
    full_reduction: '满减券',
    discount: '折扣券',
    cash: '现金券',
    shipping: '运费券'
  }
  return types[type] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    full_reduction: 'primary',
    discount: 'success',
    cash: 'warning',
    shipping: 'info'
  }
  return types[type] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '未开始',
    active: '进行中',
    ended: '已结束',
    disabled: '已禁用'
  }
  return texts[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    active: 'success',
    ended: 'warning',
    disabled: 'danger'
  }
  return types[status] || 'info'
}

// 类型变化
const onTypeChange = () => {
  couponForm.condition = 0
  couponForm.value = 0
}

// 打开新建对话框
const openCreateDialog = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessage.info(`查看优惠券 ${row.name} 详情`)
}

// 发放优惠券
const sendCoupon = (row: any) => {
  sendDialogVisible.value = true
}

// 提交发放
const submitSend = async () => {
  await sendFormRef.value?.validate()
  ElMessage.success('发放成功')
  sendDialogVisible.value = false
  loadCouponList()
}

// 切换状态
const toggleStatus = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${action}优惠券 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`${action}成功`)
    loadCouponList()
  }).catch(() => { })
}

// 删除优惠券
const deleteCoupon = (row: any) => {
  ElMessageBox.confirm(`确认删除优惠券 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadCouponList()
  }).catch(() => { })
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
  dialogVisible.value = false
  loadCouponList()
}

// 关闭对话框
const closeDialog = () => {
  formRef.value?.resetFields()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadCouponList()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.sendType = ''
  searchForm.status = ''
  handleSearch()
}

const refreshList = () => {
  loadCouponList()
}

const loadCouponList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
  }, 500)
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadCouponList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadCouponList()
}

const exportCoupons = () => {
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadCouponList()
})
</script>

<style scoped lang="scss">
.coupon-management {
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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .text-warning {
    color: #e6a23c;
    font-weight: bold;
  }
}
</style>
