import request from "@/utils/https/pdm_servers"
const env = import.meta.env

/**
 * @description:获取颜色档案列表-分页
 */
export function getColorProfileList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/page",
        method: "post",
        data
    })
}

/**
 * @description:获取颜色档案列表-不分页所有数据
 */
export function getColorProfileAllList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/list",
        method: "post",
        data
    })
}

// 颜色档案详情
export function colorProfileDetail(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/getDetail",
        method: "post",
        data
    })
}

// 新增/编辑颜色档案列表
export function colorProfileAddEdit(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/createOrEdit",
        method: "post",
        data
    })
}

// 颜色档案删除
export function colorProfileDelete(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/deleteByOids",
        method: "post",
        data
    })
}

// 获取颜色编码
export function getColorCode(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/getColorCode",
        method: "post",
        data
    })
}

// 同步颜色档案
export function colorProfileSync(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/openapi/u9/codeColorSync",
        method: "post",
        data
    })
}

// 同步颜色档案-project
export function colorProjectSync(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/openapi/u9/colorProjectSync",
        method: "post",
        data
    })
}
