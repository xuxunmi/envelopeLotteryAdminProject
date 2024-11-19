<template>
  <pt-table
      v-loading="loading"
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
      @sort-change="handleSortChange"
  >
      <!-- 表格编辑插槽 -->
      <template #slot-edit>
          <span v-if="!onlyRead" class="table-edit">
              <el-button
                type="primary"
                size="small"
                @click="goRemove(chooseRow)"
              >删除<span v-if="isChild">父子</span>约束</el-button>
              <el-button
                type="primary"
                size="small"
                @click="goAdd"
              >新增<span v-if="isChild">父子</span>约束</el-button>
              <el-button
                type="primary"
                size="small"
                @click="goEdit(chooseRow)"
              >编辑<span v-if="isChild">父子</span>约束</el-button>
              <el-button
                type="primary"
                size="small"
                @click="goCopy(chooseRow)"
              >复制<span v-if="isChild">父子</span>约束</el-button>
              <el-button
                type="primary"
                size="small"
                @click="goExport"
              >导出</el-button>
          </span>
      </template>
      <!-- 自定义列模板插槽 -->
      <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template>
      <template #col-expressions="{ row }">
        <span v-text="getText_expressions(row.expressions)"></span>
      </template>
      <template #col-result="{ row }">
        <span v-text="getText_result(row.result)"></span>
      </template>
  </pt-table>

  <!-- 新增约束 - 弹窗 -->
  <AddConstraintDialog
    v-if="addConstraintDialog.visible"
    :dialog="addConstraintDialog"
    :objectRow="objectRow"
    @handleEditSuccess="handleEditSuccess_add"
  />
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
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import AddConstraintDialog from "./addConstraintDialog.vue"
import { filterArray, resetFilterValue, formatDateTime, recursionArray, goSort } from "@/utils"
import { delRule, exportRuleListOfPart } from "@/api/configureManage/productConfigure";
import emitter from "@/utils/mitt"
import { downloadFile } from "@/utils/exportTemplate"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {}
  },
  isChild: {
    type: Boolean,
    default: false
  },
  /**
   * 是否只读
   */
  onlyRead: {
    type: Boolean,
    default: false
  },
})
const emits = defineEmits(["getList", "refresh"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const sortParams = reactive({
    sortBy: "",
    sorted: "",
    sortType: ""
})

//#region 增、删、改、查
// 获取列表
const getList = (list: any) => {
  console.log('getList', list, chooseRow.value);
  sourceData.value = formatData(list || [])
  resetFilterValue(filterValue)
  search()
  // 编辑后，高亮当前编辑行
  let find: any = null
  recursionArray(tableData.value, (item: any) => {
    if (item.choiceRuleNumber && item.choiceRuleNumber === chooseRow.value?.choiceRuleNumber) {
      find = item
      return 'return'
    }
  })
  nextTick(() => setCurrent(find))
}
// 移除
const goRemove = (row: any) => {
  if (!row) {
    ElMessage.warning('请选择一行数据！')
    return false
  }
  ElMessageBox.confirm('是否确认删除该约束？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t("dashboardPage.confirm"),
    cancelButtonText: t("dashboardPage.cancel"),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    loading.value = true
    const params = {
      oid: props.objectRow.oid,
      ruleOid: row.oid
    }
    delRule(params).then((data) => {
      ElMessage.success('删除成功！')
      emits("getList")
    })
    .finally(() => loading.value = false)
  })
}
// 获取显示内容 - 条件
const getText_expressions = (expressions: any[]) => {
  const list: string[] = []
  if (expressions && expressions.length) {
    expressions.forEach((ele, i) => {
      const choiceNames: string[] = []
      ele.choiceList.forEach((choice: any) => choiceNames.push(choice.name))
      let str
      if (i === expressions.length - 1) {
        str = `${ele.optionName} ${ele.operator} "${choiceNames.join(' || ')}"`
      } else {
        str = `${ele.optionName} ${ele.operator} "${choiceNames.join(' || ')}" ${ele.logicalSymbol} `
      }
      list.push(str)
    })
  }
  return `IF(${list.join(' ')})`
}
// 获取显示内容 - 结果
const getText_result = (result: any[]) => {
  const list: string[] = []
  if (result && result.length) {
    result.forEach(ele => {
      const choiceNames: string[] = []
      ele.choiceList.forEach((choice: any) => choiceNames.push(choice.name))
      const str = `${ele.optionName} = "${choiceNames.join(' || ')}"`
      list.push(str)
    })
  }
  return `SET(${list.join(' ')})`
}
// 导出
const goExport = () => {
  // console.log('goExport', props.objectRow);
  loading.value = true
  const params = {
    topPartoid: props.objectRow.PartOid,
    topPartNumber: props.objectRow.Number,
    ProductName: props.objectRow.ProductName
  }
  exportRuleListOfPart(params).then(data => {
    const filename = `${props.objectRow.Name}-特征约束-${formatDateTime(new Date(), 'YYYYMMDD')}`
    downloadFile(data, filename)
  })
  .finally(() => loading.value = false)
}
// 格式化数据
const formatData = (list: any[] = []) => {
  list.forEach(ele => {
    ele.expressionsText = getText_expressions(ele.expressions)
    ele.resultText = getText_result(ele.result)
  });
  return list
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
}
const handleSortChange = (data: { column: any; prop: string; order: any }) => {
    console.log("handleSortChange", data)
    sortParams.sortBy = data.prop
    sortParams.sorted = data.order
    search()
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
    fullScreen: !props.onlyRead,
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    // {
    //     type: "selection",
    //     width: "32",
    //     show: true
    // },
    {
        type: 'index',
        label: "序号",
        width: '55',
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
    },
    {
        prop: "expressionsText",
        label: '条件',
        headerAlign: "center",
        sortable: 'custom',
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
    },
    {
        prop: "resultText",
        label: '结果',
        headerAlign: "center",
        sortable: 'custom',
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
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

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
    goSort(sortParams, tableData.value)
}
//#endregion

//#region 新增约束 - 弹窗
const addConstraintDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ''
})
// 新增约束
const goAdd = () => {
  console.log('goAdd');
  Object.assign(addConstraintDialog, {
    visible: true,
    title: '特征约束',
    row: null,
    type: 'add'
  })
}
// 编辑
const goEdit = (row: any) => {
  console.log('goEdit', row);
  if (!row) {
    ElMessage.warning('请选择一行约束！')
    return false
  }
  Object.assign(addConstraintDialog, {
    visible: true,
    title: '特征约束',
    row,
    type: 'edit'
  })
}
// 复制
const goCopy = (row: any) => {
  console.log('goCopy');
  if (!row) {
    ElMessage.warning('请选择一行约束！')
    return false
  }
  Object.assign(addConstraintDialog, {
    visible: true,
    title: '特征约束',
    row,
    type: 'copy'
  })
}
// 约束编辑成功回调
const handleEditSuccess_add = (close: boolean) => {
  console.log('handleEditSuccess_add');
  emits('getList')
  Object.assign(addConstraintDialog, {
    visible: false,
    title: "",
    row: null,
    type: ''
  })
}
//#endregion

defineExpose({
  loading,
  getList,
})
</script>

<style lang="scss" scoped></style>
