<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, Edit } from '@element-plus/icons-vue'
import { getPointsRule, getPointsLog } from '@/api/member'

const activeTab = ref('rule')

interface PointsLog {
  id: string
  member: string
  phone: string
  type: string
  points: number
  balance: number
  remark: string
  createTime: string
}

const ruleForm = reactive({
  registerPoints: 100,
  loginPoints: 5,
  orderRate: 1,
  reviewPoints: 20,
  maxDailyLogin: 5,
  pointsExpireDays: 365
})

const ruleSaved = ref(false)
const saveRule = () => {
  ruleSaved.value = true
  ElMessage.success('积分规则保存成功')
}

const searchForm = reactive({ keyword: '', type: '' })

const tableData = ref<PointsLog[]>([])
const logLoading = ref(false)
const logTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)

const loadLogs = async (page = 1) => {
  logLoading.value = true
  try {
    const params: any = { page, pageSize: pageSize.value }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.type) params.type = searchForm.type
    const res = await getPointsLog(params)
    tableData.value = res.data.list || res.data.records || []
    logTotal.value = res.data.total || 0
  } catch (e) {
    console.log(e)
  } finally {
    logLoading.value = false
  }
}

const loadRule = async () => {
  try {
    const res = await getPointsRule()
    if (res.data) {
      Object.assign(ruleForm, res.data)
    }
  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  loadRule()
  loadLogs()
})
</script>

<template>
  <div class="points-page">
    <div class="page-header">
      <h2>积分管理</h2>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="积分规则" name="rule">
        <el-card shadow="never" style="max-width: 700px; margin: 0 auto">
          <template #header><span>积分获取规则配置</span></template>
          <el-form :model="ruleForm" label-width="140px">
            <el-divider content-position="left">注册相关</el-divider>
            <el-form-item label="注册赠送积分">
              <el-input-number v-model="ruleForm.registerPoints" :min="0" :max="1000" style="width: 200px" />
            </el-form-item>
            <el-divider content-position="left">每日签到</el-divider>
            <el-form-item label="签到奖励积分">
              <el-input-number v-model="ruleForm.loginPoints" :min="0" :max="100" style="width: 200px" />
            </el-form-item>
            <el-form-item label="每日签到上限">
              <el-input-number v-model="ruleForm.maxDailyLogin" :min="1" :max="10" style="width: 200px" /> 次
            </el-form-item>
            <el-divider content-position="left">消费相关</el-divider>
            <el-form-item label="消费积分比例">
              每消费 <el-input-number v-model="ruleForm.orderRate" :min="0.1" :step="0.1" :precision="1" style="width: 120px" /> 元 = 1 积分
            </el-form-item>
            <el-divider content-position="left">互动相关</el-divider>
            <el-form-item label="发表评价赠送">
              <el-input-number v-model="ruleForm.reviewPoints" :min="0" :max="500" style="width: 200px" /> 积分
            </el-form-item>
            <el-divider content-position="left">有效期</el-divider>
            <el-form-item label="积分有效期">
              <el-input-number v-model="ruleForm.pointsExpireDays" :min="0" :max="1095" style="width: 200px" /> 天（0 为永久有效）
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveRule">保存规则</el-button>
              <el-tag v-if="ruleSaved" type="success" style="margin-left: 12px">已保存</el-tag>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="积分流水" name="log">
        <el-card class="filter-card" shadow="never" style="margin-bottom: 16px">
          <el-form :model="searchForm" inline>
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" clearable placeholder="会员名/手机号" style="width: 200px" />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="searchForm.type" clearable placeholder="全部" style="width: 140px">
                <el-option label="签到" value="签到" />
                <el-option label="消费" value="消费" />
                <el-option label="评价" value="评价" />
                <el-option label="退款扣除" value="退款扣除" />
                <el-option label="管理员调整" value="管理员调整" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="currentPage = 1; loadLogs()"><el-icon><Search /></el-icon>查询</el-button>
              <el-button @click="searchForm.keyword = ''; searchForm.type = ''; currentPage = 1; loadLogs()"><el-icon><RefreshLeft /></el-icon>重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
          <el-table :data="tableData" border stripe v-loading="logLoading">
            <el-table-column prop="member" label="会员" width="120" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="type" label="类型" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="row.points > 0 ? 'success' : 'danger'" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="points" label="变动积分" width="120" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.points > 0 ? '#67C23A' : '#F56C6C', fontWeight: 500 }">
                  {{ row.points > 0 ? '+' : '' }}{{ row.points }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="剩余积分" width="120" align="center" />
            <el-table-column prop="remark" label="说明" min-width="200" />
            <el-table-column prop="createTime" label="时间" width="160" />
          </el-table>
          <div class="pagination-container">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="logTotal" background layout="total, sizes, prev, pager, next"
              :page-sizes="[15, 25, 35, 45]" @size-change="currentPage = 1; loadLogs()" @current-change="loadLogs" />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.points-page {
  .page-header {
    margin-bottom: 20px; padding: 0 20px;
    h2 { font-size: 20px; font-weight: 500; }
  }
  .pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
}
</style>
