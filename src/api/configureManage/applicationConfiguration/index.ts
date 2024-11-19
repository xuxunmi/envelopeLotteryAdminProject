import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 应用配置
// 根据物料获取选配界面特征、特征值接口
export function getOptionListOfPartApply(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/getOptionListOfPart",
        method: "post",
        data
    })
}
// 预览BOM
export function previewBOM(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/previewBOM",
        method: "post",
        data
    })
}
// 保存选配方案
export function saveScheme(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/saveScheme",
        method: "post",
        data
    })
}
// 获取颜色数据
export function getColorDetails(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/getColorDetails",
        method: "post",
        data
    })
}
//#endregion
