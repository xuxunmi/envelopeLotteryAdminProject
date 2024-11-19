import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取物料快速查询列表
export function searchPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/searchPart",
        method: "post",
        data
    })
}

/**
 * 获取物料高级查询列表
 * typeInner、oid、type、parentNumber、version字段不能排序
 */
export function advancedSearchPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/advancedSearchPart",
        method: "post",
        data
    })
}

// 快速查询
export function quickQuerySearchPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/quickQuery",
        method: "post",
        data
    })
}

// 快速查询/高级查询物料导出
export function advancedSearchExportParts(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/exportAdvancedPart",
        method: "post",
        data,
        responseType: "blob"
    })
}

// 高级查询全部物料导出
export function advancedSearchExportAllParts(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/exportAllAdvancedPart",
        method: "post",
        data,
        responseType: "blob"
    })
}

// 快速查询全部物料导出
export function exportQuickAllAdvancedPart(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/exportQuickAllAdvancedPart",
        method: "post",
        data,
        responseType: "blob"
    })
}
