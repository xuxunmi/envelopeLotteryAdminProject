/*
 * description: 下拉数据接口类型
 */
export interface SelectInterface {
    id: string | number
    name: string
    children?: SelectInterface[]
}

export interface UserSelectInterface {
    label: string
    value: string
}

export interface TcTabelInterface {
    fileName: string
    fileUrl: string
}

/*
 * description: echarts柱状图series标签内容格式参数接口
 */
export interface seriesFormatterInterface {
    value: number
}

/*
 * description: 动态表单接口类型
 */
export interface DynamicsFormInterface {
    label: string
    name: string
    type: string
    uniqueTarget: boolean
    options: UserSelectInterface[]
    rules: FormRulesInterface[]
}
