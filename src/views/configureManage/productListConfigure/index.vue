<template>
  <div class="app-container">
    <div class="sf-container">
      <div class="sf-container-main">
        <PList
          ref="PListRef"
          class="p_list"
          type="productListConfigure"
          @handleProductClick="handleProductClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import PList from "@/views/bomManage/productBom/components/pList.vue"

//#region 参数和方法
defineOptions({
  name: "productListConfigure"
})
const instance: any = getCurrentInstance()
//#endregion

//#region PList
const topObject = ref({
    PartOid: "",
    Number: ""
})
const handleProductClick = (row: any) => {
    topObject.value = row
}
//#endregion

</script>

<style lang="scss" scoped>

</style>
