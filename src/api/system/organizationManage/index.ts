import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取组织管理列表
export function getOrganizationManageData(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getProductAndGroupList",
        method: "post",
        data
    })
}

// 新增组织
export function creatOrganization(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/createProductAndGroup",
        method: "post",
        data
    })
}

// 编辑组织
export function updateOrganization(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/editProductAndGroup",
        method: "post",
        data
    })
}

// 删除组织
export function deleteOrganization(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delProduct",
        method: "post",
        data
    })
}
