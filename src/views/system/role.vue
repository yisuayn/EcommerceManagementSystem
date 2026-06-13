<!-- RolePermission.vue -->
<template>
  <div class="role-permission">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>角色权限管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon>
            <Plus />
          </el-icon>
          新增角色
        </el-button>
        <el-button @click="refreshList">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 角色列表 -->
      <el-col :span="8">
        <el-card class="role-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-input v-model="roleSearch" placeholder="搜索角色" clearable size="small" style="width: 160px" />
            </div>
          </template>
          <div class="role-list">
            <div v-for="role in filteredRoleList" :key="role.id" class="role-item"
              :class="{ active: currentRole?.id === role.id }" @click="selectRole(role)">
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-code">{{ role.code }}</div>
              </div>
              <div class="role-actions">
                <el-button link type="primary" size="small" @click.stop="openEditDialog(role)">
                  编辑
                </el-button>
                <el-button link type="danger" size="small" @click.stop="deleteRole(role)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
          <div class="role-footer">
            <el-pagination v-model:current-page="rolePage" :page-size="10" :total="roleTotal" layout="prev, pager, next"
              small />
          </div>
        </el-card>
      </el-col>

      <!-- 权限分配 -->
      <el-col :span="16">
        <el-card class="permission-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>权限分配 - {{ currentRole?.name || '请选择角色' }}</span>
              <el-button v-if="currentRole" type="primary" :loading="saving" @click="savePermissions">
                保存权限
              </el-button>
            </div>
          </template>

          <div v-if="currentRole" class="permission-tree">
            <el-tree ref="treeRef" :data="permissionTree" show-checkbox node-key="id"
              :default-checked-keys="checkedKeys" :props="{ label: 'name', children: 'children' }" check-strictly />
          </div>
          <el-empty v-else description="请选择左侧角色" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? '新增角色' : '编辑角色'" width="500px"
      @close="closeDialog">
      <el-form :model="roleForm" :rules="roleRules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="name" required>
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色标识" prop="code" required>
          <el-input v-model="roleForm.code" placeholder="请输入角色标识" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="roleForm.sort" :min="0" :max="999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="roleForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

// 角色列表
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    sort: 1,
    status: 1,
    remark: '拥有所有权限'
  },
  {
    id: 2,
    name: '商品管理员',
    code: 'product_admin',
    sort: 2,
    status: 1,
    remark: '商品管理权限'
  },
  {
    id: 3,
    name: '订单管理员',
    code: 'order_admin',
    sort: 3,
    status: 1,
    remark: '订单管理权限'
  },
  {
    id: 4,
    name: '财务管理员',
    code: 'finance_admin',
    sort: 4,
    status: 0,
    remark: '财务相关权限'
  }
])

// 权限树数据
const permissionTree = ref([
  {
    id: 1,
    name: '数据看板',
    path: '/dashboard',
    children: [
      { id: 101, name: '查看数据', path: '/dashboard/view', permission: 'dashboard:view' },
      { id: 102, name: '导出数据', path: '/dashboard/export', permission: 'dashboard:export' }
    ]
  },
  {
    id: 2,
    name: '商品管理',
    path: '/product',
    children: [
      { id: 201, name: '商品列表', path: '/product/list', permission: 'product:list' },
      { id: 202, name: '商品发布', path: '/product/publish', permission: 'product:publish' },
      { id: 203, name: '库存管理', path: '/product/stock', permission: 'product:stock' },
      { id: 204, name: '分类管理', path: '/product/category', permission: 'product:category' }
    ]
  },
  {
    id: 3,
    name: '订单管理',
    path: '/order',
    children: [
      { id: 301, name: '订单列表', path: '/order/list', permission: 'order:list' },
      { id: 302, name: '订单处理', path: '/order/process', permission: 'order:process' },
      { id: 303, name: '售后管理', path: '/order/after-sale', permission: 'order:after-sale' },
      { id: 304, name: '物流管理', path: '/order/logistics', permission: 'order:logistics' }
    ]
  },
  {
    id: 4,
    name: '营销中心',
    path: '/marketing',
    children: [
      { id: 401, name: '优惠券管理', path: '/marketing/coupon', permission: 'marketing:coupon' },
      { id: 402, name: '秒杀活动', path: '/marketing/seckill', permission: 'marketing:seckill' },
      { id: 403, name: '促销活动', path: '/marketing/promotion', permission: 'marketing:promotion' }
    ]
  },
  {
    id: 5,
    name: '系统设置',
    path: '/system',
    children: [
      { id: 501, name: '管理员管理', path: '/system/admin', permission: 'system:admin' },
      { id: 502, name: '角色权限', path: '/system/role', permission: 'system:role' },
      { id: 503, name: '操作日志', path: '/system/log', permission: 'system:log' }
    ]
  }
])

