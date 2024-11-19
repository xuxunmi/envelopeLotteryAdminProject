<template>
  <pt-table
      v-loading="loading"
      ref="PtTableRef"
      :locale="locale"
      :tableColumns="tableColumns"
      :tableEditConfig="tableEditConfig"
      :paginationConfig="pageData"
      :menuConfig="menuConfig"
      :data="tableData"
      border
      highlight-current-row
      size="small"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
      @page-current-change="handleCurrentChange"
      @page-size-change="handleSizeChange"
  >
      <!-- 表格编辑插槽 -->
      <template #slot-edit>
          <span class="table-edit">
              <el-button
                type="primary"
                size="small"
                @click="goAdd"
              >新增</el-button>
              <el-button
                type="primary"
                size="small"
                @click="goDel(multipleSelection)"
              >删除</el-button>
          </span>
      </template>
      <!-- 自定义列模板插槽 -->
      <!-- <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template> -->
      <template #col-code="{ row }">
        <span v-text="getNameById(options_color, row.code + '', {
          value: 'code',
          label: 'codeListNameC'
        })"></span>
      </template>
      <template #col-operate="{ row }">
        <el-button
          type="primary"
          link
          size="small"
          @click="goDel([row])"
        >删除</el-button>
      </template>
  </pt-table>

  <!-- 编辑条件 - 弹窗 -->
  <AddColorDialog
    v-if="addColorDialog.visible"
    :dialog="addColorDialog"
    :objectRow="objectRow"
    @handleEditSuccess="handleEditSuccess_add"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import AddColorDialog from "./addColorDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { filterArray, resetFilterValue } from "@/utils/index"
import { colorSettingPage, deleteColorSetting } from '@/api/configureManage/productConfigure'
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {}
  },
})
const emits = defineEmits(["handleRowClick"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])

//#region 增、删、改、查
// 获取列表
const getList = () => {
  console.log('getList', props.objectRow);
  loading.value = true
  let params = {
    pageNo: pageData.currentPage,
    pageSize: pageData.pageSize,
    partOid: props.objectRow.oid
  }
  colorSettingPage(params).then(data => {
    tableData.value = data.data.list || []
    pageData.total = data.data.total || 0
  })
  .finally(() => loading.value = false)
}
// 移除
const goDel = (rows: any[]) => {
  if (!rows.length) {
    ElMessage.error("请选择一条数据！")
    return false
  }
  ElMessageBox.confirm('是否确认删除选择数据？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t("dashboardPage.confirm"),
    cancelButtonText: t("dashboardPage.cancel"),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    loading.value = true
    const oids = rows.map((item) => item.oidStr).join(',')
    deleteColorSetting({ oidsStr: oids }).then((data) => {
      ElMessage.success(t("dashboardPage.deleteSuccess"))
      getList()
    })
    .catch(() => loading.value = false)
  })
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
    emits('handleRowClick', row)
}
const handleSelectionChange = (val: any[]) => {
    console.log('handleSelectionChange', val)
    multipleSelection.value = val
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
    colSetShow: true
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
    },
    // {
    //     label: '序号',
    //     type: 'index',
    //     width: "60",
    //     showOverflowTooltip: true,
    //     show: true,
    //     headerAlign: "center",
    // },
    {
        label: '颜色分组',
        width: '180',
        // showOverflowTooltip: true,
        show: true,
        slot: 'code',
        headerAlign: "center",
    },
    {
        prop: 'optionalColorName',
        label: '可选颜色',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
    },
    {
        prop: 'defaultColorName',
        label: '默认颜色',
        width: '120',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
    },
    {
        label: '操作',
        width: '55',
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
    show: true
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
//#endregion

//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region 颜色配置 - 弹窗
const addColorDialog = reactive<any>({
    visible: false,
    title: "",
})
// 新增
const goAdd = () => {
  console.log('goAdd');
  Object.assign(addColorDialog, {
    visible: true,
    title: '颜色配置',
  })
}
// 编辑
const goEdit = (row: any) => {
  console.log('goEdit');
  Object.assign(addColorDialog, {
    visible: true,
    title: '颜色配置',
    type: 'edit',
  })
}
// 颜色配置成功回调
const handleEditSuccess_add = () => {
  console.log('handleEditSuccess_add');
  getList()
  Object.assign(addColorDialog, {
    visible: false,
    title: "",
  })
}
//#endregion

//#region 字典数据
const options_color = ref<any[]>([])  // 颜色分组
getDictionarySelect({ codes: "COLOR_GROUP" }).then(data => {
  options_color.value = data.data.COLOR_GROUP || []
})
//#endregion

defineExpose({
  getList
})
</script>

<style lang="scss" scoped></style>
