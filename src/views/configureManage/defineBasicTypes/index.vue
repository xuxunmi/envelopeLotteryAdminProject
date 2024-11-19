<template>
  <div class="app-container">
      <div v-loading="loading" class="sf-container3">
          <!-- <div class="search-container">
              <el-form
                ref="searchFormRef"
                :inline="true"
                :model="searchForm"
                size="small"
                label-width="80"
              >
                  <el-form-item label="订单号">
                      <el-input
                        v-model="searchForm.orderNo"
                        placeholder="请输入"
                        clearable
                        @keyup.enter="getList"
                      />
                  </el-form-item>
                  <el-form-item>
                      <el-button type="primary" @click="getList">查询</el-button>
                  </el-form-item>
              </el-form>
          </div> -->
          <div class="sf-container-main">
              <div class="sf-container-main-content">
                  <div class="sf-table-wrapper">
                      <pt-table
                          ref="PtTableRef"
                          :tableColumns="tableColumns"
                          :tableEditConfig="tableEditConfig"
                          :paginationConfig="pageData"
                          :menuConfig="menuConfig"
                          :data="tableData"
                          :locale="locale"
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
                                    size="small"
                                    @click="getList"
                                  >{{ t('dashboardPage.refresh') }}</el-button>
                                  <el-button
                                    type="primary"
                                    size="small"
                                    @click="goAdd"
                                  >添加</el-button>
                                  <el-button
                                    type="primary"
                                    size="small"
                                    @click="goDel(multipleSelection)"
                                  >批量删除</el-button>
                              </span>
                          </template>
                          <!-- 自定义列模板插槽 -->
                          <template #col-action="{ row }">
                              <el-button
                                type="primary"
                                size="small"
                                link
                                @click="goEdit(row)"
                              >编辑</el-button>
                              <el-button
                                type="primary"
                                size="small"
                                link
                                @click="goDel([row])"
                              >删除</el-button>
                          </template>
                      </pt-table>
                  </div>
              </div>
          </div>

          <!-- 选择系列 - 弹窗 -->
          <ChooseSeriesDialog
              v-if="chooseSeriesDialog.visible"
              :dialog="chooseSeriesDialog"
              @handleEditSuccess="handleEditSuccess_series"
          />
          <!-- 系列选配 - 弹窗 -->
          <OptionalDialog
              v-if="optionalDialog.visible"
              :dialog="optionalDialog"
              @handleEditSuccess="handleEditSuccess_optional"
          />
          <!-- 添加基本型 - 弹窗 -->
          <AddBasicTypesDialog
              v-if="addBasicTypesDialog.visible"
              :dialog="addBasicTypesDialog"
              @handleEditSuccess="handleEditSuccess_types"
          />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtMenuConfigType
} from "@/plugins/pt-front"
import ChooseSeriesDialog from "@/views/orderManage/prePlanningOrder/components/chooseSeriesDialog.vue"
import OptionalDialog from "./components/optionalDialog.vue"
import AddBasicTypesDialog from "./components/addBasicTypesDialog.vue"
import { basicTypePage, basicTypeDelete } from '@/api/configureManage/defineBasicTypes'
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
  name: "defineBasicTypes"
})

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 头部搜索
const searchForm = reactive({
  orderNo: "", // 订单号
})
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])

//#region 增、删、改、查
// 获取列表
const getList = () => {
  console.log('getList', pageData);
  loading.value = true
  chooseRow.value = null
  multipleSelection.value = []
  const params = {
    pageNo: pageData.currentPage,
    pageSize: pageData.pageSize
  }
  basicTypePage(params).then(data => {
    tableData.value = data.data.list
    pageData.total = data.data.total
  })
  .finally(() => loading.value = false)
}
const goAdd = () => {
  goChoose_series()
}
const goEdit = (row: any) => {
  goEdit_basic(row)
}
const goDel = (rows: any[]) => {
  if (!rows.length) {
    ElMessage.error('请选择一条数据！')
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
    const oidsStr = rows.map(item => item.oidStr).join(',')
    basicTypeDelete({ oidsStr }).then(data => {
      ElMessage.success('删除成功！')
      getList()
    })
    .catch(() => loading.value = false)
  })
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
      type: "selection",
      width: "32",
      show: true
  },
  {
      prop: "partName",
      label: "系列名称",
      // showOverflowTooltip: true,
      show: true
  },
  {
      prop: "partNum",
      label: "系列编码",
      // showOverflowTooltip: true,
      show: true
  },
  {
      prop: "productName",
      label: "品名",
      // showOverflowTooltip: true,
      show: true
  },
  {
      prop: "createdBy",
      label: "创建人",
      // showOverflowTooltip: true,
      show: true
  },
  {
      prop: "action",
      label: "操作",
      align: "center",
      width: "100",
      fixed: "right",
      show: true,
      slot: "action",
  }
])
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
  console.log("row-click", row)
  chooseRow.value = row
}
const handleSelectionChange = (val: any[]) => {
  console.log("handleSelectionChange", val)
  multipleSelection.value = val
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

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: false
})
//#endregion

//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

//#region 选择系列 - 弹窗
const chooseSeriesDialog = reactive<any>({
  visible: false,
  title: "选择系列"
})
const goChoose_series = () => {
  chooseSeriesDialog.visible = true
}
// 选择系列回调
const handleEditSuccess_series = (row: any) => {
  console.log("handleEditSuccess_series", row)
  chooseSeriesDialog.visible = false
  goOptional(row)
}
//#endregion

//#region 系列选配 - 弹窗
const optionalDialog = reactive<any>({
  visible: false,
  title: "系列选配",
  row: null
})
const goOptional = (row: any) => {
  Object.assign(optionalDialog, {
    visible: true,
    row
  })
}
// 系列选配回调
const handleEditSuccess_optional = (optionList: any[]) => {
  console.log("handleEditSuccess_optional", optionList)
  const part = JSON.parse(JSON.stringify(optionalDialog.row))
  Object.assign(optionalDialog, {
    visible: false,
    row: null
  })
  goAdd_basic(optionList, part)
}
//#endregion

//#region 添加基本型 - 弹窗
const addBasicTypesDialog = reactive<any>({
  visible: false,
  title: "添加基本型",
  type: 'add',
  row: null,
  optionList: [], // 特征列表
  part: {}  // 系列
})
// 新增
const goAdd_basic = (optionList: any[], part: any) => {
  Object.assign(addBasicTypesDialog, {
    visible: true,
    title: "添加基本型",
    type: 'add',
    optionList,
    part,
  })
}
// 编辑
const goEdit_basic = (row: any) => {
  Object.assign(addBasicTypesDialog, {
    visible: true,
    title: "编辑基本型",
    type: 'edit',
    optionList: [],
    part: {},
    row
  })
}
// 添加基本型回调
const handleEditSuccess_types = () => {
  console.log("handleEditSuccess_types")
  getList()
  Object.assign(addBasicTypesDialog, {
    visible: false,
    title: "",
    type: '',
    row: null,
    optionList: [],
    part: {}
  })
}
//#endregion

</script>

<style lang="scss" scoped></style>
