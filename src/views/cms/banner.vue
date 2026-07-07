<template>
  <div class="banner-management">
    <div class="page-header">
      <h2>Banner 管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建 Banner
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="bannerList" border stripe v-loading="tableLoading">
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              fit="cover"
              style="width: 80px; height: 40px; border-radius: 4px;"
            >
              <template #error>
                <div class="image-placeholder">Banner</div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="140" />
        <el-table-column prop="subtitle" label="副标题" min-width="140" show-overflow-tooltip />
        <el-table-column prop="linkUrl" label="链接 URL" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="上架"
              inactive-text="下架"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteBanner(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新建 Banner' : '编辑 Banner'"
      width="600px"
      @close="closeDialog"
    >
      <el-form :model="bannerForm" :rules="bannerRules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入 Banner 标题" />
        </el-form-item>

        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="bannerForm.subtitle" placeholder="请输入副标题" />
        </el-form-item>

        <el-form-item label="图片 URL" prop="image">
          <el-input v-model="bannerForm.image" placeholder="请输入图片 URL" />
        </el-form-item>

        <el-form-item label="图片上传" prop="imageUpload">
          <el-upload
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :limit="1"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：1920x450px</div>
        </el-form-item>

        <el-form-item label="链接 URL" prop="linkUrl">
          <el-input v-model="bannerForm.linkUrl" placeholder="请输入跳转链接">
            <template #prepend>https://</template>
          </el-input>
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="bannerForm.sortOrder" :min="0" :max="999" style="width: 200px" />
        </el-form-item>

        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker
            v-model="bannerForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="bannerForm.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
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
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface BannerItem {
  id: number
  title: string
  subtitle: string
  image: string
  linkUrl: string
  sortOrder: number
  status: number
  startTime: string
  endTime: string
}

const tableLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const bannerList = ref<BannerItem[]>([
  {
    id: 1,
    title: '节日促销',
    subtitle: '全场低至5折，限时抢购',
    image: 'https://via.placeholder.com/80x40/409eff/fff?text=1',
    linkUrl: 'promotion/holiday',
    sortOrder: 1,
    status: 1,
    startTime: '2025-06-01 00:00:00',
    endTime: '2025-06-30 23:59:59'
  },
  {
    id: 2,
    title: '新品上架',
    subtitle: '2025夏季新品首发',
    image: 'https://via.placeholder.com/80x40/67c23a/fff?text=2',
    linkUrl: 'product/new',
    sortOrder: 2,
    status: 1,
    startTime: '2025-06-15 00:00:00',
    endTime: '2025-07-15 23:59:59'
  },
  {
    id: 3,
    title: '限时秒杀',
    subtitle: '每日10点场，爆款低至1折',
    image: 'https://via.placeholder.com/80x40/e6a23c/fff?text=3',
    linkUrl: 'seckill/daily',
    sortOrder: 3,
    status: 1,
    startTime: '2025-06-20 00:00:00',
    endTime: '2025-06-27 23:59:59'
  },
  {
    id: 4,
    title: '品牌特卖',
    subtitle: '大牌专场，品质保障',
    image: 'https://via.placeholder.com/80x40/f56c6c/fff?text=4',
    linkUrl: 'brand/sale',
    sortOrder: 4,
    status: 0,
    startTime: '2025-07-01 00:00:00',
    endTime: '2025-07-31 23:59:59'
  },
  {
    id: 5,
    title: '会员日',
    subtitle: 'VIP专享，双倍积分',
    image: 'https://via.placeholder.com/80x40/909399/fff?text=5',
    linkUrl: 'member/day',
    sortOrder: 5,
    status: 0,
    startTime: '2025-07-08 00:00:00',
    endTime: '2025-07-08 23:59:59'
  }
])

const bannerForm = reactive({
  title: '',
  subtitle: '',
  image: '',
  linkUrl: '',
  sortOrder: 0,
  dateRange: null as [Date, Date] | null,
  status: 1
})

const bannerRules = {
  title: [{ required: true, message: '请输入 Banner 标题', trigger: 'blur' }],
  image: [{ required: true, message: '请输入图片 URL', trigger: 'blur' }]
}

const openCreateDialog = () => {
  dialogType.value = 'create'
  editingId.value = null
  dialogVisible.value = true
}

const openEditDialog = (row: BannerItem) => {
  dialogType.value = 'edit'
  editingId.value = row.id
  bannerForm.title = row.title
  bannerForm.subtitle = row.subtitle
  bannerForm.image = row.image
  bannerForm.linkUrl = row.linkUrl
  bannerForm.sortOrder = row.sortOrder
  bannerForm.status = row.status
  if (row.startTime && row.endTime) {
    bannerForm.dateRange = [new Date(row.startTime), new Date(row.endTime)]
  } else {
    bannerForm.dateRange = null
  }
  dialogVisible.value = true
}

const handleStatusChange = (row: BannerItem) => {
  const text = row.status === 1 ? '上架' : '下架'
  ElMessage.success(`${text}成功`)
}

const deleteBanner = (row: BannerItem) => {
  ElMessageBox.confirm(`确认删除 Banner「${row.title}」吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = bannerList.value.findIndex(item => item.id === row.id)
    if (idx !== -1) {
      bannerList.value.splice(idx, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value?.validate()
  ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
  dialogVisible.value = false
}

const closeDialog = () => {
  formRef.value?.resetFields()
  bannerForm.dateRange = null
}

const refreshList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    ElMessage.success('已刷新')
  }, 500)
}

onMounted(() => {
  tableLoading.value = false
})
</script>

<style scoped lang="scss">
.banner-management {
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

  .table-card {
    border-radius: 8px;
  }

  .image-placeholder {
    width: 80px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eee;
    color: #999;
    font-size: 12px;
    border-radius: 4px;
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.4;
  }
}
</style>
