<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, ChatLineRound, Check, WarnTriangleFilled, Delete } from '@element-plus/icons-vue'
import { getReviewList, auditReview, replyReview, deleteReview } from '@/api/review'

interface Review {
  id: number
  productName: string
  productImage: string
  member: string
  rating: number
  content: string
  imagesCount: number
  images: string[]
  createTime: string
  status: 'pending' | 'approved' | 'blocked'
  reply?: string
}

const tableData = ref<Review[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const expandedRows = ref<string[]>([])

const searchForm = reactive({
  productName: '',
  member: '',
  rating: '',
  status: ''
})

const replyDialog = ref(false)
const currentReview = ref<Review | null>(null)
const replyContent = ref('')

const statistics = reactive({
  total: 0,
  pending: 0,
  blocked: 0
})

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已屏蔽', value: 'blocked' }
]

const ratingOptions = [
  { label: '全部', value: '' },
  { label: '5星', value: 5 },
  { label: '4星', value: 4 },
  { label: '3星', value: 3 },
  { label: '2星', value: 2 },
  { label: '1星', value: 1 }
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.productName) params.productName = searchForm.productName
    if (searchForm.member) params.member = searchForm.member
    if (searchForm.rating !== '') params.rating = searchForm.rating
    if (searchForm.status) params.status = searchForm.status
    const res = await getReviewList(params)
    const data = res.data || res
    tableData.value = data.list || []
    total.value = data.total || 0
    if (data.stats) {
      statistics.total = data.stats.total || 0
      statistics.pending = data.stats.pending || 0
      statistics.blocked = data.stats.blocked || 0
    } else {
      const all = data.list || []
      statistics.total = data.total || all.length
      statistics.pending = all.filter((r: Review) => r.status === 'pending').length
      statistics.blocked = all.filter((r: Review) => r.status === 'blocked').length
    }
  } catch {
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, { productName: '', member: '', rating: '', status: '' })
  currentPage.value = 1
  loadData()
}

const handleApprove = async (row: Review) => {
  try {
    await auditReview({ id: row.id, action: 'approve' })
    ElMessage.success('评价已通过')
    loadData()
  } catch {
    ElMessage.error('审核操作失败')
  }
}

const handleBlock = async (row: Review) => {
  try {
    await ElMessageBox.confirm('确定要屏蔽该评价吗？屏蔽后用户将无法查看此评价。', '确认屏蔽', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await auditReview({ id: row.id, action: 'block' })
    ElMessage.success('评价已屏蔽')
    loadData()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('屏蔽操作失败')
    }
  }
}

const handleDelete = async (row: Review) => {
  try {
    await ElMessageBox.confirm('确定要删除该评价吗？删除后不可恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteReview(String(row.id))
    ElMessage.success('评价已删除')
    loadData()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('删除操作失败')
    }
  }
}

const handleReply = (row: Review) => {
  currentReview.value = row
  replyContent.value = row.reply || ''
  replyDialog.value = true
}

const submitReply = async () => {
  if (!currentReview.value) return
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    await replyReview({ id: currentReview.value.id, content: replyContent.value })
    ElMessage.success('回复成功')
    replyDialog.value = false
    loadData()
  } catch {
    ElMessage.error('回复操作失败')
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = { approved: 'success', pending: 'warning', blocked: 'danger' }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { approved: '已通过', pending: '待审核', blocked: '已屏蔽' }
  return map[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="review-list">
    <div class="page-header">
      <h2>评价管理</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">全部评价</div>
              <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><ChatLineRound /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card warning" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">待审核</div>
              <div class="stat-value">{{ statistics.pending }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><WarnTriangleFilled /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card danger" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已屏蔽</div>
              <div class="stat-value">{{ statistics.blocked }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><WarnTriangleFilled /></el-icon></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.productName" clearable placeholder="商品名称" style="width: 180px" />
        </el-form-item>
        <el-form-item label="会员">
          <el-input v-model="searchForm.member" clearable placeholder="会员昵称" style="width: 140px" />
        </el-form-item>
        <el-form-item label="评分">
          <el-select v-model="searchForm.rating" clearable placeholder="全部" style="width: 100px">
            <el-option v-for="opt in ratingOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 120px">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><RefreshLeft /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%"
        @expand-change="(row: any, expanded: any[]) => expandedRows = expanded.map((r: any) => r.id)">
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <div class="expand-detail">
              <div class="detail-section">
                <h4>评价内容</h4>
                <p>{{ row.content }}</p>
              </div>
              <div v-if="row.images.length > 0" class="detail-section">
                <h4>评价图片（{{ row.imagesCount }}张）</h4>
                <div class="review-images">
                  <el-image v-for="(img, idx) in row.images" :key="idx" :src="img" :preview-src-list="row.images"
                    style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px;" fit="cover" />
                </div>
              </div>
              <div v-if="row.reply" class="detail-section reply-section">
                <h4>商家回复</h4>
                <el-alert :title="row.reply" type="success" :closable="false" show-icon />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="240">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.productImage" style="width: 50px; height: 50px; border-radius: 4px; flex-shrink: 0;" fit="cover" />
              <span class="product-name">{{ row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="member" label="会员" width="110" align="center" />
        <el-table-column label="评分" width="160" align="center">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="图片" width="80" align="center">
          <template #default="{ row }">
            <span>{{ row.imagesCount }}张</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评价时间" width="160" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="260" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'approved'" link type="success" size="small" @click="handleApprove(row)">
              <el-icon><Check /></el-icon>通过
            </el-button>
            <el-button v-if="row.status !== 'blocked'" link type="danger" size="small" @click="handleBlock(row)">
              <el-icon><WarnTriangleFilled /></el-icon>屏蔽
            </el-button>
            <el-button link type="primary" size="small" @click="handleReply(row)">
              回复
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]" :total="total" background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch" @current-change="loadData" />
      </div>
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialog" title="回复评价" width="520px">
      <div v-if="currentReview" class="reply-review-info">
        <div class="info-row">
          <span class="label">会员：</span>
          <span>{{ currentReview.member }}</span>
        </div>
        <div class="info-row">
          <span class="label">评分：</span>
          <el-rate :model-value="currentReview.rating" disabled size="small" />
        </div>
        <div class="info-row">
          <span class="label">评价：</span>
          <span>{{ currentReview.content }}</span>
        </div>
      </div>
      <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入回复内容..." />
      <template #footer>
        <el-button @click="replyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.review-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 20px;
    h2 { font-size: 20px; font-weight: 500; color: #303133; }
  }

  .stat-row {
    margin-bottom: 20px;
  }

  .stat-card {
    cursor: pointer;
    transition: transform 0.3s;
    &:hover { transform: translateY(-4px); }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stat-info {
        .stat-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: bold; color: #303133; }
      }
      .stat-icon { color: #c0c4cc; }
    }
    &.warning .stat-icon { color: #e6a23c; }
    &.danger .stat-icon { color: #f56c6c; }
  }

  .filter-card, .table-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .product-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    .product-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .expand-detail {
    padding: 16px 24px;
    .detail-section {
      margin-bottom: 16px;
      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }
      p { margin: 0; color: #303133; line-height: 1.6; }
      .review-images { display: flex; flex-wrap: wrap; }
    }
    .reply-section { margin-bottom: 0; }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .reply-review-info {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    .info-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      &:last-child { margin-bottom: 0; }

      .label {
        color: #909399;
        white-space: nowrap;
        flex-shrink: 0;
      }
    }
  }
}
</style>