// 角色权限映射
const rolePermissions: Record<number, number[]> = {
  1: [101, 102, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403, 501, 502, 503],
  2: [201, 202, 203, 204],
  3: [301, 302, 303, 304],
  4: [401, 402, 403]
}

// 当前选中的角色
const currentRole = ref<any>(null)
const checkedKeys = ref<number[]>([])
const treeRef = ref()
const saving = ref(false)

// 角色搜索
const roleSearch = ref('')
const rolePage = ref(1)
const roleTotal = ref(roleList.value.length)

const filteredRoleList = computed(() => {
  let list = roleList.value
  if (roleSearch.value) {
    list = list.filter(role =>
      role.name.includes(roleSearch.value) || role.code.includes(roleSearch.value)
    )
  }
  roleTotal.value = list.length
  const start = (rolePage.value - 1) * 10
  return list.slice(start, start + 10)
})

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref()
const roleForm = reactive({
  id: null,
  name: '',
  code: '',
  sort: 0,
  status: 1,
  remark: ''
})

const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
}

// 选择角色
const selectRole = (role: any) => {
  currentRole.value = role
  checkedKeys.value = rolePermissions[role.id] || []
}

// 保存权限
const savePermissions = async () => {
  const checkedNodes = treeRef.value?.getCheckedNodes()
  const permissions = checkedNodes.map((node: any) => node.permission).filter(Boolean)

  saving.value = true
  setTimeout(() => {
    ElMessage.success(`权限保存成功，共 ${permissions.length} 个权限`)
    saving.value = false
  }, 500)
}

// 打开新增对话框
const openCreateDialog = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (role: any) => {
  dialogType.value = 'edit'
  roleForm.id = role.id
  roleForm.name = role.name
  roleForm.code = role.code
  roleForm.sort = role.sort
  roleForm.status = role.status
  roleForm.remark = role.remark
  dialogVisible.value = true
}

// 删除角色
const deleteRole = (role: any) => {
  ElMessageBox.confirm(`确认删除角色 ${role.name} 吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    refreshList()
    if (currentRole.value?.id === role.id) {
      currentRole.value = null
    }
  }).catch(() => { })
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
  dialogVisible.value = false
  refreshList()
}

const closeDialog = () => {
  formRef.value?.resetFields()
}

const refreshList = () => {
  // 刷新角色列表
}

onMounted(() => {
  // 默认选中第一个角色
  if (roleList.value.length > 0) {
    selectRole(roleList.value[0])
  }
})
</script>

<style scoped lang="scss">
.role-permission {
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

  .role-card,
  .permission-card {
    border-radius: 8px;
    height: calc(100vh - 140px);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .role-list {
      height: calc(100% - 60px);
      overflow-y: auto;

      .role-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #ecf5ff;
          border-left: 3px solid #409eff;
        }

        .role-info {
          .role-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .role-code {
            font-size: 12px;
            color: #909399;
          }
        }

        .role-actions {
          display: none;
        }

        &:hover .role-actions {
          display: flex;
          gap: 8px;
        }
      }
    }

    .role-footer {
      padding: 12px;
      text-align: center;
      border-top: 1px solid #ebeef5;
    }
  }

  .permission-card {
    .permission-tree {
      height: calc(100% - 50px);
      overflow-y: auto;
      padding: 16px;
    }
  }
}
</style>
