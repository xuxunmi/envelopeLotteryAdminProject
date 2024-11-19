<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading" :element-loading-text="elementLoadingText">
            <div class="search-container">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="80">
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
                    <el-form-item label="组织名称">
                        <el-select v-model="searchForm.groupOid" @change="handleSelectChange_group" clearable>
                            <el-option
                                v-for="item in options_group"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="系列名称">
                        <el-select v-model="searchForm.partNum" filterable clearable @change="getList">
                            <el-option
                                v-for="item in options_series"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="用户组织">
                        <el-select
                            v-model="searchForm.organizationOid"
                            filterable
                            clearable
                            @change="handleorganizationUserChange"
                        >
                            <el-option
                                v-for="item in organizationList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="创建人">
                        <el-select v-model="searchForm.createdBy" filterable clearable @change="getList">
                            <el-option v-for="item in creatorList" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-date-picker
                            v-model="createTime"
                            type="datetimerange"
                            range-separator="~"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            @change="getList"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" @click="getList">刷新</el-button>
                        <el-button type="primary" @click="handleQueryBtn">查询</el-button>
                        <el-button type="primary" size="small" @click="handleExportBtn" :disabled="!tableData.length"
                            >导出</el-button
                        >
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
                            row-key="orderOidStr"
                            border
                            highlight-current-row
                            size="small"
                            :row-class-name="tableRowClassName"
                            @row-click="handleRowClick"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @selection-change="handleSelectionChange"
                        >
                            <!-- 自定义列模板插槽 -->
                            <template #col-orderNo="{ row }">
                                <el-button type="primary" text size="small" @click.stop="handleViewOrderDetail(row)">{{
                                    row.orderNo
                                }}</el-button>
                            </template>
                            <template #col-orderType="{ row }">
                                <span v-text="getNameById(options_orderType, row.orderType + '')" />
                            </template>
                            <template #col-planStatus="{ row }">
                                <span v-text="getNameById(options_plan, row.planStatus + '')" />
                            </template>
                            <template #col-exampleBomStatus="{ row }">
                                <span v-text="getNameById(options_exampleBomStatus, row.exampleBomStatus + '')" />
                            </template>
                        </pt-table>
                    </div>
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

        <!-- 订单导出弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.changeExport" :footer="false" width="40%">
            <ChangeExportDialog
                ref="changeExportDialogRef"
                v-if="dialogVisible.changeExport"
                v-model:visible="dialogVisible.changeExport"
                :multipleTableSelection="multipleSelection"
                :tableData="tableData"
                @confirm-success="handleConfirmSuccess_changeExport"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import orderDetailDialog from "@/views/orderManage/components/orderDetailDialog.vue"
import ChangeExportDialog from "@/views/productMange/materielQuery/components/changeExportDialog.vue"
import { getNameById } from "@/assets/common/select-list"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { OrderStatisticsReportDataInterface } from "@/interface/reportManage/orderStatistics"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { userList } from "@/api/system/staffManage/index"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { sysOrderMangerPage, exportOrderList, exportSelectOrderList } from "@/api/orderManage/standingStockOrder/index"
import { StandingStockOrderListDataInterface } from "@/interface/orderManage"
import type * as standingStockOrderTypes from "@/api/orderManage/standingStockOrder/types"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import { downloadFile } from "@/utils/exportTemplate"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "orderStatistics"
})

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 头部搜索
const options_group = ref<SelectInterface[]>([]) // 系列组织列表
const options_series = ref<SelectInterface[]>([]) // 系列名称列表
const organizationList = ref<SelectInterface[]>([]) // 用户组织列表
const creatorList = ref<SelectInterface[]>([]) // 创建人列表
const createTime = ref("") // 创建时间

const searchForm = reactive<any>({
    orderType: "" as standingStockOrderTypes.orderType, // 订单类型
    groupOid: "", // 组织名称
    partNum: "", // 系列名称
    organizationOid: "", // 用户组织
    createdBy: "", // 创建人
    startTime: "", // 开始时间
    endTime: "" // 结束时间
})

