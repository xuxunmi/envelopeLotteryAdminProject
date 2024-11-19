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
    <div class="viewDocument">
      <div class="left">
        <ViewChart
          :data="data"
          :showMax="false"
          type="pdfViewer"
          style="width: 100%;height: calc(91vh - 54px);"
        />
      </div>
      <div class="right">
        <table class="infoTable">
          <tr>
            <th style="width: 101px;">文件名</th>
            <td>{{ data?.name || '' }}</td>
          </tr>
          <tr>
            <th>编号</th>
            <td style="color: #409EFF;">
              {{ data?.number || '' }}
              <!-- <el-button text></el-button> -->
            </td>
          </tr>
          <tr>
            <th>名称</th>
            <td>{{ data?.name || '' }}</td>
          </tr>
          <tr>
            <th>状态</th>
            <td>{{ data?.state || '' }}</td>
          </tr>
          <tr>
            <th>修改者</th>
            <td style="color: #409EFF;">
              {{ data?.modifyer || '' }}
              <!-- <el-button text></el-button> -->
            </td>
          </tr>
          <tr>
            <th>上次更改时间</th>
            <td>{{ data?.modifyTime || '' }}</td>
          </tr>
        </table>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import ViewChart from "../index.vue";
//#region 参数和方法
const props = defineProps({
  data: Object,
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
.viewDocument {
  display: flex;
  gap: 20px;
  .left {
    flex: 1;
  }
  .right {
    width: 300px;
  }
  .infoTable {
    width: 100%;
    border-collapse: collapse;
    th, td {
      padding: 8px;
      border: 1px solid #ebeef5;
    }
    th {
      background-color: #f5f7fa;
      text-align: left;
    }
  }
}
</style>
