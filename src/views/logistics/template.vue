<!-- FreightTemplate.vue -->
<template>
  <div class="freight-template">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>运费模板管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新建模板
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
        <el-form-item label="模板名称">
          <el-input v-model="searchForm.name" placeholder="请输入模板名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="计费方式">
          <el-select v-model="searchForm.type" placeholder="请选择计费方式" clearable style="width: 140px">
            <el-option label="按件计费" value="piece" />
            <el-option label="按重量计费" value="weight" />
          </el-select>
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

    <!-- 模板列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="templateList" border stripe v-loading="tableLoading">
        <el-table-column prop="name" label="模板名称" min-width="140" />
        <el-table-column prop="type" label="计费方式" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'piece' ? 'primary' : 'warning'">
              {{ row.type === 'piece' ? '按件计费' : '按重量计费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="基础费用" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.baseFee }}
          </template>
        </el-table-column>
        <el-table-column label="续费/续重" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.type === 'piece'">每件 ¥{{ row.extraFee }}</span>
            <span v-else>每kg ¥{{ row.extraFee }}</span>
          </template>
        </el-table-column>
        <el-table-column label="包邮条件" width="140" align="center">
          <template #default="{ row }">
            <span v-if="row.freeThreshold > 0">满 ¥{{ row.freeThreshold }} 包邮</span>
            <el-tag v-else type="info" size="small">不包邮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="regions" label="覆盖区域" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="deleteTemplate(row)">
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

    <!-- 新建/编辑模板对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? '新建运费模板' : '编辑运费模板'" width="660px"
      @close="closeDialog">
      <el-form :model="templateForm" :rules="templateRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name" required>
              <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计费方式" prop="type" required>
              <el-select v-model="templateForm.type" placeholder="请选择计费方式" style="width: 100%">
                <el-option label="按件计费" value="piece" />
                <el-option label="按重量计费" value="weight" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基础费用" prop="baseFee" required>
              <el-input-number v-model="templateForm.baseFee" :min="0" :precision="2" style="width: 100%">
                <template #prepend>¥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="续费/续重" prop="extraFee" required>
              <el-input-number v-model="templateForm.extraFee" :min="0" :precision="2" style="width: 100%">
                <template #prepend>¥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="包邮门槛" prop="freeThreshold">
              <el-input-number v-model="templateForm.freeThreshold" :min="0" :precision="2" style="width: 100%">
                <template #prepend>满 ¥</template>
              </el-input-number>
              <div class="form-tip">0 表示不包邮</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="templateForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="覆盖区域" prop="regions" required>
          <el-checkbox-group v-model="templateForm.regions">
            <el-checkbox label="全国" />
            <el-checkbox label="华东" />
            <el-checkbox label="华南" />
            <el-checkbox label="华北" />
            <el-checkbox label="华中" />
            <el-checkbox label="西南" />
            <el-checkbox label="西北" />
            <el-checkbox label="东北" />
            <el-checkbox label="港澳台" />
            <el-checkbox label="海外" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'
import { getFreightTemplateList, saveFreightTemplate, deleteFreightTemplate } from '@/api/logistics'

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 模板列表数据
const templateList = ref<any[]>([])

// 表格相关
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref()
const templateForm = reactive({
  id: null,
  name: '',
  type: 'piece',
  baseFee: 0,
  extraFee: 0,
  freeThreshold: 0,
  regions: [] as string[],
  status: 1
})

// 表单验证规则
const templateRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计费方式', trigger: 'change' }],
  baseFee: [{ required: true, message: '请输入基础费用', trigger: 'blur' }],
  extraFee: [{ required: true, message: '请输入续费/续重费用', trigger: 'blur' }],
  regions: [{ required: true, message: '请选择覆盖区域', trigger: 'change' }]
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadTemplateList()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
  handleSearch()
}

const refreshList = () => {
  loadTemplateList()
}

const loadTemplateList = async () => {
  tableLoading.value = true
  try {
    const params: any = { page: currentPage.value, pageSize: pageSize.value }
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.status !== '') params.status = searchForm.status
    const res = await getFreightTemplateList(params)
    templateList.value = res.data.list || res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.log(e)
  } finally {
    tableLoading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadTemplateList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadTemplateList()
}

// 打开新建对话框
const openCreateDialog = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row: any) => {
  dialogType.value = 'edit'
  templateForm.id = row.id
  templateForm.name = row.name
  templateForm.type = row.type
  templateForm.baseFee = row.baseFee
  templateForm.extraFee = row.extraFee
  templateForm.freeThreshold = row.freeThreshold
  templateForm.regions = row.regions ? row.regions.split(', ').filter((r: string) => r) : []
  templateForm.status = row.status
  dialogVisible.value = true
}

// 切换状态
const toggleStatus = (row: any) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${action}模板 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await saveFreightTemplate({ id: row.id, status: row.status })
      ElMessage.success(`${action}成功`)
    } catch (e) {
      row.status = row.status === 1 ? 0 : 1
      console.log(e)
    }
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

// 删除模板
const deleteTemplate = (row: any) => {
  ElMessageBox.confirm(`确认删除运费模板 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteFreightTemplate(row.id)
      ElMessage.success('删除成功')
      loadTemplateList()
    } catch (e) {
      console.log(e)
    }
  }).catch(() => { })
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  try {
    const data: any = { ...templateForm }
    data.regions = (data.regions as string[]).join(', ')
    await saveFreightTemplate(data)
    ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
    dialogVisible.value = false
    loadTemplateList()
  } catch (e) {
    console.log(e)
  }
}

const closeDialog = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadTemplateList()
})
</script>

<style scoped lang="scss">
.freight-template {
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

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>
