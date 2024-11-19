import { type Directive } from "vue"
import { getPermissionsBtn } from "@/utils/cache/localStorage"

/** 权限指令 */
export const permission: Directive = {
    mounted(el, binding) {
        const { value } = binding
        const btnList = getPermissionsBtn()
        if (Array.isArray(value) && value.length > 0) {
            const permissionRoles = value
            const hasPermission = btnList.some((btn: [key: string[]]) => permissionRoles.includes(btn))
            if (!hasPermission) {
                // 隐藏
                // el.style.display = "none"
                // 销毁
                el.parentNode?.removeChild(el)
            }
        } else {
            throw new Error(`need roles! Like v-permission="['admin','editor']"`)
        }
    }
}
