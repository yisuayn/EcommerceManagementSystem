<template>
  <div class="inventory-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>库存管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openInboundDialog">
          <el-icon>
            <Plus />
          </el-icon>
          入库
        </el-button>
        <el-button type="warning" @click="openOutboundDialog">
          <el-icon>
            <Remove />
          </el-icon>
          出库
        </el-button>
        <el-button @click="openInventoryDialog">
          <el-icon>
            <Edit />
          </el-icon>
          盘点
        </el-button>
        <el-button @click="exportInventory">
          <el-icon>
            <Download />
          </el-icon>
          导出库存
        </el-button>
      </div>
    </div>

    <!-- 库存概览卡片 -->
    <el-row :gutter="20" class="overview-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="overview-content">
            <div class="overview-icon">
              <el-icon :size="32">
                <Box />
              </el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">总库存量</div>
              <div class="overview-value">{{ overview.totalStock }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="overview-content">
            <div class="overview-icon warning">
              <el-icon :size="32">
                <Warning />
              </el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">低于安全库存</div>
              <div class="overview-value">{{ overview.lowStockCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="overview-content">
            <div class="overview-icon success">
              <el-icon :size="32">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">今日入库</div>
              <div class="overview-value">{{ overview.todayInbound }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="overview-content">
            <div class="overview-icon danger">
              <el-icon :size="32">
                <Top />
              </el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">今日出库</div>
              <div class="overview-value">{{ overview.todayOutbound }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="SKU编码">
          <el-input v-model="searchForm.skuCode" placeholder="请输入SKU编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable style="width: 150px">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="searchForm.stockStatus" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="正常" value="normal" />
            <el-option label="低于安全库存" value="low" />
            <el-option label="缺货" value="out" />
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

    <!-- 库存列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>库存列表</span>
          <el-button type="primary" link @click="refreshList">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="inventoryList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="skuCode" label="SKU编码" width="140" />
        <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="stock" label="库存数量" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.stock <= row.minStock, 'out-stock': row.stock === 0 }">
              {{ row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="安全库存" width="100" align="center" />
        <el-table-column prop="maxStock" label="最大库存" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="costPrice" label="成本价" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatNumber(row.costPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdateTime" label="最后更新" width="180" />
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" size="small" @click="openInboundDialog(row)">
              入库
            </el-button>
            <el-button link type="warning" size="small" @click="openOutboundDialog(row)">
              出库
            </el-button>
            <el-button link type="danger" size="small" @click="showStockLog(row)">
              记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <span>已选择 {{ selectedRows.length }} 项</span>
        <el-button type="primary" size="small" @click="batchInbound">批量入库</el-button>
        <el-button type="warning" size="small" @click="batchOutbound">批量出库</el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 入库对话框 -->
    <el-dialog v-model="inboundDialogVisible" title="商品入库" width="500px" @close="closeInboundDialog">
      <el-form :model="inboundForm" :rules="inboundRules" ref="inboundFormRef" label-width="100px">
        <el-form-item label="商品" prop="productId">
          <el-select v-model="inboundForm.productId" placeholder="请选择商品" filterable style="width: 100%"
            :disabled="!!inboundForm.product">
            <el-option v-for="product in productList" :key="product.id" :label="product.productName"
              :value="product.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inboundForm.quantity" :min="1" :max="99999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库单价" prop="price">
          <el-input-number v-model="inboundForm.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="inboundForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="inboundForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInbound">确认入库</el-button>
      </template>
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog v-model="outboundDialogVisible" title="商品出库" width="500px" @close="closeOutboundDialog">
      <el-form :model="outboundForm" :rules="outboundRules" ref="outboundFormRef" label-width="100px">
        <el-form-item label="商品" prop="productId">
          <el-select v-model="outboundForm.productId" placeholder="请选择商品" filterable style="width: 100%"
            :disabled="!!outboundForm.product">
            <el-option v-for="product in productList" :key="product.id" :label="product.productName"
              :value="product.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="outboundForm.quantity" :min="1" :max="maxOutboundQuantity" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出库类型" prop="type">
          <el-select v-model="outboundForm.type" style="width: 100%">
            <el-option label="销售出库" value="sale" />
            <el-option label="退货出库" value="return" />
            <el-option label="调拨出库" value="transfer" />
            <el-option label="报损出库" value="damage" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="outboundForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="outboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOutbound">确认出库</el-button>
      </template>
    </el-dialog>

    <!-- 库存记录对话框 -->
    <el-dialog v-model="stockLogDialogVisible" title="库存变动记录" width="800px">
      <el-table :data="stockLogList" border stripe>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'inbound' ? 'success' : 'warning'">
              {{ row.type === 'inbound' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" align="center" />
        <el-table-column prop="beforeStock" label="变动前" width="100" align="center" />
        <el-table-column prop="afterStock" label="变动后" width="100" align="center" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>
      <div class="pagination-container">
        <el-pagination v-model:current-page="logCurrentPage" v-model:page-size="logPageSize" :total="logTotal"
          layout="total, prev, pager, next" @current-change="loadStockLog" />
      </div>
    </el-dialog>

    <!-- 盘点对话框 -->
    <el-dialog v-model="inventoryDialogVisible" title="库存盘点" width="600px">
      <el-table :data="inventoryList" border stripe>
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="stock" label="系统库存" width="120" align="center" />
        <el-table-column label="实际库存" width="150" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.actualStock" :min="0" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="差异" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ diff: row.actualStock !== row.stock }">
              {{ row.actualStock - row.stock }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="inventoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInventory">确认盘点</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Remove,
  Edit,
  Download,
  Box,
  Warning,
  CircleCheck,
  Top,
  Search,
  RefreshLeft,
  Refresh
} from '@element-plus/icons-vue'
import { productApi } from '@/api/product'

// 库存概览数据
const overview = reactive({
  totalStock: 0,
  lowStockCount: 0,
  todayInbound: 0,
  todayOutbound: 0
})

// 搜索表单
const searchForm = reactive({
  productName: '',
  skuCode: '',
  categoryId: '',
  stockStatus: ''
})

// 分类列表
const categoryList = ref<any[]>([])

// 商品列表（用于入库出库选择）
const productList = ref<any[]>([])

// 库存列表数据
const inventoryList = ref<any[]>([])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref<any[]>([])

// 入库相关
const inboundDialogVisible = ref(false)
const inboundFormRef = ref()
const inboundForm = reactive({
  productId: null,
  product: null,
  quantity: 1,
  price: 0,
  supplier: '',
  remark: ''
})

const inboundRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入入库单价', trigger: 'blur' }]
}

// 出库相关
const outboundDialogVisible = ref(false)
const outboundFormRef = ref()
const outboundForm = reactive({
  productId: null,
  product: null,
  quantity: 1,
  type: 'sale',
  remark: ''
})

const maxOutboundQuantity = computed(() => {
  const product = productList.value.find(p => p.id === outboundForm.productId)
  return product?.stock || 0
})

const outboundRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'blur' },
    {
      validator: (_rule: any, value: number, callback: Function) => {
        if (value > maxOutboundQuantity.value) {
          callback(new Error(`出库数量不能超过库存 ${maxOutboundQuantity.value}`))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 库存记录相关
const stockLogDialogVisible = ref(false)
const stockLogList = ref([])
const logCurrentPage = ref(1)
const logPageSize = ref(10)
const logTotal = ref(0)

// 盘点相关
const inventoryDialogVisible = ref(false)

// 格式化数字
const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadInventoryList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.productName = ''
  searchForm.skuCode = ''
  searchForm.categoryId = ''
  searchForm.stockStatus = ''
  handleSearch()
}

// 刷新列表
const refreshList = () => {
  loadInventoryList()
}

// 加载库存列表
const loadInventoryList = async () => {
  tableLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.productName) params.productName = searchForm.productName
    if (searchForm.skuCode) params.skuCode = searchForm.skuCode
    if (searchForm.categoryId) params.categoryId = searchForm.categoryId
    if (searchForm.stockStatus) params.stockStatus = searchForm.stockStatus

    const res = await productApi(params)
    inventoryList.value = res.data.list || []
    total.value = res.data.total || 0
    // Also load product list for dropdowns
    productList.value = res.data.products || []
    categoryList.value = res.data.categories || []
    if (res.data.overview) {
      overview.totalStock = res.data.overview.totalStock || 0
      overview.lowStockCount = res.data.overview.lowStockCount || 0
      overview.todayInbound = res.data.overview.todayInbound || 0
      overview.todayOutbound = res.data.overview.todayOutbound || 0
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
  loadInventoryList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadInventoryList()
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessage.info(`查看商品 ${row.productName} 详情`)
}

// 打开入库对话框
const openInboundDialog = (row?: any) => {
  if (row) {
    inboundForm.productId = row.id
    inboundForm.product = row
  } else {
    inboundForm.productId = null
    inboundForm.product = null
  }
  inboundForm.quantity = 1
  inboundForm.price = 0
  inboundForm.supplier = ''
  inboundForm.remark = ''
  inboundDialogVisible.value = true
}

// 关闭入库对话框
const closeInboundDialog = () => {
  inboundFormRef.value?.resetFields()
}

// 提交入库
const submitInbound = async () => {
  await inboundFormRef.value?.validate()

  ElMessageBox.confirm('确认入库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await productApi({
        action: 'inbound',
        productId: inboundForm.productId,
        quantity: inboundForm.quantity,
        price: inboundForm.price,
        supplier: inboundForm.supplier,
        remark: inboundForm.remark
      })
      ElMessage.success('入库成功')
      inboundDialogVisible.value = false
      loadInventoryList()
    } catch (error) {
      console.log(error)
    }
  }).catch(() => { })
}

// 打开出库对话框
const openOutboundDialog = (row?: any) => {
  if (row) {
    outboundForm.productId = row.id
    outboundForm.product = row
  } else {
    outboundForm.productId = null
    outboundForm.product = null
  }
  outboundForm.quantity = 1
  outboundForm.type = 'sale'
  outboundForm.remark = ''
  outboundDialogVisible.value = true
}

// 关闭出库对话框
const closeOutboundDialog = () => {
  outboundFormRef.value?.resetFields()
}

// 提交出库
const submitOutbound = async () => {
  await outboundFormRef.value?.validate()

  ElMessageBox.confirm('确认出库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await productApi({
        action: 'outbound',
        productId: outboundForm.productId,
        quantity: outboundForm.quantity,
        type: outboundForm.type,
        remark: outboundForm.remark
      })
      ElMessage.success('出库成功')
      outboundDialogVisible.value = false
      loadInventoryList()
    } catch (error) {
      console.log(error)
    }
  }).catch(() => { })
}

// 批量入库
const batchInbound = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  ElMessage.info(`批量入库 ${selectedRows.value.length} 个商品`)
}

