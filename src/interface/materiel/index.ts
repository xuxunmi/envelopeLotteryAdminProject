/*
 * description: 物料文件夹接口类型
 */
export interface MaterialTreeInterface {
    oid: string
    name: string
    type: string
    pdmLinkProductOid?: string
    flag: number
    hasChildren: boolean
    children?: MaterialTreeInterface[]
}

/*
 * description: 文件及物料列表接口类型
 */
export interface MaterialListInterface {
    oid: string
    folderOidStr: string
    folderPartOid: string
    materialType: string
    type: string
    number: string
    symbol?: string
    name: string
    material?: string
    processRoute?: string
    partType: string
    parentCode?: string
    jgyyParentCode?: string
    description?: string
    machineModel: string
    lifeCycle: string
    versionOwnerUserGroup: string
    owner: string
    updateAt: string
    updateTime: string
    checkoutBy?: string
    checkoutTime?: string
    typeCode: string
    version: string
    identification: string
}

/*
 * description: 物料类型
 */
export interface MaterialInterface {
    oid: string
    type: string
    code: string // 编号
    symbol?: string
    name: string
    material?: string
    processRoute?: string
    partType: string
    version: string
}
