import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 获取菜单列表
export function getMenuTreeData(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/menu/tree",
        method: "post",
        data
    })
}

// 获取菜单详情列表
export function getMenuTreeDetail(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/menu/getDetail",
        method: "post",
        data
    })
}

// 获取字段翻译保存
export function fieldTranslateBatchSave(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/menu/saveBatch",
        method: "post",
        data
    })
}

// 获取中英文国际化
export function getInternationalFieldsData(data: object) {
    return request<any>({
        url: env.VITE_APP_PDM + "/servlet/rest/menu/getTranslateList",
        method: "post",
        data
    })
}
