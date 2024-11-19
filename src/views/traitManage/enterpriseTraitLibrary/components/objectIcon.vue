<template>
  <el-icon v-if="objectType" class="objectIcon" :size="size">
    <template v-if="objectType==='Product'">
      <!-- 产品 -->
      <Grid />
    </template>
    <template v-if="objectType==='Group'">
      <!-- 组 -->
      <Operation />
    </template>
    <template v-if="objectType==='Option'">
      <!-- 特征 -->
      <Tickets />
    </template>
    <template v-if="objectType==='Choice'">
      <!-- 特征值 -->
      <DocumentChecked />
    </template>
    <template v-if="objectType==='OptionSet'">
      <!-- 特征集 -->
      <DocumentCopy />
    </template>
    <template v-if="isCheckOut">
      <img
        v-if="isCheckUser"
        class="userIcon"
        width="8"
        src="@/assets/images/checkout.jpg"
      >
      <img
        v-else
        class="userIcon"
        width="8"
        src="@/assets/images/userCheck.jpg"
        :title="`已被${CheckOutUser}检出`"
      >
    </template>
  </el-icon>
</template>

<script setup lang="ts">
//#region 参数和方法
const props = defineProps({
  objectType: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '16px'
  },
  isCheckOut: {
    type: Boolean,
    default: false
  },
  isCheckUser: {
    type: Boolean,
    default: false
  },
  CheckOutUser: {
    type: String,
    default: ''
  },
})
//#endregion
</script>

<style lang="scss" scoped>
.objectIcon {
  color: #606266;
  .userIcon {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
