import { ref } from "vue"
import { defineStore } from "pinia"
import projectSettings from "@/config/index"
import layoutSettings from "@/config/layout"

export const useSettingsStore = defineStore("settings", () => {
    const projectName = ref<string>(projectSettings.projectName)
    const projectName2 = ref<string>(projectSettings.projectName2)
    const fixedHeader = ref<boolean>(layoutSettings.fixedHeader)
    const showSettings = ref<boolean>(layoutSettings.showSettings)
    const showTagsView = ref<boolean>(layoutSettings.showTagsView)
    const showSidebarLogo = ref<boolean>(layoutSettings.showSidebarLogo)
    const showNotify = ref<boolean>(layoutSettings.showNotify)
    const showThemeSwitch = ref<boolean>(layoutSettings.showThemeSwitch)
    const showScreenfull = ref<boolean>(layoutSettings.showScreenfull)
    const showGreyMode = ref<boolean>(layoutSettings.showGreyMode)
    const showColorWeakness = ref<boolean>(layoutSettings.showColorWeakness)
    const showLanguage = ref<boolean>(layoutSettings.showLanguage)
    const showHeadQuery = ref<boolean>(layoutSettings.showHeadQuery)
    const showInitiateChangeNotice = ref<boolean>(layoutSettings.showInitiateChangeNotice)
    const showHeadSetting = ref<boolean>(layoutSettings.showHeadSetting)

    return {
        projectName,
        projectName2,
        fixedHeader,
        showSettings,
        showTagsView,
        showSidebarLogo,
        showNotify,
        showThemeSwitch,
        showScreenfull,
        showGreyMode,
        showColorWeakness,
        showLanguage,
        showHeadQuery,
        showInitiateChangeNotice,
        showHeadSetting
    }
})
