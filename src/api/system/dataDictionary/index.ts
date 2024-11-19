import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取字典列表
export function getDataDictionaryList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysCodeManger/page",
        method: "post",
        data
    })
}

// 字典详情
export function dataDictionaryDetail(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysCodeManger/getDetail",
        method: "post",
        data
    })
}

// 新增/编辑字典列表
export function dataDictionaryAddEdit(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysCodeManger/createOrEditCode",
        method: "post",
        data
    })
}

// 字典列表删除
export function dataDictionaryDelete(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysCodeManger/deleteByOids",
        method: "post",
        data
    })
}

// 获取数据字典公共下拉数据
export function getDictionarySelect(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysCodeManger/getDetailsByCodes",
        method: "post",
        data
    })
}

/**
 * @description:明细上移/下移
 */
export function detailTableMove(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysCodeManger/moveCode",
        method: "post",
        data
    })
}
