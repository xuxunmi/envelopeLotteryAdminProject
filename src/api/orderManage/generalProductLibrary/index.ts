import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 通用产品库
// 分页查询
export function generalMangerPage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/page",
        method: "post",
        data
    })
}
// 新建->查找添加分页接口
export function sysGeneralMangerSchedulePage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/schedulePage",
        method: "post",
        data
    })
}
// 新增/修改
export function insertGenerals(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/insertGenerals",
        method: "post",
        data
    })
}
// 获取规则
export function getGeneralRule() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/getGeneralRule",
        method: "post",
    })
}
// 修改规则
export function editGeneralRule(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/editGeneralRule",
        method: "post",
        data
    })
}
// 多选删除/禁用
export function generalMangerDelete(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/deleteByOids",
        method: "post",
        data
    })
}
// 查看详情
export function generalMangerDetail(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/getDetail",
        method: "post",
        data
    })
}
//#endregion
