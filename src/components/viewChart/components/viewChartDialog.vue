<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="1200px"
    top="5vh"
    append-to-body
    fullscreen
    draggable
    overflow
  >
    <div class="viewChartDialog">
      <ViewChart
        :data="{
          url
        }"
        type="pdfViewer"
        :showMax="false"
        style="width: 100%;height: calc(91vh - 54px);margin: auto;"
      />
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import ViewChart from "../index.vue";
//#region 参数和方法
const props = defineProps({
  url: String,
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: ''
    }
  },
})
//#endregion

</script>
<style lang="scss" scoped>
</style>
