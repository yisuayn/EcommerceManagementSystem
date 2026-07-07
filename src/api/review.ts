import request from '@/utils/request'

/** 评价列表 */
export const getReviewList = (params?: any) => {
  return request({ url: '/review/list', method: 'get', params })
}

/** 审核评价 */
export const auditReview = (data: any) => {
  return request({ url: '/review/audit', method: 'post', data })
}

/** 回复评价 */
export const replyReview = (data: any) => {
  return request({ url: '/review/reply', method: 'post', data })
}

/** 删除评价 */
export const deleteReview = (id: string) => {
  return request({ url: `/review/delete/${id}`, method: 'delete' })
}
