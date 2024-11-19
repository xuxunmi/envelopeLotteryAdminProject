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
                                    type="primary"
                                    size="small"
                                    icon="Plus"
                                    @click="goInsert_option"
                                  >添加</el-button>
                                  <el-button
                                    size="small"
                                    icon="Refresh"
                                    @click="getList"
                                  >刷新</el-button>
                              </span>
                          </template>
                          <!-- 自定义列模板插槽 -->
                          <template #col-featureValue="{ row }">
                              <span v-html="getText_featureValue(row)"></span>
                          </template>
                          <template #col-action="{ row }">
                              <el-button
                                type="primary"
                                size="small"
                                link
                                @click="goEdit_rule(row)"
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
      </div>

      <!-- 添加特征 - 弹窗 -->
      <InsetOptionDialog
        v-if="insetOptionDialog.visible"
        :dialog="insetOptionDialog"
        @handleEditSuccess="handleEditSuccess_insert"
      />
      <!-- 编辑规则 - 弹窗 -->
      <EditSimplifyRulesDialog
        v-if="editSimplifyRulesDialog.visible"
        :dialog="editSimplifyRulesDialog"
        @handleEditSuccess="handleEditSuccess_rule"
      />
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
import InsetOptionDialog from "@/views/configureManage/productConfigure/components/insetOptionDialog.vue"
import EditSimplifyRulesDialog from "./components/editSimplifyRulesDialog.vue"
import { productNameRulePage, productNameRuleCreateOrEdit, productNameRuleDelete } from "@/api/configureManage/productNameSimplifyRules"
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
  name: "productNameSimplifyRules"
})

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 头部搜索
const searchForm = reactive({
  orderNo: "", // 订单号
})
//#endregion

//#region pt-table表格
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([
  { value: '1' }
])
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
  productNameRulePage(params).then(data => {
    tableData.value = data.data.list
    pageData.total = data.data.total
  })
  .finally(() => loading.value = false)
}
const goAdd = (list: any[]) => {
  const arr = formatData(list)
  console.log('goAdd', arr);
  if (!arr.length) {
    ElMessage.error('请选择一条特征！')
    return false
  }
  insetOptionDialog.loading = true
  productNameRuleCreateOrEdit(arr).then(data => {
    ElMessage.success('添加成功！')
    getList()
    Object.assign(insetOptionDialog, {
      visible: false,
      title: "",
      row: null
    })
  })
  .finally(() => insetOptionDialog.loading = false)
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
    const oidS = rows.map(item => item.featureOid)
    productNameRuleDelete({
      featureOidsStr: oidS.join(',')
    }).then(data => {
      ElMessage.success('删除成功！')
      getList()
    })
  })
}
// 格式化数据
const formatData = (options: any[]) => {
  const arr: any[] = []
  const list = options || []
  list.forEach(item => {
    if (item.checked) {
      const choices: any[] = []
      if (item.choice?.length) {
        item.choice.forEach((choice: any) => {
          if (choice.checked) {
            choices.push({
              featureValueOid: choice.oid,
              featureKey: choice.name,
              featureValue: choice.simplifyRules,
            })
          }
        });
      }
      const option =  {
        featureOid: item.oid,
        featureName: item.name,
        featureValues: choices
      }
      arr.push(option)
    }
  })
  return arr
}
// 格式化文本
const getText_featureValue = (row: any) => {
  const values = row.featureValues || []
  return values.map((item: any) => `${item.featureKey || ''} → ${item.featureValue || ''};`).join('<br/>')
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  // {
  //     type: "selection",
  //     width: "32",
  //     show: true
  // },
  {
      prop: "featureName",
      label: "特征",
      headerAlign: "center",
      // showOverflowTooltip: true,
      show: true
  },
  {
      prop: "featureValue",
      label: "特征值",
      headerAlign: "center",
      // showOverflowTooltip: true,
      show: true,
      slot: 'featureValue'
  },
  {
      prop: "createdBy",
      label: "创建人",
      headerAlign: "center",
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

//#region 添加特征 - 弹窗
const insetOptionDialog = reactive<any>({
    visible: false,
    title: "",
    loading: false,
    row: null,
    from: 'productNameSimplifyRules'
})
// 添加特征
const goInsert_option = () => {
  console.log('goInsert_option');
  Object.assign(insetOptionDialog, {
    visible: true,
    title: '添加特征',
    row: {
      isTop: true // 获取所有特征列表
    }
  })
}
// 添加特征成功回调
const handleEditSuccess_insert = (list: any[]) => {
  console.log('handleEditSuccess_insert', list);
  goAdd(list)
}
//#endregion

//#region 编辑规则 - 弹窗
const editSimplifyRulesDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
})
// 编辑规则
const goEdit_rule = (row: any) => {
  console.log('goEdit_rule');
  Object.assign(editSimplifyRulesDialog, {
    visible: true,
    title: '编辑简化规则',
    row
  })
}
// 编辑规则成功回调
const handleEditSuccess_rule = (list: any[]) => {
  console.log('handleEditSuccess_rule', list);
  getList()
  Object.assign(editSimplifyRulesDialog, {
    visible: false,
    title: "",
    row: null,
  })
}
//#endregion

</script>

<style lang="scss" scoped></style>
