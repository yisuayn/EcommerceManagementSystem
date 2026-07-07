<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'

interface NotificationTemplate {
  id: number
  name: string
  type: 'sms' | 'email' | 'internal'
  templateCode: string
  content: string
  status: boolean
}

const formRef = ref<FormInstance>()
const tableData = ref<NotificationTemplate[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentRow = ref<NotificationTemplate | null>(null)
const previewVisible = ref(false)
const previewTemplate = ref<NotificationTemplate | null>(null)

const formData = reactive({
  name: '',
  type: 'sms' as 'sms' | 'email' | 'internal',
  templateCode: '',
  content: '',
  status: true
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  templateCode: [
    { required: true, message: '请输入模板编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '模板编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
}

const typeOptions = [
  { label: '短信', value: 'sms' },
  { label: '邮件', value: 'email' },
  { label: '站内信', value: 'internal' }
]

const mockTemplates: NotificationTemplate[] = [
  {
    id: 1, name: '订单支付通知-短信', type: 'sms',
    templateCode: 'ORDER_PAID_SMS',
    content: '尊敬的{nickname}，您的订单{orderNo}已支付成功，金额{amount}元，感谢您的购买！',
    status: true
  },
  {
    id: 2, name: '订单支付通知-邮件', type: 'email',
    templateCode: 'ORDER_PAID_EMAIL',
    content: '尊敬的{nickname}，您好！您的订单{orderNo}已于{time}支付成功，支付金额{amount}元。订单详情请登录查看。',
    status: true
  },
  {
    id: 3, name: '注册欢迎-站内信', type: 'internal',
    templateCode: 'REG_WELCOME',
    content: '欢迎{nickname}注册成为我们的会员！送您一张新人优惠券，祝您购物愉快！',
    status: true
  },
  {
    id: 4, name: '发货通知-短信', type: 'sms',
    templateCode: 'ORDER_SHIPPED',
    content: '您的订单{orderNo}已发货，请注意查收。如有问题请联系客服。',
    status: true
  },
  {
    id: 5, name: '退款通知-短信', type: 'sms',
    templateCode: 'REFUND_NOTIFY',
    content: '尊敬的{nickname}，您的退款申请已处理，订单{orderNo}退款金额{amount}元，预计{time}到账。',
    status: false
  },
  {
    id: 6, name: '促销活动-邮件', type: 'email',
    templateCode: 'PROMO_ACTIVITY',
    content: '亲爱的{nickname}，商城大促来袭！全场满减优惠，点击查看详情。活动截止时间：{time}。',
    status: true
  },
  {
    id: 7, name: '密码重置-邮件', type: 'email',
    templateCode: 'PASSWORD_RESET',
    content: '您好，您正在重置密码，验证码已发送。如非本人操作，请忽略此邮件。',
    status: true
  },
  {
    id: 8, name: '会员升级-站内信', type: 'internal',
    templateCode: 'MEMBER_UPGRADE',
    content: '恭喜{nickname}升级为高级会员！即日起享受更多专属权益和优惠折扣。',
    status: false
  }
]

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockTemplates]
    tableData.value = filtered
    loading.value = false
  }, 300)
}

const openAdd = () => {
  isEdit.value = false
  currentRow.value = null
  Object.assign(formData, { name: '', type: 'sms', templateCode: '', content: '', status: true })
  dialogVisible.value = true
}

const openEdit = (row: NotificationTemplate) => {
  isEdit.value = true
  currentRow.value = row
  Object.assign(formData, {
    name: row.name,
    type: row.type,
    templateCode: row.templateCode,
    content: row.content,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (isEdit.value && currentRow.value) {
    Object.assign(currentRow.value, { ...formData })
    ElMessage.success('编辑成功')
  } else {
    const newId = Math.max(...mockTemplates.map(t => t.id)) + 1
    mockTemplates.push({
      id: newId,
      name: formData.name,
      type: formData.type,
      templateCode: formData.templateCode,
      content: formData.content,
      status: formData.status
    })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row: NotificationTemplate) => {
  ElMessageBox.confirm(`确定要删除模板「${row.name}」吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = mockTemplates.findIndex(t => t.id === row.id)
    if (idx > -1) {
      mockTemplates.splice(idx, 1)
      loadData()
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleToggleStatus = (row: NotificationTemplate) => {
  row.status = !row.status
  ElMessage.success(row.status ? '已启用' : '已禁用')
}

const handlePreview = (row: NotificationTemplate) => {
  previewTemplate.value = row
  previewVisible.value = true
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = { sms: '短信', email: '邮件', internal: '站内信' }
  return map[type] || type
}

onMounted(() => loadData())
</script>

<template>
  <div class="notification-template">
    <div class="page-header">
      <h2>通知模板</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openAdd">
          <el-icon><Plus /></el-icon>新增模板
        </el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="模板名称" min-width="180" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'sms' ? 'primary' : row.type === 'email' ? 'warning' : 'info'" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="templateCode" label="模板编码" width="180" align="center">
          <template #default="{ row }">
            <code class="code-value">{{ row.templateCode }}</code>
          </template>
        </el-table-column>
        <el-table-column label="内容预览" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content.length > 30 ? row.content.slice(0, 30) + '...' : row.content }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.status" @change="handleToggleStatus(row)" size="small" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handlePreview(row)">预览</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑模板' : '新增模板'" width="640px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择" style="width: 100%">
            <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板编码" prop="templateCode">
          <el-input v-model="formData.templateCode" placeholder="建议使用大写字母和下划线，如 ORDER_PAID" />
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入模板内容" />
          <div class="variable-hints">
            <span class="hint-label">可用变量：</span>
            <el-tag size="small" class="var-tag">{nickname}</el-tag>
            <el-tag size="small" class="var-tag">{orderNo}</el-tag>
            <el-tag size="small" class="var-tag">{amount}</el-tag>
            <el-tag size="small" class="var-tag">{time}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="模板预览" width="560px">
      <el-alert v-if="previewTemplate" type="info" :closable="false" show-icon>
        <template #title>
          <div class="preview-header">
            <span>{{ previewTemplate.name }}</span>
            <el-tag size="small" style="margin-left: 8px;">{{ previewTemplate.templateCode }}</el-tag>
          </div>
        </template>
        <div class="preview-body">
          <div class="preview-meta">
            <span>类型：{{ getTypeLabel(previewTemplate.type) }}</span>
            <span>状态：{{ previewTemplate.status ? '启用' : '禁用' }}</span>
          </div>
          <div class="preview-content">
            <h4>模板内容：</h4>
            <div class="content-box">{{ previewTemplate.content }}</div>
          </div>
        </div>
      </el-alert>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.notification-template {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 20px;
    h2 { font-size: 20px; font-weight: 500; color: #303133; }
  }

  .table-card { border-radius: 8px; }

  .code-value {
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    color: #409eff;
    font-family: monospace;
  }

  .variable-hints {
    margin-top: 8px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;

    .hint-label {
      font-size: 12px;
      color: #909399;
      margin-right: 4px;
    }
    .var-tag {
      font-family: monospace;
      cursor: pointer;
      &:hover { opacity: 0.8; }
    }
  }

  .preview-header {
    display: flex;
    align-items: center;
  }

  .preview-body {
    margin-top: 16px;

    .preview-meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #606266;
      margin-bottom: 16px;
    }

    .preview-content {
      h4 { margin: 0 0 8px; font-size: 14px; color: #303133; }
      .content-box {
        background: #f5f7fa;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        line-height: 1.6;
        color: #303133;
      }
    }
  }
}
</style>
