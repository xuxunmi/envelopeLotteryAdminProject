import i18n from "./i18n"
/**
 * 菜单导航，页面国际化
 * @param {title} string：routeTitle('系统操作日志')
 * @returns
 */
export const routeTitle = (title: string | undefined) => {
    const hasKey = i18n.global.te("routes." + title)
    // console.log("hasKey: ", hasKey)
    if (hasKey) {
        const translateTitle = i18n.global.t("routes." + title)
        return translateTitle
    }
    return title
}
