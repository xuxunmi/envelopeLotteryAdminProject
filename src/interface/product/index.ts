/*
 * description: 产品库列表/文件列表接口类型
 */
export interface ProductListDataInterface {
    oid: string
    name: string
    type: string
    hasChildren?: boolean
    children?: ProductListDataInterface[],
    sort: any
}

/*
 * description: 产品库文件夹列表接口类型
 */
export interface ProductFolderListDataInterface {
    id: string
    name: string
    hasChildren?: boolean
    children?: ProductFolderListDataInterface[]
}
