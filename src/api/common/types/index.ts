/**
 * 首页数据查询
 */
export interface UserListParams {
    pageNo: string | number
    pageSize: string | number
    params?: string
}

/**
 * 获取流程模板
 */
export interface FlowathTemplateParams {
    publishStatus?: number
}

/**
 * 根据流程模板获取流程节点列表
 */
export interface ProcessNodeListParams {
    processDefinitionId: string
}

/**
 * 修改账号密码
 */
export interface ModifyPasswordParams {
    oldPwd: string
    newPwd: string
}

/**
 * 修改账号密码
 */
export interface ViewTcDeliverablesParams {
    oldPwd: string
    newPwd: string
}
