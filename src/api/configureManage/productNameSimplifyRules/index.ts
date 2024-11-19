import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 品名简化规则
// 分页查询
export function productNameRulePage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysProductNameRuleManger/page",
        method: "post",
        data
    })
}
// 新增/修改
export function productNameRuleCreateOrEdit(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysProductNameRuleManger/createOrEdit",
        method: "post",
        data
    })
}
// 查看详情
export function productNameRuleDetail(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysProductNameRuleManger/getDetail",
        method: "post",
        data
    })
}
// 多选删除
export function productNameRuleDelete(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysProductNameRuleManger/deleteByOids",
        method: "post",
        data
    })
}
//#endregion
