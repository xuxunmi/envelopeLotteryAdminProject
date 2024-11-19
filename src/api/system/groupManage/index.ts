import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取部门树
export function groupTree() {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getGroupTree",
        method: "get"
    })
}

// 获取部门里的用户
export function getGroupMembers(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getGroupMembers",
        method: "post",
        data
    })
}

// 根据组织获取上级部门
export function getChildGroupTree(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getChildGroupTree",
        method: "post",
        data
    })
}

// // 获取部门详情
// export function getGroupDetail(data: object) {
//     return request<any>({
//         url: env.VITE_APP_PDM + "/servlet/rest/group/getGroupDetail",
//         method: "post",
//         data
//     })
// }

// 新建/编辑部门信息
export function creatAndEditGroup(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/createGroup",
        method: "post",
        data
    })
}

// 删除部门
export function delGroup(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delGroup",
        method: "post",
        data
    })
}
