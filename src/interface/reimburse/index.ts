import type { TableColumnCtx } from "element-plus"
/*
 * description: 我发起的/待审报销搜索条件接口类型
 */
export interface InitiateReimburseHeadersInterface {
    status?: number
    name?: string
    dateTimeArr?: string
    orderParam?: string
    orderType?: string
}

/*
 * description: 报销列表接口类型
 */
export interface ReimburseListDataInterface {
    id: string
    creatorName?: string
    reimbursementMonth?: string
    price?: number
    projectName?: string
    status?: number
    updateDate?: string
}

/*
 * description: 新增报销接口类型
 */
export interface ReimburseTypeTableDataInterface {
    id?: string
    detailDate?: string
    type?: string
    price?: number
    isEdit?: boolean
}

export interface NewReimburseFormDataInterface {
    id?: string
    userId?: string
    reimbursementMonth?: string
    projectId?: string
    reimbursementDetailList: ReimburseTypeTableDataInterface[]
}

/*
 * description: 列表排序接口类型
 */
export interface SortChangeParams {
    column: TableColumnCtx<ReimburseListDataInterface>
    prop: string
    order: string
}
