<template>
    <div class="app-container">
        <div v-loading="loading" :element-loading-text="elementLoadingText" class="sf-container3">
            <div class="search-container">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="85">
                    <el-form-item label="选配清单编码">
                        <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable @keyup.enter="getList" />
                    </el-form-item>
                    <el-form-item label="选配清单名称">
                        <el-input
                            v-model="searchForm.orderName"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="订单状态">
                        <el-select v-model="searchForm.saleOrderType" filterable clearable @change="getList">
                            <el-option
                                v-for="item in options_orderStatus"
                                :key="item.code"
                                :label="item.codeListNameC"
                                :value="item.code"
                            />
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
                            style="width: 330px"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getList">查询</el-button>
                        <el-button type="primary" @click="handleClearBtn">清空</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="sf-container-main">
                <div class="sf-container-main-content">
                    <div class="sf-table-wrapper">
                        <pt-table
                            ref="PtTableRef"
                            :locale="locale"
                            :tableColumns="tableColumns"
                            :tableEditConfig="tableEditConfig"
                            :paginationConfig="pageData"
                            :menuConfig="menuConfig"
                            :data="tableData"
                            row-key="orderOidStr"
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
                                    <el-button size="small" type="primary" @click="getList">{{
                                        t("dashboardPage.refresh")
                                    }}</el-button>
                                    <el-button type="primary" size="small" @click="goAdd">新建</el-button>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="saveAs(chooseRow)"
                                        >订单另存</el-button
                                    >
                                    <el-button type="primary" size="small" @click="goSync">提交实例化</el-button>
                                    <!-- <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleSubmitProcessBtn"
                                        :disabled="!multipleSelection.length"
                                        >提交</el-button
                                    > -->
                                    <!-- <el-button
                                        v-if="chooseRow?.planStatus === 1"
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleUpdateConfigBtn(chooseRow)"
                                        >修改配置</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleCheckConfigBtn(chooseRow)"
                                        >查看配置</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow || !(chooseRow.exampleBomStatus === '4')"
                                        @click="handlePreviewBomBtn(chooseRow)"
                                        >查看实例BOM</el-button
                                    > -->
                                    <!-- <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleViewApprovalRecordsBtn(chooseRow)"
                                        >查看审批记录</el-button
                                    > -->
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="goExport"
                                        :disabled="!tableData.length"
                                        >导出</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-orderType="{ row }">
                                <span>预计划选配</span>
                            </template>
                            <template #col-orderNo="{ row }">
                                <el-button type="primary" link @click="goDetail(row)">{{ row.orderNo }}</el-button>
                            </template>
                            <template #col-planStatus="{ row }">
                                <span
                                    v-text="
                                        getNameById(options_plan, row.planStatus + '', {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-saleOrderType="{ row }">
                                <span
                                    v-text="
                                        getNameById(options_orderStatus, row.saleOrderType + '', {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-workflowStatus="{ row }">
                                <span
                                    v-text="
                                        getNameById(options_processStatus, row.workflowStatus + '', {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-preparePlanType="{ row }">
                                <span
                                    v-text="
                                        getNameById(option_prePlanType, row.preparePlanType, {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-exampleBomStatus="{ row }">
                                <span v-text="getNameById(options_exampleBomStatus, row.exampleBomStatus + '')" />
                            </template>
                            <template #col-operate="{ row }">
                                <el-button
                                    v-if="row.planStatus === 1"
                                    type="primary"
                                    size="small"
                                    link
                                    @click="handleUpdateConfigBtn(row)"
                                    >修改配置</el-button
                                >
                                <el-button type="primary" size="small" link @click="handleCheckConfigBtn(row)"
                                    >查看配置</el-button
                                >
                                <el-button
                                    type="primary"
                                    size="small"
                                    link
                                    @click="handlePreviewBomBtn(row)"
                                    :disabled="!(row.exampleBomStatus === '4')"
                                    >查看实例BOM</el-button
                                >
                                <!-- v-if="row.processInstanceId" -->
                                <el-button type="primary" size="small" link @click="handleViewApprovalRecordsBtn(row)"
                                    >查看审批记录</el-button
                                >
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 新建选配 - 弹窗 -->
        <AddPlanningDialog
            v-if="addPlanningDialog.visible"
            :dialog="addPlanningDialog"
            @handleEditSuccess="handleEditSuccess_plan"
        />
        <!-- 修改配置弹窗 -->
        <dialogFrame
            :title="dialogTitle"
            v-model:visible="dialogVisible.updateConfig"
            :footer="false"
            width="90%"
            :fullscreen="fullscreen"
        >
            <updateConfigDialog
                v-if="dialogVisible.updateConfig"
                v-model:visible="dialogVisible.updateConfig"
                :currentRowData="currentRowData"
                :type="updateConfigType"
                :orderType="orderType"
                :fullscreen="fullscreen"
                @confirm-success="handleConfirmSuccess_updateConfig"
                @changeFullScreen="changeFullScreen"
            />
        </dialogFrame>

        <!-- 查看配置弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.checkConfig" :footer="false" width="90%">
            <checkConfigDialog
                v-if="dialogVisible.checkConfig"
                v-model:visible="dialogVisible.checkConfig"
                :currentRowData="currentRowData"
                @confirm-success="handleConfirmSuccess_checkConfig"
            />
        </dialogFrame>

        <!-- 预览BOM弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.previewBom" :footer="false" width="50%">
            <previewBomDialog
                v-if="dialogVisible.previewBom"
                v-model:visible="dialogVisible.previewBom"
                :objectRow="currentRowData"
                @confirm-success="handleConfirmSuccess_previewBom"
            />
        </dialogFrame>

        <!-- 提交流程弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.workflow" :footer="false" width="50%">
            <SubmitWorkflowExamine
                v-if="dialogVisible.workflow"
                v-model:visible="dialogVisible.workflow"
                :processSubmitDataList="processSubmitDataList"
                :dialogType="dialogTypeValue"
                @confirm-success="handleConfirmSuccess_workflow"
            />
        </dialogFrame>

        <!-- 审批详情弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.approvalRecord" :footer="false" width="40%">
            <ApprovalHistoryRecordDialog
                v-if="dialogVisible.approvalRecord"
                v-model:visible="dialogVisible.approvalRecord"
                :currentRowData="currentRowData"
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
import { ref, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import AddPlanningDialog from "./components/addPlanningDialog.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import updateConfigDialog from "@/views/orderManage/components/updateConfigDialog.vue"
import checkConfigDialog from "@/views/orderManage/components/checkConfigDialog.vue"
import previewBomDialog from "@/views/configureManage/applicationConfiguration/components/previewBomDialog.vue"
import SubmitWorkflowExamine from "@/components/submitWorkflowExamine/index.vue"
import ApprovalHistoryRecordDialog from "@/views/dashboard/components/approvalHistoryRecordDialog.vue"
import ChangeExportDialog from "@/views/productMange/materielQuery/components/changeExportDialog.vue"
import { usePagination } from "@/hooks/usePagination"
// import { SelectInterface } from "@/interface/common"
import { ProcessSubmitInterface } from "@/interface/orderManage"
import { sysOrderMangerPage, exportOrderList, exportSelectOrderList } from "@/api/orderManage/standingStockOrder/index"
import type * as standingStockOrderTypes from "@/api/orderManage/standingStockOrder/types"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { downloadFile } from "@/utils/exportTemplate"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "prePlanningOrder"
})
const { t, locale } = useI18n()
const router = useRouter()
const loading = ref(false)
const orderType = ref("5")
//#endregion

//#region 表单
const searchForm = reactive({
    orderType: orderType.value as standingStockOrderTypes.orderType, // 订单类型
    orderNo: "", // 选配清单编码
    orderName: "", // 选配清单名称
    saleOrderType: "", // 订单状态
    startTime: "", // 开始日期
    endTime: "" // 开始日期
})
const createTime = ref("")
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const chooseRow = ref()

//#region 增、删、改、查
// 获取列表
const getList = () => {
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
        ...searchForm,
        pageNo: pageData.currentPage,
        pageSize: pageData.pageSize
    }
    loading.value = true
    sysOrderMangerPage(params)
        .then((data) => {
            tableData.value = data.data.list
            pageData.total = data.data.total
        })
        .finally(() => (loading.value = false))
}

// 同步到U9
const goSync = () => {}
// 导出
const elementLoadingText = ref<string>("")
const goExport = () => {
    dialogTitle.value = "输出到Excel"
    const dialogType = "changeExport"
    dialogVisible[dialogType] = true
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log("multipleSelection.value: ", multipleSelection.value)
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
        fixed: "left",
        show: true,
        reserveSelection: true
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
    {
        label: "订单类型",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "orderType"
    },
    {
        prop: "orderNo",
        label: "预计划选配清单编号",
        headerAlign: "center",
        width: "200",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "orderNo"
    },
    {
        prop: "orderName",
        label: "选配清单名称",
        headerAlign: "center",
        // slot: 'search',
        minWidth: "180",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partNum",
        label: "系列配置号",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partName",
        label: "系列名称",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "preparePlanType",
        label: "预计划分类",
        headerAlign: "center",
        width: "100",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "preparePlanType"
    },
    {
        prop: "productName",
        label: "品名",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "planStatus",
        label: "方案状态",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "planStatus"
    },
    {
        prop: "exampleBom",
        label: "实例BOM",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "exampleBomStatus",
        label: "实例BOM状态",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "exampleBomStatus"
    },
    {
        prop: "num",
        label: "数量",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "saleOrderType",
        label: "订单状态",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "saleOrderType"
    },
    {
        prop: "workflowStatus",
        label: "流程状态",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "workflowStatus"
    },
    {
        prop: "createdName",
        label: "制单人",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createdAt",
        label: "创建时间",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    }
    // {
    //     prop: "updatedAt",
    //     label: "更新时间",
    //     headerAlign: "center",
    //     width: "160",
    //     showOverflowTooltip: true,
    //     show: true,
    // },
    // {
    //     label: "操作",
    //     width: "160",
    //     fixed: "right",
    //     align: "center",
    //     show: true,
    //     slot: "operate"
    // }
])
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
//#endregion

//#endregion

//#region 新建选配 - 弹窗
const addPlanningDialog = reactive<any>({
    visible: false,
    title: "",
    type: "",
    row: null
})
// 新增
const goAdd = () => {
    Object.assign(addPlanningDialog, {
        visible: true,
        title: "新建选配",
        type: "add",
        row: null
    })
}
//
const goDetail = (row: any) => {
    Object.assign(addPlanningDialog, {
        visible: true,
        title: "订单详情",
        type: "detail",
        row
    })
}
// 订单另存
const saveAs = (row: any) => {
    Object.assign(addPlanningDialog, {
        visible: true,
        title: "订单另存",
        type: "saveAs",
        row
    })
}
// 添加物料回调
const handleEditSuccess_plan = (row: any) => {
    console.log("handleEditSuccess_plan", row)
    Object.assign(addPlanningDialog, {
        visible: false,
        title: "",
        type: "",
        row: null
    })
    getList()
}

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        orderType: orderType.value as standingStockOrderTypes.orderType, // 订单类型
        orderNo: "", // 选配清单编码
        orderName: "", // 选配清单名称
        saleOrderType: "", // 订单状态
        startTime: "", // 开始日期
        endTime: "" // 开始日期
    })
    createTime.value = ""
    getList()
}
//#endregion

//#region 字典数据
const options_orderStatus = ref<any[]>([]) // 订单状态
const options_plan = ref<any[]>([]) // 方案状态
const options_processStatus = ref<any[]>([]) // 流程状态
const option_prePlanType = ref<any[]>([]) // 预计划分类下拉
const options_exampleBomStatus = ref<any[]>([]) // 实例BOM状态
getDictionarySelect({ codes: "SALE_ORDER_TYPE,PLAN_STATUS,PROCESS_STATUS,PRE_PLAN_TYPE,EXAMPLE_BOM_STATUS" }).then(
    (data) => {
        options_orderStatus.value = data.data.SALE_ORDER_TYPE || []
        options_plan.value = data.data.PLAN_STATUS || []
        options_processStatus.value = data.data.PROCESS_STATUS || []
        option_prePlanType.value = data.data.PRE_PLAN_TYPE || []
        options_exampleBomStatus.value = (data.data.EXAMPLE_BOM_STATUS || []).map((item: any) => {
            return {
                id: item.code,
                name: item.codeListNameC
            }
        })
    }
)
//#endregion

//#region 订单详情、修改配置、查看配置、查看BOM、添加备注
const updateConfigType = ref("")
const commonDialogHandler = (row: any, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}
// 处理修改配置按钮
const handleUpdateConfigBtn = (row: any) => {
    console.log("处理修改配置按钮: ", row)
    updateConfigType.value = "edit"
    commonDialogHandler(
        {
            partOid: row.materialOid,
            partNumber: row.materialName,
            partName: row.materialNum,
            schemeOid: row.schemeOid,
            oidStr: row.oidStr
        },
        "修改配置",
        "updateConfig"
    )
}

// 处理查看配置按钮
const handleCheckConfigBtn = (row: any) => {
    console.log("处理查看配置按钮: ", row)
    commonDialogHandler(row, "查看配置", "checkConfig")
}

// 处理查看BOM按钮
const handlePreviewBomBtn = (row: any) => {
    console.log("处理查看BOM按钮: ", row)
    commonDialogHandler(row, "预览BOM", "previewBom")
}

// 处理提交流程按钮
const processSubmitDataList = ref<ProcessSubmitInterface[]>([])
const handleSubmitProcessBtn = () => {
    for (let index = 0; index < multipleSelection.value.length; index++) {
        const element = multipleSelection.value[index]
        if (element.workflowStatus === 1 || element.workflowStatus === 3) {
            ElMessage({
                type: "warning",
                message: "当前选中的数据中有流程处于流程中，不支持提交流程",
                center: true
            })
            return
        }
    }
    processSubmitDataList.value = multipleSelection.value.map((item) => {
        return {
            id: item.orderOidStr,
            businessDetailId: item.oidStr,
            businessName: item.orderName,
            businessCode: item.orderNo
        }
    })
    console.log("processSubmitDataList: ", processSubmitDataList.value)
    dialogTitle.value = "选择审批人"
    dialogTypeValue.value = "预计划选配"
    const dialogType = "workflow"
    dialogVisible[dialogType] = true
}

// 处理查看审批记录按钮
const handleViewApprovalRecordsBtn = (row: any) => {
    console.log("处理查看审批记录按钮: ", row)
    commonDialogHandler(row, "审批历史记录", "approvalRecord")
}
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogTypeValue = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    updateConfig: false, // 修改配置对话框
    checkConfig: false, // 查看配置对话框
    previewBom: false, // 预览BOM对话框
    // addRemarks: false, // 添加备注对话框
    // orderDetail: false, // 订单详情对话框
    workflow: false, // 提交流程对话框
    approvalRecord: false, // 查看审批记录对话框
    changeExport: false // 预计划订单导出弹窗
})

