import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type RouteRecordRaw } from "vue-router"
import { asyncRoutes } from "@/router"
import { getDynamicMenuList, getAuthButton } from "@/api/common"
import { setDynamicsMenu, setPermissionsBtn } from "@/utils/cache/localStorage"
import { getRouterName, filterRouters, recursionArray } from "@/utils"
import router from "@/router"

// 注册路由
export const registerDynamicRoutes = (routes: RouteRecordRaw[]) => {
    return routes.forEach((route) => {
        router.addRoute(route)
    })
}

export const usePermissionStore = defineStore("permission", () => {
    const isSetRoutes = ref(false)
    // 动态路由列表
    const dynamicRoutes = ref<RouteRecordRaw[]>([])
    // 按钮权限
    const permissionsBtnList = ref<string[]>([])
    const getDynamicRoutes = async () => {
        try {
            const { data } = await getDynamicMenuList()
            if (!data.length) {
                ElMessage.error("获取的菜单权限为空！")
                return
            }
            // 格式化菜单数据
            recursionArray(data, (item) => {
                Object.assign(item, {
                    name: item.frontName,
                    path: item.frontPath
                })
            })
            setDynamicsMenu(data)
            setRoutes(data)
            // 跳转路由列表第一个
            router.push({ path: (data[0] as any).path })
            ElMessage({
                type: "success",
                message: "登录成功",
                center: true
            })
            return data
        } catch (err: any) {
            if (err.msg)
                ElMessage({
                    type: "error",
                    message: err.msg,
                    center: true
                })
            return
        }
    }
    const setRoutes = (data: any) => {
        // 获取动态路由name
        const routerNameArr = getRouterName(data)
        // 根据动态路由name匹配本地路由获取动态路由
        const addRoutersList: RouteRecordRaw[] = filterRouters(asyncRoutes, routerNameArr)
        addRoutersList.forEach((route) => router.addRoute(route))
        isSetRoutes.value = true
    }
    const getPermissionsBtn = async () => {
        try {
            const { data } = (await getAuthButton()) as { data: string[] }
            permissionsBtnList.value = data
            // console.log("permissionsBtnList： ", permissionsBtnList)
            setPermissionsBtn(data)
            return data
        } catch (err: any) {
            if (err.msg)
                ElMessage({
                    type: "error",
                    message: err.msg,
                    center: true
                })
            return
        }
    }
    return { isSetRoutes, dynamicRoutes, getDynamicRoutes, setRoutes, permissionsBtnList, getPermissionsBtn }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
    return usePermissionStore(store)
}
