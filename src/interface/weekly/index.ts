/*
 * description: 个人周报/团队周报搜索条件接口类型
 */
export interface weeklyHeadersSearchInterface {
    name?: string
    dateTimeArr?: string
    personal?: string
}

/*
 * description: 个人周报列表接口类型
 */
export interface WeeklyListDataInterface {
    projectWeeklyId: string
    projectId: string
    projectName?: string
    whichWeek?: string
    username?: string
    workDate?: string
    totalWorkHour?: number
    currentWorkContent?: string
    nextWorkContent?: string
    weeklyStatus?: number
    editTime?: string
    currentWeekUnfinishedContent?: string
    workHourDetails?: string
}
