<template>
  <pt-table
    v-loading="loading"
    ref="PtTableRef"
    :tableColumns="tableColumns"
    :tableEditConfig="tableEditConfig"
    :paginationConfig="pageData"
    :menuConfig="menuConfig"
    :data="tableData"
    border
    highlight-current-row
    size="small"
    @row-click="handleRowClick"
    @page-current-change="handleCurrentChange"
    @page-size-change="handleSizeChange"
    @selection-change="handleSelectionChange"
  >
    <!-- 表格编辑插槽 -->
    <template #slot-edit>
      <span class="table-edit">
        <el-form :model="formData" size="small">
            <el-form-item label="组织名称">
                <el-select
                  :loading="loading_product"
                  v-model="formData.ProductOid"
                  @change="handleSelectChange"
                  clearable
                  style="width: 300px;"
                >
                    <el-option v-for="item in options_name" :key="item.oid" :label="item.name" :value="item.oid" />
                </el-select>
            </el-form-item>
        </el-form>
        <el-button
          type="primary"
          size="small"
          @click="getList"
          >刷新</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click="goChoose"
        >添加</el-button>
        <el-button
          type="primary"
          size="small"
          @click="goDel(multipleSelection)"
        >移除</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!chooseRow"
          @click="goEdit(chooseRow)"
        >修改裁剪方式</el-button>
        <el-button
          type="primary"
          size="small"
          @click="goDownload"
        >下载模板</el-button>
        <el-upload
          v-model:file-list="fileList"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUploadChange"
        >
          <el-button
            type="primary"
            size="small"
          >导入</el-button>
        </el-upload>
      </span>
    </template>
    <!-- 自定义列模板插槽 -->
     <!-- 自定义列模板插槽 -->
    <template #head-search="{ column }">
      <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
    </template>
    <template #col-action="{ row }">
    </template>
  </pt-table>

  <!-- 修改裁剪方式 - 弹窗 -->
  <EditCroppingMethodDialog
    v-if="editCroppingMethodDialog.visible"
    :dialog="editCroppingMethodDialog"
    @handleEditSuccess="handleEditSuccess_crop"
  />
  <dialogFrame :title="materialDialog.title" v-model:visible="materialDialog.visible" :footer="false" width="94%">
      <MaterialDialog
          v-if="materialDialog.visible"
          v-model:visible="materialDialog.visible"
          :type="materialDialog.type"
          @confirm-success="handleConfirmSuccess_material"
      />
  </dialogFrame>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { UploadProps, UploadUserFile } from 'element-plus'
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import { usePagination } from "@/hooks/usePagination"
import EditCroppingMethodDialog from "./editCroppingMethodDialog.vue";
import dialogFrame from "@/components/dialogFrame/index.vue"
import MaterialDialog from "@/views/productMange/materiel/components/materialDialog.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { productList } from "@/api/productLibrary"
import { advancedSearchPart } from "@/api/productMange/materielQuery"
import { exportTemplate, uploadTrimMethodExcel, editTrimMethodPart } from "@/api/configureManage/cropSettings"
import { downloadFile } from "@/utils/exportTemplate"
import { filterArray, resetFilterValue } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    formData: {
        type: Object,
        default: {}
    }
})
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const loading_product = ref(false)
const formData = reactive({
    ProductOid: ""
})
const options_name = ref<any>([])
const handleSelectChange = (val: string) => {
    getList()
}
const getSelect = () => {
    loading_product.value = true
    productList()
        .then((data) => {
            console.log(data)
            options_name.value = data.data || []
            if (options_name.value[0]) {
                formData.ProductOid = options_name.value[0].oid
                handleSelectChange(formData.ProductOid)
            }
        })
        .finally(() => (loading_product.value = false))
}
getSelect()
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])
const sortParams = reactive({
    sortBy: "",
    sorted: ""
})

