import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 预计划选配
// 查找添加分页接口
export function schedulePage(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/schedulePage",
        method: "post",
        data
    })
}
//#endregion
