import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 用户权限
export function getUserAuthorization(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getUserAuthorization",
        method: "post",
        data
    })
}
// 大前台返回用户的工厂角色
export function getRoleInfoByAccount(data: any) {
    return request({
        url: env.VUE_APP_SYSTEM + "/sys/users/getRoleInfoByAccount/" + data.employeeNo,
        method: "post"
    })
}
// 获取模糊查询物料
export function getPartList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getPartList",
        method: "post",
        data
    })
}
// 获取物料BOM信息
export function getMaterialList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getMaterialList",
        method: "post",
        data
    })
}
// 获取物料文档信息
export function getMaterialDocumentList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getMaterialDocumentList",
        method: "post",
        data
    })
}
// 获取物料详细信息
export function getMaterialDetail(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getMaterialDetail",
        method: "post",
        data
    })
}
// 获取物料历史信息
export function getMaterialHistory(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getMaterialHistory",
        method: "post",
        data
    })
}
// 获取物料相关变更
export function getMaterialChange(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getMaterialChange",
        method: "post",
        data
    })
}
// BOM比较
export function getBomCompareInfo(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/KbomRest/getBomCompareInfo",
        method: "post",
        data
    })
}

// 获取用户角色
export function searchUserRoles(data: any) {
    return request({
        url: env.VUE_APP_SYSTEM + "/sys/extapi/role/" + data.userId,
        method: "post",
        data
    })
}
