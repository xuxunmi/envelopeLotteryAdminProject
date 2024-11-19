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
    name: "specialConfigOrder"
})

const orderType = ref("3")
//#endregion

</script>

<style lang="scss" scoped></style>
