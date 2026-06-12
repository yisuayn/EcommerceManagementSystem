import service from "@/utils/request";
export const productApi = () => {
    return service({
        url: '/admin/list',
        method: 'get',
    })
}