// 批量出库
const batchOutbound = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  ElMessage.info(`批量出库 ${selectedRows.value.length} 个商品`)
}

// 显示库存记录
const showStockLog = async (row: any) => {
  try {
    const res = await productApi({ action: 'stockLog', productId: row.id, page: logCurrentPage.value, pageSize: logPageSize.value })
    stockLogList.value = res.data.list || []
    logTotal.value = res.data.total || 0
    stockLogDialogVisible.value = true
  } catch (error) {
    console.log(error)
  }
}

// 加载库存记录
const loadStockLog = async () => {
  try {
    const res = await productApi({ action: 'stockLog', page: logCurrentPage.value, pageSize: logPageSize.value })
    stockLogList.value = res.data.list || []
    logTotal.value = res.data.total || 0
  } catch (error) {
    console.log(error)
  }
}

// 打开盘点对话框
const openInventoryDialog = () => {
  // 为每个商品添加 actualStock 字段
  inventoryList.value.forEach(item => {
    item.actualStock = item.stock
  })
  inventoryDialogVisible.value = true
}

// 提交盘点
const submitInventory = async () => {
  const diffItems = inventoryList.value.filter(item => item.actualStock !== item.stock)
  if (diffItems.length === 0) {
    ElMessage.info('没有盘点差异')
    inventoryDialogVisible.value = false
    return
  }

  ElMessageBox.confirm(`发现 ${diffItems.length} 个商品有盘点差异，确认提交吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await productApi({ action: 'inventory', items: diffItems.map(item => ({ id: item.id, actualStock: item.actualStock })) })
      ElMessage.success('盘点完成')
      inventoryDialogVisible.value = false
      loadInventoryList()
    } catch (error) {
      console.log(error)
    }
  }).catch(() => { })
}

// 导出库存
const exportInventory = () => {
  ElMessage.success('导出成功')
}

// 初始化
onMounted(() => {
  loadInventoryList()
})
</script>

<style scoped lang="scss">
.inventory-management {
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

  .overview-row {
    margin-bottom: 20px;
  }

  .overview-card {
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .overview-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .overview-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        color: white;

        &.warning {
          background: linear-gradient(135deg, #e6a23c 0%, #f5a623 100%);
        }

        &.success {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        }

        &.danger {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
        }
      }

      .overview-info {
        flex: 1;

        .overview-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .overview-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }

  .filter-card,
  .table-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
    }
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

  .low-stock {
    color: #e6a23c;
    font-weight: bold;
  }

  .out-stock {
    color: #f56c6c;
    font-weight: bold;
  }

  .diff {
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>
