import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取多级字典树
export function multiLevelDictionaryData(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/sysDict/page",
        method: "post",
        data
    })
}

// 新建多级字典
export function creatDictionary(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/sysDict/createOrEditCode",
        method: "post",
        data
    })
}

// 编辑多级字典
export function editDictionary(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/sysDict/modify",
        method: "post",
        data
    })
}

// 多级字典详情
export function multiLevelDictionaryDetails(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/sysDict/getDetail",
        method: "post",
        data
    })
}

// 多级字典删除
export function delDictionary(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/sysDict/deleteByOids",
        method: "post",
        data
    })
}

// 多级字典删除
export function updateDictionaryStatus(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/sysDict/modifyStatus",
        method: "post",
        data
    })
}
