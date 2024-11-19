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
    max-height="calc(70vh - 212px)"
    @row-click="handleRowClick"
    style="width: 100%"
  ></pt-table>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import { getFindPartList } from "@/api/bomManage/productBom/index";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  formData: {
    type: Object,
    default: {}
  },
})
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
// 获取列表
const getList = () => {
  getFindPartList(props.formData).then(data => {
    console.log(data);
    tableData.value = data.data || []
  }).catch(err => {
    tableData.value = []
  })
}

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log('row-click', row);
  chooseRow.value = row
}
// 事件
const setCurrent = (row?: any) => {
  PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  show: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
    prop: "PartNumber",
    label: computed(() => t("productBomPage.PartNumber")) as any,
    width: '180',
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "PartName",
    label: computed(() => t("productBomPage.PartName")) as any,
    // showOverflowTooltip: true,
    show: true,
  },
])
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
  show: false,
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: false
})
//#endregion

//#endregion

// 向外暴露方法
defineExpose({ chooseRow, getList })
</script>

<style lang="scss" scoped>
</style>

