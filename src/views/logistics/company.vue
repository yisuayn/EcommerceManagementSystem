<!-- LogisticsCompany.vue -->
<template>
  <div class="logistics-company">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>物流公司管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDrawer">
          <el-icon>
            <Plus />
          </el-icon>
          新增公司
        </el-button>
        <el-button @click="refreshList">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="公司名称">
          <el-input v-model="searchForm.name" placeholder="请输入公司名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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

    <!-- 公司列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="companyList" border stripe v-loading="tableLoading">
        <el-table-column prop="name" label="公司名称" min-width="160" />
        <el-table-column prop="code" label="编码" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="website" label="官网地址" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="row.website" target="_blank" type="primary">{{ row.website }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="trackingUrl" label="查询地址" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="generateTrackingUrl(row)" target="_blank" type="primary">{{ row.trackingUrl }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDrawer(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="deleteCompany(row)">
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

    <!-- 新增/编辑公司抽屉 -->
    <el-drawer v-model="drawerVisible" :title="drawerType === 'create' ? '新增物流公司' : '编辑物流公司'" size="500px"
      @close="closeDrawer">
      <div class="drawer-body">
        <el-form :model="companyForm" :rules="companyRules" ref="formRef" label-width="100px">
          <el-form-item label="公司名称" prop="name" required>
            <el-input v-model="companyForm.name" placeholder="请输入物流公司名称" />
          </el-form-item>

          <el-form-item label="公司编码" prop="code" required>
            <el-input v-model="companyForm.code" placeholder="请输入编码，如 SF、YTO" />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="companyForm.phone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="官网地址" prop="website">
            <el-input v-model="companyForm.website" placeholder="请输入官网地址" />
          </el-form-item>

          <el-form-item label="查询地址" prop="trackingUrl">
            <el-input v-model="companyForm.trackingUrl" placeholder="请输入物流查询地址" />
            <div class="form-tip">使用 {nu} 代替运单号，如：https://www.sf.com/{nu}</div>
          </el-form-item>

          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="companyForm.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="companyForm.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 公司列表数据
const companyList = ref([
  {
    id: 1,
    name: '顺丰速运',
    code: 'SF',
    phone: '95338',
    website: 'https://www.sf-express.com',
    trackingUrl: 'https://www.sf-express.com/cn/sc/dynamic-search/result/{nu}',
    sortOrder: 0,
    status: 1
  },
  {
    id: 2,
    name: '圆通速递',
    code: 'YTO',
    phone: '95554',
    website: 'https://www.yto.net.cn',
    trackingUrl: 'https://www.yto.net.cn/gd/query/{nu}',
    sortOrder: 1,
    status: 1
  },
  {
    id: 3,
    name: '中通快递',
    code: 'ZTO',
    phone: '95311',
    website: 'https://www.zto.com',
    trackingUrl: 'https://www.zto.com/express/query/{nu}',
    sortOrder: 2,
    status: 1
  },
  {
    id: 4,
    name: '韵达快递',
    code: 'YD',
    phone: '95546',
    website: 'https://www.yundaex.com',
    trackingUrl: 'https://www.yundaex.com/query/waybill/{nu}',
    sortOrder: 3,
    status: 1
  },
  {
    id: 5,
    name: '京东物流',
    code: 'JD',
    phone: '950616',
    website: 'https://www.jdl.com',
    trackingUrl: 'https://www.jdl.com/express/query/{nu}',
    sortOrder: 4,
    status: 1
  },
  {
    id: 6,
    name: '中国邮政',
    code: 'EMS',
    phone: '11183',
    website: 'https://www.ems.com.cn',
    trackingUrl: 'https://www.ems.com.cn/query/{nu}',
    sortOrder: 5,
    status: 0
  },
  {
    id: 7,
    name: '德邦物流',
    code: 'DB',
    phone: '95353',
    website: 'https://www.deppon.com',
    trackingUrl: 'https://www.deppon.com/waybill/query/{nu}',
    sortOrder: 6,
    status: 1
  }
])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 抽屉相关
const drawerVisible = ref(false)
const drawerType = ref<'create' | 'edit'>('create')
const formRef = ref()
const companyForm = reactive({
  id: null,
  name: '',
  code: '',
  phone: '',
  website: '',
  trackingUrl: '',
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const companyRules = {
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入公司编码', trigger: 'blur' }]
}

// 生成追踪链接（示例）
const generateTrackingUrl = (row: any) => {
  return row.trackingUrl.replace('{nu}', 'DEMO1234567890')
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadCompanyList()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const refreshList = () => {
  loadCompanyList()
}

const loadCompanyList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
  }, 500)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadCompanyList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadCompanyList()
}

// 打开新增抽屉
const openCreateDrawer = () => {
  drawerType.value = 'create'
  drawerVisible.value = true
}

// 打开编辑抽屉
const openEditDrawer = (row: any) => {
  drawerType.value = 'edit'
  companyForm.id = row.id
  companyForm.name = row.name
  companyForm.code = row.code
  companyForm.phone = row.phone
  companyForm.website = row.website
  companyForm.trackingUrl = row.trackingUrl
  companyForm.sortOrder = row.sortOrder
  companyForm.status = row.status
  drawerVisible.value = true
}

// 切换状态
const toggleStatus = (row: any) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${action}物流公司 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

// 删除公司
const deleteCompany = (row: any) => {
  ElMessageBox.confirm(`确认删除物流公司 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadCompanyList()
  }).catch(() => { })
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  ElMessage.success(drawerType.value === 'create' ? '创建成功' : '更新成功')
  drawerVisible.value = false
  loadCompanyList()
}

const closeDrawer = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadCompanyList()
})
</script>

<style scoped lang="scss">
.logistics-company {
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

  .drawer-body {
    padding: 0 20px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>