//#region 增、删、改、查
// 获取列表
const getList = () => {
  const params = {
    ...sortParams,
    pageNo: pageData.currentPage,
    pageSize: pageData.pageSize,
    types: ["wt.part.WTPart"],
    containers: [formData.ProductOid],
    conditions: [
      {
        key: "number",
        type: "",
        symbol: "不等于",
        value: "20200*"
      },
      {
        key: "trimMethod",
        type: "",
        symbol: "in",
        value: "保留自己;子项裁剪;裁剪自己;裁剪自己和子"
      }
    ],
  }
  loading.value = true
  multipleSelection.value = []
  chooseRow.value = null
  advancedSearchPart(params).then((data) => {
      sourceData.value = data.data.content || []
      pageData.total = data.data.total || 0
      resetFilterValue(filterValue)
      search()
  })
  .finally(() => (loading.value = false))
}
// 下载模板
const goDownload = () => {
  loading.value = true
  exportTemplate().then(data => {
    const filename = `裁剪设置模版`
    downloadFile(data, filename)
  })
  .finally(() => loading.value = false)
}
// 添加
const goAdd = (rows: any[], trimMethod: string) => {
  console.log("goAdd", rows, trimMethod)
  if (!rows.length) {
    ElMessage.error("未选择物料！")
    return false
  }
  const params = {
    numberList: rows?.map((item) => item.code) || [],
    trimMethod: "保留自己"
  }
  loading.value = true
  editTrimMethodPart(params).then((data) => {
    ElMessage.success("添加成功！")
    getList()
    Object.assign(editCroppingMethodDialog, {
      loading: false,
      visible: false,
      row: null
    })
    Object.assign(materialDialog, {
        visible: false,
        chooseRows: []
    })
  })
  .finally(() => (loading.value = false))
}
// 移除
const goDel = (rows: any[]) => {
  if (!rows.length) {
    ElMessage.error('请选择一条数据！')
    return false
  }
  ElMessageBox.confirm('是否确认移除选择数据？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t("dashboardPage.confirm"),
    cancelButtonText: t("dashboardPage.cancel"),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    const params = {
      numberList: rows?.map(item => item.number) || [],
      trimMethod: ""
    }
    loading.value = true
    editTrimMethodPart(params)
        .then((data) => {
            ElMessage.success("删除成功！")
            getList()
        })
        .finally(() => (loading.value = false))
  })
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    chooseRow.value = row
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    // console.log("multipleSelection.value:", multipleSelection.value)
}
// 方法
// const handleSortChange = (data: { column: any; prop: string; order: any }) => {
//     console.log("handleSortChange", data)
//     sortParams.sortBy = data.prop
//     switch (data.order) {
//         case "descending":
//             sortParams.sorted = "DESC"
//             break
//         case "ascending":
//             sortParams.sorted = "ASC"
//             break

//         default:
//             sortParams.sorted = ""
//             break
//     }
//     getList()
// }
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
    type: "selection",
    width: "32",
    show: true,
  },
    {
        type: 'index',
        label: "序号",
        width: '55',
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
    {
        prop: "type",
        label: "类型",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "number",
        label: "物料编号",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "name",
        label: "物料名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "materialSymbol",
        label: "代号",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "trimMethod",
        label: "裁剪方式",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    // {
    //     prop: "action",
    //     label: "操作",
    //     slot: "action",
    //     align: "center",
    //     width: "120",
    //     fixed: "right",
    //     show: true
    // }
])
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList)
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: false
})
//#endregion

//#endregion

//#region 导入
const fileList = ref<UploadUserFile[]>([])
const handleUploadChange: UploadProps['onChange'] = (uploadFile) => {
  console.log('handleUploadChange', uploadFile);
  if (uploadFile.raw) {
    const formData = new FormData()
    formData.append("file", uploadFile.raw)
    loading.value = true
    uploadTrimMethodExcel(formData).then(data => {
      ElMessage.success('导入成功！')
      getList()
    })
    .finally(() => loading.value = false)
  }
}
//#endregion

//#region 修改裁剪方式 - 弹窗
const editCroppingMethodDialog = reactive<any>({
  loading: false,
  visible: false,
  title: "修改裁剪方式",
  row: null,
  type: ''  // add（添加）、edit（编辑）
})
// 编辑
const goEdit = (row: any) => {
  Object.assign(editCroppingMethodDialog, {
    visible: true,
    type: 'edit',
    row
  })
}
// 修改裁剪方式回调
const handleEditSuccess_crop = (formData: any) => {
  console.log("handleEditSuccess_crop")
  if (editCroppingMethodDialog.type === 'add') {
    goAdd(materialDialog.chooseRows, formData.trimMethod)
  } else if (editCroppingMethodDialog.type === 'edit') {
    getList()
    Object.assign(editCroppingMethodDialog, {
      visible: false,
      row: null,
    })
  }
}
//#endregion

//#region 选择物料 - 弹窗
const materialDialog = reactive<any>({
    visible: false,
    title: "选择物料",
    type: "chooseRows",
    chooseRows: []
})
// 选择物料
const goChoose = () => {
    console.log("选择物料")
    Object.assign(materialDialog, {
        visible: true,
    })
}
// 选择物料回调
const handleConfirmSuccess_material = (rows: any[]) => {
    console.log("handleConfirmSuccess_material", rows)
    if (!rows.length) {
      ElMessage.error('请选择一条数据！')
      return false
    }
    materialDialog.chooseRows = rows
    Object.assign(editCroppingMethodDialog, {
      visible: true,
      type: 'add',
    })
}
//#endregion

</script>

<style lang="scss" scoped>
</style>

