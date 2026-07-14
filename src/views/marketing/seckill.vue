<!-- SeckillActivity.vue -->
<template>
  <div class="seckill-activity">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>秒杀活动</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新建活动
        </el-button>
        <el-button @click="refreshList">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 时间轴导航 -->
    <el-card class="time-nav-card" shadow="never">
      <div class="time-nav">
        <div v-for="time in timeSlots" :key="time.value" class="time-slot"
          :class="{ active: currentTimeSlot === time.value }" @click="switchTimeSlot(time.value)">
          <div class="time">{{ time.label }}</div>
          <div class="status" :class="getTimeSlotStatus(time.value)">
            {{ getTimeSlotStatusText(time.value) }}
          </div>
        </div>
      </div>
    </el-card>

    <!-- 秒杀商品展示 -->
    <el-row :gutter="20" class="product-row">
      <el-col v-for="product in seckillProducts" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="product-card" shadow="hover">
          <div class="product-image">
            <el-image :src="product.image" fit="cover" />
            <div v-if="product.status === 'pending'" class="countdown">
              <el-countdown :time="product.startTime" format="HH:mm:ss" @finish="refreshList" />
            </div>
            <div v-if="product.status === 'active'" class="countdown active">
              <el-countdown :time="product.endTime" format="HH:mm:ss" @finish="refreshList" />
            </div>
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="price-info">
              <span class="seckill-price">¥{{ product.seckillPrice }}</span>
              <span class="original-price">¥{{ product.originalPrice }}</span>
            </div>
            <div class="stock-info">
              <span>已售 {{ product.soldCount }}</span>
              <span>剩余 {{ product.stock }}</span>
            </div>
            <div class="progress-bar">
              <el-progress :percentage="product.soldPercent" :stroke-width="8" />
            </div>
            <el-button type="danger" :disabled="product.status !== 'active' || product.stock === 0"
              @click="buyNow(product)">
              {{ getButtonText(product) }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 活动列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>秒杀活动列表</span>
        </div>
      </template>

      <el-table :data="activityList" border stripe v-loading="tableLoading">
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column prop="timeSlot" label="活动场次" width="100" align="center">
          <template #default="{ row }">
            {{ getTimeSlotLabel(row.timeSlot) }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
        <el-table-column prop="totalSales" label="总销量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActivityStatusType(row.status)">
              {{ getActivityStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewActivityDetail(row)">
              详情
            </el-button>
            <el-button v-if="row.status === 'pending'" link type="success" size="small" @click="startActivity(row)">
              开始
            </el-button>
            <el-button v-if="row.status === 'active'" link type="warning" size="small" @click="endActivity(row)">
              结束
            </el-button>
            <el-button link type="danger" size="small" @click="deleteActivity(row)">
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

    <!-- 新建/编辑活动对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? '新建秒杀活动' : '编辑秒杀活动'" width="700px"
      @close="closeDialog">
      <el-form :model="activityForm" :rules="activityRules" ref="formRef" label-width="120px">
        <el-form-item label="活动名称" prop="name" required>
          <el-input v-model="activityForm.name" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动场次" prop="timeSlot" required>
          <el-select v-model="activityForm.timeSlot" style="width: 100%">
            <el-option label="00:00 - 08:00" value="morning" />
            <el-option label="08:00 - 12:00" value="morning2" />
            <el-option label="12:00 - 14:00" value="noon" />
            <el-option label="14:00 - 18:00" value="afternoon" />
            <el-option label="18:00 - 20:00" value="evening" />
            <el-option label="20:00 - 24:00" value="night" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" prop="dateRange" required>
          <el-date-picker v-model="activityForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" style="width: 100%" />
        </el-form-item>

        <el-form-item label="秒杀商品" prop="products" required>
          <div class="product-selector">
            <div v-for="(item, index) in activityForm.products" :key="index" class="product-item">
              <el-select v-model="item.productId" placeholder="选择商品" filterable style="width: 40%">
                <el-option v-for="product in allProducts" :key="product.id" :label="product.name" :value="product.id" />
              </el-select>
              <el-input-number v-model="item.seckillPrice" :min="0" :precision="2" placeholder="秒杀价"
                style="width: 25%" />
              <el-input-number v-model="item.stock" :min="1" :max="9999" placeholder="库存" style="width: 20%" />
              <el-button type="danger" link @click="removeProduct(index)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addProduct">
              <el-icon>
                <Plus />
              </el-icon>
              添加商品
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="每人限购" prop="userLimit">
          <el-input-number v-model="activityForm.userLimit" :min="1" :max="99" style="width: 100%" />
        </el-form-item>

        <el-form-item label="活动说明" prop="description">
          <el-input v-model="activityForm.description" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 活动详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`活动详情 - ${currentActivity?.name}`" size="60%">
      <div v-if="currentActivity" class="activity-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动名称">
            {{ currentActivity.name }}
          </el-descriptions-item>
          <el-descriptions-item label="活动场次">
            {{ getTimeSlotLabel(currentActivity.timeSlot) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动时间">
            {{ currentActivity.startTime }} 至 {{ currentActivity.endTime }}
          </el-descriptions-item>
          <el-descriptions-item label="活动状态">
            <el-tag :type="getActivityStatusType(currentActivity.status)">
              {{ getActivityStatusText(currentActivity.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="每人限购">
            {{ currentActivity.userLimit }}件
          </el-descriptions-item>
          <el-descriptions-item label="总销量">
            {{ currentActivity.totalSales }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table :data="currentActivity.products" border style="margin-top: 20px">
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="seckillPrice" label="秒杀价" width="120" align="right" />
          <el-table-column prop="originalPrice" label="原价" width="120" align="right" />
          <el-table-column prop="stock" label="库存" width="100" align="center" />
          <el-table-column prop="soldCount" label="已售" width="100" align="center" />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Refresh } from '@element-plus/icons-vue'
import { getSeckillList, saveSeckill } from '@/api/marketing'

// 时间场次
const timeSlots = [
  { label: '00:00-08:00', value: 'morning', status: 'ended' },
  { label: '08:00-12:00', value: 'morning2', status: 'active' },
  { label: '12:00-14:00', value: 'noon', status: 'pending' },
  { label: '14:00-18:00', value: 'afternoon', status: 'pending' },
  { label: '18:00-20:00', value: 'evening', status: 'pending' },
  { label: '20:00-24:00', value: 'night', status: 'pending' }
]

const currentTimeSlot = ref('morning2')

// 秒杀商品列表
const seckillProducts = ref<any[]>([])

// 活动列表
const activityList = ref<any[]>([])

// 所有商品
const allProducts = ref<any[]>([])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref()
const activityForm = reactive({
  name: '',
  timeSlot: '',
  dateRange: null,
  products: [] as any[],
  userLimit: 1,
  description: ''
})

const activityRules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  timeSlot: [{ required: true, message: '请选择活动场次', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择活动日期', trigger: 'change' }],
  products: [{ required: true, message: '请添加秒杀商品', trigger: 'change' }]
}

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentActivity = ref<any>(null)

// 获取场次标签
const getTimeSlotLabel = (value: string) => {
  const slot = timeSlots.find(s => s.value === value)
  return slot?.label || value
}

// 获取场次状态
const getTimeSlotStatus = (value: string) => {
  const slot = timeSlots.find(s => s.value === value)
  return slot?.status || 'pending'
}

const getTimeSlotStatusText = (value: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    pending: '预告',
    ended: '已结束'
  }
  return statusMap[getTimeSlotStatus(value)] || ''
}

// 切换场次
const switchTimeSlot = (value: string) => {
  currentTimeSlot.value = value
  loadSeckillProducts()
}

// 获取按钮文本
const getButtonText = (product: any) => {
  if (product.stock === 0) return '已抢光'
  if (product.status === 'pending') return '即将开始'
  if (product.status === 'active') return '立即抢购'
  return '已结束'
}

// 立即购买
const buyNow = (product: any) => {
  ElMessage.success(`抢购 ${product.name} 成功！`)
}

// 加载秒杀商品
const loadSeckillProducts = async () => {
  try {
    const res = await getSeckillList({ timeSlot: currentTimeSlot.value })
    seckillProducts.value = res.data.list || []
  } catch {
    // 静默处理
  }
}

// 打开新建对话框
const openCreateDialog = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
}

// 添加商品
const addProduct = () => {
  activityForm.products.push({
    productId: null,
    seckillPrice: 0,
    stock: 1
  })
}

// 移除商品
const removeProduct = (index: number) => {
  activityForm.products.splice(index, 1)
}

// 查看活动详情
const viewActivityDetail = (row: any) => {
  currentActivity.value = row
  detailDrawerVisible.value = true
}

// 开始活动
const startActivity = (row: any) => {
  ElMessageBox.confirm(`确认开始活动 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 'active'
    ElMessage.success('活动已开始')
  }).catch(() => { })
}

// 结束活动
const endActivity = (row: any) => {
  ElMessageBox.confirm(`确认结束活动 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'ended'
    ElMessage.success('活动已结束')
  }).catch(() => { })
}

// 删除活动
const deleteActivity = (row: any) => {
  ElMessageBox.confirm(`确认删除活动 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadActivityList()
  }).catch(() => { })
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  try {
    await saveSeckill({
      name: activityForm.name,
      timeSlot: activityForm.timeSlot,
      dateRange: activityForm.dateRange,
      products: activityForm.products,
      userLimit: activityForm.userLimit,
      description: activityForm.description
    })
    ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
    dialogVisible.value = false
    loadActivityList()
  } catch {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
  }
}

// 关闭对话框
const closeDialog = () => {
  formRef.value?.resetFields()
  activityForm.products = []
}

// 刷新列表
const refreshList = () => {
  loadSeckillProducts()
  loadActivityList()
}

// 加载活动列表
const loadActivityList = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getSeckillList(params)
    activityList.value = res.data.list || []
    total.value = res.data.total || 0
    // 从活动列表中提取商品数据用于商品卡片展示（取当前场次的商品）
    const currentActivity = activityList.value.find((a: any) => a.timeSlot === currentTimeSlot.value)
    if (currentActivity && currentActivity.products) {
      seckillProducts.value = currentActivity.products
    }
  } catch {
    ElMessage.error('获取活动列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadActivityList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadActivityList()
}

// 获取活动状态
const getActivityStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '未开始',
    active: '进行中',
    ended: '已结束'
  }
  return texts[status] || status
}

const getActivityStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    active: 'success',
    ended: 'warning'
  }
  return types[status] || 'info'
}

onMounted(() => {
  loadSeckillProducts()
  loadActivityList()
})
</script>

<style scoped lang="scss">
.seckill-activity {
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

  .time-nav-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .time-nav {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 12px;

      .time-slot {
        flex: 1;
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: #f5f7fa;

        &:hover {
          background: #e6f2ff;
        }

        &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;

          .status {
            color: rgba(255, 255, 255, 0.8);
          }
        }

        .time {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .status {
          font-size: 12px;
          color: #909399;

          &.active {
            color: #67c23a;
          }

          &.pending {
            color: #e6a23c;
          }

          &.ended {
            color: #909399;
          }
        }
      }
    }
  }

  .product-row {
    margin-bottom: 20px;
  }

  .product-card {
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .product-image {
      position: relative;
      height: 200px;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .countdown {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;

        &.active {
          background: #f56c6c;
        }
      }
    }

    .product-info {
      padding: 16px;

      .product-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .price-info {
        margin-bottom: 12px;

        .seckill-price {
          font-size: 24px;
          font-weight: bold;
          color: #f56c6c;
          margin-right: 8px;
        }

        .original-price {
          font-size: 14px;
          color: #909399;
          text-decoration: line-through;
        }
      }

      .stock-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .progress-bar {
        margin-bottom: 16px;
      }

      .el-button {
        width: 100%;
      }
    }
  }

  .table-card {
    border-radius: 8px;

    .card-header {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .product-selector {
    .product-item {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
  }

  .activity-detail {
    padding: 20px;
  }
}
</style>
