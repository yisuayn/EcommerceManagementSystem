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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getArticleList, saveArticle, deleteArticle as deleteArticleApi } from '@/api/cms'

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

const filteredList = ref<ArticleItem[]>([])

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

const loadData = async () => {
  tableLoading.value = true
  try {
    const params: any = { page: currentPage.value, pageSize: pageSize.value }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.category) params.category = searchForm.category
    const res = await getArticleList(params)
    filteredList.value = res.data.list || res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.log(e)
  } finally {
    tableLoading.value = false
  }
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

const handleStatusChange = async (row: ArticleItem) => {
  try {
    await saveArticle({ id: row.id, status: row.status })
    const text = row.status === 1 ? '已发布' : '草稿'
    ElMessage.success(`状态已切换为「${text}」`)
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1
    console.log(e)
  }
}

const deleteArticle = (row: ArticleItem) => {
  ElMessageBox.confirm(`确认删除文章「${row.title}」吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteArticleApi(String(row.id))
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      console.log(e)
    }
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value?.validate()
  try {
    const data: any = {
      title: articleForm.title,
      category: articleForm.category,
      author: articleForm.author,
      coverImage: articleForm.coverImage,
      content: articleForm.content,
      status: articleForm.status
    }
    if (editingId.value) data.id = editingId.value
    await saveArticle(data)
    ElMessage.success(dialogType.value === 'create' ? '发布成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.log(e)
  }
}

const closeDialog = () => {
  formRef.value?.resetFields()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  currentPage.value = 1
  loadData()
}

const refreshList = () => {
  loadData()
  ElMessage.success('已刷新')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}

onMounted(() => {
  loadData()
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
