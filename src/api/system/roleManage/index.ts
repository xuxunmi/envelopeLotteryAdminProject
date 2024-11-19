import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取角色树列表
export function roleList() {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getRoleList",
        method: "get"
    })
}

// 新建/编辑角色信息
export function creatAndEditRole(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/createGroup",
        method: "post",
        data
    })
}

// 删除角色
export function delRole(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delGroup",
        method: "post",
        data
    })
}

// 角色添加用户
export function roleAddUser(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/addWTUserToWTGroup",
        method: "post",
        data
    })
}

// 角色移除用户
export function roleDeleteUser(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/removeWTUserFromWTGroup",
        method: "post",
        data
    })
}

// 获取角色菜单权限树
export function menuAuthTreeByRole(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/menu/auth",
        method: "post",
        data
    })
}

// 角色菜单权限保存
export function roleAuthTreeSave(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/menu/saveMenu",
        method: "post",
        data
    })
}
