<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, Promotion, SuccessFilled, WarnTriangleFilled, DataAnalysis } from '@element-plus/icons-vue'
import { getSendLogList } from '@/api/notification'

interface SendLog {
  id: number
  templateName: string
  recipient: string
  type: 'sms' | 'email' | 'internal'
  content: string
  status: 'success' | 'fail'
  sendTime: string
  failReason?: string
}

const tableData = ref<SendLog[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const detailDrawer = ref(false)
const currentLog = ref<SendLog | null>(null)

const searchForm = reactive({
  templateName: '',
  recipient: '',
  type: '',
  status: '',
  dateRange: null as [Date, Date] | null
})

const statistics = computed(() => {
  const data = tableData.value
  const totalCount = total.value
  const success = data.filter(l => l.status === 'success').length
  const fail = data.filter(l => l.status === 'fail').length
  const rate = totalCount > 0 ? ((success / totalCount) * 100).toFixed(1) + '%' : '0%'
  return { total: totalCount, success, fail, rate }
})

const typeOptions = [
  { label: '短信', value: 'sms' },
  { label: '邮件', value: 'email' },
  { label: '站内信', value: 'internal' }
]

const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' }
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.templateName) params.templateName = searchForm.templateName
    if (searchForm.recipient) params.recipient = searchForm.recipient
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.dateRange && searchForm.dateRange[0] && searchForm.dateRange[1]) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    const res = await getSendLogList(params)
    const data = res.data || res
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch {
    ElMessage.error('获取发送记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, { templateName: '', recipient: '', type: '', status: '', dateRange: null })
  currentPage.value = 1
  loadData()
}

const viewDetail = (row: SendLog) => {
  currentLog.value = row
  detailDrawer.value = true
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = { sms: '短信', email: '邮件', internal: '站内信' }
  return map[type] || type
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="send-log">
    <div class="page-header">
      <h2>发送记录</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日发送</div>
              <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><Promotion /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card success" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">成功</div>
              <div class="stat-value">{{ statistics.success }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><SuccessFilled /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card danger" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">失败</div>
              <div class="stat-value">{{ statistics.fail }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><WarnTriangleFilled /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">成功率</div>
              <div class="stat-value">{{ statistics.rate }}</div>
            </div>
            <div class="stat-icon"><el-icon :size="32"><DataAnalysis /></el-icon></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="模板名称">
          <el-input v-model="searchForm.templateName" clearable placeholder="模板名称" style="width: 160px" />
        </el-form-item>
        <el-form-item label="收件人">
          <el-input v-model="searchForm.recipient" clearable placeholder="手机号/邮箱/账号" style="width: 170px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" clearable placeholder="全部" style="width: 110px">
            <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 100px">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-date-picker v-model="searchForm.dateRange" type="datetimerange" range-separator="至"
            start-placeholder="开始时间" end-placeholder="结束时间" style="width: 350px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><RefreshLeft /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 记录列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="templateName" label="模板名称" min-width="160" />
        <el-table-column prop="recipient" label="收件人" width="150" />
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'sms' ? 'primary' : row.type === 'email' ? 'warning' : 'info'" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content.length > 30 ? row.content.slice(0, 30) + '...' : row.content }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="160" />
        <el-table-column label="失败原因" width="130" align="center">
          <template #default="{ row }">
            <template v-if="row.status === 'fail' && row.failReason">
              <el-tooltip :content="row.failReason" placement="top">
                <el-tag type="danger" size="small" effect="dark" style="cursor: pointer;">
                  {{ row.failReason.length > 8 ? row.failReason.slice(0, 8) + '...' : row.failReason }}
                </el-tag>
              </el-tooltip>
            </template>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]" :total="total" background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="currentPage = 1; loadData()" @current-change="loadData" />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailDrawer" title="发送详情" size="500px">
      <template v-if="currentLog">
        <div class="detail-content">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="模板名称">{{ currentLog.templateName }}</el-descriptions-item>
            <el-descriptions-item label="收件人">{{ currentLog.recipient }}</el-descriptions-item>
            <el-descriptions-item label="发送类型">
              <el-tag :type="currentLog.type === 'sms' ? 'primary' : currentLog.type === 'email' ? 'warning' : 'info'" size="small">
                {{ getTypeLabel(currentLog.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发送时间">{{ currentLog.sendTime }}</el-descriptions-item>
            <el-descriptions-item label="发送状态">
              <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'" size="small">
                {{ currentLog.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentLog.status === 'fail' && currentLog.failReason" label="失败原因">
              <span class="fail-reason">{{ currentLog.failReason }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="发送内容">
              <div class="full-content">{{ currentLog.content }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.send-log {
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
    &.success .stat-icon { color: #67c23a; }
    &.danger .stat-icon { color: #f56c6c; }
    &.primary .stat-icon { color: #409eff; }
  }

  .filter-card, .table-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .detail-content {
    padding: 0 4px;

    .fail-reason {
      color: #f56c6c;
    }

    .full-content {
      line-height: 1.6;
      color: #303133;
    }
  }
}
</style>
