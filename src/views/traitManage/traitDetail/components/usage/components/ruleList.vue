<template>
  <pt-table
    v-loading="loading"
    ref="PtTableRef"
    :locale="locale"
    :tableColumns="tableColumns"
    :tableEditConfig="tableEditConfig"
    :paginationConfig="paginationConfig"
    :menuConfig="menuConfig"
    :data="list"
    border
    highlight-current-row
    size="small"
    @row-click="handleRowClick"
    @selection-change="handleSelectionChange"
  ></pt-table>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import { getPartRelatedObjects } from "@/api/bomManage/productDetail/index";
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
    list: {
        type: Array,
        default: []
    },
})
const loading = ref(false)
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const getList = (PartOid: string) => {
  // loading.value = true
  // let params = {
  //   PartOid,
  //   ObjType: 'EPM'
  // }
  // getPartRelatedObjects(params).then(data => {
  //   tableData.value = data.data || []
  // }).catch(err => {
  //   tableData.value = []
  // }).finally(() => {
  //   loading.value = false
  // })
}

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log('row-click', row);
}
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value);
}
// 事件
const setCurrent = (row?: any) => {
  PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  size: "small",
  colSetShow: true
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
    prop: "number",
    label: computed(() => t("traitDetailPage.ruleList_number")) as any,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "version",
    label: computed(() => t("traitDetailPage.ruleList_version")) as any,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "state",
    label: computed(() => t("traitDetailPage.ruleList_state")) as any,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "ruleType",
    label: computed(() => t("traitDetailPage.ruleList_ruleType")) as any,
    width: '120px',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "ruleDefinition",
    label: computed(() => t("traitDetailPage.ruleList_ruleDefinition")) as any,
    width: '170px',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "ruleOwnerName",
    label: computed(() => t("traitDetailPage.ruleList_ruleOwner")) as any,
    width: '140px',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "desc",
    label: computed(() => t("traitDetailPage.ruleList_explain")) as any,
    width: '140px',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "modifyTime",
    label: computed(() => t("traitDetailPage.ruleList_modifyTime")) as any,
    width: '170px',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
])
const goEdit = (row: any) => {
  console.log('编辑', row);
}
const goDel = (row: any) => {
  console.log('删除', row);
}
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
defineExpose({ getList })

</script>

<style lang="scss" scoped>
</style>

