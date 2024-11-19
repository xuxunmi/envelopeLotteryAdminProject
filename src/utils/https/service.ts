import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { get } from "lodash-es"
import { getToken, getCurrentGroupId, getCurrentRoleId } from "../cache/localStorage"
import { statusCodeErrorMessage } from "../httpErrorCodeFun"
import projectSettings from "@/config"
const env = import.meta.env

// 接口白名单
const apiWhiteList: string[] = ["/logout", "/servlet/rest/security/csrf"]

/** 创建请求实例 */
function createService() {
    // 创建一个 Axios 实例
    const service = axios.create()
    // 请求拦截
    service.interceptors.request.use(
        (config) => {
            const token = getToken()
            config.headers["CSRF_NONCE"] = token
            // 判断接口代理
            const proxy = config.url?.split("/")[1]
            if ("/" + proxy === env.VITE_APP_PDM) {
                // 用户账号密码
                config.auth = projectSettings.auth
            }
            return config
        },
        // 发送失败
        (error) => Promise.reject(error)
    )
    // 响应拦截（可根据具体业务作出相应的调整）
    service.interceptors.response.use(
        (response) => {
            // apiData 是 API 返回的数据
            const apiData = response.data as any
            // 这个 Code 是和后端约定的业务 Code
            const code = apiData.code
            // 判断返回是不是
            if (apiWhiteList.includes(response.config.url!)) {
                return apiData
            }
            switch (code) {
                case 200:
                    // code === 0 代表没有错误
                    return apiData
                case 401:
                    // Token 过期时，直接退出登录并强制刷新页面（会重定向到登录页）
                    ElMessage.error(apiData.msg)
                    setTimeout(() => {
                        useUserStoreHook().logout()
                        location.reload()
                    }, 500)
                    break
                default:
                    // 不是正确的 Code
                    return Promise.reject(apiData)
            }
        },
        (error) => {
            // Status 是 HTTP 状态码
            const status = get(error, "response.status")
            error.msg = statusCodeErrorMessage(status)
            return Promise.reject(error)
        }
    )
    return service
}

/** 创建请求方法 */
function createRequestFunction(service: AxiosInstance) {
    return function <T>(config: AxiosRequestConfig): Promise<T> {
        const configDefault = {
            headers: {
                "Content-Type": get(config, "headers.Content-Type", "application/json")
            },
            timeout: 300000,
            baseURL: "/",
            data: {}
        }
        return service(Object.assign(configDefault, config))
    }
}

/** 用于网络请求的实例 */
export const service = createService()
/** 用于网络请求的方法 */
export const request = createRequestFunction(service)
