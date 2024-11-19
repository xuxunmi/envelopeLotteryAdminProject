import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 企业特征库接口
// 特征库名称接口
export function getFeatureNames() {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/getFeatureNames",
        method: "post"
    })
}
// 特征库树-懒加载
export function getFeatureTree(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/getFeatureTree",
        method: "post",
        data
    })
}
// 新建/编辑组
export function addOptionChoiceGroup(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/addOptionChoiceGroup",
        method: "post",
        data
    })
}
// 新建/编辑特征
export function addOrUpdateOption(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/addOrUpdateOption",
        method: "post",
        data
    })
}
// 新建/编辑特征值
export function addOrUpdateChoice(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/addOrUpdateChoice",
        method: "post",
        data
    })
}
// 批量新建特征值
export function addBatchChoice(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/addBatchChoice",
        method: "post",
        data
    })
}
// 特征列表
export function getOptionList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/getOptionList",
        method: "post",
        data
    })
}
// 导出特征列表
export function exportOptionList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/exportOptionList",
        method: "post",
        data,
        responseType: "blob"
    })
}
// 获取特征流水码
export function getChoiceNextCode(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/OptionChoiceController/getChoiceNextCode",
        method: "post",
        data
    })
}
// 大删除接口--（组/特征/特征值）
export function delOptionChoiceServices(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/delOptionChoiceServices",
        method: "post",
        data
    })
}
// 分配到组
export function allocationOptionToGroup(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/allocationOptionToGroup",
        method: "post",
        data
    })
}
// 组织下拉
export function getOptionChoiceGroupList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/getOptionChoiceGroupList",
        method: "post",
        data
    })
}
// 特征值-使用情况接口—返回四个列表
export function getChoiceUsage(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/getChoiceUsage",
        method: "post",
        data
    })
}
// 查看信息(特征/特征值)
export function getObjectInfo(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/getObjectInfo",
        method: "post",
        data
    })
}
// 同步特征到中间表
export function syncOrgProductConfig(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/OccUpdateController/syncOrgProductConfig",
        method: "post",
        data
    })
}

// 同步特征到U9
export function codeFeatureSync(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/openapi/u9/codeFeatureSync",
        method: "post",
        data
    })
}
// 特征值上移/下移保存
export function choiceSetOrderSave(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/saveConfigurationSeq",
        method: "post",
        data
    })
}
//#endregion
