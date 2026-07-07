<template>
  <div class="article-management">
    <div class="page-header">
      <h2>文章管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          写文章
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="文章标题">
          <el-input v-model="searchForm.keyword" placeholder="请输入标题关键字" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable style="width: 130px">
            <el-option label="公告" value="announcement" />
            <el-option label="活动" value="activity" />
            <el-option label="指南" value="guide" />
            <el-option label="资讯" value="news" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文章列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="filteredList" border stripe v-loading="tableLoading">
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="110" align="center" />
        <el-table-column prop="publishTime" label="发布时间" width="160" />
        <el-table-column prop="views" label="阅读量" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="已发布"
              inactive-text="草稿"
              inline-prompt
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteArticle(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '写文章' : '编辑文章'"
      width="700px"
      @close="closeDialog"
    >
      <el-form :model="articleForm" :rules="articleRules" ref="formRef" label-width="100px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="articleForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="公告" value="announcement" />
            <el-option label="活动" value="activity" />
            <el-option label="指南" value="guide" />
            <el-option label="资讯" value="news" />
          </el-select>
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input v-model="articleForm.author" placeholder="请输入作者" />
        </el-form-item>

        <el-form-item label="封面图片" prop="coverImage">
          <el-input v-model="articleForm.coverImage" placeholder="请输入封面图片 URL">
            <template #prepend>URL</template>
          </el-input>
        </el-form-item>

        <el-form-item label="文章内容" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入文章内容…"
          />
        </el-form-item>

        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="articleForm.status">
            <el-radio :value="1">发布</el-radio>
            <el-radio :value="0">草稿</el-radio>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface ArticleItem {
  id: number
  title: string
  category: string
  author: string
  coverImage: string
  content: string
  publishTime: string
  views: number
  status: number
}

const tableLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  keyword: '',
  category: ''
})

const articleList = ref<ArticleItem[]>([
  {
    id: 1,
    title: '平台2025年端午节放假通知',
    category: 'announcement',
    author: '管理员',
    coverImage: 'https://via.placeholder.com/320x180/409eff/fff?text=Announce',
    content: '尊敬的各位用户：根据国家法定节假日安排，平台将于2025年6月8日至6月10日放假三天。放假期间，平台各项服务正常运行，但审核及客服响应可能会有延迟，敬请谅解。祝大家端午安康！',
    publishTime: '2025-06-01 10:00:00',
    views: 12580,
    status: 1
  },
  {
    id: 2,
    title: '618年中大促攻略来啦！',
    category: 'activity',
    author: '运营小编',
    coverImage: 'https://via.placeholder.com/320x180/67c23a/fff?text=618',
    content: '一年一度的618年中大促即将开启！今年平台联合数千个品牌商家，推出满300减50、跨店满减、限时秒杀等多重优惠活动。攻略在手，省钱不愁！',
    publishTime: '2025-06-05 14:30:00',
    views: 35200,
    status: 1
  },
  {
    id: 3,
    title: '新手指南：如何快速发布商品',
    category: 'guide',
    author: '技术支持',
    coverImage: 'https://via.placeholder.com/320x180/e6a23c/fff?text=Guide',
    content: '欢迎新商家入驻！本文手把手教您如何在平台快速发布商品：第一步，进入商家后台点击"商品发布"；第二步，填写商品基本信息、上传图片、设置价格库存；第三步，提交审核。审核通过后即可上架销售。',
    publishTime: '2025-05-20 09:00:00',
    views: 8760,
    status: 1
  },
  {
    id: 4,
    title: '2025年电商行业趋势分析',
    category: 'news',
    author: '行业观察',
    coverImage: 'https://via.placeholder.com/320x180/f56c6c/fff?text=Trends',
    content: '2025年电商行业呈现几大趋势：1. AI技术在电商领域的深度应用，从智能客服到个性化推荐；2. 社交电商持续增长，直播带货进入常态化运营；3. 即时零售市场快速扩张，一小时达成为新标配；4. 绿色消费理念盛行，可持续电商崛起。',
    publishTime: '2025-06-10 11:00:00',
    views: 42800,
    status: 1
  },
  {
    id: 5,
    title: '【公告】平台服务协议更新通知',
    category: 'announcement',
    author: '法务部',
    coverImage: 'https://via.placeholder.com/320x180/909399/fff?text=Legal',
    content: '为进一步保障用户权益，平台对《用户服务协议》进行了修订。主要变更内容包括：完善个人信息保护条款、明确平台与商家的责任边界、优化争议处理流程等。新协议将于2025年7月1日起正式生效。',
    publishTime: '2025-06-15 08:00:00',
    views: 5600,
    status: 1
  },
  {
    id: 6,
    title: '夏季清凉好物推荐合集',
    category: 'activity',
    author: '好物推荐官',
    coverImage: 'https://via.placeholder.com/320x180/409eff/fff?text=Summer',
    content: '炎炎夏日，平台精选了一批清凉好物：便携小风扇、冰凉坐垫、防晒喷雾、速干T恤……全场满199减30，更有品牌专区额外折扣。快来 pick 你的消暑神器吧！',
    publishTime: '2025-06-18 16:00:00',
    views: 18900,
    status: 1
  },
  {
    id: 7,
    title: '商家入驻资质审核指南（2025版）',
    category: 'guide',
    author: '招商经理',
    coverImage: 'https://via.placeholder.com/320x180/67c23a/fff?text=Merchant',
    content: '2025年商家入驻资质要求更新：基础资质包括营业执照、法人身份证、银行账户信息；特殊行业需提供相应许可证（如食品经营许可证、医疗器械经营备案等）。提交材料需为清晰彩色扫描件或照片。',
    publishTime: '2025-04-10 10:30:00',
    views: 13200,
    status: 1
  },
  {
    id: 8,
    title: '关于优化退换货流程的调研问卷',
    category: 'announcement',
    author: '产品经理',
    coverImage: 'https://via.placeholder.com/320x180/e6a23c/fff?text=Survey',
    content: '为了给您提供更好的售后服务体验，我们诚挚邀请您参与退换货流程优化调研问卷。问卷共10题，预计耗时3分钟。完成问卷即送5元无门槛优惠券。感谢您的支持！',
    publishTime: '2025-06-12 15:00:00',
    views: 3400,
    status: 0
  },
  {
    id: 9,
    title: '跨境购频道正式上线',
    category: 'news',
    author: '国际事业部',
    coverImage: 'https://via.placeholder.com/320x180/f56c6c/fff?text=Global',
    content: '平台跨境购频道正式上线！首批上线日韩美妆、澳洲保健品、欧洲母婴用品等千余种海外商品。所有商品均由品牌直供或保税仓发货，正品保障，物流可追溯。',
    publishTime: '2025-06-20 09:30:00',
    views: 22000,
    status: 0
  }
])

