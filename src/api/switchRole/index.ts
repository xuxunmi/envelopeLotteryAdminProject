import { request } from "@/utils/https/service"
const env = import.meta.env

/**
 * @description:获取用户下拉数据
 */
export function getSwitchRoleGroupList() {
    return request({
        url: env.VITE_BASE_API + "/sys/group/groupAndRoleList",
        method: "get"
    })
}
