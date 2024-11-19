import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取产品库列表
export function productList() {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfBaseManage/getProductList",
        method: "get"
    })
}

// 新增/编辑产品库
export function createUpdateProduct(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfBaseManage/CreateOrUpdateProduct",
        method: "post",
        data
    })
}

// 获取产品库文件夹列表
export function productFolderFirstNode(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/getFirstNode",
        method: "post",
        data
    })
}

// 获取产品库文件夹懒加载列表
export function productFolderLazyChildrenNode(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/getProductContent",
        method: "post",
        data
    })
}

/**
 * @description:文件夹上移/下移
 */
export function folderNodeMove(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/moveFolder",
        method: "post",
        data
    })
}

// 删除文件夹
export function deleteFolder(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delSubFolder",
        method: "post",
        data
    })
}

// 产品库文件夹详情
export function getFolderDetails(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/getObjDetail",
        method: "post",
        data
    })
}

// 新增/编辑产品库文件夹
export function createFolder(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/createFolder",
        method: "post",
        data
    })
}

// 获取产品库文件夹内容列表
export function productFolderContentList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/getLeftList",
        method: "post",
        data
    })
}

// 新增/编辑产品库部件
export function createPart(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/product/createPart",
        method: "post",
        data
    })
}

// 新增/编辑产品库文档
export function createDocument(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/ptc1/file/createFile",
        method: "post",
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

// 下载产品库/存储库文档
export function downloadUploadFile(params: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/ptc1/file/getFile",
        method: "get",
        responseType: "blob",
        params
    })
}

// 下载产品库/存储库文档
export function deleteBatch(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest//product/delObj",
        method: "post",
        data
    })
}
