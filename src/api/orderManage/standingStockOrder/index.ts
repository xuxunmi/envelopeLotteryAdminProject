import request from "@/utils/https/pdm_servers"
import type * as Types from "./types"
const env = import.meta.env

//#region 常备库存订单
// 分页查询通知
export function sysOrderMangerPage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/page",
        method: "post",
        data
    })
}
// 新增订单/修改
export function createOrEditOrder(data: Types.createOrEditOrderRequestData) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/createOrEditOrder",
        method: "post",
        data
    })
}
// 多选删除
export function deleteByOids(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/deleteByOids",
        method: "post",
        data
    })
}
// 查看详情
export function getDetail(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/getDetail",
        method: "post",
        data
    })
}
// 根据Oid查询选配信息
export function getSchemeByOid(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/getSchemeByOid",
        method: "post",
        data
    })
}
// 修改配置（考虑版本）
export function editScheme(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/editScheme",
        method: "post",
        data
    })
}
// 导出勾选订单
export function exportSelectOrderList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/exportSelectOrderList",
        method: "post",
        data,
        responseType: "blob"
    })
}
// 导出全部订单
export function exportOrderList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/exportOrderList",
        method: "post",
        data,
        responseType: "blob"
    })
}
// 订单详情
export function getOrderScheme(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/getOrderScheme",
        method: "post",
        data
    })
}
// 预计划选配详情
export function getPlanOrder(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/getPlanOrder",
        method: "post",
        data
    })
}
// 新建通用产品
export function createGeneralOrder(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysGeneralManger/create",
        method: "post",
        data
    })
}
//#endregion
