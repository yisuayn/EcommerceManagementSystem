import request from '@/utils/request'

/** 会员列表 */
export const getMemberList = (params?: any) => {
  return request({ url: '/member/list', method: 'get', params })
}

/** 会员详情 */
export const getMemberDetail = (id: string) => {
  return request({ url: `/member/detail/${id}`, method: 'get' })
}

/** 新增/编辑会员 */
export const saveMember = (data: any) => {
  return request({ url: '/member/save', method: 'post', data })
}

/** 会员等级列表 */
export const getLevelList = (params?: any) => {
  return request({ url: '/member/level/list', method: 'get', params })
}

/** 保存会员等级 */
export const saveLevel = (data: any) => {
  return request({ url: '/member/level/save', method: 'post', data })
}

/** 积分规则 */
export const getPointsRule = () => {
  return request({ url: '/member/points/rule', method: 'get' })
}

/** 积分流水 */
export const getPointsLog = (params?: any) => {
  return request({ url: '/member/points/log', method: 'get', params })
}
