import request from '@/utils/request'

/** 通知模板列表 */
export const getTemplateList = (params?: any) => {
  return request({ url: '/notification/template/list', method: 'get', params })
}

/** 保存通知模板 */
export const saveTemplate = (data: any) => {
  return request({ url: '/notification/template/save', method: 'post', data })
}

/** 发送记录列表 */
export const getSendLogList = (params?: any) => {
  return request({ url: '/notification/log/list', method: 'get', params })
}

/** 发送通知 */
export const sendNotification = (data: any) => {
  return request({ url: '/notification/send', method: 'post', data })
}
