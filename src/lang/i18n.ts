import { createI18n } from "vue-i18n"
import { getLanguage } from "@/utils/cache/localStorage"
import { useInternationalStoreHook } from "@/store/modules/international"
import { getInternationalFields } from "@/utils/cache/localStorage"

// elementPlus中的语言配置
import elementZhLocale from "element-plus/es/locale/lang/zh-cn"
import elementEnLocale from "element-plus/es/locale/lang/en"

// 引入本地语言包
import zhLocale from "./zh_CN"
import enLocale from "./en_US"

const internationalStore = useInternationalStoreHook()
const { zh, en } =
    Object.keys(internationalStore.internationalFields).length === 0
        ? getInternationalFields()
        : internationalStore.internationalFields
console.log(zh, en, Object.keys(internationalStore.internationalFields))
// 配置国际化语言包
const messages = {
    zh_cn: {
        ...zhLocale, // 本地文本语言包
        ...elementZhLocale, // elementPlus语言包
        ...zh // 动态中英文
    },
    en: {
        ...enLocale,
        ...elementEnLocale,
        ...en
    }
}
console.log("messages: ", messages, getLanguage() || "zh_cn")
// 配置i18n
const i18n = createI18n({
    legacy: false, // 如果想在composition api中使用需要设置为false
    globalInjection: true, // 全局模式，可以直接使用 $t
    locale: getLanguage() || "zh_cn",
    silentTranslationWarn: true, // 是否取消本地化失败时输出的警告
    messages
})

export default i18n
