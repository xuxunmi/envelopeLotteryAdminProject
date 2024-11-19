/*
 * description: 系统日志form接口类型
 */
export interface SystemLogFormInterface {
    userName: string
    userOperate: string
    status: number
}

/*
 * description: 员工管理form接口类型
 */
export interface SystemLogTableInterface {
    oid: string
    userName: string
    userOperate: string
    requestUrl?: string
    requestMethod?: string
    requestParams: string
    requestDuration: string
    status: number
    errMsg?: string
    ip?: string
    userAgent?: string
    createDate: string
}
