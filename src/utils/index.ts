import dayjs from "dayjs"
import weekday from "dayjs/plugin/weekday"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { type RouteRecordRaw, RouteRecordName } from "vue-router"
import CryptoJS from "crypto-js"
import { getUserAuthorization, getRoleInfoByAccount } from "@/api/bomList"
import projectSettings from "@/config"
import { ElMessage } from "element-plus"

dayjs.extend(weekday)
dayjs.extend(weekOfYear)

//#region 公共方法
/** 格式化时间 */
export const formatDateTime = (time: string | number | Date, format: string | undefined = "YYYY-MM-DD HH:mm:ss") => {
    if (!time) {
        return "N/A"
    }
    const date = new Date(time)
    return dayjs(date).format(format)
}

/**
 * 递归数组
 * @param arr 数组
 * @param cb 回调事件
 * @param child 子元素字段名
 */
export const recursionArray = (arr: any[], cb?: (item: any, i: number, parent: any) => void | 'return' | boolean, child = "children", parent?: any) => {
    for (let i = 0; i < arr.length; i++) {
        const flag = cb && cb(arr[i], i, parent)
        if (flag === "return") return true
        if (arr[i][child] && arr[i][child].length) {
            recursionArray(arr[i][child], cb, child, arr[i])
        }
    }
}

/**
 * 设置数组元素位置
 * @param type 操作类型
 * @param index 元素下标
 * @param arr 数组
 * @param string 顺序号
 */
export const setObjectOrder = (obj1?: any, obj2?: any, order?: string) => {
    if (obj1 && obj2 && order) {
        const temp = obj1[order]
        obj1[order] = obj2[order]
        obj2[order] = temp
    }
}
export const setArrayEleOrder = (type: string, index: number, arr: any[], order?: string) => {
    console.log("setArrayEleOrder", type, index, arr)
    if (type === "up") {
        // 上移
        if (index > 0 && index < arr.length) {
            setObjectOrder(arr[index], arr[index - 1], order)
            const temp = arr[index]
            arr[index] = arr[index - 1]
            arr[index - 1] = temp
        }
    } else if (type === "down") {
        // 下移
        if (index >= 0 && index < arr.length - 1) {
            setObjectOrder(arr[index], arr[index - 1], order)
            const temp = arr[index]
            arr[index] = arr[index + 1]
            arr[index + 1] = temp
        }
    } else if (type === "top") {
        // 置顶
        if (index > 0 && index < arr.length) {
            if (order) {
                const firstOrder = arr[0][order]
                for (let i = 0; i < index; i++) arr[i][order] = arr[i + 1][order]
                arr[index][order] = firstOrder
            }
            const element = arr.splice(index, 1)[0]
            arr.unshift(element)
        }
    } else if (type === "bottom") {
        // 置底
        if (index >= 0 && index < arr.length - 1) {
            if (order) {
                const lastOrder = arr[arr.length - 1][order]
                for (let i = index + 1; i < arr.length; i++) arr[i][order] = arr[i - 1][order]
                arr[index][order] = lastOrder
            }
            const element = arr.splice(index, 1)[0]
            arr.push(element)
        }
    }
}

/**
 * @param  tree 表格树数据源
 * @param targetName 当前树节点name
 * @return {} targetName所在的row
 */
export const findTableTreeNodeByName = (arr: any[], targetName: string): any => {
    for (const obj of arr) {
        if (obj.name.toLowerCase().includes(targetName)) {
            return obj
        }
        if (obj.children) {
            const found: any | null = findTableTreeNodeByName(obj.children, targetName)
            if (found) {
                return found
            }
        }
    }
    return null
}

/**
 * @param  tree 树型数组数据源
 * @param id 当前树节点id
 * @return {} id所在的row
 */
export const findTreeNodeById = (tree: any[], id: string) => {
    for (const node of tree) {
        if (node.oid === id) {
            return node
        }
        if (node.children && node.children.length > 0) {
            const treeNode: any = findTreeNodeById(node.children, id)
            if (treeNode) {
                return treeNode
            }
        }
    }
    return null
}

/**
 * 获取一年的所有周总数
 * @param year 年份
 */
