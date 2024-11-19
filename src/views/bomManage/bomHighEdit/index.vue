<template>
  <div class="app-container">
    <div v-loading="loading" class="sf-container">
      <div class="sf-container-header">
        <el-button
          type="primary"
          size="small"
          @click="save"
          :disabled="!highEditData.length"
        >保存</el-button>
        <el-button
          type="primary"
          size="small"
          @click="goBOMCompare"
        >比较</el-button>
        <el-button
          type="primary"
          size="small"
          @click="closeTab"
        >退出</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!highEditData.length"
          @click="cancelEdit"
        >取消编辑</el-button>
      </div>
      <div class="sf-container-main">
        <drop-line left-width="50%">
          <template #left>
            <div class="sf-container-main-content">
              <div class="sf-table-wrapper">
                <LeftBom
                  ref="LeftBomRef"
                  from="bomHighEdit_left"
                  :topObject="leftObj"
                  @afterRefresh="handleAfterRefresh_left"
                  @goPaste="goPaste"
                  @goCopy="goCopy"
                  @goCut="goCut"
                  @clearHighEditData="clearHighEditData"
                  @goHighEdit_add="goHighEdit_add"
                  @goHighEdit_del="goHighEdit_del"
                  @goHighEdit_prop="goHighEdit_prop"
                  @changeCanDrag="changeCanDrag"
                  @cancelEdit="cancelEdit"
                />
              </div>
            </div>
          </template>
          <template #right>
            <div class="sf-container-main-content">
              <div class="sf-table-wrapper">
                <RightBom
                  ref="RightBomRef"
                  from="bomHighEdit_right"
                  :topObject="rightObj"
                  @goCopy="goCopy"
                  @afterRefresh="handleAfterRefresh_right"
                  @chooseObj="getList_right"
                />
              </div>
            </div>
          </template>
        </drop-line>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onActivated } from "vue"
import { useRoute, useRouter } from "vue-router"
import DropLine from "@/components/dropLine/index.vue"
import LeftBom from "@/views/bomManage/productBom/components/pBom.vue"
import RightBom from "@/views/bomManage/productBom/components/pBom.vue"
import { bomInsertPart, saveBom } from "@/api/bomManage/productBom/index";
import { findDomByClass, recursionArray } from "@/utils"
import { MaterialInterface } from "@/interface/materiel"
import { type TagView, useTagsViewStore } from "@/store/modules/tags-view"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
  name: "bomHighEdit"
})
const route = useRoute()
const router = useRouter()
const instance: any = getCurrentInstance()
const tagsViewStore = useTagsViewStore()
const { t, locale } = useI18n()
const loading = ref(false)

onActivated(() => {
  console.log("路由参数query：", route.query)
  if (leftObj.PartOid !== route.query.oid) {
    getList_left({
      PartOid: route.query.oid as string,
      Number: route.query.number as string,
    })
  }
})
//#endregion

//#region BOM高级编辑
// 退出
const closeTab = () => {
  console.log('closeTab', route, route.path, tagsViewStore.visitedViews);
  tagsViewStore.visitedViews.forEach((view) => {
      console.log(view, route);
      if (view.path === route.path) {
          // 删除标签
          tagsViewStore.delVisitedView(view)
          tagsViewStore.delCachedView(view)
          toLastView(tagsViewStore.visitedViews)
      }
  })
}
const toLastView = (visitedViews: TagView[]) => {
    const latestView = visitedViews.slice(-1)[0]
    if (latestView !== undefined && latestView.fullPath !== undefined) {
        router.push(latestView.fullPath)
    } else {
        router.push("/")
    }
}
// 取消编辑
const cancelEdit = () => {
  if (highEditData.value.length) {
    ElMessageBox.confirm('取消将无法保存您编辑的信息，您确认要取消吗?', '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: 'warning',
        center: true,
      }
    )
    .then(() => {
      highEditData.value = []
      instance.refs.LeftBomRef.getList()
    })
  } else {
    instance.refs.LeftBomRef.getList()
  }
}
// BOM比较
const goBOMCompare = () => {
  instance.refs.LeftBomRef.goBOMCompare(instance.refs.LeftBomRef.chooseRow)
}

