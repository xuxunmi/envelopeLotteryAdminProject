/*
 * description: 常备库存订单列表接口类型
 */
export interface StandingStockOrderListDataInterface {
    oid: number
    oidStr: string
    orderOidStr: string
    orderNo: string
    orderName: string
    productName: string
    partNumber?: string
    number: number
    orderType: string
    remark?: string
    createTime: string
    status: string
    processInstanceId?: string
    workflowStatus: number
    planStatus: number
}

/*
 * description: 订单提交流程接口类型
 */
export interface ProcessSubmitInterface {
    id: string
    businessDetailId: string
    businessName: string
    businessCode: string
}
