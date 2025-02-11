/** 布局配置 */
interface LayoutSettings {
    /** 是否显示 Settings Panel */
    showSettings: boolean
    /** 是否显示标签栏 */
    showTagsView: boolean
    /** 是否显示侧边栏 Logo */
    showSidebarLogo: boolean
    /** 是否固定 Header */
    fixedHeader: boolean
    /** 是否显示消息通知 */
    showNotify: boolean
    /** 是否显示切换主题按钮 */
    showThemeSwitch: boolean
    /** 是否显示全屏按钮 */
    showScreenfull: boolean
    /** 是否显示灰色模式 */
    showGreyMode: boolean
    /** 是否显示色弱模式 */
    showColorWeakness: boolean
    /** 是否显示切换语言 */
    showLanguage: boolean
    /** 是否显示头部查询 */
    showHeadQuery: boolean
    /** 是否显示发起变更通知按钮 */
    showInitiateChangeNotice: boolean
    /** 是否显示设置 */
    showHeadSetting: boolean
}

const layoutSettings: LayoutSettings = {
    showSettings: false,
    showTagsView: true,
    fixedHeader: true,
    showSidebarLogo: true,
    showNotify: false,
    showThemeSwitch: false,
    showScreenfull: false,
    showGreyMode: false,
    showColorWeakness: false,
    showLanguage: false,
    showHeadQuery: true,
    showInitiateChangeNotice: true,
    showHeadSetting: true
}

export default layoutSettings
