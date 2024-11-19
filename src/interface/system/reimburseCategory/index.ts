/*
 * description: 报销树类型接口类型
 */
export interface ReimburseCategoryTreeInterface {
    id: string
    pid: string
    name: string
    type?: number
    description?: string
    status?: number
    children: ReimburseCategoryTreeInterface[]
}

/*
 * description: 报销类别form类型接口类型
 */
export interface ReimburseCategoryFromInterface {
    id?: string
    pid?: string
    name?: string
    description?: string
    type: string
}
