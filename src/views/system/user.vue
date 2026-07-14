<!-- AdminManagement.vue -->
<template>
  <div class="admin-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>管理员管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新增管理员
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
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.roleId" placeholder="请选择角色" clearable style="width: 150px">
            <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
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

    <!-- 管理员列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="adminList" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="avatar" label="头像" width="70" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roleName" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="resetPassword(row)">
              重置密码
            </el-button>
            <el-button link type="danger" size="small" @click="deleteAdmin(row)">
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

    <!-- 新增/编辑管理员对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? '新增管理员' : '编辑管理员'" width="550px"
      @close="closeDialog">
      <el-form :model="adminForm" :rules="adminRules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="adminForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item v-if="dialogType === 'create'" label="密码" prop="password" required>
          <el-input v-model="adminForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname" required>
          <el-input v-model="adminForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email" required>
          <el-input v-model="adminForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone" required>
          <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="角色" prop="roleId" required>
          <el-select v-model="adminForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="adminForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="adminForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="重置密码" width="450px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="password" required>
          <el-input v-model="passwordForm.password" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" required>
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请确认新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPassword">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`管理员详情 - ${currentAdmin?.nickname}`" size="500px">
      <div v-if="currentAdmin" class="admin-detail">
        <div class="detail-avatar">
          <el-avatar :size="80" :src="currentAdmin.avatar" />
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            {{ currentAdmin.username }}
          </el-descriptions-item>
          <el-descriptions-item label="昵称">
            {{ currentAdmin.nickname }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentAdmin.email }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentAdmin.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            {{ currentAdmin.roleName }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentAdmin.status === 1 ? 'success' : 'danger'">
              {{ currentAdmin.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录IP">
            {{ currentAdmin.lastLoginIp || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">
            {{ currentAdmin.lastLoginTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentAdmin.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ currentAdmin.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'
import { getAdminList, saveAdmin, resetAdminPassword, getRoleList } from '@/api/system'

// 角色列表
const roleList = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '商品管理员' },
  { id: 3, name: '订单管理员' },
  { id: 4, name: '财务管理员' },
  { id: 5, name: '客服管理员' }
])

// 管理员列表
const adminList = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  username: '',
  nickname: '',
  roleId: '',
  status: ''
})

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
const adminForm = reactive({
  id: null,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  roleId: null,
  status: 1,
  remark: ''
})

// 表单验证规则
const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 重置密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref()
const currentResetAdmin = ref<any>(null)
const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentAdmin = ref<any>(null)

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadAdminList()
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.nickname = ''
  searchForm.roleId = ''
  searchForm.status = ''
  handleSearch()
}

const refreshList = () => {
  loadAdminList()
}

const loadAdminList = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.username || undefined,
      nickname: searchForm.nickname || undefined,
      roleId: searchForm.roleId || undefined,
      status: searchForm.status !== '' ? searchForm.status : undefined
    }
    const res = await getAdminList(params)
    adminList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch {
    ElMessage.error('获取管理员列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadAdminList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadAdminList()
}

// 打开新增对话框
const openCreateDialog = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row: any) => {
  dialogType.value = 'edit'
  adminForm.id = row.id
  adminForm.username = row.username
  adminForm.nickname = row.nickname
  adminForm.email = row.email
  adminForm.phone = row.phone
  adminForm.roleId = row.roleId
  adminForm.status = row.status
  adminForm.remark = row.remark
  dialogVisible.value = true
}

// 查看详情
const viewDetail = (row: any) => {
  currentAdmin.value = row
  detailDrawerVisible.value = true
}

// 切换状态
const toggleStatus = (row: any) => {
  const action = row.status === 1 ? '启用' : '禁用'
  ElMessageBox.confirm(`确认${action}管理员 ${row.nickname} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

// 重置密码
const resetPassword = (row: any) => {
  currentResetAdmin.value = row
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const submitResetPassword = async () => {
  await passwordFormRef.value?.validate()
  try {
    await resetAdminPassword({
      id: currentResetAdmin.value.id,
      password: passwordForm.password
    })
    ElMessage.success(`密码重置成功，新密码已发送至 ${currentResetAdmin.value.email}`)
    passwordDialogVisible.value = false
  } catch {
    ElMessage.error('密码重置失败')
  }
}

// 删除管理员
const deleteAdmin = (row: any) => {
  ElMessageBox.confirm(`确认删除管理员 ${row.nickname} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadAdminList()
  }).catch(() => { })
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  try {
    await saveAdmin({
      id: adminForm.id || undefined,
      username: adminForm.username,
      password: adminForm.password || undefined,
      nickname: adminForm.nickname,
      email: adminForm.email,
      phone: adminForm.phone,
      roleId: adminForm.roleId,
      status: adminForm.status,
      remark: adminForm.remark
    })
    ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
    dialogVisible.value = false
    loadAdminList()
  } catch {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
  }
}

const closeDialog = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadRoleList()
  loadAdminList()
})

// 加载角色列表
const loadRoleList = async () => {
  try {
    const res = await getRoleList({})
    roleList.value = res.data.list || []
  } catch {
    // 使用默认角色列表
  }
}
</script>

<style scoped lang="scss">
.admin-management {
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

  .admin-detail {
    padding: 20px;

    .detail-avatar {
      text-align: center;
      margin-bottom: 20px;
    }
  }
}
</style>
