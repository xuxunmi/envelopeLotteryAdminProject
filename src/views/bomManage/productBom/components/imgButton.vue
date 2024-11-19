<template>
  <div v-if="disabled" class="img-button disabled" @click.capture.stop>
      <slot></slot>
  </div>
  <div v-else class="img-button">
      <slot></slot>
  </div>
</template>

<script setup lang="ts">

//#region 参数和方法
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
})
//#endregion

</script>
<style lang='scss' scoped>
.img-button {
  cursor: pointer;
  &.disabled {
    cursor: not-allowed !important;
  }
}
</style>