export const getWeeksInYear = (year: number) => {
    const firstDayOfYear = new Date(year, 0, 1) // 获取指定年份的第一天
    const lastDayOfYear = new Date(year, 11, 31) // 获取指定年份的最后一天

    const firstWeekDay = firstDayOfYear.getDay() // 第一天是星期几
    const timeDiff = lastDayOfYear.getTime() - firstDayOfYear.getTime() // 日期之间的时间差（毫秒）
    const daysInYear = Math.floor(timeDiff / (24 * 60 * 60 * 1000)) + 1 // 一年中的总天数

    let weeks = Math.ceil((daysInYear + firstWeekDay) / 7) // 计算周数
    if (firstWeekDay === 0) {
        // 如果第一天是周日，则减少一周
        weeks--
    }

    return weeks
}

/**
 * 生成一年的所有周数组
 * @param year 年份
 */
export const createWeekInYear = (year?: number) => {
    type weekType = {
        from: string
        to: string
        name: string
        id: string
    }
    const y = year || dayjs().year()
    const currentYearWeeks: weekType[] = []
    const prevYearWeeks: weekType[] = []
    const prevWeeksNum = getWeeksInYear(y - 1)
    const currentWeeksNum = getWeeksInYear(y)

    // 上一年
    for (let i = 0; i < prevWeeksNum; i++) {
        const from = dayjs()
            .year(y - 1)
            .week(i)
            .weekday(0)
            .format("YYYY-MM-DD")
        const to = dayjs()
            .year(y - 1)
            .week(i)
            .weekday(7)
            .format("YYYY-MM-DD")
        const week: weekType = {
            from,
            to,
            name:
                dayjs()
                    .year(y - 1)
                    .format("YYYY") +
                "-" +
                `W${i + 1}(${from}—${to})`,
            id:
                dayjs()
                    .year(y - 1)
                    .format("YYYY") +
                "-" +
                (i + 1)
        }
        prevYearWeeks.push(week)
    }

    // 今年
    for (let i = 0; i < currentWeeksNum; i++) {
        const from = dayjs().year(y).week(i).weekday(1).format("YYYY-MM-DD")
        const to = dayjs().year(y).week(i).weekday(7).format("YYYY-MM-DD")
        const week: weekType = {
            from,
            to,
            name: dayjs().year(y).format("YYYY") + "-" + `W${i + 1}(${from}—${to})`,
            id: dayjs().year(y).format("YYYY") + "-" + (i + 1)
        }
        currentYearWeeks.push(week)
    }
    // 取上一年后半年的周数据
    const prevHalfYearWeeks = prevYearWeeks.slice(Math.ceil(prevYearWeeks.length / 2))
    // 上一年和今年合并起来
    const weeksTotal: weekType[] = prevHalfYearWeeks.concat(currentYearWeeks)
    // console.log(" weeksTotal:", weeksTotal)
    return weeksTotal
}

/**
 * 检验时间范围
 * @param currentTime 当前时间范围
 * @param compareTime 对比时间范围
 * @param type 对比类型（out: 当前 > 对比; in: 当前 < 对比）
 */
export const checkTimesRange = (
    currentTime: Array<string | number | Date>,
    compareTime: Array<string | number | Date>,
    type: string | undefined = "in"
) => {
    let flag = false
    if (currentTime[0] && currentTime[1] && compareTime[0] && compareTime[1]) {
        try {
            const curStart = new Date(currentTime[0]).getTime()
            const curEnd = new Date(currentTime[1]).getTime()
            const comStart = new Date(compareTime[0]).getTime()
            const comEnd = new Date(compareTime[1]).getTime()
            if (type === "out") {
                if (curStart <= comStart && curEnd >= comEnd) {
                    flag = true
                }
            } else {
                if (curStart >= comStart && curStart <= comEnd && curEnd >= comStart && curEnd <= comEnd) {
                    flag = true
                }
            }
        } catch (error) {
            console.error("校验时间范围异常：", error)
        }
    }
    return flag
}
/**
 * 检验时间范围
 * @param currentTime 校验时间
 * @param compareTime 对比时间范围
 */
export const checkTimeRange = (currentTime: string | number | Date, compareTime: Array<string | number | Date>) => {
    let flag = true
    if (currentTime && compareTime[0] && compareTime[1]) {
        try {
            const curTime = new Date(currentTime).getTime()
            const comStart = new Date(compareTime[0]).getTime()
            const comEnd = new Date(compareTime[1]).getTime()
            if (curTime <= comStart || curTime >= comEnd) {
                flag = false
            }
        } catch (error) {
            flag = false
            console.error("校验时间范围异常：", error)
        }
    }
    return flag
}

