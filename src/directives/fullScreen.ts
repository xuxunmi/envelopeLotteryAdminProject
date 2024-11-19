import { type Directive } from "vue"

const changeFullScreen = (el: any, ifFullScreen: boolean) => {
  if (ifFullScreen) {
    el.classList.add('pt-fullScreen')
  } else {
    el.classList.remove('pt-fullScreen')
  }
}

/** 全屏指令 */
export const fullScreen: Directive = {
  mounted(el, binding) {
    changeFullScreen(el, binding.value)
  },
  updated(el, binding) {
    changeFullScreen(el, binding.value)
  }
}
