<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="1340px"
    :append-to-body="true"
    draggable
    overflow
  >
    <div>
      <el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      v-loading="loading"
      border>
        <el-table-column
          align="center"
          prop="xuhao"
          label="序号"
          width="180">
        </el-table-column>
        <el-table-column
          align="center"
          prop="State"
          label="状态"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.State) }">
              {{ extractContent(scope.row.State) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="Type"
          label="行数据类型"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.Type) }">
              {{ extractContent(scope.row.Type) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ParentNumber"
          label="父件编码"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ParentNumber) }">
              {{ extractContent(scope.row.ParentNumber) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ParentName"
          label="父件名称"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ParentName) }">
              {{ extractContent(scope.row.ParentName) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ParentDetail"
          label="父件详细描述"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ParentDetail) }">
              {{ extractContent(scope.row.ParentDetail) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="LineNum"
          label="位置号"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.LineNum) }">
              {{ extractContent(scope.row.LineNum) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ChildNum"
          label="子件编码"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ChildNum) }">
              {{ extractContent(scope.row.ChildNum) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ChildName"
          label="子件名称"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ChildName) }">
              {{ extractContent(scope.row.ChildName) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ChildDetail"
          label="子件详细描述"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ChildDetail) }">
              {{ extractContent(scope.row.ChildDetail) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="Amount"
          label="数量"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.Amount) }">
              {{ extractContent(scope.row.Amount) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="St"
          label="ST"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.St) }">
              {{ extractContent(scope.row.St) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="DefaultUnti"
          label="单位"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.DefaultUnti) }">
              {{ extractContent(scope.row.DefaultUnti) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="Cr"
          label="CR"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.Cr) }">
              {{ extractContent(scope.row.Cr) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus"
import type { TableColumnCtx } from 'element-plus'
import { getBOMChangeInfo } from "@/api/flowDetail";
//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: ''
    }
  },
  flowTaskID: String,
  userInfo: Object,
})
const loading = ref(false)
onMounted(() => {
  init()
})
//#endregion

//#region 表格
const tableData = ref<any>([])
// 初始化
const init = () => {
  getList()
}
const getList = () => {
  loading.value = true
  let params = {
    flowTaskID: props.flowTaskID || '',
    employeeNo: props.userInfo?.employeeNo || '',
  }
  getBOMChangeInfo(params).then((res: any) => {
    if(res.data.length===0){
      loading.value = false
      ElMessage.error('暂无更改记录！')
    } else {
      tableData.value = res.data.sort((a: any, b: any) => {
        return a.xuhao - b.xuhao
      })
    }
  })
}
const extractColor = (text: string) => {
  const matchResult = /<font.*color="(.*?)"/.exec(text); // 提取颜色值
  return matchResult ? matchResult[1] : ''; // 如果匹配成功就返回颜色值，否则为空字符串
}
const extractContent = (text: string) => {
  return text.replace(/<.*?>/g, ''); // 去除HTML标签，只显示文本内容
}
// 合并单元行
interface SpanMethodProps {
  row: any
  column: TableColumnCtx<any>
  rowIndex: number
  columnIndex: number
}
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0) { // 假设序号列是第一列（索引为0）
    if(rowIndex > 0 && row.xuhao === tableData.value[rowIndex-1].xuhao) {
      return {
        rowspan: 0,
        colspan: 0
      };
    } else {
      let rowspan = 1;
      let currentRow = tableData.value[rowIndex];
      for (let i = rowIndex + 1; i < tableData.value.length; i++) {
          const nextRow = tableData.value[i];
          if (currentRow.xuhao === nextRow.xuhao) {
              rowspan++;
          } else {
              break;
          }
      }
      return {
        rowspan,
        colspan: 1
      };
    }
  }
  loading.value = false
}
//#endregion

</script>
<style scoped></style>