/** 将全局 CSS 变量导入 JS 中使用 */
export const getCssVariableValue = (cssVariableName: string) => {
    let cssVariableValue = ""
    try {
        // 没有拿到值时，会返回空串
        cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
    } catch (error) {
        console.error(error)
    }
    return cssVariableValue
}

/**
 * 移除树中的指定节点集合
 * @param {*} tree 树
 * @param {*} items 节点集合
 */
export function removeItemsInTree<T>(tree: any, items: Array<T>): void {
    items.forEach((item) => removeItemInTree(tree, item))
}

/**
 * 移除树中的指定节点
 * @param {*} tree 树
 * @param {*} node 节点
 */
export function removeItemInTree(tree: any, node: any) {
    const index = tree.indexOf(node)
    if (index !== -1) {
        tree.splice(index, 1)
        return true
    }
    for (const childNode of tree) {
        if (childNode.children?.length) {
            if (removeItemInTree(childNode.children, node)) {
                return true
            }
        }
    }
    return false
}

/**
 *
 * @param  tree 树数据源
 * @param targetOid 当前树节点id
 * @return {} 当前同层树节点的下一个兄弟元素
 */
export const findNextSiblingNodes = (tree: any[], targetOid: string, nextSiblingNodes: any[] = []): any[] => {
    for (let i = 0; i < tree.length; i++) {
        if (tree[i].oid === targetOid) {
            if (i < tree.length - 1) {
                nextSiblingNodes.push(tree[i + 1])
            }
            break
        } else if (tree[i].children && tree[i].children.length > 0) {
            const nextSibling = findNextSiblingNodes(tree[i].children, targetOid)
            if (nextSibling.length > 0) {
                nextSiblingNodes = nextSibling
                break
            }
        }
    }
    return nextSiblingNodes
}

/**
 *
 * @param  tree 树数据源
 * @param targetOid 当前树节点id
 * @return {} 当前同层树节点的上一个兄弟元素
 */
export const findPreviousSiblingNodes = (tree: any[], targetOid: string, previousSiblingNodes: any[] = []): any[] => {
    for (let i = 0; i < tree.length; i++) {
        if (tree[i].oid === targetOid) {
            if (i > 0) {
                previousSiblingNodes.push(tree[i - 1])
            }
            break
        } else if (tree[i].children && tree[i].children.length > 0) {
            const previousSibling = findPreviousSiblingNodes(tree[i].children, targetOid)
            if (previousSibling.length > 0) {
                previousSiblingNodes = previousSibling
                break
            }
        }
    }
    return previousSiblingNodes
}

/**
 *
 * @param {array} tree 树数据源
 * @param {string} targetOid 目标树节点id
 * @return {string[]}  当前树节点id的所有父级ids,按照从根节点到直接父节点的顺序排序
 */
export const findParentIds = (tree: any[], targetOid: string): string[] => {
    const parentOids: string[] = []
    function traverse(node: any, targetOid: string): boolean {
        if (node.oid === targetOid) {
            parentOids.push(node.oid)
            return true
        }
        if (node.children) {
            for (const child of node.children) {
                if (traverse(child, targetOid)) {
                    parentOids.push(node.oid)
                    return true
                }
            }
        }
        return false
    }
    for (const node of tree) {
        if (traverse(node, targetOid)) {
            break
        }
    }
    return parentOids
}

/**
 * 数组去重
 * @param {arr} Array
 */
export const uniqueArray = (arr: any[]) => {
    if (!Array.isArray(arr)) {
        throw new Error("type error!")
    }
    if (arr.length == 1) {
        return arr
    }
    return [...new Set(arr)]
}

/**
 *
 * @param  {Array} routers 后台返回的用户权限json
 * @return {Array} nameArr 过滤后返回的路由name
 */
export const getRouterName = (routers: any[], nameArr: RouteRecordName[] = []): RouteRecordName[] => {
    routers.forEach((item) => {
        if (item.name && item.isChecked) {
            nameArr.push(item.name)
            if (item.children && item.children.length > 0) {
                getRouterName(item.children, nameArr)
            }
        }
    })
    return nameArr
}

/**
 * @param  {Array} rouerNames 过滤后的路由name
 * @param  {Array} allDynamicRouter  前端配置好的所有动态路由的集合
 * @return {Array} arr 过滤后返回的路由
 */
