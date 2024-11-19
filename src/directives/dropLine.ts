import { type Directive } from "vue"

/** 拖拽指令 */
export const dropLine: Directive = {
  mounted(el, binding) {
    let starX:number, startWidth:number
    const preDom = el.previousElementSibling
    const [leftMinWidth, rightMinWidth] = binding.value || [300, 400]
    el.onmousedown = (e: any) => {
      starX = e.clientX
      startWidth = preDom.clientWidth
      e.preventDefault()
      document.onmousemove = (e: any) => {
        let parentWidth = el.parentNode.clientWidth
        let preWidth = startWidth + e.clientX - starX
        let nextWidth = parentWidth - preWidth
        if (preWidth >= leftMinWidth && nextWidth >= rightMinWidth) {
          preDom.style.width = preWidth + 'px'
        }
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
}
