/*
 * description: 员工管理table接口类型
 */
export interface StaffTableInterface {
    userOid: string
    code: string
    name: string
    topOid: string
    superName: string
    superOid: string
    first: string
    last: string
    status: string
    email?: string
}
