import service from "@/utils/request";
export const dashboardApi = () => {
    return service({
        url: '/getsaledata',
        method: 'get',
    })
}