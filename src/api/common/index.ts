import request from "@/utils/https/pdm_servers"
import type * as Common from "./types"
const env = import.meta.env

/**
 * @description:下拉选列表
 */
export function getSelectList(data: object) {
    return request({
        url: env.VITE_BASE_API + "/common/selectList",
        method: "post",
        data
    })
}

/**
 * @description:获取用户下拉数据
 */
export function getUserList(params: Common.UserListParams) {
    return request({
        url: env.VITE_BASE_API + "/sys/user",
        method: "get",
        params
    })
}

/**
 * @description:获取动态菜单
 */
export function getDynamicMenuList() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getWTUserPermissions",
        method: "get"
    })
}

/**
 * @description:获取权限按钮
 */
export function getAuthButton() {
    return request({
        url: env.VITE_BASE_API + "/sys/menu/getAuthButton",
        method: "get"
    })
}
