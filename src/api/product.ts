import service from '@/utils/request'

/** 商品列表 */
export const productApi = (params?: any) => {
  return service({ url: '/admin/list', method: 'get', params })
}

/** 发布商品 */
export const publishProduct = (data: any) => {
  return service({ url: '/product/publish', method: 'post', data })
}

/** 保存/编辑商品 */
export const saveProduct = (data: any) => {
  return service({ url: '/product/save', method: 'post', data })
}
