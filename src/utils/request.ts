import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  config => {
    const token =
      localStorage.getItem('token')

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }
    return config
  },(error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {return response.data},
  (error) => {
    // 统一处理错误
    const message = error.response?.data?.message || error.message || '请求失败'
    
    // 可以根据状态码做不同处理
    switch (error.response?.status) {
      case 401:
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token')
        window.location.href = '/login'
        break
      case 403:
        ElMessage?.error('没有权限访问')
        break
      case 404:
        ElMessage?.error('请求的资源不存在')
        break
      case 500:
        ElMessage?.error('服务器错误')
        break
      default:
        ElMessage?.error(message)
    }
    
    return Promise.reject(error)}
)

export default service