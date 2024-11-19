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
    >
        <!-- 表格编辑插槽 -->
        <template #slot-edit>
            <span v-if="!onlyRead" class="table-edit">
                <el-button type="primary" size="small" @click="getList">刷新</el-button>
                <el-button type="primary" size="small" @click="goAdd_option">{{
                    t("enterpriseTraitLibraryPage.addFeature")
                }}</el-button>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="!chooseRow"
                  @click="goEdit_option(chooseRow)"
                >{{ t("dashboardPage.edit") }}</el-button>
                <el-button type="primary" size="small" :disabled="!chooseRow" @click="goDel(chooseRow)">{{
                    t("dashboardPage.delete")
                }}</el-button>
                <el-button
                    type="primary"
                    size="small"
                    :disabled="!chooseRow"
                    @click="goAllocation(chooseRow)"
                    >分配到组</el-button
                >
                <el-button type="primary" size="small" @click="goExport">导出</el-button>
            </span>
        </template>
        <!-- 自定义列模板插槽 -->
        <template #head-search="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #col-icon="{ row }">
            <ObjectIcon :objectType="row.type" style="top: 3px" />
        </template>
        <template #col-optionType="{ row }">
            <div>{{ getNameById(productTypeList, row.optionType) }}</div>
        </template>
        <template #col-boolean="{ row, column }">
            <span v-if="row[column.property] === true">是</span>
            <span v-else-if="row[column.property] === false">否</span>
        </template>
        <!-- 右键菜单 -->
        <template #slot-menu="{ row }">
            <template v-if="row?.type === 'Option'">
                <!-- <li @click="goDetail(row)">{{ t("dashboardPage.details") }}</li> -->
                <template v-if="!onlyRead">
                    <li @click="goEdit_option(row)">{{ t("dashboardPage.edit") }}</li>
                    <li @click="goDel(row)">{{ t("dashboardPage.delete") }}</li>
                    <li @click="goAllocation(row)">分配到组</li>
                </template>
            </template>
        </template>
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
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import ObjectIcon from "./objectIcon.vue"
import { filterArray, resetFilterValue } from "@/utils/index"
import { SelectInterface } from "@/interface/common"
import { getNameById } from "@/assets/common/select-list"
import { getOptionList, exportOptionList } from "@/api/traitManage/enterpriseTraitLibrary"
import emitter from "@/utils/mitt"
import { downloadFile } from "@/utils/exportTemplate"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: () => ({})
    },
    onlyRead: {
        type: Boolean,
        default: false
    },
    // 产品分类
    productTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    }
})
const emits = defineEmits(["goDel_option"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
// 获取列表
const getList = () => {
    console.log("getOptionList", props.objectRow)
    loading.value = true
    const pid = props.objectRow.oid
    getOptionList({ pid }).then((data) => {
        chooseRow.value = null
        const arr: any[] = data.data || []
        arr.forEach((ele) => (ele.pid = props.objectRow.oid))
        sourceData.value = data.data || []
        resetFilterValue(filterValue)
        search()
    })
    .finally(() => loading.value = false)
}
// 删除
const goDel = (row: any) => {
    emitter.emit("enterpriseTraitLibrary_goDel", row)
}
// 新建特征
const goAdd_option = () => {
    emitter.emit("enterpriseTraitLibrary_goAdd_option", props.objectRow)
}
// 编辑特征
const goEdit_option = (row: any) => {
    emitter.emit("enterpriseTraitLibrary_goEdit_option", row)
}
// 分配到组
const goAllocation = (row: any) => {
    emitter.emit("enterpriseTraitLibrary_goAllocation", row)
}
// 查看详情
const goDetail = (row: any) => {
    emitter.emit("enterpriseTraitLibrary_goDetail", row)
}
// 导出
const goExport = () => {
  loading.value = true
  const pid = props.objectRow.oid
  exportOptionList({ pid }).then(data => {
    const filename = `特征列表-${props.objectRow.name}-${formatDateTime(new Date(), 'YYYYMMDDHHmmss')}`
    downloadFile(data, filename)
  })
  .finally(() => loading.value = false)
}

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
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
        width: "37px",
        show: true,
        slot: "icon"
    },
    {
        prop: "number",
        label: "特征编码",
        width: "160",
        slot: "search",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center"
    },
    {
        prop: "name",
        label: "特征名称",
        width: "180",
        slot: "search",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center"
    },
    {
        prop: "desc",
        label: computed(() => t("enterpriseTraitLibraryPage.explain")) as any,
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center"
    },
    // {
    //     prop: "absolutely",
    //     label: computed(() => t("enterpriseTraitLibraryPage.necessary")) as any,
    //     width: '100px',
    //     showOverflowTooltip: true,
    //     show: true,
    //     slot: 'absolutely',
    //     headerAlign: "center"
    // },
    // {
    //     prop: "singleChoice",
    //     label: computed(() => t("enterpriseTraitLibraryPage.singleChoice")) as any,
    //     width: '115px',
    //     showOverflowTooltip: true,
    //     show: true,
    //     slot: 'boolean',
    //     headerAlign: "center"
    // },
    {
        prop: "optionType",
        label: "产品分类",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "optionType",
        headerAlign: "center"
    },
    {
        prop: "visitable",
        label: "是否界面可见",
        width: "140",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "boolean",
        headerAlign: "center"
    },
    {
        prop: "isKeyOption",
        label: "是否关键特征",
        width: "140",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "boolean",
        headerAlign: "center"
    },
    {
        prop: "isOrderMate",
        label: "是否参与订单匹配",
        width: "160px",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "boolean",
        headerAlign: "center"
    },
    {
        prop: "defaultValue",
        label: "默认值",
        width: "110px",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center"
    },
    {
        prop: "choiceList",
        label: '特征值',
        minWidth: "500px",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center"
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
    console.log("tableData.value111: ", tableData.value)
}
//#endregion

//#region 挂载全局变量
//#endregion

defineExpose({
    getList
})
</script>

<style lang="scss" scoped></style>
