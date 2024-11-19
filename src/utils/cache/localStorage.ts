/** 统一处理 localStorage */
import CacheKey from "@/constants/cacheKey"
import { type ThemeName } from "@/hooks/useTheme"
import { type RouteRecordRaw } from "vue-router"

export const getSidebarStatus = () => {
    return localStorage.getItem(CacheKey.SIDEBAR_STATUS)
}
export const setSidebarStatus = (sidebarStatus: "opened" | "closed") => {
    localStorage.setItem(CacheKey.SIDEBAR_STATUS, sidebarStatus)
}

export const getActiveThemeName = () => {
    return localStorage.getItem(CacheKey.ACTIVE_THEME_NAME) as ThemeName
}
export const setActiveThemeName = (themeName: ThemeName) => {
    localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, themeName)
}

//#region token 处理
export const getToken = () => {
    return localStorage.getItem(CacheKey.TOKEN)
}
export const setToken = (token: string) => {
    localStorage.setItem(CacheKey.TOKEN, token)
}
export const removeToken = () => {
    localStorage.removeItem(CacheKey.TOKEN)
}
//#endregion

//#region 系统语言
export const getLanguage = () => {
    return localStorage.getItem(CacheKey.LANGUAGE)
}
export const setLanguage = (language: string) => {
    localStorage.setItem(CacheKey.LANGUAGE, language)
}
export const removeLanguage = () => {
    localStorage.removeItem(CacheKey.LANGUAGE)
}
//#endregion

//#region 中英文国际化
export const getInternationalFields = () => {
    return JSON.parse(localStorage.getItem(CacheKey.INTERNATIONAL_FIELDS) || "{}")
}
export const setInternationalFields = (Fields: Object) => {
    localStorage.setItem(CacheKey.INTERNATIONAL_FIELDS, JSON.stringify(Fields || "{}"))
}
export const removeInternationalFields = () => {
    localStorage.removeItem(CacheKey.INTERNATIONAL_FIELDS)
}
//#endregion

//#region pdm only token 处理
export const getPdmOnlyToken = () => {
    return localStorage.getItem(CacheKey.PDM_ONLY_TOKEN)
}
export const setPdmOnlyToken = (token: string) => {
    localStorage.setItem(CacheKey.PDM_ONLY_TOKEN, token)
}
export const removePdmOnlyToken = () => {
    localStorage.removeItem(CacheKey.PDM_ONLY_TOKEN)
}
//#endregion

//#region 用户信息处理
export const getUserInfo = () => {
    return JSON.parse(localStorage.getItem(CacheKey.UserInfo) || "{}")
}
export const setUserInfo = (userInfo: object) => {
    localStorage.setItem(CacheKey.UserInfo, JSON.stringify(userInfo || "{}"))
}
export const removeUserInfo = () => {
    localStorage.removeItem(CacheKey.UserInfo)
}
//#endregion

//#region 切换角色
// 当前组，当前角色
export const getCurrentGroupId = () => {
    const cacheValue = localStorage.getItem(CacheKey.CURRENT_GROUP_ID)
    return cacheValue ? JSON.parse(cacheValue) : null
}
export const setCurrentGroupId = (id: string) => {
    localStorage.setItem(CacheKey.CURRENT_GROUP_ID, JSON.stringify(id))
}
export const removeCurrentGroupId = () => {
    localStorage.removeItem(CacheKey.CURRENT_GROUP_ID)
}

export const getCurrentRoleId = () => {
    const cacheValue = localStorage.getItem(CacheKey.CURRENT_ROLE_ID)
    return cacheValue ? JSON.parse(cacheValue) : null
}
export const setCurrentRoleId = (id: string) => {
    localStorage.setItem(CacheKey.CURRENT_ROLE_ID, JSON.stringify(id))
}
export const removeCurrentRoleId = () => {
    localStorage.removeItem(CacheKey.CURRENT_ROLE_ID)
}
//#endregion

//#region 动态路由菜单
export const getDynamicsMenu = () => {
    const menuList = localStorage.getItem(CacheKey.DYNAMICS_MENU_LIST)
    return menuList && menuList.length ? JSON.parse(menuList) : []
}
export const setDynamicsMenu = (menu: RouteRecordRaw[]) => {
    localStorage.setItem(CacheKey.DYNAMICS_MENU_LIST, JSON.stringify(menu || []))
}
export const removeDynamicsMenu = () => {
    localStorage.removeItem(CacheKey.DYNAMICS_MENU_LIST)
}
//#endregion

//#region 按钮权限
export const getPermissionsBtn = () => {
    const btnList = localStorage.getItem(CacheKey.PERMISSIONS_BTN_LIST)
    return btnList && btnList.length ? JSON.parse(btnList) : []
}
export const setPermissionsBtn = (list: string[]) => {
    localStorage.setItem(CacheKey.PERMISSIONS_BTN_LIST, JSON.stringify(list || []))
}
export const removePermissionsBtn = () => {
    localStorage.removeItem(CacheKey.PERMISSIONS_BTN_LIST)
}
//#endregion
