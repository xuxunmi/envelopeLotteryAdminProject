/*
 * description: 项目监控搜索条件
 */
export interface ProjectMonitorHeadersInterface {
    projectCode?: string
    projectName?: string
    scheduleCode?: string
    scheduleName?: string
    taskCode?: string
    taskName?: string
    stage?: string
    planManageLevel?: string
    projectType?: string
    scheduleStatus?: string
    taskStatus?: string
    dateTimeArr?: string
    taskOwner?: string[]
    responsibleDepart?: string[]
    nodePerson?: string[]
    nodeType?: string
}

/*
 * description: 项目列表
 */
export interface ProjectListTableInterface {
    projectNumber?: string
    projectName?: string
    projectType?: number
    timeNumber?: string
    timeName?: string
    timeStatus?: number
    taskName?: string
    taskLeader?: string
}
