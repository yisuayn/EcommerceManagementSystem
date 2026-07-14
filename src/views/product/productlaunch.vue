<template>
  <div class="product-publish">
    <div class="publish-header">
      <h2>发布商品</h2>
      <div class="header-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          发布商品
        </el-button>
      </div>
    </div>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="publish-form">
      <!-- 基础信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">基础信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="productName" required>
              <el-input v-model="formData.productName" placeholder="请输入商品名称" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品英文名" prop="productNameEn">
              <el-input v-model="formData.productNameEn" placeholder="请输入商品英文名" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商品分类" prop="categoryId" required>
              <el-cascader v-model="formData.categoryId" :options="categoryOptions"
                :props="{ expandTrigger: 'hover', value: 'id', label: 'name' }" placeholder="请选择商品分类" clearable
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品牌" prop="brandId" required>
              <el-select v-model="formData.brandId" placeholder="请选择品牌" filterable clearable style="width: 100%">
                <el-option v-for="brand in brandList" :key="brand.id" :label="brand.name" :value="brand.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品单位" prop="unit">
              <el-input v-model="formData.unit" placeholder="如：件、个、盒" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商品价格" prop="price" required>
              <el-input-number v-model="formData.price" :min="0" :precision="2" :controls="false" placeholder="请输入价格"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="市场价" prop="originalPrice">
              <el-input-number v-model="formData.originalPrice" :min="0" :precision="2" :controls="false"
                placeholder="请输入市场价" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成本价" prop="costPrice">
              <el-input-number v-model="formData.costPrice" :min="0" :precision="2" :controls="false"
                placeholder="请输入成本价" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="库存" prop="stock" required>
              <el-input-number v-model="formData.stock" :min="0" :step="1" placeholder="请输入库存" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品重量" prop="weight">
              <el-input-number v-model="formData.weight" :min="0" :precision="2" placeholder="重量(g)"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品标签" prop="tags">
              <el-select v-model="formData.tags" multiple filterable allow-create default-first-option
                placeholder="请选择或输入标签" style="width: 100%">
                <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 商品属性 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">商品属性</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="上架状态" prop="status">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="上架"
                inactive-text="下架" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否热销" prop="isHot">
              <el-switch v-model="formData.isHot" :active-value="1" :inactive-value="0" active-text="是"
                inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否新品" prop="isNew">
              <el-switch v-model="formData.isNew" :active-value="1" :inactive-value="0" active-text="是"
                inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品简介" prop="summary">
          <el-input v-model="formData.summary" type="textarea" :rows="3" maxlength="200" show-word-limit
            placeholder="请输入商品简介" />
        </el-form-item>
      </el-card>

      <!-- 商品图片 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">商品图片</span>
            <span class="card-tip">建议尺寸：800*800px，支持jpg/png格式</span>
          </div>
        </template>

        <el-form-item label="商品主图" prop="mainImage" required>
          <div class="upload-container">
            <el-upload :action="uploadUrl" :headers="uploadHeaders" list-type="picture-card" :limit="5"
              :http-request="handleUpload" :on-remove="handleMainImageRemove" :before-upload="beforeUpload">
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </div>
          <div class="upload-tip">
            最多上传5张图片，支持jpg/png格式，每张不超过5MB
          </div>
        </el-form-item>

        <!-- 图片预览 -->
        <div v-if="formData.mainImage.length > 0" class="image-preview">
          <div v-for="(url, index) in formData.mainImage" :key="index" class="preview-item">
            <el-image :src="url" fit="cover" :preview-src-list="formData.mainImage" />
            <div class="preview-actions">
              <el-button type="danger" circle size="small" @click="removeImage(index)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 规格管理 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">规格管理</span>
            <el-button type="primary" link @click="addSpec">
              <el-icon>
                <Plus />
              </el-icon>
              添加规格
            </el-button>
          </div>
        </template>

        <div v-for="(spec, index) in formData.specs" :key="index" class="spec-item">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input v-model="spec.name" placeholder="规格名称（如：颜色）" />
            </el-col>
            <el-col :span="14">
              <el-select v-model="spec.values" multiple filterable allow-create default-first-option
                placeholder="规格值（如：红色、蓝色）" style="width: 100%">
                <el-option v-for="val in spec.values" :key="val" :label="val" :value="val" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="danger" link @click="removeSpec(index)">
                删除
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- SKU 列表 -->
        <div v-if="formData.specs.length > 0 && formData.skuList.length > 0" class="sku-list">
          <div class="sku-header">
            <span>SKU列表</span>
            <el-button type="primary" link @click="generateSku">
              <el-icon>
                <Refresh />
              </el-icon>
              重新生成SKU
            </el-button>
          </div>
          <el-table :data="formData.skuList" border>
            <el-table-column v-for="spec in formData.specs" :key="spec.name" :prop="spec.name" :label="spec.name"
              width="120" />
            <el-table-column label="价格" width="150">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0" :precision="2" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="150">
              <template #default="{ row }">
                <el-input-number v-model="row.stock" :min="0" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="SKU编码" width="180">
              <template #default="{ row }">
                <el-input v-model="row.skuCode" size="small" placeholder="自动生成" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- 商品详情（TipTap 编辑器） -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">商品详情</span>
          </div>
        </template>

        <el-form-item label="商品详情" prop="detailHtml">
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button size="small" @click="editor?.chain().focus().toggleBold().run()"
                  :type="editor?.isActive('bold') ? 'primary' : 'default'">
                  <strong>B</strong>
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().toggleItalic().run()"
                  :type="editor?.isActive('italic') ? 'primary' : 'default'">
                  <em>I</em>
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().toggleStrike().run()"
                  :type="editor?.isActive('strike') ? 'primary' : 'default'">
                  <s>S</s>
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().toggleCode().run()"
                  :type="editor?.isActive('code') ? 'primary' : 'default'">
                  &lt;/&gt;
                </el-button>
              </el-button-group>

              <el-button-group>
                <el-button size="small" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
                  :type="editor?.isActive('heading', { level: 1 }) ? 'primary' : 'default'">
                  H1
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
                  :type="editor?.isActive('heading', { level: 2 }) ? 'primary' : 'default'">
                  H2
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
                  :type="editor?.isActive('heading', { level: 3 }) ? 'primary' : 'default'">
                  H3
                </el-button>
              </el-button-group>

              <el-button-group>
                <el-button size="small" @click="editor?.chain().focus().toggleBulletList().run()"
                  :type="editor?.isActive('bulletList') ? 'primary' : 'default'">
                  无序列表
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().toggleOrderedList().run()"
                  :type="editor?.isActive('orderedList') ? 'primary' : 'default'">
                  有序列表
                </el-button>
              </el-button-group>

              <el-button-group>
                <el-button size="small" @click="editor?.chain().focus().toggleBlockquote().run()"
                  :type="editor?.isActive('blockquote') ? 'primary' : 'default'">
                  引用
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().setHorizontalRule().run()">
                  分割线
                </el-button>
              </el-button-group>

              <el-button-group>
                <el-button size="small" @click="addImage">
                  <el-icon>
                    <Picture />
                  </el-icon>
                  图片
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().undo().run()">
                  撤销
                </el-button>
                <el-button size="small" @click="editor?.chain().focus().redo().run()">
                  重做
                </el-button>
              </el-button-group>
            </div>
            <EditorContent :editor="editor" class="editor-content" />
          </div>
        </el-form-item>
      </el-card>

      <!-- SEO信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">SEO信息</span>
          </div>
        </template>

        <el-form-item label="SEO标题" prop="seoTitle">
          <el-input v-model="formData.seoTitle" placeholder="请输入SEO标题" maxlength="60" show-word-limit />
        </el-form-item>

        <el-form-item label="SEO关键词" prop="seoKeywords">
          <el-input v-model="formData.seoKeywords" placeholder="请输入SEO关键词，多个关键词用英文逗号分隔" maxlength="100"
            show-word-limit />
        </el-form-item>

        <el-form-item label="SEO描述" prop="seoDescription">
          <el-input v-model="formData.seoDescription" type="textarea" :rows="2" maxlength="200" show-word-limit
            placeholder="请输入SEO描述" />
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Refresh, Picture } from '@element-plus/icons-vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { publishProduct } from '@/api/product'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)

