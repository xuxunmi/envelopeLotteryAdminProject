import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取工作区懒加载列表
export function workspaceLazyChildrenNode(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/folderTree",
        method: "post",
        data
    })
}

// 新建工作区文件夹
export function createWorkspaceFolder(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/createUserFolder",
        method: "post",
        data
    })
}

// 编辑个人工作区文件夹
export function editWorkspaceFolder(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/editUserFolder",
        method: "post",
        data
    })
}

// 获取个人工作区文件夹详情
export function workspaceFolderDetail(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/getFolderDetail",
        method: "post",
        data
    })
}

/**
 * @description:个人工作区树节点上移/下移
 */
export function workspaceTreeMove(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/moveFolder",
        method: "post",
        data
    })
}

// 删除个人工作区文件夹
export function deleteWorkspaceFolder(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/delUserFolder",
        method: "post",
        data
    })
}

// 获取文件夹物料列表
export function getFolderMaterielList(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/getUserFolderPart",
        method: "post",
        data
    })
}

// 文件夹物料列表添加物料
export function folderMaterielAdd(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/userFolderAddPart",
        method: "post",
        data
    })
}

// 移除文件夹与物料之间的关系
export function folderMaterielRemove(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/userFolderDelPart",
        method: "post",
        data
    })
}

// 删除文件夹与物料关系及物料
export function folderMaterielDelete(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/delPart",
        method: "post",
        data
    })
}

// 物料添加到工作区文件夹
export function materieBatchAddFolder(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/addPartsToFolders",
        method: "post",
        data
    })
}

// 物料更改变更所属者
export function materieUpdatebBelongsOwner(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/updateOwner",
        method: "post",
        data
    })
}

// 工作区文件夹物料全部导出
export function workspaceExportParts(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/exportFolderPart",
        method: "post",
        data,
        responseType: "blob"
    })
}

// 工作区文件夹物料勾选导出
export function workspaceSelectedExportParts(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/UserFolderManger/exportSelectedFolderPart",
        method: "post",
        data,
        responseType: "blob"
    })
}

// 物料详情取消检出
export function materieCancelCheckout(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/undoCheckout",
        method: "post",
        data
    })
}

// 物料详情修订
export function materieReviseWTPart(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/reviseWTPart",
        method: "post",
        data
    })
}

// 物料详情新建基线
export function materieCreateBaseline(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/createBaseline",
        method: "post",
        data
    })
}

// 物料详情一键发布
export function materieOneClickPublishing(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/publish",
        method: "post",
        data
    })
}

// 物料详情获取跃迁生命周期状态
export function getLifeCycleTemplateNode(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getLifeCycleTemplateNode",
        method: "post",
        data
    })
}

// 物料详情跃迁保存
export function materieSetState(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/setState",
        method: "post",
        data
    })
}

//BOM批量编辑
// 批量编辑-获取所有最新版本的父部件
export function getMaterieLatestAllParentPart(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getAllParent",
        method: "post",
        data
    })
}

// 批量编辑-移除父部件
export function materieRemoveParentPart(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delBomItem",
        method: "post",
        data
    })
}

// 批量编辑-替换父部件
export function materieReplaceParentPart(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/replaceChild",
        method: "post",
        data
    })
}

/**
 * @description: 数据导入下载模板
 */
export function dataImportBomTemplate() {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/importPartOrBOMTemplate",
        method: "post",
        responseType: "blob" // 接收二进制流
    })
}

/**
 * @description: 数据导入上传
 */
export function uploadPartOrBOMExcel(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/PartController/importPartOrBOM",
        method: "post",
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

/**
 * @description: 物料详情导出到U9
 */
export function u9SyncBom(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/openapi/syncU9",
        method: "post",
        data
    })
}

/**
 * @description: 物料详情导出到U9
 */
export function pbomSyncU9(data: object) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/openapi/u9/codesSync",
        method: "post",
        data
    })
}
