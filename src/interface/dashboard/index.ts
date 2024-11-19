/*
 * description: 审批流程列表接口类型
 */
export interface ApprovalFlowInterface {
    oidStr: string
    orderOidStr: string
    orderNo: string
    orderName: string
    orderType: number
    workflowStatus?: number
    taskId: string
    taskName: string
    processInstanceId: string
    processDefinitionName: string
    processDefinitionKey: string
    executionId: string
    businessKey: string
    submitter?: string
    submitTime: string
    completeTime?: string
    comment?: string
}
