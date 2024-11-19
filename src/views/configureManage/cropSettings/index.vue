<template>
  <div class="app-container dashboard">
    <div class="sf-container">
      <PartList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import PartList from "./components/partList.vue"

//#region 参数和方法
defineOptions({
  name: "cropSettings"
})
//#endregion

</script>

<style lang="scss" scoped></style>
