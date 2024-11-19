import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region BOM比较
// 获取版本下拉
export function getAllVerAndIter(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getAllVerAndIter",
        method: "post",
        data
    })
}
// 根据编号、大版本、小版本查询物料
export function getPartByNoAndVersionIteration(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getPartByNoAndVersionIteration",
        method: "post",
        data
    })
}
// 获取物料关联基线
export function getBaseLines(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getBaseLines",
        method: "post",
        data
    })
}
// bom比较
export function getBomCompareInfo(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getBomCompareInfo",
        method: "post",
        data
    })
}

// BOM比较结果导出
export function exportBomCompareInfo(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/exportBomCompareInfo",
        method: "post",
        data,
        responseType: "blob"
    })
}
//#endregion
