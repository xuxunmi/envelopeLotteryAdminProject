import request from "@/utils/https/pdm_servers"
const env = import.meta.env

/**
 * @description:获取流程列表
 */
export function getProcessList(params: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/model/manage/modelLists",
        method: "get",
        params
    })
}

/**
 * @description:流程定义发布
 */
export function processRelease(params: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/model/manage/deploy",
        method: "get",
        params
    })
}

/**
 * @description:获取流程模板
 */
export function getFlowathTemplate(params: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/model/manage/getPIList",
        method: "get",
        params
    })
}

/**
 * @description:根据流程模板获取流程节点列表
 */
export function processNodeList(params: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/activiti-explorer/model/allNode",
        method: "get",
        params
    })
}

/**
 * @description:流程提交
 */
export function processSubmit(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/task/manage/submit",
        method: "post",
        data
    })
}
