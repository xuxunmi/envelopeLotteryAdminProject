// core
import { createApp } from "vue"
import App from "@/App.vue"
import store from "@/store"
import router from "@/router"
import "@/router/permission"
// load
import { loadSvg } from "@/icons"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import { loadDirectives } from "@/directives"
// css
import "uno.css"
import "normalize.css"
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "vxe-table/lib/style.css"
import "vxe-table-plugin-element/dist/style.css"
import "@/styles/index.scss"
// 自定义表格
import PtFront from "@/plugins/pt-front"
import "@/plugins/pt-front/dist/style.css"
import VuePdf from "vue3-pdfjs"

// 引入i18n语言国际化
import i18n from "@/lang/i18n"

const app = createApp(App)
app.use(VuePdf)

/** 注册所有 Element Plus Icon */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
/** 加载全局 SVG */
loadSvg(app)
/** 加载自定义指令 */
loadDirectives(app)

app.use(store).use(router).use(PtFront).use(i18n)
router.isReady().then(() => {
    app.mount("#app")
})
