import request from '@/utils/request'

export const loginApi = (data: any) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}
export const registerApi = (data: any) => {

  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}
// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/userinfo',
    method: 'get'
  })
}
// 退出登录
export const logout = () => {
  return request({
    url: '/logout',
    method: 'post'
  })
}
