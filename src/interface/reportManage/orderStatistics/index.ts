/*
 * description: 订单统计报表接口类型
 */
export interface OrderStatisticsReportDataInterface {
    oid: string
    orderType: string
    orderNumber: string
    seriesConfigNumber: string
    seriesName: string
    productName: string
    schemeStatus: string
    instanceBom: string
    instanceBomStatus: string
    number: number
    creator: string
    createTime: string
    updateTime: string
}
