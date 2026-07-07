import request from '@/utils/request'

/** 交易流水列表 */
export const getTransactionList = (params?: any) => {
  return request({ url: '/finance/transaction/list', method: 'get', params })
}

/** 退款列表 */
export const getRefundList = (params?: any) => {
  return request({ url: '/finance/refund/list', method: 'get', params })
}

/** 审核退款 */
export const auditRefund = (data: any) => {
  return request({ url: '/finance/refund/audit', method: 'post', data })
}
