import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { useTagsViewStore } from "./tags-view"
import {
    getToken,
    removeToken,
    setToken,
    getPdmOnlyToken,
    setPdmOnlyToken,
    removePdmOnlyToken,
    getUserInfo,
    setUserInfo,
    removeUserInfo,
    removeCurrentGroupId,
    removeCurrentRoleId,
    removeDynamicsMenu,
    removePermissionsBtn
} from "@/utils/cache/localStorage"
import { removeTimeTableTimeId } from "@/utils/cache/sessionStorage"
import router, { resetRouter } from "@/router"
import { loginApi, logoutApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
import { ElLoading } from "element-plus"
import { getPdmToken } from "@/api/pdmToken"

export const useUserStore = defineStore("user", () => {
    const token = ref<string>(getToken() || "")
    const pdmOnlyToken = ref<string>(getPdmOnlyToken() || "")
    const roles = ref<string[]>([])
    const userInfo = ref<{
      disabled: boolean
      email: string
      fullName: string
      id: string
      label: string
      name: string
      oid: string
      postalAddress: string
      telephoneNumber: string
      userCertificate: string
    }>(getUserInfo() || {})

    // const permissionStore = usePermissionStore()
    const tagsViewStore = useTagsViewStore()

    /** 设置角色数组 */
    const setRoles = (value: string[]) => {
        roles.value = value
    }
    /** 登录 */
    const login = (loginData: LoginRequestData) => {
        return new Promise((resolve, reject) => {
            loginApi({
                username: loginData.username,
                password: loginData.password
            })
                .then((res) => {
                    // const TOKEN = res.items[0].attributes.nonce || ''
                    const TOKEN = res.data.userCertificate || ''

                    setToken(TOKEN)
                    token.value = TOKEN

                    setUserInfo(res.data)
                    userInfo.value = res.data

                    resolve(true)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    /** 获取全局pdm唯一验证token */
    const getPdmGlobalOnlyToken = () => {
        return new Promise((resolve, reject) => {
            getPdmToken()
                .then((res: any) => {
                    const { items } = res
                    setPdmOnlyToken(items[0]?.attributes?.nonce)
                    pdmOnlyToken.value = items[0]?.attributes?.nonce
                    resolve(true)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
    /** 获取用户详情 */
    const getInfo = () => {
        return new Promise((resolve) => {
            roles.value = ["admin"]
            resolve(roles.value)
        })
    }
    // /** 切换角色 */
    // const changeRoles = async (role: string) => {
    //     const newToken = "token-" + role
    //     token.value = newToken
    //     setToken(newToken)
    //     await getInfo()
    //     permissionStore.setRoutes(roles.value)
    //     resetRouter()
    //     permissionStore.dynamicRoutes.forEach((item: RouteRecordRaw) => {
    //         router.addRoute(item)
    //     })
    //     resetTagsView()
    // }
    /** 登出 */
    const logout = () => {
        const loading = ElLoading.service({
            lock: true,
            text: "等待登出...",
            background: "rgba(255, 255, 255, 0.7)"
        })
        // logoutApi({ token: token.value })
        resetToken()
        removeUserInfo()
        resetGroupRoleId()
        resetRouter()
        resetTagsView()
        resetDynamicsRoutesAndPermissionsBtn()
        removeTimeTableTimeId()
        router.push("/login")
        location.reload();
        loading.close()
    }
    /** 重置 Token */
    const resetToken = () => {
        removeToken()
        removePdmOnlyToken()
        token.value = ""
        pdmOnlyToken.value = ""
        roles.value = []
    }
    /** 重铸切换角色当前组，当前角色  */
    const resetGroupRoleId = () => {
        // 清空切换角色当前组，当前角色
        removeCurrentGroupId()
        removeCurrentRoleId()
    }
    /** 重置动态路由和按钮权限  */
    const resetDynamicsRoutesAndPermissionsBtn = () => {
        removeDynamicsMenu()
        removePermissionsBtn()
    }
    /** 重置 visited views 和 cached views */
    const resetTagsView = () => {
        tagsViewStore.delAllVisitedViews()
        tagsViewStore.delAllCachedViews()
    }

    return {
        token,
        roles,
        userInfo,
        setRoles,
        login,
        getInfo,
        logout,
        resetToken,
        resetGroupRoleId,
        resetTagsView,
        pdmOnlyToken,
        getPdmGlobalOnlyToken
    }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
    return useUserStore(store)
}