const filteredList = computed(() => {
  let list = articleList.value
  if (searchForm.keyword) {
    const kw = searchForm.keyword.toLowerCase()
    list = list.filter(item => item.title.toLowerCase().includes(kw))
  }
  if (searchForm.category) {
    list = list.filter(item => item.category === searchForm.category)
  }
  total.value = list.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

const articleForm = reactive({
  title: '',
  category: '',
  author: '',
  coverImage: '',
  content: '',
  status: 1
})

const articleRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

const getCategoryText = (category: string) => {
  const map: Record<string, string> = {
    announcement: '公告',
    activity: '活动',
    guide: '指南',
    news: '资讯'
  }
  return map[category] || category
}

const getCategoryTagType = (category: string) => {
  const map: Record<string, string> = {
    announcement: '',
    activity: 'success',
    guide: 'warning',
    news: 'info'
  }
  return map[category] || ''
}

const openCreateDialog = () => {
  dialogType.value = 'create'
  editingId.value = null
  dialogVisible.value = true
}

const openEditDialog = (row: ArticleItem) => {
  dialogType.value = 'edit'
  editingId.value = row.id
  articleForm.title = row.title
  articleForm.category = row.category
  articleForm.author = row.author
  articleForm.coverImage = row.coverImage
  articleForm.content = row.content
  articleForm.status = row.status
  dialogVisible.value = true
}

const handleStatusChange = (row: ArticleItem) => {
  const text = row.status === 1 ? '已发布' : '草稿'
  ElMessage.success(`状态已切换为「${text}」`)
}

const deleteArticle = (row: ArticleItem) => {
  ElMessageBox.confirm(`确认删除文章「${row.title}」吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = articleList.value.findIndex(item => item.id === row.id)
    if (idx !== -1) {
      articleList.value.splice(idx, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value?.validate()
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  if (dialogType.value === 'create') {
    const newId = Math.max(...articleList.value.map(i => i.id)) + 1
    articleList.value.unshift({
      id: newId,
      title: articleForm.title,
      category: articleForm.category,
      author: articleForm.author,
      coverImage: articleForm.coverImage || 'https://via.placeholder.com/320x180/eee/999?text=Article',
      content: articleForm.content,
      publishTime: now,
      views: 0,
      status: articleForm.status
    })
  } else {
    const item = articleList.value.find(i => i.id === editingId.value)
    if (item) {
      item.title = articleForm.title
      item.category = articleForm.category
      item.author = articleForm.author
      item.coverImage = articleForm.coverImage
      item.content = articleForm.content
      item.status = articleForm.status
    }
  }
  ElMessage.success(dialogType.value === 'create' ? '发布成功' : '更新成功')
  dialogVisible.value = false
}

const closeDialog = () => {
  formRef.value?.resetFields()
}

const handleSearch = () => {
  currentPage.value = 1
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  currentPage.value = 1
}

const refreshList = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
    ElMessage.success('已刷新')
  }, 500)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

onMounted(() => {
  tableLoading.value = false
  total.value = articleList.value.length
})
</script>

<style scoped lang="scss">
.article-management {
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

  .filter-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .table-card {
    border-radius: 8px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
