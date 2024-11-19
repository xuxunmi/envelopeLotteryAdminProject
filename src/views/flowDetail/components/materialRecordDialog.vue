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
          prop="partNumber"
          label="零件号"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.partNumber) }">
              {{ extractContent(scope.row.partNumber) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="partName"
          label="名称"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.partName) }">
              {{ extractContent(scope.row.partName) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="PartDetails"
          label="详细描述"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.PartDetails) }">
              {{ extractContent(scope.row.PartDetails) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="EngName"
          label="英文名称"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.EngName) }">
              {{ extractContent(scope.row.EngName) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="MapSheet"
          label="图幅"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.MapSheet) }">
              {{ extractContent(scope.row.MapSheet) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="Characteristic"
          label="特性"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.Characteristic) }">
              {{ extractContent(scope.row.Characteristic) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="DrawingNo"
          label="图号"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.DrawingNo) }">
              {{ extractContent(scope.row.DrawingNo) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="PartPhase"
          label="状态"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.PartPhase) }">
              {{ extractContent(scope.row.PartPhase) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="Unit"
          label="单位"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.Unit) }">
              {{ extractContent(scope.row.Unit) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="OripartNumber"
          label="原厂零件号"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.OripartNumber) }">
              {{ extractContent(scope.row.OripartNumber) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="ProductClassification"
          label="产品分级"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.ProductClassification) }">
              {{ extractContent(scope.row.ProductClassification) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="MaterialRelease"
          label="材料放行"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.MaterialRelease) }">
              {{ extractContent(scope.row.MaterialRelease) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="FunctionalRelease"
          label="功能放行"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.FunctionalRelease) }">
              {{ extractContent(scope.row.FunctionalRelease) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="CmatNumber"
          label="材料编码"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.CmatNumber) }">
              {{ extractContent(scope.row.CmatNumber) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="DomesticMaterial"
          label="国产材料"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.DomesticMaterial) }">
              {{ extractContent(scope.row.DomesticMaterial) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="SupplyCode"
          label="供应商代码"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.SupplyCode) }">
              {{ extractContent(scope.row.SupplyCode) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="SupplyName"
          label="供应商名称"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.SupplyName) }">
              {{ extractContent(scope.row.SupplyName) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="MiddleWare"
          label="中间件"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.MiddleWare) }">
              {{ extractContent(scope.row.MiddleWare) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="OrderNum"
          label="订货号"
          width="180">
          <template #default="scope">
            <div :style="{ color: extractColor(scope.row.OrderNum) }">
              {{ extractContent(scope.row.OrderNum) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { TableColumnCtx } from 'element-plus'
import { ElMessage } from "element-plus"
import { getPartChangeInfo } from "@/api/flowDetail";
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
  getPartChangeInfo(params).then((res: any) => {
    if(res.data.length===0){
      loading.value = false
      ElMessage.error('暂无更改记录！')
    } else {
      tableData.value = res.data.sort((a:any,b:any) => {
        return a.xuhao - b.xuhao
      })
    }
  })
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
const extractColor = (text: string) => {
  const matchResult = /<font.*color="(.*?)"/.exec(text); // 提取颜色值
  return matchResult ? matchResult[1] : ''; // 如果匹配成功就返回颜色值，否则为空字符串
}
const extractContent = (text: string) => {
  return text.replace(/<.*?>/g, ''); // 去除HTML标签，只显示文本内容
}
//#endregion

</script>
<style scoped></style>
