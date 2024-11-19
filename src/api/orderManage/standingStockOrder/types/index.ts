export type orderConfiguresType = {
  partNum: string
  partOid: string
  partName: string
  scheme?: schemeType,
  productName: string // 品名
}
export type schemeType = {
  schemeOid?: string
  schemeCode: string
  schemeName: string
  options: {
    optionOid: string
    optionName: string
    optionNumber: string
    isOrderMate: string // 特征是否参与订单匹配
    choiceOid: string
    choiceName: string
    choiceNumber: string
  }[]
}
/**
 * 订单类型--1.常备库存选配 2.常备选配订单 3.特殊选配订单 4.在库选配订单 5.预计划选配
 * @default ''
 */
export type orderType = string
export interface createOrEditOrderRequestData {
  oidStr?: string // 订单oid
  remark?: string // 备注
  orderType?: orderType
  orderConfigures?: orderConfiguresType[]  // 配置列表
}
