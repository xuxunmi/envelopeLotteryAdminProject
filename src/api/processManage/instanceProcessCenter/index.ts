import request from "@/utils/https/pdm_servers"
const env = import.meta.env

/**
 * @description:获取实例化流程中心列表
 */
export function instantiatePage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/instantiatePage",
        method: "post",
        data
    })
}

/**
 * @description:立即执行
 */
export function immediateExecutionInstantiate(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/createBomInstance",
        method: "post",
        data
    })
}

/**
 * @description:暂停/作废
 */
export function pauseAndCancellationInstantiate(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfApplyConfiguration/updateExampleStatus",
        method: "post",
        data
    })
}
