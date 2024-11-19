import router from "@/router"
import { useUserStoreHook } from "@/store/modules/user"
import { usePermissionStoreHook } from "@/store/modules/permission"
import { whiteList } from "@/config/white-list"
import { getToken } from "@/utils/cache/localStorage"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { getDynamicsMenu } from "@/utils/cache/localStorage"

const isRefresh = false //判断是否是刷新页面进入的守卫

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, _from, next) => {
    NProgress.start()
    const permissionStore = usePermissionStoreHook()
    // 判断该用户是否登录
    if (getToken()) {
        if (to.path === "/login") {
            // 如果已经登录，并准备进入 Login 页面，则重定向到主页
            next()
            NProgress.done()
        } else {
            if (permissionStore.isSetRoutes) {
                next()
            } else {
                const data = getDynamicsMenu()
                await permissionStore.setRoutes(data)
                next({ ...to, replace: true })
            }
        }
    } else {
        // 如果没有 Token
        if (whiteList.indexOf(to.path) !== -1) {
            // 如果在免登录的白名单中，则直接进入
            next()
        } else {
            // 其他没有访问权限的页面将被重定向到登录页面
            next("/login")
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
