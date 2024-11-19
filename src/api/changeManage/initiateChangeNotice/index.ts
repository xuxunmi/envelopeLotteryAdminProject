import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取我发起的/发给我的列表
export function getChangeNoticeList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysNoticeManger/page",
        method: "post",
        data
    })
}

// 创建/编辑变更通知
export function createOrEditNotice(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysNoticeManger/createOrEditNotice",
        method: "post",
        data
    })
}

// 发起变更通知详情
export function changeNoticeDetail(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysNoticeManger/getDetail",
        method: "post",
        data
    })
}

// 我发起的删除
export function changeNoticeDelete(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysNoticeManger/deleteByOids",
        method: "post",
        data
    })
}

// 发给我的标记已读
export function changeNoticeMarkRead(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysNoticeManger/markNotice",
        method: "post",
        data
    })
}