export const filterRouters = (
    allDynamicRouter: RouteRecordRaw[],
    routerNames: RouteRecordName[] = []
): RouteRecordRaw[] => {
    return allDynamicRouter.filter((item) => {
        if (item.children) {
            item.children = filterRouters(item.children, routerNames)
        }
        return (item.name && routerNames.includes(item.name)) || item.children?.length || item.meta?.alwaysChecked
    })
}

/**
 * 保留指定位小数
 * @param {*} src
 * @param {*} pos
 * @returns
 */
export const formatFloat = (src: number, pos = 2) => {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos)
}

/**
 * 打开一个新窗口
 * @param {*} src
 */
export const windowOpenTab = (src: string) => {
    window.open(src || "", "_blank", "scrollbars=yes,resizable=1")
}

/**
 * 通过类名查找元素
 * @param {any[]} domList
 * @param {className} className
 */
export const findDomByClass = (domList: any[], className: string) => {
    if (domList.length && className) {
        for (let i = 0; i < domList.length; i++) {
            const ele = domList[i]
            if (ele.classList.contains(className)) return ele
        }
    } else {
        return null
    }
}

/**
 * 判断两个数组是否相等，顺序不同但元素相等
 * @param {any[]} a 数组a
 * @param {any[]} b 数组b
 */
export const equalsArray = (a: any[], b: any[]) => {
    const m = new Map()
    a.forEach((o) => m.set(o, (m.get(o) || 0) + 1))
    b.forEach((o) => m.set(o, (m.get(o) || 0) - 1))
    for (const value of m.values()) {
        if (value !== 0) {
            return false
        }
    }
    return true
}
//#endregion

//#region 前端列表搜索
/**
 * 数组过滤1: 保留子集
 * @param {object} filterValue 筛选参数
 * @param {array} sourceData  筛选数据
 * @param {object} option  配置选项
 * @returns
 */
export const filterArray = (
    filterValue: any,
    sourceData: any[],
    option: {
        child?: string
        clone?: boolean
    } = {}
) => {
    const { clone = true } = option
    let tree = []
    if (clone) {
        tree = JSON.parse(JSON.stringify(sourceData))
    } else {
        tree = sourceData
    }
    // 筛选不为空的条件
    let flag = true
    Object.keys(filterValue).forEach((key) => {
        if (filterValue[key] !== "") flag = false
    })
    if (flag) {
        return tree
    } else {
        return _filterArray(tree, filterValue, option)
    }
}
const special_regular = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
const _filterArray = (
    treeList: any[],
    filterValue: any,
    option: {
        child?: string
    } = {}
) => {
    const emptyArr = []
    const { child = "children" } = option
    for (const item of treeList) {
        if (checkFilterValue(filterValue, item)) {
            emptyArr.push(item)
        } else {
            if (item[child] && Array.isArray(item[child]) && item[child].length) {
                const subArr: any = _filterArray(item[child], filterValue, option)
                if (subArr && subArr.length) {
                    const node = { ...item }
                    node[child] = subArr
                    emptyArr.push(node)
                }
            }
        }
    }
    return emptyArr
}
/**
 * 数组过滤2: 保留父级
 * @param {object} filterValue 筛选参数
 * @param {array} sourceData  筛选数据
 * @param {object} option  配置选项
 * @returns
 */