//#region 编辑操作
type highEditDataType = {
  frontEndID?: string
  LinkOid?: string
  findNumber?: string
  isCropping?: string
  Amount?: string
  highEditProps: {
    type: string  // 操作类型(addExist: 添加现有的; addNew: 添加新的; del: 删除; prop: 属性编辑;)
    oid: string // 物料oid
    parentOid: string // 父级物料oid
    parentFrontEndID: string // 父级物料前端oid
    params: any // 新增子件参数
  }
}
const highEditData = ref<highEditDataType[]>([]) // 高级编辑操作
// 清空操作队列
const clearHighEditData = () => {
  highEditData.value = []
}
// 保存
const keys = ['isCropping', 'Amount', 'remark', 'location']
const save = () => {
  const params: {
    dels: { LinkOid: string }[]
    exists: { ParentPartOid: string, PartOid:string, findNumber:string }[]
    news: any[]
  } = {
    dels: [] as any[],
    exists: [],
    news: []
  }
  highEditData.value.forEach(ele => {
    switch (ele.highEditProps.type) {
      case 'addExist':
        keys.forEach(key => {
          if (!ele.highEditProps.params.hasOwnProperty(key)) ele.highEditProps.params[key] = ''
        })
        params.exists.push(ele.highEditProps.params)
        break;
      case 'prop':
        keys.forEach(key => {
          if (!ele.highEditProps.params.hasOwnProperty(key)) ele.highEditProps.params[key] = ''
        })
        params.exists.push(ele.highEditProps.params)
        break;
      case 'addNew':
        params.news.push(ele.highEditProps.params)
        break;
      case 'del':
        params.dels.push(ele.highEditProps.params)
        break;

      default:
        break;
    }
  })
  console.log('save', highEditData.value, params);
  loading.value = true
  saveBom(params).then(data => {
    ElMessage.success('保存成功！')
    getList_left({
      PartOid: route.query.oid as string,
      Number: route.query.number as string,
    })
  })
  .finally(() => loading.value = false)
}
// 添加操作队列
const goHighEdit_add = (obj: any) => {
  console.log('goHighEdit_add', obj);
  for (let i = 0; i < highEditData.value.length; i++) {
    const ele = highEditData.value[i];
    if (obj.frontEndID === ele.frontEndID) {
      if (ele.highEditProps.type === 'prop') {
        ele.highEditProps.type = obj.highEditProps.type
        return true
      } else {
        ElMessage.error('操作已存在！')
        return false
      }
    }
  }
  highEditData.value.push(obj)
}
// 移除操作队列
const goHighEdit_del = (row: any) => {
  console.log('goHighEdit_del', row);
  for (let i = 0; i < highEditData.value.length; i++) {
    const ele = highEditData.value[i];
    if (row.frontEndID === ele.frontEndID) {
      highEditData.value.splice(i, 1)
      return true
    }
  }
}
// 编辑属性
const goHighEdit_prop = (row: any, prop: any, newVal: any) => {
  console.log('goHighEdit_prop', row, prop, newVal);
  for (let i = 0; i < highEditData.value.length; i++) {
    const ele: any = highEditData.value[i];
    if (row.frontEndID === ele.frontEndID) {
      // 已存在
      if (row.oldData && row.oldData[prop] === newVal && ele.highEditProps.type === 'prop') {
        let flag = true
        Object.keys(row.oldData).forEach(key => {
          if (row.oldData[key] !== row[key]) flag = false
        })
        if (flag) {
          highEditData.value.splice(i, 1)
        } else {
          keys.forEach(key => {
            ele[key] = row[key]
            ele.highEditProps.params[key] = row[key]
          })
        }
      } else {
        keys.forEach(key => {
          ele[key] = row[key]
          ele.highEditProps.params[key] = row[key]
        })
      }
      return true
    }
  }
  // 未存在
  const obj = {
    ...row,
    highEditProps: {
      type: 'prop',
      oid: row.PartOid,
      parentOid: row.parentOid,
      parentFrontEndID: row.parentFrontEndID,
      params: {
        ParentPartOid: row.parentOid,
        PartOid: row.PartOid,
        findNumber: "",
      }
    }
  }
  keys.forEach(key => obj.highEditProps.params[key] = row[key])
  highEditData.value.push(obj)
}
//#endregion

