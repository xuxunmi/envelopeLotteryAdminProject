import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 产品库/存储库文件夹详情
export function getDocumentPartDetails(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/getObjDetail",
        method: "post",
        data
    })
}

// 获取文档文件链接
export function previewDoc(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/previewDoc",
        method: "post",
        data
    })
}

// 产品库/存储库文件夹详情可视化图纸
export function getEPMFile(params: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/ptc1/file/getEPMFile",
        method: "get",
        params
    })
}

/**
 * @description: 物料详情：何处使用页签
 */
export function whereUseLazyData(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/topParent",
        method: "post",
        data
    })
}

/**
 * @description: 物料详情：版本历史页签
 */
export function versionHistoryData(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getWTPartHistory",
        method: "post",
        data
    })
}

/**
 * @description: 物料详情：上海整机MBOM页签
 */
export function getCompleteMachineMBOM(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getMBOM",
        method: "post",
        data
    })
}
