/*
 * description: 系统菜单接口类型
 */
export interface SystemMenuInterface {
    menuCode: string | number
    menuNameZh?: string
    menuNameEn?: string
    menuName: string
    children?: SystemMenuInterface[]
}

/*
 * description: 菜单名称接口类型
 */
export interface MenuNameInterface {
    oid: string
    menuCode: string | number
    menuNameZh: string
    menuNameEn: string
    isEdit?: boolean
}

/*
 * description: 界面字段接口类型
 */
export interface InterfaceFieldRefs {
    oid: string
    menuCode: string | number
    fieldId: string
    fieldNameZh: string
    fieldNameEn: string
    status: string
    isEdit?: boolean
}
