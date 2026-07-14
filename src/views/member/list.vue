<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getMemberList, saveMember } from '@/api/member'

interface Member {
  id: string
  avatar: string
  nickname: string
  phone: string
  email: string
  level: string
  points: number
  balance: number
  totalOrders: number
  totalAmount: number
  lastLogin: string
  createTime: string
  status: number
}

const tableData = ref<Member[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const drawer = ref(false)
const currentRow = ref<Member | null>(null)

const searchForm = reactive({
  keyword: '',
  level: '',
  status: ''
})

const formData = reactive({
  nickname: '',
  phone: '',
  email: '',
  level: '',
  points: 0,
  balance: 0,
  status: 1,
  remark: ''
})

const formRules: FormRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const levelOptions = ['普通会员', '银卡会员', '金卡会员', '钻石会员']

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, pageSize: pageSize.value }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.level) params.level = searchForm.level
    if (searchForm.status !== '') params.status = searchForm.status
    const res = await getMemberList(params)
    tableData.value = res.data.list || res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => { Object.assign(searchForm, { keyword: '', level: '', status: '' }); currentPage.value = 1; loadData() }

const handleEdit = (row: Member) => {
  currentRow.value = row
  Object.assign(formData, {
    nickname: row.nickname,
    phone: row.phone,
    email: row.email,
    level: row.level,
    points: row.points,
    balance: row.balance,
    status: row.status,
    remark: ''
  })
  drawer.value = true
}

const handleSave = async () => {
  try {
    await saveMember(formData)
    ElMessage.success(currentRow.value ? '编辑成功' : '新增成功')
    drawer.value = false
    loadData()
  } catch (e) {
    console.log(e)
  }
}

const handleToggleStatus = (row: Member) => {
  row.status = row.status === 1 ? 0 : 1
  ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
}

onMounted(() => loadData())
</script>

<template>
  <div class="member-list">
    <div class="page-header">
      <h2>会员管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="currentRow = null; drawer = true">
          <el-icon><Plus /></el-icon>新增会员
        </el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" clearable placeholder="昵称/手机号" style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="searchForm.level" clearable placeholder="全部" style="width: 140px">
            <el-option v-for="lv in levelOptions" :key="lv" :label="lv" :value="lv" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><RefreshLeft /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="level" label="会员等级" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.level === '钻石会员' ? 'danger' : row.level === '金卡会员' ? 'warning' : row.level === '银卡会员' ? 'primary' : 'info'" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="100" align="right" sortable />
        <el-table-column prop="balance" label="余额" width="120" align="right">
          <template #default="{ row }">¥{{ row.balance.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="totalOrders" label="订单数" width="90" align="center" />
        <el-table-column prop="totalAmount" label="累计消费" width="130" align="right" sortable>
          <template #default="{ row }">¥{{ row.totalAmount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" @change="handleToggleStatus(row)" size="small" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[15, 25, 35, 45]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next"
          @size-change="currentPage = 1; loadData()"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-drawer v-model="drawer" :title="currentRow ? '编辑会员' : '新增会员'" size="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="formData.level" placeholder="请选择" style="width: 100%">
            <el-option v-for="lv in levelOptions" :key="lv" :label="lv" :value="lv" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="积分">
              <el-input-number v-model="formData.points" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="余额">
              <el-input-number v-model="formData.balance" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <div class="drawer-footer">
        <el-button @click="drawer = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.member-list {
  .page-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding: 0 20px;
    h2 { font-size: 20px; font-weight: 500; color: var(--color-text-primary, #303133); }
  }
  .filter-card { margin-bottom: 16px; border-radius: 8px; }
  .table-card { border-radius: 8px; }
  .pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
}
</style>