// 表单数据
interface ProductForm {
  productName: string
  productNameEn: string
  categoryId: number[]
  brandId: number
  unit: string
  price: number
  originalPrice: number
  costPrice: number
  stock: number
  weight: number
  tags: string[]
  status: number
  isHot: number
  isNew: number
  summary: string
  mainImage: string[]
  specs: any[]
  skuList: any[]
  detailHtml: string
  seoTitle: string
  seoKeywords: string
  seoDescription: string
}

const formData = reactive<ProductForm>({
  productName: '',
  productNameEn: '',
  categoryId: [],
  brandId: 0,
  unit: '',
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  stock: 0,
  weight: 0,
  tags: [],
  status: 1,
  isHot: 0,
  isNew: 0,
  summary: '',
  mainImage: [],
  specs: [],
  skuList: [],
  detailHtml: '',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: ''
})

// 表单验证规则
const formRules = {
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  brandId: [
    { required: true, message: '请选择品牌', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ],
  mainImage: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ]
}

// 分类数据
const categoryOptions = ref([
  { id: 1, name: '服装', children: [{ id: 11, name: '男装' }, { id: 12, name: '女装' }] },
  { id: 2, name: '数码', children: [{ id: 21, name: '手机' }, { id: 22, name: '电脑' }] },
  { id: 3, name: '食品', children: [{ id: 31, name: '零食' }, { id: 32, name: '饮料' }] }
])

