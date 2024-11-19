/*
 * description: 字典接口类型
 */
export interface TableDataInterface {
    oid: string
    code: string
    name: string
    status: string | number
    isEdit?: boolean
}
