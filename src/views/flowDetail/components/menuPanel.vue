<template>
  <ul ref="menuPanelRef" class="menuPanel">
    <li v-if="rowObjType==='part'" @click="$emit('checkMenu', '查询BOM')">查询BOM</li>
    <li v-if="rowObjType==='part'" @click="$emit('checkMenu', 'BOM一键比对')">BOM一键比对(抄表)</li>
    <li v-if="rowObjType==='part'&&flowTaskData?.flowTasktype==='ECA'" @click="$emit('checkMenu', '物料更改记录')">物料更改记录</li>
    <li v-if="rowObjType==='part'&&flowTaskData?.flowTasktype==='ECA'" @click="$emit('checkMenu', 'BOM更改记录')">BOM更改记录</li>
  </ul>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
//#region 参数和方法
const props = defineProps({
  rowObjType: String,
  flowTaskData: Object,
})
const instance: any = getCurrentInstance()
onMounted(() => {
  initMenu() // 初始化表格右键菜单
})
//#endregion

// 初始化表格右键菜单
const initMenu = () => {
  document.addEventListener('click', (e) => {
    const menu = instance.refs.menuPanelRef
    if (menu && !menu.contains(e.target)) hidden()
  }, false)
}
const show = (event: MouseEvent, rect: any) => {
  const menu = instance.refs.menuPanelRef
  //阻止元素发生默认的行为
  event.preventDefault();
  console.log(rect)
  // 根据事件对象中鼠标点击的位置，进行定位
  menu.style.left = event.clientX - rect.x  + "px";
  menu.style.top = event.clientY - rect.y   + "px";
  // 改变自定义菜单的隐藏与显示
  menu.style.display = "block";
}
const hidden = () => {
  const menu = instance.refs.menuPanelRef
  if (menu) menu.style.display = "none";
}
</script>
<style lang='scss' scoped>
.menuPanel {
  position: absolute;
  display: none;
  background-color: #f2f3f5;
  box-shadow: 0 0 8px #d9ecff;
  border: 1px solid #a0cfff;
  z-index: 99999;
  li {
    cursor: pointer;
    padding: 0 6px;
    &:hover {
      background-color: #a0cfff;
    }
    height: 24px;
    line-height: 24px;
  }
}
</style>
