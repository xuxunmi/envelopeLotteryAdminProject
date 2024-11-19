<template>
  <ul
    v-if="showMenu"
    ref="ptMenuRef"
    class="pt-menu"
    @click="hidden"
  >
    <!-- 自定义菜单 -->
    <slot :row="rightMenuRow"></slot>
    <!-- 默认菜单 -->
    <!-- <li @click="$emit('checkMenu', '菜单', rightMenuRow)">菜单</li> -->
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

//#region 参数和方法
const props = defineProps({
  showMenu: {
    type: Boolean,
    default: false
  },
	rightMenuRow: {
    type: Object,
    default: () => {}
  }
})
const emits = defineEmits(['checkMenu'])
onMounted(() => {
  initMenu()
})
//#endregion

//#region 菜单
const ptMenuRef = ref<HTMLElement>()

// 初始化表格右键菜单
const initMenu = () => {
  document.addEventListener('click', (e: MouseEvent) => {
    const menu = ptMenuRef.value
    if (menu && !menu.contains(e.target as HTMLElement)) hidden()
  }, false)
}
// 显示
const show = (event: MouseEvent, rect: any) => {
  event.preventDefault();
  if (!props.showMenu) return false
  const menu = ptMenuRef.value
  if (!menu) return false
  menu.style.display = "block";
  nextTick(() => {
    // 根据事件对象中鼠标点击的位置，进行定位
    if ((event.clientX - rect.x + menu.clientWidth) > rect.width) {
      menu.style.left = event.clientX - rect.x - menu.clientWidth + "px"
    } else {
      menu.style.left = event.clientX - rect.x + "px"
    }
    if ((event.clientY - rect.y + menu.clientHeight) > rect.height) {
      menu.style.top = event.clientY - rect.y - menu.clientHeight + "px"
    } else {
      menu.style.top = event.clientY - rect.y + "px"
    }
  })
}
// 隐藏
const hidden = () => {
  const menu = ptMenuRef.value
  if (menu) menu.style.display = "none";
}
//#endregion

// 向外暴露方法
defineExpose({
  show,
  hidden
})
</script>
<style lang='scss' scoped>
.pt-menu {
  position: absolute;
  display: none;
  padding: 5px 0;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, .12);
  font-size: 14px;
  z-index: 1000;
  list-style: none;
  :deep(li) {
    cursor: pointer;
    padding: 5px 16px;
    list-style: none;
    line-height: 22px;
    &:hover {
      background-color: #ecf5ff;
      color: #409eff;
    }
  }
}
</style>
