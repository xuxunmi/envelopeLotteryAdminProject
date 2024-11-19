import request from "@/utils/https/pdm_servers"
const env = import.meta.env

/**
 * @description:获取颜色件管理列表
 */
export function getColorComponentManageList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/colorPartPage",
        method: "post",
        data
    })
}

/**
 * @description:颜色件管理添加物料
 */
export function colorComponentManageAddMaterial(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/createColorPart",
        method: "post",
        data
    })
}

/**
 * @description:颜色件管理删除物料
 */
export function colorComponentManageDelete(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/deleteColorPartOids",
        method: "post",
        data
    })
}

// 导出模板
export function downColorPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/downColorPart",
        method: "post",
        data,
        responseType: "blob", // 接收二进制流
    })
}
// 上传
export function uploadColorPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/uploadColorPart",
        method: "post",
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}
// 颜色导入模板下载
export function getTemplate() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/getTemplate",
        method: "post",
        responseType: "blob", // 接收二进制流
    })
}
