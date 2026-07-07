import service from "@/utils/request";
export const productApi = (params?: any) => {
  return service({
    url: '/admin/list',
    method: 'get',
    params: params  // 👈 关键：把参数传给 axios
  })
}
