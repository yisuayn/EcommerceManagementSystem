import request from '@/utils/request'

/** Banner 列表 */
export const getBannerList = (params?: any) => {
  return request({ url: '/cms/banner/list', method: 'get', params })
}

/** 保存 Banner */
export const saveBanner = (data: any) => {
  return request({ url: '/cms/banner/save', method: 'post', data })
}

/** 删除 Banner */
export const deleteBanner = (id: string) => {
  return request({ url: `/cms/banner/delete/${id}`, method: 'delete' })
}

/** 文章列表 */
export const getArticleList = (params?: any) => {
  return request({ url: '/cms/article/list', method: 'get', params })
}

/** 保存文章 */
export const saveArticle = (data: any) => {
  return request({ url: '/cms/article/save', method: 'post', data })
}

/** 删除文章 */
export const deleteArticle = (id: string) => {
  return request({ url: `/cms/article/delete/${id}`, method: 'delete' })
}
