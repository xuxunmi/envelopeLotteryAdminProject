/*
 * description: 流程表格
 */
export interface TableInterface {
    oid: string // modelId
    processCode: string // 流程编码
    processName: string // 流程名称
    createTime?: string // 创建时间
    lastUpdateTime?: string // 修改时间时间
    deploymentId?: string
}