const currentRowData = ref({
    oidStr: "", // 详情oid
    orderOidStr: "", // 订单oid
    orderNo: "", // 订单编号
    orderName: "" // 订单名称
}) // 当前行数据

//#region 设置全屏
const fullscreen = ref(false)
const changeFullScreen = (type: boolean) => {
    console.log("changeFullScreen", type)

    fullscreen.value = type
}
//#endregion

//#endregion

// #region 关闭弹窗
// 关闭订单详情
// const handleConfirmSuccess_orderDetail = (dialogType: string) => {
//     dialogVisible[dialogType] = false
//     // getList()
//     // resetDialog()
// }
// 关闭修改配置
const handleConfirmSuccess_updateConfig = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
    // resetDialog()
}

// 关闭查看配置
const handleConfirmSuccess_checkConfig = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // getList()
    // resetDialog()
}

// 关闭查看BOM
const handleConfirmSuccess_previewBom = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // getList()
    // resetDialog()
}

// // 关闭添加备注
// const handleConfirmSuccess_addRemarks = (dialogType: string) => {
//     dialogVisible[dialogType] = false
//     getList()
//     // resetDialog()
// }

// 关闭提交流程
const handleConfirmSuccess_workflow = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
    resetDialog()
}

// 关闭订单导出弹窗
const changeExportDialogRef = ref()
const handleConfirmSuccess_changeExport = async (changeExportForm: any) => {
    try {
        console.log("changeExportDialogRef: ", changeExportForm, changeExportDialogRef.value)
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
            result = await exportOrderList(searchForm)
        }
        const filename = `预计划-${formatDateTime(new Date(), "YYYY-MM-DD")}`
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

// 重置弹窗数据
const resetDialog = () => {
    chooseRow.value = null
    currentRowData.value = {
        oidStr: "",
        orderOidStr: "",
        orderNo: "",
        orderName: ""
    }
    processSubmitDataList.value = []
}
//#endregion
</script>

<style lang="scss" scoped>
.sf-container3 {
    .search-container {
        .el-form-item {
            margin-bottom: 10px;
        }
    }
}
</style>