//#region 复制/粘贴/剪切
const cutObjs = ref<any[]>([])  // 剪切对象
const copyObjs = ref<any[]>([]) // 复制对象
// 复制
const goCopy = (rows: any[]) => {
  console.log('goCopy', rows);
  try {
    copyObjs.value = JSON.parse(JSON.stringify(rows))
    ElMessage.success("复制成功！")
  } catch (error) {
    console.log('goCopy error:', rows, error);
    ElMessage.success("复制失败！")
  }
}
// 剪切
const goCut = (rows: any[]) => {
  console.log('goCut', rows);
  try {
    cutObjs.value = JSON.parse(JSON.stringify(rows))
    ElMessage.success("剪切成功！")
  } catch (error) {
    console.log('goCut error:', rows, error);
    ElMessage.success("剪切失败！")
  }
}
// 粘贴
const goPaste = (row: any) => {
  console.log('goPaste', row, cutObjs.value, copyObjs.value);
  if (row.materialType === 'wt.part.WTPart|com.pdinfo.kbomMODULE') {
    ElMessage.error('模块下不能再新增子件！')
    return false
  }
  let pasteObjs = []
  if (cutObjs.value.length) {
    // 剪切对象优先
    pasteObjs = cutObjs.value
    cutObjs.value = []
  } else {
    pasteObjs = copyObjs.value
    copyObjs.value = []
  }
  if (!pasteObjs.length) {
    ElMessage.warning('未复制对象！')
    return false
  }
  const objs: any[] = []
  pasteObjs.forEach(ele => {
    const obj = {
      ...ele,
      leaf: ele.leaf,
      isTop: false,
      parentOid: row.oid,
      parentFrontEndID: row.frontEndID,
      Amount: ele.Amount || 1,
      highEditProps: {
        type: 'addExist',
        oid: ele.PartOid,
        parentOid: row.PartOid,
        parentFrontEndID: row.frontEndID,
        params: {
          ParentPartOid: row.PartOid,
          PartOid: ele.PartOid,
          findNumber: row.findNumber || '',
          Amount: ele.Amount || 1,
        }
      }
    }
    objs.push(obj)
  })
  instance.refs.LeftBomRef.addPart(objs)
  // 插入对象
  // let params = {
  //   PartOid: copyObjs.PartOid,
  //   ParentPartOid: row.PartOid,
  //   findNumber: copyObjs.findNumber,
  // }
  // bomInsertPart(params).then(data => {
  //   ElMessage.success(t('productBomPage.insertSuccessful'))
  //   instance.refs.LeftBomRef.partRefresh()
  // })
}
//#endregion

//#endregion

//#region 左侧树
const leftObj = reactive({
    PartOid: "",
    Number: ""
})
const handleAfterRefresh_left = () => {
  // initFrameSelect()
  initPutDom()
}
// 获取列表
const getList_left = ({ PartOid, Number }: { PartOid: string, Number: string}) => {
  Object.assign(leftObj, { PartOid, Number})
  console.log('getList_left', leftObj, PartOid, Number);
  instance.refs.LeftBomRef.getShowRuleDetails()
}
// 初始化拖拽入元素
const initPutDom = () => {
  const leftList = instance.refs.LeftBomRef.$el.querySelector('.pBom .el-table__body-wrapper .el-table__body tbody')
  console.log('initPutDom', leftList);

  leftList.id = 'droppable'
  leftList.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault()
    const putDom = findDomByClass(e.composedPath(), 'el-table__row')
    const enterEvent = new Event('mouseenter', { bubbles: true });
    const overEvent = new Event('mouseover', { bubbles: true });
    putDom.dispatchEvent(enterEvent);
    putDom.dispatchEvent(overEvent);
  })
  leftList.addEventListener('drop', (e: DragEvent) => {
    console.log('drop', e);
    const putDom = findDomByClass(e.composedPath(), 'el-table__row')
    const putDataDom = putDom.querySelector('.dataDom')
    const pullDataStr = e.dataTransfer?.getData('pullData')
    if (putDataDom.dataset.type === 'wt.part.WTPart|com.pdinfo.kbomMODULE') {
      ElMessage.error('模块下不能再新增子件！')
      return false
    }
    if (
      !pullDataStr
      || putDataDom.dataset.highedittype === 'del'
    ) return false
    const pullData = JSON.parse(pullDataStr)
    const obj = {
      ...pullData,
      leaf: pullData.leaf,
      isTop: false,
      Amount: pullData.Amount || 1,
      highEditProps: {
        type: 'addExist',
        oid: pullData.PartOid,
        parentOid: putDataDom.dataset.oid,
        parentFrontEndID: putDataDom.dataset.id,
        params: {
          ParentPartOid: putDataDom.dataset.oid,
          PartOid: pullData.PartOid,
          findNumber: putDataDom.dataset.findnumber || '',
          Amount: pullData.Amount || 1,
        }
      }
    }
    console.log('ok', pullData, putDataDom.dataset, obj);
    instance.refs.LeftBomRef.addPart([obj])
    // let params = {
    //   PartOid: pullData.oid,
    //   ParentPartOid: putDataDom.dataset.oid,
    //   findNumber: pullData.number,
    // }
    // bomInsertPart(params).then(data => {
    //   ElMessage.success(t('productBomPage.insertSuccessful'))
    //   const list = instance.refs.LeftBomRef.tableData
    //   recursionArray(list, (item: any) => {
    //     if (item.PartOid === params.ParentPartOid) {
    //       instance.refs.LeftBomRef.partRefresh(item)
    //       return 'return'
    //     }
    //   })
    // })
  })
}
// 拖拽设置
const canDrag = ref(false)
const changeCanDrag = (val: boolean) => {
  canDrag.value = val
}
//#endregion

