<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, ChatLineRound, Check, WarnTriangleFilled } from '@element-plus/icons-vue'

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

const allReviews = ref<Review[]>([])
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

const statistics = computed(() => ({
  total: allReviews.value.length,
  pending: allReviews.value.filter(r => r.status === 'pending').length,
  blocked: allReviews.value.filter(r => r.status === 'blocked').length
}))

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

const mockReviews = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  productName: ([
    'Apple iPhone 15 Pro Max 原色钛金属',
    '华为 Mate 60 Pro 雅丹黑',
    'Nike Air Force 1 白色经典款',
    '索尼 WH-1000XM5 头戴式降噪耳机',
    '戴森 V15 Detect 无绳吸尘器',
    '小米14 Ultra 徕卡光学 白色',
    'AirPods Pro 2 USB-C 版本',
    'MacBook Air M3 星光色',
    '乐高 兰博基尼 Sián FKP 37 机械组',
    '三星 Galaxy S24 Ultra 钛灰'
  ][i % 10]) || '',
  productImage: 'https://via.placeholder.com/50x50',
  member: (['张小明', '李小红', '王大伟', '赵丽华', '陈志远', '刘美丽', '周建国', '吴秀英'][i % 8]) || '',
  rating: (i % 5) + 1,
  content: ([
    '非常满意，物流很快，包装完好，商品质量很好，和描述一致，下次还会购买。',
    '产品不错，性价比高，发货速度快，客服态度也很好，值得推荐。',
    '一般般吧，没有想象中好，但也不算差，勉强能用，这个价位还算合理。',
    '质量很差，用了不到一周就坏了，联系客服也不处理，差评！',
    '外观漂亮，手感很好，功能齐全，系统流畅，拍照效果惊艳，非常值得入手。',
    '和描述不符，实物颜色有偏差，尺寸也偏小，建议买大一号，不太满意。',
    '包装很精致，送礼合适，但产品本身没有很惊艳，中规中矩。',
    '太好用了！解决了我的大问题，强烈推荐给有需要的朋友，五星好评！'
  ][i % 8]) || '',
  imagesCount: i % 4,
  images: Array.from({ length: i % 4 }, (_, j) => `https://picsum.photos/seed/review${i}_${j}/200/200`),
  createTime: `2026-0${1 + Math.floor(i / 8)}-${String(10 + ((i * 3) % 18)).padStart(2, '0')} ${String(9 + (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
  status: (['pending', 'approved', 'approved', 'blocked', 'approved', 'pending', 'approved', 'blocked', 'approved', 'pending'] as const)[i % 10] || 'pending',
  reply: i % 3 === 0 ? '感谢您的支持，我们会继续努力提供更好的服务！' : undefined
}))

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockReviews]
    if (searchForm.productName) {
      filtered = filtered.filter(r => r.productName.includes(searchForm.productName))
    }
    if (searchForm.member) {
      filtered = filtered.filter(r => r.member.includes(searchForm.member))
    }
    if (searchForm.rating !== '') {
      filtered = filtered.filter(r => r.rating === Number(searchForm.rating))
    }
    if (searchForm.status) {
      filtered = filtered.filter(r => r.status === searchForm.status)
    }
    total.value = filtered.length
    const start = (currentPage.value - 1) * pageSize.value
    tableData.value = filtered.slice(start, start + pageSize.value)
    loading.value = false
  }, 300)
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

const handleApprove = (row: Review) => {
  row.status = 'approved'
  ElMessage.success('评价已通过')
}

const handleBlock = (row: Review) => {
  ElMessageBox.confirm('确定要屏蔽该评价吗？屏蔽后用户将无法查看此评价。', '确认屏蔽', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'blocked'
    ElMessage.success('评价已屏蔽')
  }).catch(() => {})
}

const handleReply = (row: Review) => {
  currentReview.value = row
  replyContent.value = row.reply || ''
  replyDialog.value = true
}

const submitReply = () => {
  if (!currentReview.value) return
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  currentReview.value.reply = replyContent.value
  ElMessage.success('回复成功')
  replyDialog.value = false
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
  allReviews.value = mockReviews
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
        <el-table-column fixed="right" label="操作" width="210" align="center">
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
