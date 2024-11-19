/*
 * description: 常备库存订单列表接口类型
 */
export interface ChangeNoticeInterface {
    oid: string
    seriesName: string
    noticeClassification: string
    promoter: string
    noticeTitle: string
    noticeContent?: string
    status?: string
    createTime: string
}
