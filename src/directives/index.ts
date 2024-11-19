import { type App } from "vue"
import { type Directive } from "vue"
import { permission } from "./permission"
import { fullScreen } from "./fullScreen"
import { dropLine } from "./dropLine"

/** 挂载自定义指令 */
export function loadDirectives(app: App) {
  app.directive("permission", permission)
  app.directive("dropLine", dropLine)
  app.directive("fullScreen", fullScreen)
}
