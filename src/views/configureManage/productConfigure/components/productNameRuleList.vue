<template>
  <pt-table
    ref="PtTableRef"
    :locale="locale"
    :tableColumns="tableColumns"
    :tableEditConfig="tableEditConfig"
    :paginationConfig="paginationConfig"
    :menuConfig="menuConfig"
    :data="tableData"
    border
    highlight-current-row
    size="small"
    @row-click="handleRowClick"
    @row-dblclick="handleRowDblclick"
  >
    <!-- 自定义列模板插槽 -->
    <!-- <template #head-search="{ column }">
      <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
    </template> -->
    <template #col-expressions="{ row }">
      <span v-text="getText_expressions(row)"></span>
    </template>
    <template #col-result="{ row }">
      <span v-text="getText_result(row)"></span>
    </template>
    <template #col-operate="{ row }">
      <el-button
        type="success"
        link
        size="small"
        @click="goEdit(row)"
      >修改</el-button>
      <el-button
        type="primary"
        link
        size="small"
        @click="goDel(row)"
      >删除</el-button>
    </template>
  </pt-table>
</template>

<script setup lang="ts">
import { ref, reactive, type PropType } from "vue"
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType
} from "@/plugins/pt-front"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {}
  },
})
const emits = defineEmits(["editProductNameRule", "delProductNameRule"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()

//#region 增、删、改、查
// 获取列表
const getList = (list: any[]) => {
  tableData.value = list || []
}
const goDel = (row: any) => {
  ElMessageBox.confirm('是否确认删除该数据？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t("dashboardPage.confirm"),
    cancelButtonText: t("dashboardPage.cancel"),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    emits('delProductNameRule', row)
  })
}
const goEdit = (row: any) => {
  emits('editProductNameRule', row)
}
// 获取条件文本
const getText_expressions = (row: any) => {
  const expressions = row.expressionList || []
  const expressionList: string[] = []
  expressions.forEach((ele: any) => {
    const str = `${ele.logicalSymbol} ${ele.optionName} ${ele.operator} "${ele.choiceName}"`
    expressionList.push(str)
  })
  return `IF(${expressionList.join(' ')})`
}
// 获取结果文本
const getText_result = (row: any) => {
  const result = row.resultList || []
  const resultList: string[] = []
  result.forEach((ele: any) => {
    const str = `${ele.resultChoiceName}->${ele.shortName}`
    resultList.push(str)
  })
  return `${resultList.join(' ')}`
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log("row-click", row)
  setCurrent(row)
}
const handleRowDblclick = (row: any, column: any, event: any) => {
  console.log("handleRowDblclick", row)
  goEdit(row)
}
// 事件
const setCurrent = (row?: any) => {
  chooseRow.value = row
  PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  size: "small",
  colSetShow: false,
  show: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
    type: "index",
    label: '序号',
    width: '55',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "expressions",
    label: '条件',
    // showOverflowTooltip: true,
    show: true,
    slot: 'expressions',
    headerAlign: "center",
  },
  {
    prop: "result",
    label: '品名规则',
    // showOverflowTooltip: true,
    show: true,
    slot: 'result',
    headerAlign: "center",
  },
  {
    label: '操作',
    width: '115',
    fixed: 'right',
    headerAlign: "center",
    // showOverflowTooltip: true,
    show: true,
    slot: 'operate'
  },
])
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
  show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: true
})
//#endregion

//#endregion

defineExpose({
  getList,
  tableData
})
</script>

<style lang="scss" scoped></style>
