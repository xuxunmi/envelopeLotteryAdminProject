import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 裁剪设置
// 导出模板
export function exportTemplate() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/exportTemplate",
        method: "post",
        responseType: "blob", // 接收二进制流
    })
}
// 上传
export function uploadTrimMethodExcel(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/uploadTrimMethodExcel",
        method: "post",
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}
// 修改裁剪方式
export function editTrimMethodPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/editTrimMethodPart",
        method: "post",
        data
    })
}
//#endregion
