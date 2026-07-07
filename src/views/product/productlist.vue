<script setup lang="ts">
import { onMounted, ref, reactive } from "vue"
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { productApi } from "@/api/product"

interface User {
  id: string
  skuCode: string
  productName: string
  productNameEn: string
  brandName: string
  price: number
  originalPrice: number
  costPrice: number
  stock: number
  soldCount: number
  rating: number
  ratingCount: number
  summary: string
  viewCount: number
  status: number
  isHot: number
  isNew: number
}

const currentRow = ref<User | null>(null)
// ✅ 正确：函数定义时接收参数
const handleEditClick = (row: User) => {
  currentRow.value = row
  Object.assign(formData, row)
  drawer.value = true
}
// const handleEditClick = (row: User) => {//点击操作表格
//     console.log('Edit clicked:', row)
// }

const filterTag = (value: string, row: User) => {
  // return row.tag === value
}

const tableData = ref<User[]>([])
const total = ref(0)
const loading = ref(false)
// 分页设置代码
const currentPage = ref(1)
const pageSize = ref(15) // 改成和接口一致
const size = ref<ComponentSize>('default')
const disabled = ref(false)
const drawer = ref(false)

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  getproductlist(currentPage.value, val)
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getproductlist(val, pageSize.value)
  console.log(`current page: ${val}`)
}
const getproductlist = async (page = 1, pageSize = 15) => {//发送请求获取数据
  loading.value = true
  try {
    const res = await productApi({
      page: page,
      pageSize: pageSize
    })
    tableData.value = res.data.list
    total.value = res.data.total || 0
  } catch (error) {
    console.log(error);
  }
}
onMounted(() => {
  getproductlist(currentPage.value, pageSize.value)
})
//数据表单操作
const formRef = ref<FormInstance>()
// ✅ 使用 User 类型定义表单数据
const formData = reactive<User>({
  id: '',
  skuCode: '',
  productName: '',
  productNameEn: '',
  brandName: '',
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  stock: 0,
  soldCount: 0,
  rating: 0,
  ratingCount: 0,
  summary: '',
  viewCount: 0,
  status: 0,
  isHot: 0,
  isNew: 0
})
// 表单验证规则
const formRules: FormRules = {
  skuCode: [
    { required: true, message: '请输入SKU编码', trigger: 'blur' }
  ],
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ]
}
</script>

<template>
  <div class="productlist">
    <el-table :data="tableData" style="width: 100%">
      <!-- <el-table-column type="selection" width="55" /> -->
      <!-- @vue-generic {User} -->
      <el-table-column property="skuCode" fixed label="sku编码" width="100" show-overflow-tooltip />
      <el-table-column property="brandName" label="品牌名" width="100"></el-table-column>
      <el-table-column property="productName" label="产品名字" width="200" show-overflow-tooltip />
      <el-table-column property="price" label="价格" />
      <el-table-column property="originalPrice" label="原价" />
      <el-table-column property="isHot" label="是否热门" />
      <el-table-column property="stock" label="库存" />
      <el-table-column property="soldCount" label="销售量" />
      <el-table-column prop="tag" label="标签" width="100" :filters="[
        { text: 'Home', value: 'Home' },
        { text: 'Office', value: 'Office' },
      ]" :filter-method="filterTag" filter-placement="bottom-end">
        <template #default="scope">
          <el-tag :type="scope.row.tag === 'Home' ? 'primary' : 'success'" disable-transitions>{{
            scope.row.tag
            }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEditClick(scope.row)">
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click="handleEditClick(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer v-model="drawer" size="50%">
      <div class="drawer-content">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
          <el-row :gutter="20">
            <el-col>
              <el-form-item label="商品编码" prop="id">
                <el-input v-model="formData.id" placeholder="请输入SKU编码" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="SKU编码" prop="skuCode">
                <el-input v-model="formData.skuCode" placeholder="请输入SKU编码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="品牌名称" prop="brandName">
                <el-input v-model="formData.brandName" placeholder="请输入品牌名称" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品名称" prop="productName">
                <el-input v-model="formData.productName" placeholder="请输入产品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品英文名" prop="productNameEn">
                <el-input v-model="formData.productNameEn" placeholder="请输入产品英文名" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="价格" prop="price">
                <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="原价" prop="originalPrice">
                <el-input-number v-model="formData.originalPrice" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成本价" prop="costPrice">
                <el-input-number v-model="formData.costPrice" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="库存" prop="stock">
                <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="销量" prop="soldCount">
                <el-input-number v-model="formData.soldCount" :min="0" style="width: 100%" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="浏览量" prop="viewCount">
                <el-input-number v-model="formData.viewCount" :min="0" style="width: 100%" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="评分" prop="rating">
                <el-rate v-model="formData.rating" :max="5" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="评价数" prop="ratingCount">
                <el-input-number v-model="formData.ratingCount" :min="0" style="width: 100%" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态" prop="status">
                <el-select v-model="formData.status" style="width: 100%">
                  <el-option :value="1" label="上架" />
                  <el-option :value="0" label="下架" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="是否热销" prop="isHot">
                <el-switch v-model="formData.isHot" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否新品" prop="isNew">
                <el-switch v-model="formData.isNew" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="商品简介" prop="summary">
            <el-input v-model="formData.summary" type="textarea" :rows="4" placeholder="请输入商品简介" />
          </el-form-item>
        </el-form>

        <!-- 底部按钮 -->
        <div class="drawer-footer">
          <el-button @click="drawer = false">取消</el-button>
          <el-button type="primary">
            保存
          </el-button>
        </div>
      </div>
    </el-drawer>
    <div class="demo-pagination-block">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[15, 25, 35, 45]"
        :size="size" :disabled="disabled" background layout="sizes, prev, pager, next" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.productlist {
  position: relative;
  height: 100%;

  .demo-pagination-block {
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .el-table {
    height: calc(100% - 35px);
    overflow-y: scroll;
  }

  // 表格滚动条样式
  .el-table::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
}
</style>
