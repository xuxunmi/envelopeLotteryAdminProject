import axios from "axios"
import { ElLoading, ElMessage } from "element-plus"
import { getToken } from "../cache/localStorage"
import { useUserStoreHook } from "@/store/modules/user"
import { get } from "lodash-es"
import projectSettings from "@/config"
import i18n from "@/lang/i18n"

const env = import.meta.env

let loading: any
function startLoading() {
    return false
    loading = ElLoading.service({
        lock: true,
        text: (i18n.global as any).t("pdmServers.pleaseWait"),
        background: "rgba(255, 255, 255, 0.9)"
    })
}
function endLoading() {
    return false
    loading.close()
}

const service = axios.create({
    baseURL: "/",
    timeout: 600000 // 超时时间
})
// 唯一token路由
const onlyToken = [
    {
        // 用户权限
        api: env.VITE_APP_PDM + "/servlet/rest/rduni/getUserAuthorization",
        token: () => "Basic YnVzYWRtaW46YnVzQWRtaW5AMTIz"
    },
    {
        // 角色工厂
        api: env.VUE_APP_SYSTEM + "/sys/users/getRoleInfoByAccount",
        token: getToken
    },
    {
        // 获取用户角色
        api: env.VUE_APP_SYSTEM + "/sys/extapi/role/",
        token: getToken
    },
    {
        // 催办
        api: env.VUE_APP_BASE_DATA + "/sys/pdm/notice/send",
        token: getToken
    }
]
// 请求拦截
service.interceptors.request.use(
    (config) => {
        startLoading()
        // 添加token
        // console.log('config', config);
        // let token = getToken() || ''
        // config.headers.Authorization = token
        const token = getToken() || ""
        config.headers["Authorization"] = `Basic ${token}`

        onlyToken.forEach((ele) => {
            if (config.url?.indexOf(ele.api) != -1) config.headers.Authorization = ele.token()
        })

        // 判断接口代理
        const proxy = config.url?.split("/")[1]
        if ("/" + proxy === env.VITE_APP_PDM && config.url === "/kbom/servlet/rest/AuthController/login") {
            // 用户账号密码
            config.auth = projectSettings.auth
        }

        return config
    },
    (error) => {
        console.log(error)
        return Promise.reject(error)
    }
)

// 接口白名单
const whiteApiList = [
    env.VUE_APP_SYSTEM + "/sys/users/getRoleInfoByAccount",
    env.VUE_APP_SYSTEM + "/sys/extapi/role/",
    env.VUE_APP_BASE_DATA + "/sys/pdm/notice/send",
    env.VITE_APP_PDM + "/servlet/rest/security/csrf",
    env.VITE_APP_PDM + "/ptc1/file/getFile",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/exportPZBom",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/exportOptionList",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/exportOptionListOfPart",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/exportRuleListOfPart",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/exportConditionListOfPart",
    env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/exportOrderList",
    env.VITE_APP_PDM + "/servlet/rest/SysOrderManger/exportSelectOrderList",
    env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/exportFolderPart",
    env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/exportSelectedFolderPart",
    env.VITE_APP_PDM + "/servlet/rest/PartController/exportAdvancedPart",
    env.VITE_APP_PDM + "/servlet/rest/PartController/exportAllAdvancedPart",
    env.VITE_APP_PDM + "/servlet/rest/PartController/exportQuickAllAdvancedPart",
    env.VITE_APP_PDM + "/servlet/rest/PartController/exportTemplate",
    env.VITE_APP_PDM + "/servlet/rest/PartController/importPartOrBOMTemplate",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/downloadTemplate",
    env.VITE_APP_PDM + "/servlet/rest/SysColorManger/downColorPart",
    env.VITE_APP_PDM + "/servlet/rest/SysColorManger/getTemplate",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/addOrUpdateChoice",
    env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/addOption",
    env.VITE_APP_PDM + "/servlet/rest/KbomRest/exportBomCompareInfo"
]

// 错误提示白名单
const whiteErrorApiList = [env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionChoice/delOptionChoiceServices"]

//响应拦截
service.interceptors.response.use(
    (response) => {
        endLoading()
        const res = response.data
        // console.log("response", response)
        let flag = false
        whiteApiList.forEach((ele) => {
            if (response.config.url?.indexOf(ele) != -1) flag = true
        })
        if (flag) return res
        if (res.resultCode != 200) {
            console.log("res.message: ", res.message)
            let errFlag = false
            whiteErrorApiList.forEach((ele) => {
                if (response.config.url?.indexOf(ele) != -1) errFlag = true
            })
            if (!errFlag) {
                ElMessage({
                    message: res.message || (i18n.global as any).t("pdmServers.interfaceError"),
                    type: "error",
                    duration: 5 * 1000,
                    dangerouslyUseHTMLString: true
                })
            }
            return Promise.reject(res)
        } else {
            return res
        }
    },
    (error) => {
        console.log("error：" + error, error.config.url) // debug
        const status = get(error, "response.status")
        if (status === 412) {
            // Token 过期时，直接退出登录并强制刷新页面（会重定向到登录页）
            ElMessage.error((i18n.global as any).t("pdmServers.loginAgain"))
            setTimeout(() => {
                useUserStoreHook().logout()
                location.reload()
            }, 500)
        } else {
            endLoading()
            let flag = false
            whiteApiList.forEach((ele) => {
                if (error.config.url?.indexOf(ele) != -1) flag = true
            })
            if (!flag) {
                ElMessage({
                    message: (i18n.global as any).t("pdmServers.requestFailed"),
                    type: "error",
                    duration: 5 * 1000
                })
            }
        }

        return Promise.reject(error)
    }
)

export default service
