import { reactive } from "vue"

interface DefaultPaginationData {
    total: number
    currentPage: number
    pageSizes: number[]
    pageSize: number
    layout: string
    small?: boolean
    hideOnSinglePage?: boolean // 只有一页时是否隐藏
    teleported?: boolean // 是否将下拉菜单teleport至 body
}

interface PaginationData {
    total?: number
    currentPage?: number
    pageSizes?: number[]
    pageSize?: number
    layout?: string
    small?: boolean
    hideOnSinglePage?: boolean // 只有一页时是否隐藏
    show?: boolean // pt-table(分页显示/隐藏)
    teleported?: boolean // 是否将下拉菜单teleport至 body
}

/** 默认的分页参数 */
const defaultPaginationData: DefaultPaginationData = {
    total: 0,
    currentPage: 1,
    pageSizes: [20, 50, 100, 200, 500],
    pageSize: 20,
    layout: "total, jumper, prev, pager, next, sizes",
    small: true,
    hideOnSinglePage: false,
    teleported: false
}

export function usePagination(initialPaginationData: PaginationData = {}) {
    /** 合并分页参数 */
    const pageData = reactive({ ...defaultPaginationData, ...initialPaginationData })
    /** 改变当前页码 */
    const handleCurrentChange = (value: number) => {
        pageData.currentPage = value
    }
    /** 改变页面大小 */
    const handleSizeChange = (value: number) => {
        pageData.pageSize = value
    }

    return { pageData, handleCurrentChange, handleSizeChange }
}
