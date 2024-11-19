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
                <el-button type="primary" size="small" @click="goAdd">新增</el-button>
                <el-button type="primary" size="small" @click="goDel(chooseRow)">删除</el-button>
                <el-button type="primary" size="small" @click="goEdit(chooseRow, 'expression')"
                    >编辑</el-button
                >
                <!-- 限模块类型 -->
                <!-- <el-button v-if="isModule" type="primary" size="small" @click="goEdit(chooseRow, 'partFilter')"
                    >编辑物料筛选</el-button
                >
                <el-button type="primary" size="small" @click="goEdit(chooseRow, 'attribute')">编辑属性设置</el-button> -->
                <el-button type="primary" size="small" @click="goExport">导出</el-button>
                <el-button type="primary" size="small" @click="goCopy(chooseRow)">复制</el-button>
                <el-button type="primary" size="small" @click="goSetOrder('up')">上移</el-button>
                <el-button type="primary" size="small" @click="goSetOrder('down')">下移</el-button>
                <el-button type="primary" size="small" @click="goSetOrder('top')">置顶</el-button>
                <el-button type="primary" size="small" @click="goSetOrder('bottom')">置底</el-button>
                <el-button type="primary" size="small" @click="saveOrder">保存顺序</el-button>
            </span>
        </template>
        <!-- 自定义列模板插槽 -->
        <!-- <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template> -->
    </pt-table>

    <!-- 编辑条件 - 弹窗 -->
    <EditConditionDialog
        v-if="editConditionDialog.visible"
        :dialog="editConditionDialog"
        :objectRow="objectRow"
        :isModule="isModule"
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
import EditConditionDialog from "./editConditionDialog.vue"
import { filterArray, resetFilterValue, formatDateTime } from "@/utils"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getConditionListOfPart, delCondition, exportConditionListOfPart, saveOptionOrder } from "@/api/configureManage/productConfigure"
import { downloadFile } from "@/utils/exportTemplate"
import { setArrayEleOrder, goSort } from '@/utils'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: {
            oid: "", // 当前物料oid
            parentOid: "", // 当前物料父级oid
            topObjectOid: "", // 当前物料顶层系列oid
            Number: "", // 编号
            ProductName: "", // 组织名称
            Name: "", // 名称
            materialType: "" // 物料类型
        }
    },
    onlyRead: {
        type: Boolean,
        default: false
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
const sortParams = reactive({
    sortBy: "",
    sorted: "",
    sortType: ""
})
// 是否模块类型
const isModule = computed(() => props.objectRow.materialType === "wt.part.WTPart|com.pdinfo.kbomMODULE")

//#region 增、删、改、查
// 获取列表
const getList = () => {
    console.log("getList", props.objectRow)
    loading.value = true
    chooseRow.value = null
    let params
    // oid: 必填,添加特征和特征值的那个部件的oid（应该是整机或模块）
    // partOid: 不是查询模块时必填, 配置了条件的那个物料，
    // parentPartOid: 不是查询模块时必填，partOid的直接父项。
    if (isModule.value) {
        // 模块
        params = {
            oid: props.objectRow.oid
        }
    } else {
        // 非模块
        params = {
            oid: props.objectRow.oid,
            partOid: props.objectRow.oid,
            parentPartOid: props.objectRow.parentOid
        }
    }
    getConditionListOfPart(params)
        .then((data) => {
            sourceData.value = formatData(data.data || [])
            resetFilterValue(filterValue)
            search()
        })
        .finally(() => (loading.value = false))
}
// 移除
const goDel = (row: any) => {
    if (!row) {
        ElMessage.warning("请选择一行数据！")
        return false
    }
    ElMessageBox.confirm("是否确认删除该条件？", t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        loading.value = true
        // 当选择的是模块时：oid是左侧选择的物料的父项oid；partOid是筛选物料oid；parentPartOid是左侧选择的物料的oid
        // 当选择的是非模块时：oid是左侧选择的物料的父项oid；partOid是左侧选择的物料的oid；parentPartOid是左侧选择的物料的父项oid
        let params
        if (isModule.value) {
            params = {
                oid: props.objectRow.parentOid,
                partOid: row.partOid,
                parentPartOid: props.objectRow.oid,
                useOid: row.useOid // 模块加一个useOid的字段 这个字段在查询的时候回返回到前端
            }
        } else {
            params = {
                oid: props.objectRow.parentOid,
                partOid: props.objectRow.oid,
                parentPartOid: props.objectRow.parentOid,
                useOid: row.useOid // 非模块加一个useOid的字段 这个字段在查询的时候回返回到前端
            }
        }
        delCondition(params)
            .then((data) => {
                ElMessage.success(t("dashboardPage.deleteSuccess"))
                getList()
            })
            .catch(() => (loading.value = false))
    })
}
// 导出
const goExport = () => {
    // console.log('goExport', props.objectRow);
    const params = {
        topPartoid: props.objectRow.oid,
        topPartNumber: props.objectRow.Number,
        ProductName: props.objectRow.ProductName
    }
    exportConditionListOfPart(params).then((data) => {
        const filename = `${props.objectRow.Name}-配置条件-${formatDateTime(new Date(), "YYYYMMDD")}`
        downloadFile(data, filename)
    })
}
// 格式化列表显示
const formatData = (arr: any[] = []) => {
  arr?.forEach(ele => {
    ele.expressionsText = getText_expressions(ele.expressions)
    ele.partText = getText_part(ele)
    ele.propertiesText = getText_properties(ele.properties)
  })
  return arr
}
const getText_expressions = (expressions: any[] = []) => {
    const strArr: any = []
    expressions.forEach((ele, i) => {
      let str
      if (i === expressions.length - 1) {
        str = `${ele.optionName || ""}${ele.operator?.replace(/=|包含/g, "==") || ""}${ele.choiceName?.replace(/,/g, "||") || ""}`
      } else {
        str = `${ele.optionName || ""}${ele.operator?.replace(/=|包含/g, "==") || ""}${ele.choiceName?.replace(/,/g, "||") || ""} ${ele.logicalSymbol?.replace(/AND/g, '&&')?.replace(/OR/g, "||") || ""} `
      }
      strArr.push(str)
    })
    return strArr.join("")
}
const getText_part = (row: any) => {
    return `${row.partNumber || ""}:${row.partName || ""}`
}
const getText_properties = (properties = []) => {
    const strArr: any = []
    properties.forEach((ele: any) => {
        const find = option_attribute.value.find(item => item.code === ele.name)
        strArr.push(`${find?.codeListNameC || ""}=${ele.value || ""}`)
    })
    return strArr.join(";")
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
    const params = {
      oid: props.objectRow.oid,
      parentOid: props.objectRow.parentOid,
      optionList: tableData.value.map((item, index) => {
        return {
          ...item,
          order: index
        }
      })
    }
    saveOptionOrder(params).then((data) => {
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
    colSetShow: false
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
        prop: 'expressionsText',
        label: "条件表达式",
        headerAlign: "center",
        sortable: 'custom',
        // showOverflowTooltip: true,
        show: true,
    },
    {
        prop: "partText",
        label: "物料筛选",
        headerAlign: "center",
        sortable: 'custom',
        // showOverflowTooltip: true,
        show: true,
    },
    {
        prop: "propertiesText",
        label: "属性设置",
        headerAlign: "center",
        sortable: 'custom',
        // showOverflowTooltip: true,
        show: true,
        slot: "properties"
    }
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

//#region 编辑条件 - 弹窗
const editConditionDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ""
})
// 新增
const goAdd = () => {
    console.log("goAdd")
    Object.assign(editConditionDialog, {
        visible: true,
        title: "新增条件",
        type: "add",
        row: null,
        layout: `expression, ${isModule.value ? "partFilter, " : ""}attribute`
    })
}
// 复制
const goCopy = (row: any) => {
    console.log("goCopy")
    if (!row) {
        ElMessage.warning("请选择一行数据！")
        return false
    }
    const copyObj = JSON.parse(JSON.stringify(row))
    delete copyObj.useOid
    Object.assign(editConditionDialog, {
        visible: true,
        title: "新增条件",
        type: "copy",
        row: copyObj,
        layout: `expression, ${isModule.value ? "partFilter, " : ""}attribute`
    })
}
// 编辑
const goEdit = (row: any, layout: string) => {
    if (!row) {
        ElMessage.warning("请选择一行数据！")
        return false
    }
    console.log("goEdit", row, layout)
    Object.assign(editConditionDialog, {
        visible: true,
        title: "编辑条件",
        type: "edit",
        row,
        layout
    })
}
// 编辑条件成功回调
const handleEditSuccess_add = () => {
    console.log("handleEditSuccess_add")
    getList()
    Object.assign(editConditionDialog, {
        visible: false,
        title: "",
        row: null,
        type: "",
        layout: ""
    })
}
//#endregion

//#region 字典数据
const option_attribute = ref<any[]>([])  // 属性设置
getDictionarySelect({ codes: "ATTRIBUTE_SETTINGS" }).then(data => {
  option_attribute.value = data.data.ATTRIBUTE_SETTINGS || []
})
//#endregion

defineExpose({
    getList
})
</script>

<style lang="scss" scoped></style>