//#region 右侧树
const rightObj = reactive({
  PartOid: "",
  Number: ""
})
// 获取列表
const getList_right = ({ PartOid, Number }: { PartOid: string, Number: string}) => {
  Object.assign(rightObj, { PartOid, Number})
  console.log('getList_right', rightObj);
  instance.refs.RightBomRef.getShowRuleDetails()
}
const handleAfterRefresh_right = () => {
  // initFrameSelect()
  initDragRow()
}
// 初始化框选
const initFrameSelect = () => {
  // const bom = instance.refs.RightBomRef
  const bom = instance.refs.LeftBomRef
  const frameEl = bom.$el.querySelector('.pBom .el-table__body-wrapper') as HTMLDivElement
  console.log('initFrameSelect', frameEl);
  let canvas: HTMLCanvasElement | null
  frameEl.onmousedown = (event: MouseEvent) => {
    const frameRect = frameEl.getBoundingClientRect()
    // console.log('onMouseDown', event);
    if (!event.shiftKey || event.button !== 0 || !frameEl) {
      event.preventDefault()
      return
    }
    const startX = event.clientX - frameRect.x
    const startY = event.clientY - frameRect.y
    let endX = startX
    let endY = startY
    // 初始化canvas
    if (canvas) frameEl.removeChild(canvas)
    canvas = document.createElement('canvas') as HTMLCanvasElement
    canvas.style.position = 'absolute'
    canvas.style.zIndex = '100'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.width = frameRect.width
    canvas.height = frameRect.height
    frameEl.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    frameEl.onmousemove = (event: MouseEvent) => {
      // console.log('onMouseMove', event);
      endX = event.clientX - frameRect.x
      endY = event.clientY - frameRect.y
      if (!ctx || !canvas) return false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // 绘制框选
      ctx.fillStyle = 'rgba(28, 122, 244, 0.3)'
      const rectWidth = endX - startX
      const rectHeight = endY - startY
      ctx.fillRect(startX, startY, rectWidth, rectHeight)

      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(28, 122, 244, 1)'
      ctx.strokeRect(startX, startY, rectWidth, rectHeight)
    }
    frameEl.onmouseup = () => {
      const rows = frameEl.querySelectorAll('tr')
      const list: any[] = []
      rows.forEach(row => {
        const rowRect = row.getBoundingClientRect()
        const min = Math.min(startY, endY)
        const max = Math.max(startY, endY)
        const top = rowRect.top - frameRect.top
        const bottom = rowRect.bottom - frameRect.top
        if ((top >= min && top <= max) || (bottom >= min && bottom <= max)) {
          const dataDom = row.querySelector('.dataDom') as HTMLDivElement
          if(dataDom?.dataset.id) list.push(dataDom.dataset.id)
        }
      })
      console.log('list', list);
      bom.goSelectRows(list)
      if (canvas) {
        frameEl.removeChild(canvas)
        canvas = null
      }
      frameEl.onmousemove = null
      frameEl.onmouseup = null
      frameEl.onresize = null
    }
  }
}
// 初始化拖拽行
const initDragRow = () => {
  const rightList = instance.refs.RightBomRef.$el.querySelector('.pBom .el-table__body-wrapper .el-table__body tbody')
  console.log('initDragRow', rightList);

  rightList.onmousedown = (e: Event) => {
      // console.log("onmousedown", e)
      const domList = e.composedPath()
      const pullDom = findDomByClass(domList, "el-table__row")
      const dataDom = pullDom.querySelector(".dataDom")
      const chooseRow = instance.refs.RightBomRef.chooseRow
      if (!dataDom || dataDom.dataset.id !== chooseRow?.frontEndID || !canDrag.value) return false
      pullDom.draggable = true

      pullDom.ondragstart = (e: DragEvent) => {
          // console.log("ondragstart", e)
          let data
          const tableData = instance.refs.RightBomRef.tableData
          recursionArray(tableData, (item) => {
              if (item.PartOid === dataDom.dataset.oid && item.Number === dataDom.dataset.number) data = item
          })
          e.dataTransfer?.setData("pullData", JSON.stringify(data))
          // e.dataTransfer?.setDragImage(pullDom, -30, 30)
      }
      pullDom.ondragend = (e: DragEvent) => {
          // console.log("ondragend", e)
          pullDom.draggable = false
          pullDom.ondrag = null
          pullDom.ondragend = null
      }
  }
}
//#endregion

</script>

<style lang="scss" scoped>

</style>
