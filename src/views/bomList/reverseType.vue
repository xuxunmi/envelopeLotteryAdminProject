<template>
    <div class="app-container">
      <BomList type="reverse"/>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BomList from "./index.vue";
//#region 参数和方法
defineOptions({
  name: "reverseType"
})
//#endregion
</script>

<style lang="scss" scoped>
</style>
