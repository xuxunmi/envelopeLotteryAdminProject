<template>
  <li v-if="disabled" class="pt-menu-li disabled" @click.capture.stop>
      <slot></slot>
  </li>
  <li v-else class="pt-menu-li">
      <slot></slot>
  </li>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';

//#region 参数和方法
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
})
//#endregion

//#region 菜单选项

//#endregion

</script>
<style lang='scss' scoped>
.pt-menu-li {
  cursor: pointer;
  padding: 5px 16px;
  list-style: none;
  line-height: 22px;
  &:hover {
    background-color: #ecf5ff;
    color: #409eff;
  }
  &.disabled {
    cursor: not-allowed !important;
    color: #c0c4cc !important;
    background-color: #fff !important;
  }
}
</style>