const brandList = ref([
  { id: 1, name: '苹果' },
  { id: 2, name: '华为' },
  { id: 3, name: '小米' },
  { id: 4, name: '耐克' },
  { id: 5, name: '阿迪达斯' }
])

const tagOptions = ref(['热卖', '新品', '限时优惠', '包邮', '爆款', '推荐'])

// TipTap 编辑器配置
const editor = useEditor({
  content: formData.detailHtml,
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Placeholder.configure({
      placeholder: '请输入商品详情...',
    }),
  ],
  onUpdate: ({ editor }) => {
    formData.detailHtml = editor.getHTML()
  },
})

// 添加图片到编辑器
const addImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (file) {
      // 这里需要上传图片到服务器，获取URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        editor?.chain().focus().setImage({ src: url }).run()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 上传配置
const uploadUrl = '/api/upload'
const uploadHeaders = { 'Authorization': 'Bearer ' + localStorage.getItem('token') }

// 图片上传前校验
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 自定义上传（本地读取为 base64，不依赖后端）
const handleUpload = (options: any) => {
  const file = options.file
  const reader = new FileReader()
  reader.onload = (e: any) => {
    formData.mainImage.push(e.target.result)
    ElMessage.success('上传成功')
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败')
  }
  reader.readAsDataURL(file)
}

// 主图删除
const handleMainImageRemove = (uploadFile: any) => {
  const index = formData.mainImage.indexOf(uploadFile.url)
  if (index > -1) {
    formData.mainImage.splice(index, 1)
  }
}

// 删除图片
const removeImage = (index: number) => {
  formData.mainImage.splice(index, 1)
}

// 添加规格
const addSpec = () => {
  formData.specs.push({ name: '', values: [] })
}

// 删除规格
const removeSpec = (index: number) => {
  formData.specs.splice(index, 1)
  generateSku()
}

// 生成SKU
const generateSku = () => {
  const specs = formData.specs.filter(s => s.name && s.values.length)
  if (specs.length === 0) {
    formData.skuList = []
    return
  }

  const generateCombinations = (specs: any[], index = 0, current: any[] = []): any[] => {
    if (index === specs.length) {
      const sku: any = {}
      specs.forEach((spec, i) => {
        sku[spec.name] = current[i]
      })
      sku.price = formData.price
      sku.stock = 0
      sku.skuCode = ''
      return [sku]
    }
    const combinations: any[] = []
    for (const value of specs[index].values) {
      combinations.push(...generateCombinations(specs, index + 1, [...current, value]))
    }
    return combinations
  }

  formData.skuList = generateCombinations(specs)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 构建提交数据
    const submitData = {
      ...formData,
      categoryId: formData.categoryId[formData.categoryId.length - 1],
      skuList: formData.skuList.filter(sku => sku.price > 0),
      detailHtml: formData.detailHtml
    }

    console.log('提交数据:', submitData)

    // 调用API
    await publishProduct(submitData)

    ElMessage.success('商品发布成功！')
    setTimeout(() => {
      router.push('/product/list')
    }, 1500)
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请完善表单信息')
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消发布吗？填写的内容将不会保存', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.back()
  }).catch(() => { })
}

// 组件卸载时销毁编辑器
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped lang="scss">
.product-publish {
  min-height: 100vh;

  .publish-header {
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
  }

  .publish-form {
    .form-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }

        .card-tip {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .upload-container {
      :deep(.el-upload--picture-card) {
        width: 100px;
        height: 100px;
      }
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }

    .image-preview {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;

      .preview-item {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 8px;
        overflow: hidden;

        .el-image {
          width: 100%;
          height: 100%;
        }

        .preview-actions {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        &:hover .preview-actions {
          opacity: 1;
        }
      }
    }

    .spec-item {
      margin-bottom: 16px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
    }

    .sku-list {
      margin-top: 20px;

      .sku-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
      }
    }

    .editor-container {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;

      .editor-toolbar {
        padding: 8px;
        border-bottom: 1px solid #dcdfe6;
        background: #f5f7fa;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .editor-content {
        min-height: 400px;
        padding: 16px;

        :deep(.ProseMirror) {
          outline: none;
          min-height: 400px;

          p {
            margin: 0 0 0.5em 0;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          ul,
          ol {
            padding-left: 1.5em;
          }

          blockquote {
            border-left: 3px solid #409eff;
            padding-left: 1em;
            margin: 0.5em 0;
            color: #666;
          }

          pre {
            background: #f5f7fa;
            padding: 0.5em;
            border-radius: 4px;

            code {
              background: none;
            }
          }

          code {
            background: #f5f7fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
          }

          .is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
          }
        }
      }
    }
  }
}
</style>
