import { UserSelectInterface } from "@/interface/common"

/*
 * description: 树表格类型接口类型
 */
export interface ProjectTreeInterface {
    id: string
    name: string
    type: string
    isTemplate: number
    projectNumber: string
    description: string
    parentId: string
    pid: string
    projectId: string
    kind: number
    sort: number
    status: number
    workflowStatus: number
    leaf?: boolean
    children?: ProjectTreeInterface[]
}

/*
 * description: 项目form类型接口类型
 */
export interface ProjectFromInterface {
    id?: string
    code?: string
    name?: string
    description?: string
    type?: string
    template?: string
    attachment?: string
    startTime?: string
    endTime?: string
    members?: object[]
    owner?: string
    group?: string
    createTime?: string
    updateBy?: string
    updateTime?: string
    releaseStatus?: string
    releaseTime?: string
    realStartTime?: string
    realEndTime?: string
    timeStatus?: string
    checkedOut?: string
    checkedOutBy?: string
    checkedOutTime?: string
    fileList?: []
}

/*
 * description: 动态表单验证接口类型
 */
export interface FormRulesInterface {
    required: boolean
    message: string
    trigger: string
}

/*
 * description: 项目成员用户表格接口类型
 */
export interface ProjectMemberTableInterface {
    id: string // id
    parentId?: string // 父级id
    realName?: string // 名称
    username?: string
    roleName?: string // 项目角色
}
