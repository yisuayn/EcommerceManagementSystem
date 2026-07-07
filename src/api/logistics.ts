import request from '@/utils/request'

/** 运费模板列表 */
export const getFreightTemplateList = (params?: any) => {
  return request({ url: '/logistics/template/list', method: 'get', params })
}

/** 保存运费模板 */
export const saveFreightTemplate = (data: any) => {
  return request({ url: '/logistics/template/save', method: 'post', data })
}

/** 删除运费模板 */
export const deleteFreightTemplate = (id: string) => {
  return request({ url: `/logistics/template/delete/${id}`, method: 'delete' })
}

/** 物流公司列表 */
export const getCompanyList = (params?: any) => {
  return request({ url: '/logistics/company/list', method: 'get', params })
}

/** 保存物流公司 */
export const saveCompany = (data: any) => {
  return request({ url: '/logistics/company/save', method: 'post', data })
}

/** 物流追踪查询 */
export const getTrackingInfo = (trackingNo: string) => {
  return request({ url: `/logistics/tracking/${trackingNo}`, method: 'get' })
}
