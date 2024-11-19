import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取用户列表
export function userList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getUserList",
        method: "post",
        data
    })
}

// 新建/编辑
export function creatAndEditUser(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/createUser",
        method: "post",
        data
    })
}

// 获取用户详情
// export function getUserDetail(data: object) {
//     return request<any>({
//         url: env.VITE_APP_PDM + "/servlet/rest/user/getUserDetail",
//         method: "post",
//         data
//     })
// }

// 删除用户
export function delUser(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delUser",
        method: "post",
        data
    })
}

/**
 * @description:重置账号密码
 */
export function resetPassword(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/reSetWTUserPassword",
        method: "post",
        data
    })
}

/**
 * @description:修改账号密码
 */
export function modifyPassword(data: object) {
    return request({
        url: env.VITE_BASE_API + "/updatePwd",
        method: "post",
        data
    })
}

/**
 * @description: 用户导出模板
 */
export function exportUserTemplate() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/downloadTemplate",
        method: "post",
        responseType: "blob" // 接收二进制流
    })
}

/**
 * @description: 用户上传
 */
export function uploadUserExcel(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/importManagerFile",
        method: "post",
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

/**
 * @description: 用户导出
 */
export function userExport(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/exportFolderPart",
        method: "post",
        data,
        responseType: "blob"
    })
}
