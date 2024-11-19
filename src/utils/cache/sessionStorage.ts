import CacheKey from "@/constants/cacheKey"

//#region 时间表管理 - timeId管理
export const getTimeTableTimeId = () => {
    return sessionStorage.getItem(CacheKey.TIME_ID) || ""
}
export const setTimeTableTimeId = (timeId: string) => {
    sessionStorage.setItem(CacheKey.TIME_ID, timeId)
}
export const removeTimeTableTimeId = () => {
    sessionStorage.removeItem(CacheKey.TIME_ID)
}
//#endregion

//#region 时间表管理 - baselineId管理
export const getTimeTableBaselineId = () => {
    return sessionStorage.getItem(CacheKey.BASELINE_Id) || ""
}
export const setTimeTableBaselineId = (baselineId: string) => {
    sessionStorage.setItem(CacheKey.BASELINE_Id, baselineId)
}
export const removeTimeTableBaselineId = () => {
    sessionStorage.removeItem(CacheKey.BASELINE_Id)
}
//#endregion