export const filterTree2 = (
    sourceData: any[],
    filterValue: any,
    option: {
        child?: string
        isFilterBranchNode?: boolean
    } = {}
) => {
    const tree = JSON.parse(JSON.stringify(sourceData))
    // 筛选不为空的条件
    let flag = true
    Object.keys(filterValue).forEach((key) => {
        if (filterValue[key] !== "") flag = false
    })
    if (flag) {
        return tree
    } else {
        const list = _filterTree2(tree, filterValue, option)
        return list
    }
}
const _filterTree2 = (
    node: any[],
    filterValue: any,
    option: {
        child?: string
        isFilterBranchNode?: boolean
    } = {}
) => {
    if (!node?.length) return []
    const { child = "children", isFilterBranchNode = true } = option
    const newNode: any[] = []
    for (let i = 0, l = node.length; i < l; i++) {
        const item = node[i]
        if (item?.[child]?.length) {
            const newChildrenNode: any[] = _filterTree2(item?.[child], filterValue, option)
            if (newChildrenNode?.length) {
                item[child] = newChildrenNode
                newNode.push(item)
            } else {
                delete item[child]
                if (isFilterBranchNode && checkFilterValue(filterValue, item)) {
                    newNode.push(item)
                }
            }
        } else {
            if (checkFilterValue(filterValue, item)) newNode.push(item)
        }
    }
    return newNode
}
// 校验过滤项
const checkFilterValue = (filterValue: any, item: any) => {
    let flag = true
    Object.keys(filterValue).forEach((key) => {
        if (filterValue[key] !== "") {
            if (Object.prototype.toString.call(filterValue[key]) === "[object Boolean]") {
                if (item[key] === filterValue[key]) flag = false
            } else {
                const reg = new RegExp(filterValue[key].replace(special_regular, ""), "i")
                if (!reg.test(String(item[key]).replace(special_regular, ""))) flag = false
            }
        }
    })
    return flag
}
/**
 * 重置参数
 * @param {object} filterValue 筛选参数
 */
export const resetFilterValue = (filterValue: any) => {
    Object.keys(filterValue).forEach((ele) => (filterValue[ele] = ""))
}
/**
 * 校验物料是否可编辑
 * @param {object} materialType 物料类型
 * @return {boolean} 是否可编辑
 */
export const checkMaterialCanEdit = (materialType: string) => {
    return (
        materialType === "wt.part.WTPart|com.pdinfo.kbomPHANTOM" || // 零部件
        materialType === "wt.part.WTPart|com.pdinfo.kbomMODULE" || // 模块
        materialType === "wt.part.WTPart|com.pdinfo.kbomCAR"
    ) // 整机配置
}
//#endregion

//#region 前端列表排序
type sortParamsType = {
    sortBy: string
    sorted: any
    sortType: any
}
export const goSort = (data: sortParamsType, tableData: any[]) => {
    if (data.sorted) {
        tableData.sort((a: any, b: any) => handleSort(a, b, data))
        recursionArray(tableData, (item: any) => {
            if (item.children && item.children) {
                item.children.sort((a: any, b: any) => {
                    return handleSort(a, b, data)
                })
            }
        })
    } else {
        tableData.sort((a: any, b: any) => a.frontEndID - b.frontEndID)
        recursionArray(tableData, (item: any) => {
            if (item.children && item.children) {
                item.children.sort((a: any, b: any) => a.frontEndID - b.frontEndID)
            }
        })
    }
}
const handleSort = (a: any, b: any, data: sortParamsType) => {
    const aValue = a[data.sortBy] || ""
    const bValue = b[data.sortBy] || ""
    if (data.sortType === "number") {
        // 数字
        if (data.sorted === "ascending") {
            return aValue - bValue
        } else if (data.sorted === "descending") {
            return bValue - aValue
        }
    } else if (data.sortType === "time") {
        // 时间
        if (data.sorted === "ascending") {
            return new Date(aValue).getTime() - new Date(bValue).getTime()
        } else if (data.sorted === "descending") {
            return new Date(bValue).getTime() - new Date(aValue).getTime()
        }
    } else {
        // 字符串
        if (data.sorted === "ascending") {
            return aValue.localeCompare(bValue)
        } else if (data.sorted === "descending") {
            return bValue.localeCompare(aValue)
        }
    }
    return 0
}
//#endregion

//#region 加密/解密
export const SECRET_KEY = CryptoJS.enc.Utf8.parse("1234567890123450")
export const SECRET_IV = CryptoJS.enc.Utf8.parse("1234567890123450")
// 加密方法
export function encrypt(msg: string, key: CryptoJS.lib.WordArray, iv: CryptoJS.lib.WordArray) {
    if (!msg) return ""
    try {
        const srcs = CryptoJS.enc.Utf8.parse(msg)
        const encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        })
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
    } catch (error) {
        console.log("加密异常", error)
        return ""
    }
}

// 解密方法
export function decrypt(word: string, key: CryptoJS.lib.WordArray, iv: CryptoJS.lib.WordArray) {
    if (!word) return ""
    try {
        const base64 = CryptoJS.enc.Base64.parse(word)
        const srcs = CryptoJS.enc.Base64.stringify(base64)
        const decrypt = CryptoJS.AES.decrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        })
        const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        return decryptedStr
    } catch (error) {
        console.log("解密异常", error)
        return ""
    }
}
//#endregion

