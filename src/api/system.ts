import service from '@/utils/request'

/** 管理员列表 */
export const getAdminList = (params?: any) => {
  return service({ url: '/system/admin/list', method: 'get', params })
}

/** 新增/编辑管理员 */
export const saveAdmin = (data: any) => {
  return service({ url: '/system/admin/save', method: 'post', data })
}

/** 重置密码 */
export const resetAdminPassword = (data: any) => {
  return service({ url: '/system/admin/reset-password', method: 'post', data })
}

/** 角色列表 */
export const getRoleList = (params?: any) => {
  return service({ url: '/system/role/list', method: 'get', params })
}

/** 保存角色 */
export const saveRole = (data: any) => {
  return service({ url: '/system/role/save', method: 'post', data })
}

/** 权限树 */
export const getPermissionTree = () => {
  return service({ url: '/system/permission/tree', method: 'get' })
}

/** 保存角色权限 */
export const saveRolePermission = (data: any) => {
  return service({ url: '/system/role/permission/save', method: 'post', data })
}

/** 操作日志列表 */
export const getLogList = (params?: any) => {
  return service({ url: '/system/log/list', method: 'get', params })
}
