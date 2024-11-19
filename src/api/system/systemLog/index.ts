import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取操作日志列表
export function getSystemLog(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/logService/getLogList",
        method: "post",
        data
    })
}
