import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 基本型
// 分页查询通知
export function basicTypePage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysBasicTypeManger/page",
        method: "post",
        data
    })
}
// 新增订单/修改
export function createOrEditBasicType(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysBasicTypeManger/createOrEditBasicType",
        method: "post",
        data
    })
}
// 查看详情
export function basicTypeDetail(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysBasicTypeManger/getDetail",
        method: "post",
        data
    })
}
// 多选删除
export function basicTypeDelete(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysBasicTypeManger/deleteByOids",
        method: "post",
        data
    })
}
// 获取品名简称
export function getShortNameList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysBasicTypeManger/getShortNameList",
        method: "post",
        data
    })
}
// 格式化品名
export function getProductName(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysBasicTypeManger/getProductName",
        method: "post",
        data
    })
}
// 格式化方案编码
export function getSchemeCode(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/OptionChoiceController/getSchemeCode",
        method: "post",
        data
    })
}
//#endregion
