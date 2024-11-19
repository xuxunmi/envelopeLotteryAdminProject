<template>
    <div class="app-container">
        <div v-loading="loading" class="sf-container3">
            <div class="search-container">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="100">
                    <el-form-item label="订单号">
                        <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable @keyup.enter="getList" />
                    </el-form-item>
                    <el-form-item label="品名">
                        <el-input
                            v-model="searchForm.productName"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="订单类型">
                        <el-select v-model="searchForm.orderType" clearable @change="getList">
                            <el-option
                                v-for="item in options_orderType"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="系列配置号">
                        <el-input
                            v-model="searchForm.partNumLike"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="组织名称">
                        <el-select v-model="searchForm.groupOid" @change="handleSelectChange_group" clearable>
                            <el-option
                                v-for="item in options_group"
                                :key="item.id"
                                :label="item.name"
                                :value="item.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="系列名称">
                        <el-select v-model="searchForm.partNum" filterable clearable>
                            <el-option
                                v-for="item in options_series"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="实例BOM状态">
                        <el-select v-model="searchForm.exampleBomStatus" filterable clearable>
                            <el-option
                                v-for="item in options_exampleBomStatus"
                                :key="item.code"
                                :label="item.codeListNameC"
                                :value="item.code"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" @click="getList">刷新</el-button>
                        <el-button type="primary" @click="getList">查询</el-button>
                        <el-button size="small" type="primary" @click="handleClearBtn">清空</el-button>
                    </el-form-item>
                </el-form>
            </div>
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
                            :row-class-name="tableRowClassName"
                            @row-click="handleRowClick"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @selection-change="handleSelectionChange"
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <span class="table-edit">
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click.stop="handleImmediateExecutionBtn(chooseRow)"
                                        :disabled="
                                            !chooseRow.exampleBomStatus ||
                                            !(
                                                chooseRow.exampleBomStatus === '1' ||
                                                chooseRow.exampleBomStatus === '3' ||
                                                chooseRow.exampleBomStatus === '4' ||
                                                chooseRow.exampleBomStatus === '5'
                                            ) ||
                                            !(multipleSelection.length === 1)
                                        "
                                        >立即执行</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click.stop="handlePauseAndCancelBtn(chooseRow, '5')"
                                        :disabled="
                                            !chooseRow.exampleBomStatus ||
                                            !(
                                                chooseRow.exampleBomStatus === '1' ||
                                                chooseRow.exampleBomStatus === '2' ||
                                                chooseRow.exampleBomStatus === '3'
                                            ) ||
                                            !(multipleSelection.length === 1)
                                        "
                                        >暂停</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click.stop="handlePauseAndCancelBtn(chooseRow, '6')"
                                        :disabled="
                                            !chooseRow.exampleBomStatus ||
                                            !(
                                                chooseRow.exampleBomStatus === '1' ||
                                                chooseRow.exampleBomStatus === '2' ||
                                                chooseRow.exampleBomStatus === '3' ||
                                                chooseRow.exampleBomStatus === '5'
                                            ) ||
                                            !(multipleSelection.length === 1)
                                        "
                                        >作废</el-button
                                    >

                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                                        @click="handlePreviewBomBtn"
                                        >查看实例BOM</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click.stop="handleSyncBtn(chooseRow)"
                                        :disabled="
                                            !chooseRow.exampleBomStatus ||
                                            !(chooseRow.exampleBomStatus === '4' && chooseRow.u9SyncStatus === '0') ||
                                            !(multipleSelection.length === 1)
                                        "
                                        >同步到u9</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-orderNumber="{ row }">
                                <el-button type="primary" text size="small" @click="handleViewOrderDetail(row)">{{
                                    row.orderNo
                                }}</el-button>
                            </template>
                            <template #col-orderType="{ row }">
                                <span v-text="getNameById(options_orderType, row.orderType + '')" />
                            </template>
                            <template #col-planStatus="{ row }">
                                <span
                                    v-text="
                                        getNameById(options_planStatus, row.planStatus + '', {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-u9SyncStatus="{ row }">
                                <span
                                    v-text="
                                        getNameById(options_u9SyncStatus, row.u9SyncStatus + '', {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-exampleBomStatus="{ row }">
                                <span
                                    :style="{ color: row.exampleBomStatus === '3' ? '#F56C6C' : '' }"
                                    v-text="
                                        getNameById(options_exampleBomStatus, row.exampleBomStatus + '', {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>

            <!-- 订单详情弹窗 -->
            <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.orderDetail" :footer="false" width="90%">
                <orderDetailDialog
                    v-if="dialogVisible.orderDetail"
                    v-model:visible="dialogVisible.orderDetail"
                    :currentRowData="currentRowData"
                    @confirm-success="handleConfirmSuccess_orderDetail"
                />
            </dialogFrame>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import orderDetailDialog from "@/views/orderManage/components/orderDetailDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { getNameById } from "@/assets/common/select-list"
import { TableDataInterface } from "@/interface/processManage/instanceProcessCenter"
import {
    instantiatePage,
    immediateExecutionInstantiate,
    pauseAndCancellationInstantiate
} from "@/api/processManage/instanceProcessCenter"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "instanceProcessCenter"
})

const { t, locale } = useI18n()
const router = useRouter()
const loading = ref(false)
//#endregion

//#region 头部搜索
const options_group = ref<SelectInterface[]>([]) // 组织名称列表
const options_series = ref<SelectInterface[]>([]) // 系列名称列表
const searchForm = reactive({
    orderNo: "", // 订单号
    productName: "", // 品名
    orderType: "", // 订单类型
    partNumLike: "", // 系列配置号
    groupOid: "", // 组织名称
    partNum: "", // 系列名称
    exampleBomStatus: "" // 实例BOM状态
})

// 获取组织名称列表
const getOptionsGroupList = async () => {
    try {
        const { data } = await productList()
        options_group.value =
            data.map((item: { oid: string; name: string }) => {
                return {
                    id: item.oid,
                    name: item.name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    }
}

getOptionsGroupList()

// 获取系列名称列表
const getOptionsSeriesList = async (name: string) => {
    try {
        const { data } = await getProductTopBom({ ProductName: name })
        options_series.value =
            data.map((item: { Number: string; Name: string }) => {
                return {
                    id: item.Number,
                    name: item.Name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    }
}

// 处理查看BOM按钮
const handlePreviewBomBtn = () => {
    const row = multipleSelection.value[0] as any
    console.log(row)
    // 实例BOM状态为完成(4)时，跳转到实例BOM的物料详情页
    if (row.exampleBomStatus !== "4") {
        ElMessage({
            type: "warning",
            message: "实例BOM未完成！",
            center: true,
            duration: 3000
        })
    } else {
        ElMessage.info("跳转到实例BOM的物料详情页")
        // router.push({
        //     path: `/product/bomDetail/${row.oid}`,
        //     query: { oid: row.oid, type: "WTPart", tagTitle: `${row.number}_${row.name}_${row.version}` }
        // })
    }
    //commonDialogHandler(row, "预览BOM", "previewBom")
}

// 处理选择组织名称
const handleSelectChange_group = (val: string) => {
    searchForm.partNum = ""
    options_series.value = []
    if (!val) return
    getOptionsSeriesList(val)
}
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<TableDataInterface[]>([])
const chooseRow = ref<any>({
    exampleBomStatus: ""
})
const multipleSelection = ref<TableDataInterface[]>([])

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    setCurrent(row)
    // PtTableRef.value!.toggleRowSelection(row)
}
// 事件
const setCurrent = (row?: any) => {
    chooseRow.value = row
    const isSelected = multipleSelection.value.some((selectedRow) => selectedRow === row)
    // console.log(isSelected)
    if (isSelected) {
        PtTableRef.value!.toggleRowSelection(row, false)
    } else {
        PtTableRef.value!.toggleRowSelection(row, true)
    }
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        align: "center",
        show: true
    },
    {
        type: "index",
        label: "序号",
        width: "55",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
    // {
    //     label: computed(() => t("materielPage.sequence")) as any,
    //     type: "index",
    //     width: "50",
    //     headerAlign: "center",
    //     fixed: "left",
    //     show: true
    // },
    {
        prop: "orderType",
        label: "订单类型",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        slot: "orderType"
    },
    {
        prop: "orderNo",
        label: "订单号-行号",
        headerAlign: "center",
        width: "180",
        // showOverflowTooltip: true,
        show: true,
        slot: "orderNumber"
    },
    {
        prop: "partNum",
        label: "系列配置号",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partName",
        label: "系列名称",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "productName",
        label: "品名",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "planStatus",
        label: "方案状态",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        slot: "planStatus"
    },
    {
        prop: "exampleBom",
        label: "实例BOM",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "u9SyncStatus",
        label: "U9同步状态",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        slot: "u9SyncStatus"
    },
    {
        prop: "exampleBomStatus",
        label: "实例BOM状态",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        slot: "exampleBomStatus"
    },
    {
        prop: "errorInfo",
        label: "失败原因",
        headerAlign: "center",
        width: "120",
        showOverflowTooltip: true,
        show: true,
        slot: "errorInfo"
    },
    {
        prop: "exampleStartDate",
        label: "实例化开始时间",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "exampleEndDate",
        label: "实例化结束时间",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    }
])
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

// 获取订单列表
const getList = () => {
    loading.value = true
    Object.assign(chooseRow.value, {
        taskId: "",
        workflowStatus: ""
    })
    const params = {
        ...searchForm,
        pageNo: pageData.currentPage,
        pageSize: pageData.pageSize
    }
    instantiatePage(params)
        .then((data) => {
            tableData.value = data.data.list
            pageData.total = data.data.total
        })
        .finally(() => (loading.value = false))
}

const handleSelectionChange = (val: TableDataInterface[]) => {
    multipleSelection.value = val
    console.log("multipleSelection.value: ", multipleSelection.value)
}

const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (multipleSelection.value.some((selectedRow) => selectedRow === row)) {
        return "front-checked"
    }
    return "front-not-checked"
}

//#region 字典数据
const options_planStatus = ref<any[]>([]) // 方案状态
const options_exampleBomStatus = ref<any[]>([]) // 实例BOM状态
const options_orderType = ref<any[]>([]) // 订单类型
const options_u9SyncStatus = ref<any[]>([]) // 订单类型
getDictionarySelect({ codes: "PLAN_STATUS,EXAMPLE_BOM_STATUS,ORDER_TYPE,U9_SYNC_STATUS" }).then((data) => {
    options_planStatus.value = data.data.PLAN_STATUS || []
    options_exampleBomStatus.value = data.data.EXAMPLE_BOM_STATUS || []
    options_orderType.value =
        data.data.ORDER_TYPE.map((item: any) => {
            return {
                id: item.code,
                name: item.codeListNameC
            }
        }) || []
    options_u9SyncStatus.value = data.data.U9_SYNC_STATUS || []
})
//#endregion

//#region 订单详情、立即执行、暂停、取消、同步按钮
const commonDialogHandler = (row: TableDataInterface, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}
// 查看订单详情
const handleViewOrderDetail = (row: TableDataInterface) => {
    console.log("订单详情: ", row)
    // currentRowData.value = row
    // dialogTitle.value = "订单详情"
    // const dialogType = "orderDetail"
    // dialogVisible[dialogType] = true
    commonDialogHandler(row, "订单详情", "orderDetail")
}

// 处理立即执行按钮
const handleImmediateExecutionBtn = async (row: TableDataInterface) => {
    try {
        loading.value = true
        const newRow = multipleSelection.value.length ? multipleSelection.value[0] : row
        const params: {
            orderOid: string
        } = {
            orderOid: newRow.orderOidStr
        }
        await immediateExecutionInstantiate(params)
        ElMessage({
            type: "success",
            message: "执行成功！",
            center: true
        })
        getList()
    } catch (error) {
        console.log(error)
        loading.value = false
    }
}

// 处理暂停/作废按钮
const handlePauseAndCancelBtn = async (row: TableDataInterface, type: string) => {
    try {
        loading.value = true
        const newRow = multipleSelection.value.length ? multipleSelection.value[0] : row
        const params: {
            orderOid: string
            exampleStatus: string
        } = {
            orderOid: newRow.orderOidStr,
            exampleStatus: type
        }
        await pauseAndCancellationInstantiate(params)
        ElMessage({
            type: "success",
            message:
                getNameById(options_exampleBomStatus.value, type, {
                    value: "code",
                    label: "codeListNameC"
                }) + "成功！",
            center: true
        })
        getList()
    } catch (error) {
        console.log(error)
        loading.value = false
    }
}

// 处理同步按钮
const handleSyncBtn = (row: TableDataInterface) => {
    console.log("处理同步按钮: ", row)
    alert("功能开发中，敬请期待！")
}

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        orderNo: "",
        productName: "",
        orderType: "",
        partNumLike: "",
        groupOid: "",
        partNum: "",
        exampleBomStatus: ""
    })
    getList()
}

//#endregion

//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    orderDetail: false // 订单详情对话框
})

const currentRowData = ref({
    oid: ""
}) // 当前行数据
//#endregion

// #region 关闭弹窗
// 关闭订单详情
const handleConfirmSuccess_orderDetail = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // getList()
    // resetDialog()
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion
</script>

<style lang="scss" scoped>
.sf-container3 {
    .search-container {
        .el-form-item {
            margin-bottom: 10px;
        }
    }
    :deep(.pt-table) {
        .front-checked {
            td.el-table__cell {
                background-color: #f9e2d0 !important;
            }
        }
        .front-not-checked {
            td.el-table__cell {
                background-color: transparent !important;
            }
            td.el-table-fixed-column--left {
                background-color: #fff !important;
            }
        }
    }
}
</style>
