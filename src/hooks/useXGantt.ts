// 初始化列表拖拽修改宽度
export function initDragTable(queryName: string, colWidth: any) {
  nextTick(() => {
    const xgRoot = document.querySelector((queryName || '') + ' .xg-root') as HTMLDivElement
    if (!xgRoot) {
      console.error('initDragTable - 获取甘特图组件失败：' + (queryName || '') + ' .xg-root');
      return false
    }
    const rootRect = xgRoot.getBoundingClientRect()
    const xgMoveLine = xgRoot.querySelector('.xg-move-line') as HTMLDivElement
    const header = xgRoot.querySelector('.xg-table-container .xg-table-header tr') as HTMLDivElement
    const thList = header.querySelectorAll('.xg-table-header-cell') as NodeListOf<HTMLDivElement>
    const separateLine = xgRoot.querySelector('.xg-mid-separate-line') as HTMLDivElement
    const table = xgRoot.querySelector('.xg-table-container') as HTMLDivElement
    // 表头拖拽修改宽度
    thList.forEach((ele, i) => {
      const thClone = ele.cloneNode(true) as HTMLDivElement
      if (i + 1 === thList.length) thClone.classList.add('xg-table-header-cell-resizable')
      thClone.addEventListener('pointerdown', (event: PointerEvent) => {
        // console.log('event', event);
        let startLeft = 0
        let endLeft = 0
        let moveX = 0
        document.onselectstart = function() { return false; }
        document.ondragstart = function() { return false; }
        const target = event.target as HTMLElement
        const targetWidth = target.clientWidth + 1
        startLeft = endLeft = event.clientX - (rootRect?.left ?? 0)
        xgMoveLine.style.left = startLeft + 'px'
        xgMoveLine.style.display = 'block'
        xgRoot.style.cursor = 'col-resize'

        const move = (e: PointerEvent) => {
          endLeft = e.clientX - (rootRect?.left ?? 0)
          if (endLeft- startLeft + targetWidth >= 40) {
            moveX = endLeft- startLeft
            xgMoveLine.style.left = endLeft + 'px'
          }
        }
        const up = (e: PointerEvent) => {
          // console.log('result', startLeft, endLeft, moveX, targetWidth);
          xgMoveLine.style.left = 0 + 'px'
          xgMoveLine.style.display = 'none'
          xgRoot.style.cursor = 'initial'
          changeColumnWidth(target, (moveX + targetWidth))
          xgRoot.removeEventListener('pointermove', move)
          xgRoot.removeEventListener('pointerup', up)
          document.onselectstart = null
          document.ondragstart = null
        }
        xgRoot.addEventListener('pointermove', move)
        xgRoot.addEventListener('pointerup', up)
      })
      ele.remove()
      header.appendChild(thClone)
    })
    // 列表拖拽修改宽度
    separateLine.addEventListener('pointerdown', (event: PointerEvent) => {
      // console.log('event', event);
      let startLeft = 0
      let endLeft = 0
      let moveX = 0
      document.onselectstart = function() { return false; }
      document.ondragstart = function() { return false; }
      startLeft = endLeft = event.clientX - (rootRect?.left ?? 0)
      moveX = startLeft
      xgMoveLine.style.left = startLeft + 'px'
      xgMoveLine.style.display = 'block'
      xgRoot.style.cursor = 'col-resize'
      const move = (e: PointerEvent) => {
        endLeft = e.clientX - (rootRect?.left ?? 0)
        if (endLeft > 40 && endLeft < rootRect?.width - 40) {
          moveX = endLeft
          xgMoveLine.style.left = endLeft + 'px'
        }
      }
      const up = (e: PointerEvent) => {
        // console.log('result', startLeft, endLeft, moveX, targetWidth);
        xgMoveLine.style.left = 0 + 'px'
        xgMoveLine.style.display = 'none'
        xgRoot.style.cursor = 'initial'
        changeTableWidth(moveX-1)
        xgRoot.removeEventListener('pointermove', move)
        xgRoot.removeEventListener('pointerup', up)
        document.onselectstart = null
        document.ondragstart = null
      }
      xgRoot.addEventListener('pointermove', move)
      xgRoot.addEventListener('pointerup', up)
    })
    // 修改列宽
    function changeColumnWidth(target: HTMLElement, width: number) {
      let name = target.innerText
      console.log(name, width);

      if (name) colWidth[name] = width
    }
    // 修改表格宽
    function changeTableWidth(moveX: number) {
      let width = moveX / rootRect?.width * 100
      table.style.maxWidth = width + '%'
    }
  })
}
