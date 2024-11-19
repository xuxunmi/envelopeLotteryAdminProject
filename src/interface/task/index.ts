/*
 * description: 任务form类型接口类型
 */
export interface TaskTreeInterface {
    taskId: string
    taskName?: string | undefined
    businessKey?: string | undefined
    processDefinitionKey?: string | undefined
    processInstanceId?: string | undefined
    processName?: string | undefined
    todoTarget?: boolean | undefined
    delTarget?: boolean | undefined
    timeOrTaskMapList?: TaskTreeInterface[]
}

/*
 * description: 任务form类型接口类型
 */
export interface TaskFromInterface {
    processNode?: string
    approve?: string
    description?: string
}
