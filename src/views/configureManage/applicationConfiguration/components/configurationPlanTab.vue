<template>
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
                <el-button type="primary" size="small" @click="handleSimilarCreateBtn">类似创建</el-button>
                <el-button type="primary" size="small" @click="handleQueryPlanBtn">查询方案</el-button>
                <el-button
                    type="primary"
                    size="small"
                    :disabled="!multipleSelection.length"
                    @click="handleDeletePlanBtn"
                    >删除方案</el-button
                >
                <el-button
                    type="primary"
                    size="small"
                    :disabled="!multipleSelection.length"
                    @click="handleDeleteInstanceBtn"
                    >删除实例</el-button
                >
                <el-button
                    type="primary"
                    size="small"
                    :disabled="!multipleSelection.length"
                    @click="handleChangePlanNameBtn"
                    >修改方案名称</el-button
                >
                <el-button
                    type="primary"
                    size="small"
                    :disabled="!multipleSelection.length"
                    @click="handleBrowseInstanceBomBtn"
                    >浏览实例BOM</el-button
                >
                <el-button
                    type="primary"
                    size="small"
                    :disabled="!multipleSelection.length"
                    @click="handleCreatePlanCacheBtn"
                    >创建方案缓存</el-button
                >
                <el-button type="primary" size="small" @click="handleMangeToolsBtn">管理工具</el-button>
            </span>
        </template>
        <!-- 自定义列模板插槽 -->
        <!-- <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template> -->
    </pt-table>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import { ElMessageBox, ElMessage } from "element-plus"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "configurationPlanTab"
})

const { t, locale } = useI18n()

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: () => ({})
    },
    onlyRead: {
        type: Boolean,
        default: false
    }
})

const emits = defineEmits(["handleRowClick"])
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([
    {
        planCode: "10010030120-2928",
        planName: "FD30E-新柴4D29V41-009(国I/P泵)-二级4000mm-进口侧移器",
        instanceCode: "10010030120-2928"
    },
    {
        planCode: "10010035050-6184",
        planName: "FD35E-云内YN27NAG4(国W高压共轨)-基本型液压调距叉门架300",
        instanceCode: "10010035050-6184"
    },
    {
        planCode: "10010035050-6681",
        planName: "FD35E-出租车-新柴4D29V41-009(国INP泵)-三级4500mm-高排",
        instanceCode: "10010035050-6681"
    },
    {
        planCode: "10010035050-6723",
        planName: "云内YN27NAG4(国W高压共轨)-三级4500mm-三联阀配油",
        instanceCode: "10010035050-6723"
    },
    {
        planCode: "10010035050-6729",
        planName: "新柴4D29V41-009(国WNP泵)-三级4000mm-三联阀配油管",
        instanceCode: "10010035050-6729"
    }
])
const multipleSelection = ref<any[]>([])
const chooseRow = ref()

//#region 增、删、改、查
// 获取列表
const getList = () => {
    // try {
    //     const params = {
    //         operation: searchForm.userOperate,
    //         creatorName: searchForm.userName,
    //         status: searchForm.status,
    //         pageNo: pageData.currentPage,
    //         pageSize: pageData.pageSize
    //     }
    //     const { data } = await getSystemLog(params)
    //     tableData.value = data.list.map((item: any) => {
    //         return {
    //             oid: item.id,
    //             userName: item.creatorName,
    //             userOperate: item.operation,
    //             requestUrl: item.requestUri,
    //             requestMethod: item.requestMethod,
    //             requestParams: item.requestParams,
    //             requestDuration: item.requestTime,
    //             status: item.status,
    //             errMsg: item.errorMessage,
    //             ip: item.ip,
    //             userAgent: item.userAgent,
    //             createDate: item.createDate
    //         }
    //     })
    //     pageData.total = data.total
    // } catch (error: any) {
    //     console.log(error)
    // }
}

// 处理类似创建按钮
const handleSimilarCreateBtn = () => {
    console.log("处理类似创建按钮")
}

// 处理查询方案按钮
const handleQueryPlanBtn = () => {
    console.log("处理查询方案按钮")
}

// 处理删除方案按钮
const handleDeletePlanBtn = () => {
    console.log("处理删除方案按钮")
    ElMessageBox.confirm(t("productLibraryPage.confirmDelete"), t("productLibraryPage.prompt"), {
        confirmButtonText: t("productLibraryPage.confirm"),
        cancelButtonText: t("productLibraryPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            // const oids = [row.oid]
            // const type = row.type
            // deleteBatchHandler(oids, type)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t("productLibraryPage.cancelDelMsg"),
                center: true
            })
        })
}

// 处理删除实例按钮
const handleDeleteInstanceBtn = () => {
    console.log("处理删除实例按钮")
}

// 处理修改方案名称按钮
const handleChangePlanNameBtn = () => {
    console.log("处理修改方案名称")
}

// 处理浏览实例BOM按钮
const handleBrowseInstanceBomBtn = () => {
    console.log("处理浏览实例BOM")
}

// 处理创建方案缓存按钮
const handleCreatePlanCacheBtn = () => {
    console.log("处理创建方案缓存")
}

// 处理管理工具按钮
const handleMangeToolsBtn = () => {
    console.log("处理管理工具按钮")
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any) => {
    console.log("row-click", row, column)
    setCurrent(row)
    emits("handleRowClick", row, column)
}

const handleSelectionChange = (val: any[]) => {
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
    {
        label: "序号",
        type: "index",
        width: "60",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "planCode",
        label: "方案编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "planName",
        label: "方案名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "instanceCode",
        label: "实例编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    }
])
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

defineExpose({
    getList
})
</script>

<style lang="scss" scoped></style>