// 获取系列组织列表
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

// 处理选择组织名称
const handleSelectChange_group = (val: string) => {
    searchForm.partNum = ""
    options_series.value = []
    if (!val) return
    const name = getNameById(options_group.value, val)
    getOptionsSeriesList(name)
}

// 获取组织列表
const getOrganizationList = async () => {
    try {
        loading.value = true
        const params = {
            page: "1",
            limit: "99999"
        }
        const { data } = await getOrganizationManageData(params)
        organizationList.value =
            data.map((item: { groupOid: string; name: string }) => {
                return {
                    id: item.groupOid,
                    name: item.name
                }
            }) || []
        searchForm.organizationOid = organizationList.value[0].id
        handleorganizationUserChange(searchForm.organizationOid)
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

getOrganizationList()

// 处理用户组织选择
const handleorganizationUserChange = (value: string) => {
    Object.assign(searchForm, {
        ...searchForm,
        organizationOid: value,
        createdBy: ""
    })
    creatorList.value = []
    if (!value) return
    getUserList(value)
}

// 获取创建人列表
const getUserList = async (organizationOid: string) => {
    try {
        const params = {
            topOid: organizationOid,
            status: "已启用",
            page: "1",
            limit: "99999"
        }
        const { data } = await userList(params)
        creatorList.value =
            data.map((item: any) => {
                return {
                    id: item.userOid,
                    name: item.name
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    } finally {
        loading.value = false
    }
}
//#endregion

// 处理查询按钮
const handleQueryBtn = () => {
    if (!searchForm.groupOid) {
        ElMessage({
            type: "warning",
            message: "请先选择组织名称!",
            center: true
        })
        return
    }
    getList()
}

// 处理导出按钮
const elementLoadingText = ref<string>("")
const handleExportBtn = () => {
    dialogTitle.value = "输出到Excel"
    const dialogType = "changeExport"
    dialogVisible[dialogType] = true
}
// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        orderType: "",
        groupOid: "",
        partNum: "",
        organizationOid: "",
        createdBy: "",
        startTime: "",
        endTime: ""
    })
    createTime.value = ""
    options_series.value = []
    creatorList.value = []
    getList()
}
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<OrderStatisticsReportDataInterface[]>([])
const chooseRow = ref()
const multipleSelection = ref<StandingStockOrderListDataInterface[]>([])

const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        fixed: "left",
        show: true,
        reserveSelection: true
    },
    {
        label: computed(() => t("materielPage.sequence")) as any,
        type: "index",
        width: "50",
        headerAlign: "center",
        fixed: "left",
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
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
        label: "编号",
        slot: "orderNo",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partNum",
        label: "系列配置号",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partName",
        label: "系列名称",
        headerAlign: "center",
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
        prop: "exampleBomStatus",
        label: "实例BOM状态",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        slot: "exampleBomStatus"
    },
    {
        prop: "num",
        label: "数量",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createdName",
        label: "创建人",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createdAt",
        label: "创建时间",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    }
])

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    if (!row) return
    chooseRow.value = row
    setCurrent(row)
    // PtTableRef.value!.toggleRowSelection(row)
}
// 事件
const setCurrent = (row?: any) => {
    const isSelected = multipleSelection.value.some((selectedRow) => selectedRow === row)
    // console.log(isSelected)
    if (isSelected) {
        PtTableRef.value!.toggleRowSelection(row, false)
    } else {
        PtTableRef.value!.toggleRowSelection(row, true)
    }
    PtTableRef.value!.setCurrentRow(row)
}
const handleSelectionChange = (val: any[]) => {
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
const getList = async () => {
    try {
        chooseRow.value = null
        // multipleSelection.value = []
        // 格式化日期
        if (createTime.value) {
            searchForm.startTime = createTime.value[0]
            searchForm.endTime = createTime.value[1]
        } else {
            searchForm.startTime = ""
            searchForm.endTime = ""
        }
        const params = {
            orderType: searchForm.orderType,
            createdBy: searchForm.createdBy,
            groupOid: searchForm.groupOid,
            partNum: searchForm.partNum,
            startTime: searchForm.startTime,
            endTime: searchForm.endTime,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        // console.log("params: ", params)
        const { data } = await sysOrderMangerPage(params)
        tableData.value = data.list || []
        pageData.total = data.total
    } catch (error: any) {
        console.log(error)
    }
}
//#endregion

//#endregion

//#region 订单详情、修改配置、查看配置、查看BOM、添加备注
const commonDialogHandler = (row: OrderStatisticsReportDataInterface, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}
// 查看订单详情
const handleViewOrderDetail = (row: OrderStatisticsReportDataInterface) => {
    console.log("订单详情: ", row)
    // currentRowData.value = row
    // dialogTitle.value = "订单详情"
    // const dialogType = "orderDetail"
    // dialogVisible[dialogType] = true
    commonDialogHandler(row, "订单详情", "orderDetail")
}
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    orderDetail: false, // 订单详情对话框
    changeExport: false // 预计划订单导出弹窗
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
// 关闭订单导出弹窗
const changeExportDialogRef = ref()
const handleConfirmSuccess_changeExport = async (changeExportForm: any) => {
    try {
        console.log("changeExportDialogRef: ", changeExportDialogRef.value)
        changeExportDialogRef.value!.loading = true
        changeExportDialogRef.value!.elementLoadingText = "正在导出到Excel，请稍等..."
        if (changeExportForm.exportMethod === "1") {
            if (!multipleSelection.value.length) {
                ElMessage({
                    type: "warning",
                    message: "请先勾选列表数据！",
                    center: true
                })
                return
            }
        }
        // 判断是勾选导出还是本页导出1（勾选），2（本页），3（全部）
        const content = changeExportForm.exportMethod === "1" ? multipleSelection.value : tableData.value
        let result = null
        if (changeExportForm.exportMethod === "1" || changeExportForm.exportMethod === "2") {
            result = await exportSelectOrderList(content)
        } else {
            const params = {
                orderType: searchForm.orderType,
                groupOid: searchForm.groupOid,
                partNum: searchForm.partNum,
                createdBy: searchForm.createdBy,
                startTime: searchForm.startTime,
                endTime: searchForm.endTime
            }
            result = await exportOrderList(params)
        }
        const filename = `订单统计报表-${formatDateTime(new Date(), "YYYY-MM-DD")}`
        downloadFile(result, filename)
        dialogVisible.changeExport = false
        PtTableRef.value!.clearSelection()
    } catch (err: any) {
        console.log(err)
    } finally {
        changeExportDialogRef.value!.elementLoadingText = ""
        changeExportDialogRef.value!.loading = false
    }
}
//#endregion

//#region 字典数据
const options_plan = ref<SelectInterface[]>([]) // 方案状态
const options_orderType = ref<SelectInterface[]>([]) // 订单类型
const options_exampleBomStatus = ref<any[]>([]) // 实例BOM状态
getDictionarySelect({ codes: "PLAN_STATUS,EXAMPLE_BOM_STATUS,ORDER_TYPE" }).then((data) => {
    options_plan.value = (data.data.PLAN_STATUS || []).map((item: any) => {
        return {
            id: item.code,
            name: item.codeListNameC
        }
    })
    options_orderType.value = (data.data.ORDER_TYPE || []).map((item: any) => {
        return {
            id: item.code,
            name: item.codeListNameC
        }
    })
    options_exampleBomStatus.value = (data.data.EXAMPLE_BOM_STATUS || []).map((item: any) => {
        return {
            id: item.code,
            name: item.codeListNameC
        }
    })
})
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
