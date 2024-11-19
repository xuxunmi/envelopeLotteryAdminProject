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
        @row-dblclick="handleRowDblclick"
        @selection-change="handleSelectionChange"
    >
        <!-- 表格编辑插槽 -->
        <template #slot-edit>
            <span class="table-edit">
              <el-button type="primary" size="small" @click="goSetOrder('up')">上移</el-button>
              <el-button type="primary" size="small" @click="goSetOrder('down')">下移</el-button>
              <el-button type="primary" size="small" @click="goSetOrder('top')">置顶</el-button>
              <el-button type="primary" size="small" @click="goSetOrder('bottom')">置底</el-button>
              <el-button type="primary" size="small" @click="saveOrder">保存顺序</el-button>
            </span>
        </template>
        <!-- 自定义列模板插槽 -->
        <template #head-search="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #col-operate="{ row }">
            <el-button type="primary" link size="small" @click="goEdit(row)">设置品名规则</el-button>
        </template>
        <template #head-nameRule="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #col-nameRule="{ row }">
            <span v-html="row.nameRule" />
        </template>
        <!-- 条件 -->
        <template #head-expression="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #col-expression="{ row }">
            <span v-html="row.expression" />
        </template>
        <!-- 结果 -->
        <template #head-result="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #col-result="{ row }">
            <span v-html="row.result" />
        </template>
    </pt-table>

    <!-- 设置品名规则 - 弹窗 -->
    <AddConstraintDialog
        v-if="addConstraintDialog.visible"
        :dialog="addConstraintDialog"
        :objectRow="objectRow"
        @handleEditSuccess="handleEditSuccess_edit"
        @close="handleDialogClose"
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
import AddConstraintDialog from "@/views/configureManage/productConfigure/components/addConstraintDialog.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { getProNameRuleList, resortedSetting } from "@/api/configureManage/productConfigure"
import { filterArray, resetFilterValue, setArrayEleOrder } from "@/utils/index"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: {}
    }
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
    console.log("getList", props.objectRow)
    const params = {
        oid: props.objectRow.oid
    }
    loading.value = true
    getProNameRuleList(params)
        .then((data) => {
            data.data?.forEach((ele: any) => {
                // ele.nameRule = getText_nameRule(ele)
                ele.expression = getText_expression(ele)
                ele.result = getText_result(ele)
            })
            sourceData.value = data.data || []
            console.log("data.data: ", data.data)
            resetFilterValue(filterValue)
            search()
        })
        .finally(() => (loading.value = false))
}
getList()
// 格式化条件规则
const getText_expression = (row: any) => {
    const settingList = row.settingList || []
    console.log("settingList: ", settingList)
    const list: any[] = []
    settingList.forEach((ele: any) => {
        let expression = ""
        const expressionList: string[] = []
        if (ele.expressionList && ele.expressionList.length) {
            ele.expressionList.forEach((ele: any) => {
                const str = `${ele.optionName} ${ele.operator} "${ele.choiceName}"`
                expressionList.push(str)
            })
            expression = `IF(${expressionList.join(" ")})`
        }
        list.push(`${expression}`)
    })
    return list.join("<br>")
}
// 格式化结果规则
const getText_result = (row: any) => {
    const settingList = row.settingList || []
    // console.log("settingList: ", settingList)
    const list: any[] = []
    settingList.forEach((ele: any) => {
        let result = ""
        const resultList: string[] = []
        if (ele.resultList && ele.resultList.length) {
            ele.resultList.forEach((ele: any) => {
                const str = `${ele.resultChoiceName}->${ele.shortName}"`
                resultList.push(str)
            })
            result = `${resultList.join(" ")}`
        }
        list.push(`${result}`)
    })
    return list.join("<br>")
}

// 格式化品名规则
const getText_nameRule = (row: any) => {
    const settingList = row.settingList || []
    const list: string[] = []
    settingList.forEach((ele: any) => {
        let expression = "",
            result = ""
        const expressionList: string[] = []
        if (ele.expressionList && ele.expressionList.length) {
            ele.expressionList.forEach((ele: any) => {
                const str = `${ele.logicalSymbol} ${ele.optionName} ${ele.operator} "${ele.choiceName}"`
                expressionList.push(str)
            })
            expression = `IF(${expressionList.join(" ")})`
        }
        const resultList: string[] = []
        if (ele.resultList && ele.resultList.length) {
            ele.resultList.forEach((ele: any) => {
                const str = `${ele.resultChoiceName}->${ele.shortName}"`
                resultList.push(str)
            })
            result = `${resultList.join(" ")}`
        }
        list.push(`${expression} ${result}`)
    })
    return list.join("<br>")
}

// 设置顺序
const setOrder = (type: string, index: number, list: any[]) => {
  setArrayEleOrder(type, index, list)
}
// 设置顺序
const goSetOrder = (type: string) => {
  // console.log('goSetOrder', chooseRow.value);
  for (let i = 0; i < tableData.value.length; i++) {
    const ele = tableData.value[i];
    if (ele === chooseRow.value) {
      setOrder(type, i, tableData.value)
      return true
    }
  }
}
// 保存顺序
const saveOrder = () => {
    loading.value = true
    const params = tableData.value.map((item, index) => {
      return {
        partOid: props.objectRow.oid,
        optionOid: item.optionOid,
        sort: index + 1
      }
    })
    resortedSetting(params).then((data) => {
      ElMessage.success("保存成功！")
      getList()
    })
    .finally(() => (loading.value = false))
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
    emits("handleRowClick", row)
}
const handleSelectionChange = (val: any[]) => {
    console.log("handleSelectionChange", val)
    multipleSelection.value = val
}
const handleRowDblclick = (row: any, column: any, event: Event) => {
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
    colSetShow: true,
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
        type: "index",
        label: "序号",
        width: "55",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "optionNumber",
        label: "特征编码",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
        width: "100"
    },
    {
        prop: "optionName",
        label: "特征",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
        width: "200"
    },
    {
        prop: "expression",
        label: "条件",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "expression"
    },
    {
        prop: "result",
        label: "结果",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "result"
    }
    // {
    //     prop: "nameRule",
    //     label: "品名规则",
    //     headerAlign: "center",
    //     sortable: true,
    //     // showOverflowTooltip: true,
    //     show: true,
    //     slot: "nameRule"
    // }
    // {
    //     label: '操作',
    //     width: '100',
    //     fixed: 'right',
    //     headerAlign: "center",
    //     showOverflowTooltip: true,
    //     show: true,
    //     slot: 'operate'
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
    showMenu: true
})
//#endregion

//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region 设置品名规则 - 弹窗
const addConstraintDialog = reactive<any>({
    visible: false,
    title: "设置品名规则",
    type: "productNameRule",
    row: null,
    hasEdit: false
})
// 设置品名规则
const goEdit = (row: any) => {
    console.log("goEdit", row)
    Object.assign(addConstraintDialog, {
        visible: true,
        row
    })
}
// 约束编辑成功回调
const handleEditSuccess_edit = () => {
    console.log("handleEditSuccess_edit")
    getList()
}
// 弹窗关闭回调
const handleDialogClose = () => {
    console.log("handleDialogClose", addConstraintDialog.hasEdit)
    if (addConstraintDialog.hasEdit) getList()
    Object.assign(addConstraintDialog, {
        row: null,
        hasEdit: false
    })
}
//#endregion

defineExpose({
    getList
})
</script>

<style lang="scss" scoped></style>
