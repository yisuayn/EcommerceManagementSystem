import service from '@/utils/request'

/** 订单列表 */
export const getOrderList = (params?: any) => {
  return service({ url: '/order/list', method: 'get', params })
}

/** 订单发货 */
export const shipOrder = (data: any) => {
  return service({ url: '/order/ship', method: 'post', data })
}

/** 售后列表 */
export const getAfterSaleList = (params?: any) => {
  return service({ url: '/order/after-sale/list', method: 'get', params })
}

/** 审核售后 */
export const auditAfterSale = (data: any) => {
  return service({ url: '/order/after-sale/audit', method: 'post', data })
}

/** 异常列表 */
export const getExceptionList = (params?: any) => {
  return service({ url: '/order/exception/list', method: 'get', params })
}

/** 处理异常 */
export const handleException = (data: any) => {
  return service({ url: '/order/exception/handle', method: 'post', data })
}
