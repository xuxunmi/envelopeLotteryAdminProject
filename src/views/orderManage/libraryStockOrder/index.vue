<template>
  <div class="app-container">
    <KeepAlive>
      <OrderMangerPage :orderType="orderType" />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import OrderMangerPage from "@/views/orderManage/components/orderMangerPage.vue";

//#region 参数和方法
defineOptions({
    name: "libraryStockOrder"
})

const orderType = ref("4")
//#endregion

</script>

<style lang="scss" scoped></style>
