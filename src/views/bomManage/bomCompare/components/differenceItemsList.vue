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
  >
    <!-- 表格编辑插槽 -->
    <template #slot-edit>
      <span class="table-edit">

      </span>
    </template>
    <!-- 自定义列模板插槽 -->
    <!-- <template #head-search="{ column }">
      <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
    </template> -->
  </pt-table>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
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
  tableData: {
    type: Array,
    default: []
  },
})
const emits = defineEmits(["goDel_option"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const chooseRow = ref()

//#region 增、删、改、查
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log("row-click", row, column)
  chooseRow.value = row
}
// 事件
const setCurrent = (row?: any) => {
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
    width: 55,
    headerAlign: "center",
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "childNumber",
    label: '左物料编号',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "compareChildNumber",
    label: '右物料编号',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "partName",
    label: '左物料名称',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "comparePartName",
    label: '右物料名称',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "qty",
    label: '左物料数量',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "compareQty",
    label: '右物料数量',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "childVersion",
    label: '左物料版本',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "compareChildVersion",
    label: '右物料版本',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  // {
  //   prop: "value",
  //   label: '说明',
  //   showOverflowTooltip: true,
  //   show: true,
  //   headerAlign: "center",
  // },
])
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
  show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: false
})
//#endregion

//#endregion

// 暴露方法
// defineExpose({})
</script>

<style lang="scss" scoped></style>
