import request from "@/utils/https/pdm_servers"
const env = import.meta.env

/**
 * @description:获取首页待我审批列表
 */
export function getPendingApproveData(params: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/task/manage/todoList",
        method: "get",
        params
    })
}

/**
 * @description:获取首页我发起列表
 */
export function getInitiatedProcessListData(params: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/task/manage/traceTaskList",
        method: "get",
        params
    })
}

// /**
//  * @description:获取任务视图url
//  */
// export function getTaskTraceProcess(params: object) {
//     return request({
//         url: "/workflow/task/manage/traceProcess",
//         // url: env.VITE_APP_PDM + "/servlet/rest/workflow/task/manage/submit",
//         method: "get",
//         responseType: "blob",
//         params
//     })
// }

/**
 * @description:流程任务审批：通过/驳回
 */
export function processTaskComplete(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/task/manage/completeTask",
        method: "post",
        data
    })
}

/**
 * @description:获取审批历史记录
 */
export function getApprovalHistory(params: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/workflow/task/manage/history",
        method: "get",
        params
    })
}