//#region pdm接口校验
// 验证授权
const env = import.meta.env

export const toRedirectUrl = (userName: string, password: string, callback: Function) => {
    const xml = new XMLHttpRequest()
    xml.onreadystatechange = function () {
        if (xml.readyState == 4) {
            console.log("xml", xml.status)
            if (xml.status == 200) {
                // 验证通过
                const result = this.responseText.trim()
                if (callback) callback({})
            } else {
                // 验证失败
                ElMessage.error("验证失败！")
            }
        }
    }
    // const url = `http:/pdmuat.cnhtc.cn/netmarkets/jsp/ext/integration/verifyPassword.jsp?userName=${userName}&password=${password}`
    const url = `${env.VITE_APP_PDM}/netmarkets/jsp/restapi/index.html`

    xml.open("GET", url, false, userName, password)
    xml.send()
}
// 获取用户信息
export const getUserInfo = () => {
    try {
        const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo") || "{}")
        // userInfo.employeeNo = '075376'
        return userInfo
    } catch (error) {
        console.log("userInfo", error)
        return false
    }
}

// 获取token
export const getUserAuth = (callback: Function) => {
    const userName = projectSettings.auth.username
    const password = projectSettings.auth.password
    toRedirectUrl(userName, password, callback)
}

// 校验工厂
export const checkFactory = (codes: any, cb: Function) => {
    const userInfo = getUserInfo()
    const HPM = new Promise((resolve, reject) => {
        const xml = new XMLHttpRequest()
        xml.onreadystatechange = function () {
            if (xml.readyState == 4) {
                if (xml.status == 200) {
                    // 成功
                    resolve(JSON.parse(this.response))
                } else {
                    // 失败
                    reject(this)
                }
            }
        }
        const userName = projectSettings.hpm.userName
        const password = projectSettings.hpm.password
        const url = `${env.VUE_APP_HPM}/RESTAdapter/RDLP/PMLI018/MaterialFactoryView`
        xml.open("POST", url, false, userName, password)
        // 格式化时间日期
        const date = new Date()
        const year = date.getFullYear().toString().padStart(4, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const day = date.getDate().toString().padStart(2, "0")
        const hour = date.getHours().toString().padStart(2, "0")
        const minute = date.getMinutes().toString().padStart(2, "0")
        const second = date.getSeconds().toString().padStart(2, "0")
        const params: any = {
            MessageHeader: {
                Interface_ID: "PLMI018",
                UUID: "",
                MessageId: "",
                Sender: "RDLP",
                Receiver: "HPM",
                SendDate: `${year}${month}${day}`, // 日期
                SendTime: `${hour}${minute}${second}` // 时间
            },
            Requests: []
        }
        if (codes.length) {
            codes.forEach((ele: any) => {
                const d = {
                    MATNR: ele, // 物料号
                    REMARK1: "",
                    REMARK2: "",
                    REMARK3: "",
                    REMARK4: "",
                    REMARK5: ""
                }
                params.Requests.push(d)
            })
        }
        xml.send(JSON.stringify(params))
    })
    const role = getRoleInfoByAccount(userInfo)
    Promise.all([HPM, role])
        .then((data: any) => {
            console.log("校验工厂", data)
            let result = false
            const numbers = codes
            if (data[1].length) {
                data[0].Responses.forEach((ele0: any) => {
                    data[1].forEach((ele1: any) => {
                        console.log("比较1", ele0.WERKS + "", ele1.replace("WFA_F_", ""))
                        if (ele0.WERKS + "" === ele1.replace("WFA_F_", "")) {
                            // 删除对应物料号
                            numbers.forEach((num: any, i: number) => {
                                if (num === ele0.MATNR) numbers.splice(i, 1)
                            })
                        }
                    })
                })
                if (numbers.length) {
                    result = false
                } else {
                    result = true
                }
            } else {
                // result = true // 角色工厂数组为空直接通过
            }
            console.log("校验工厂比较结果", result, numbers)
            const str = Array.from(new Set(numbers)).join("、")
            if (!result) ElMessage.error(`根据HPM系统工艺路线划分信息，您不具备此物料${str}的查询权限！`)
            cb(result, numbers)
        })
        .catch((err) => {
            console.log("校验工厂", err)
            ElMessage.error(`校验工厂异常！`)
            cb(false)
        })
}
//#endregion
