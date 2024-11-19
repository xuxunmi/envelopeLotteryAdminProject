const ww = require("chinese-workday")
const isWorkday = ww.isWorkday

/**
 * 检查日期是否为工作日
 * @param date 字符串日期 2024-05-14
 * @return boolean
 */
export const checkIsWorkday = (date: string) => {
    if (!date) return
    const isworkday = isWorkday(date)
    return isworkday
}
