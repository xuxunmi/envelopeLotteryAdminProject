import request from "@/utils/https/pdm_servers"
import type * as Login from "./types/login"
const env = import.meta.env

/** 登录并返回Token和用户信息 */
// export function loginApi() {
//     return request<any>({
//         url: env.VITE_APP_PDM + "/servlet/rest/security/csrf",
//         method: "get"
//     })
// }
export function loginApi(data: Login.LoginRequestData) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/AuthController/login",
        method: "post",
        data
    })
}

/** 登出并删除Token和用户信息 */
export function logoutApi(data: Login.LogoutRequestData) {
    return request({
        url: env.VITE_BASE_API + "/logout",
        method: "post",
        data
    })
}
