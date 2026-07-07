<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

interface Level {
  id: string
  name: string
  icon: string
  minPoints: number
  discount: number
  benefits: string[]
  status: number
}

const tableData = ref<Level[]>([
  { id: '1', name: '普通会员', icon: '⭐', minPoints: 0, discount: 100, benefits: ['基础权益', '生日礼品'], status: 1 },
  { id: '2', name: '银卡会员', icon: '🥈', minPoints: 1000, discount: 95, benefits: ['基础权益', '生日礼品', '95折优惠', '免费包邮'], status: 1 },
  { id: '3', name: '金卡会员', icon: '🥇', minPoints: 5000, discount: 90, benefits: ['基础权益', '生日礼品', '9折优惠', '免费包邮', '专属客服'], status: 1 },
  { id: '4', name: '钻石会员', icon: '💎', minPoints: 20000, discount: 85, benefits: ['基础权益', '生日礼品', '85折优惠', '免费包邮', '专属客服', 'VIP通道'], status: 1 }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = reactive({
  name: '',
  minPoints: 0,
  discount: 100,
  benefits: '',
  status: 1
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, { name: '', minPoints: 0, discount: 100, benefits: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row: Level) => {
  isEdit.value = true
  Object.assign(formData, {
    name: row.name,
    minPoints: row.minPoints,
    discount: row.discount,
    benefits: row.benefits.join('、'),
    status: row.status
  })
  dialogVisible.value = true
}

const handleSave = () => {
  ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
  dialogVisible.value = false
}

const handleDelete = (row: Level) => {
  ElMessageBox.confirm(`确认删除等级「${row.name}」吗？`, '提示', {
    confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<template>
  <div class="level-page">
    <div class="page-header">
      <h2>会员等级</h2>
      <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增等级</el-button>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :xs="24" :sm="12" :md="6" v-for="lv in tableData" :key="lv.id">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div style="text-align: center">
            <div style="font-size: 36px; margin-bottom: 8px">{{ lv.icon }}</div>
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 4px">{{ lv.name }}</div>
            <div style="font-size: 12px; color: #909399; margin-bottom: 12px">需 {{ lv.minPoints }} 积分</div>
            <div style="font-size: 13px; color: #606266">
              <div v-for="b in lv.benefits" :key="b" style="margin: 4px 0">· {{ b }}</div>
            </div>
            <el-tag v-if="lv.discount < 100" type="danger" size="small" style="margin-top: 8px">
              {{ lv.discount / 10 }}折
            </el-tag>
            <el-tag v-else type="info" size="small" style="margin-top: 8px">无折扣</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card" shadow="never">
      <template #header><span>等级配置列表</span></template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="等级名称" width="150" />
        <el-table-column prop="minPoints" label="所需积分" width="120" align="center" />
        <el-table-column prop="discount" label="折扣率" width="120" align="center">
          <template #default="{ row }">{{ row.discount / 10 }}折</template>
        </el-table-column>
        <el-table-column prop="benefits" label="权益" min-width="300">
          <template #default="{ row }">
            <el-tag v-for="b in row.benefits" :key="b" size="small" style="margin: 2px 4px 2px 0">{{ b }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" size="small" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑等级' : '新增等级'" width="550px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="等级名称" required>
          <el-input v-model="formData.name" placeholder="如：金卡会员" />
        </el-form-item>
        <el-form-item label="所需积分" required>
          <el-input-number v-model="formData.minPoints" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="折扣率" required>
          <el-slider v-model="formData.discount" :min="0" :max="100" show-input />
          <div style="font-size: 12px; color: #909399; margin-top: 4px">当前折扣：{{ formData.discount / 10 }}折</div>
        </el-form-item>
        <el-form-item label="权益描述">
          <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="权益内容，用顿号分隔" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.level-page {
  .page-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding: 0 20px;
    h2 { font-size: 20px; font-weight: 500; }
  }
  .table-card { border-radius: 8px; }
}
</style>
