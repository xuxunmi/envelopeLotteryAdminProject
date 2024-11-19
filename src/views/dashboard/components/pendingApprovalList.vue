<template>
    <div class="pendingApprovalList" v-loading="loading">
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
            @page-current-change="handleCurrentChange"
            @page-size-change="handleSizeChange"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            style="width: 100%"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        @click="handletThroughBtn(chooseRow)"
                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                        >通过</el-button
                    >
                    <el-button
                        type="primary"
                        size="small"
                        @click="handletRejectBtn(chooseRow)"
                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                        >驳回</el-button
                    >
                    <el-button
                        type="primary"
                        size="small"
                        @click="handletBatchThroughBtn"
                        :disabled="!multipleSelection.length"
                        >批量通过</el-button
                    >
                    <el-button
                        type="primary"
                        size="small"
                        @click="handletBatchRejectBtn"
                        :disabled="!multipleSelection.length"
                        >批量驳回</el-button
                    >
                    <el-button
                        type="primary"
                        size="small"
                        @click="handleViewApprovalRecordsBtn(chooseRow)"
                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                        >查看审批记录</el-button
                    >
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #col-orderNo="{ row }">
                <el-button type="primary" text size="small" @click="handleOrderName(row)">{{ row.orderNo }}</el-button>
            </template>
            <template #col-workflowStatus="{ row }">
                <div>{{ getNameById(processStatusList, String(row.workflowStatus)) }}</div>
            </template>
        </pt-table>

        <!-- 订单详情弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.orderDetail" :footer="false" width="90%">
            <orderDetailDialog
                v-if="dialogVisible.orderDetail"
                v-model:visible="dialogVisible.orderDetail"
                :currentRowData="currentRowData"
                @confirm-success="handleConfirmSuccess_orderDetail"
            />
        </dialogFrame>
        <!-- 预计划选配 - 弹窗 -->
        <AddPlanningDialog
            v-if="addPlanningDialog.visible"
            :dialog="addPlanningDialog"
            @handleEditSuccess="handleEditSuccess_plan"
        />

        <!-- 通过/驳回弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.approval" :footer="false" width="40%">
            <ApprovalDialog
                v-if="dialogVisible.approval"
                v-model:visible="dialogVisible.approval"
                :currentRowData="currentRowData"
                :dialogType="dialogAuditType"
                @confirm-success="handleConfirmSuccess_approval"
            />
        </dialogFrame>

        <!-- 查看审批记录弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.approvalRecord" :footer="false" width="40%">
            <ApprovalHistoryRecordDialog
                v-if="dialogVisible.approvalRecord"
                v-model:visible="dialogVisible.approvalRecord"
                :currentRowData="currentRowData"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import OrderDetailDialog from "@/views/orderManage/components/orderDetailDialog.vue"
import AddPlanningDialog from "@/views/orderManage/prePlanningOrder/components/addPlanningDialog.vue"
import ApprovalDialog from "./approvalDialog.vue"
import ApprovalHistoryRecordDialog from "./approvalHistoryRecordDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"
import { ApprovalFlowInterface } from "@/interface/dashboard"
import { getPendingApproveData, processTaskComplete } from "@/api/dashboard"
import emitter from "@/utils/mitt"

defineOptions({
    name: "PendingApprovalList"
})

const props = defineProps({
    processStatusList: {
        type: Array as () => SelectInterface[],
        default: () => []
    }
})

const { t, locale } = useI18n()

//#region 参数和方法
const router = useRouter()
const loading = ref(false)
//#endregion

//#region pt-table表格

const PtTableRef = ref<PtTableComponent>()
const tableData = ref<ApprovalFlowInterface[]>([])
const multipleSelection = ref<ApprovalFlowInterface[]>([])
const chooseRow = ref()

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        const { data } = await getPendingApproveData(params)
        tableData.value = data.list.map((item: any) => {
            return {
                oidStr: item.businessDetailId,
                orderOidStr: item.businessId,
                orderNo: item.businessCode,
                orderName: item.businessName,
                processDefinitionName: item.processDefinitionName,
                processDefinitionKey: item.processDefinitionKey,
                orderType: item.orderType,
                workflowStatus: item.workflowStatus,
                taskId: item.taskId,
                taskName: item.taskName,
                processInstanceId: item.processInstanceId,
                executionId: item.executionId,
                businessKey: item.businessKey,
                submitter: item.starter,
                submitTime: item.createTime,
                completeTime: item.approveTime
            }
        })
        pageData.total = data.total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

//#region el-table默认参数
const handleRowClick = (row: ApprovalFlowInterface) => {
    chooseRow.value = row
    const isSelected = multipleSelection.value.some((selectedRow) => selectedRow === row)
    // console.log(isSelected)
    if (isSelected) {
        PtTableRef.value!.toggleRowSelection(row, false)
    } else {
        PtTableRef.value!.toggleRowSelection(row, true)
    }
}

const handleSelectionChange = (val: ApprovalFlowInterface[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
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

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        headerAlign: "center",
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
    {
        prop: "processDefinitionName",
        label: "流程名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "orderNo",
        label: "对象名称",
        headerAlign: "center",
        slot: "orderNo",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "workflowStatus",
        label: "流程状态",
        slot: "workflowStatus",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "submitter",
        label: "提交人",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "submitTime",
        label: "提交时间",
        headerAlign: "center",
        // width: "160",
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

//#region 批量通过、批量驳回、对象名称、通过、驳回、查看审批记录
const batchApprovalHandler = async (completeTaskDtoList: any) => {
    try {
        loading.value = true
        await processTaskComplete(completeTaskDtoList)
        loading.value = false
        PtTableRef.value!.clearSelection()
        ElMessage({
            type: "success",
            message: "审核通过",
            center: true
        })
        // 刷新我发起列表
        emitter.emit("dashboard_refresh_initiatedProcessList", () => {})
        getList()
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
const handletBatchThroughBtn = async () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: "请先勾选数据!",
            center: true
        })
        return
    }
    const variables = {
        flag: true, // 通过默认写死为true
        comment: ""
    }
    const paramsList = multipleSelection.value.map((item) => {
        return {
            taskId: item.taskId,
            businessId: item.orderOidStr,
            variables
        }
    })
    batchApprovalHandler(paramsList)
}

const handletBatchRejectBtn = () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: "请先勾选数据!",
            center: true
        })
        return
    }
    const variables = {
        flag: false, // 驳回默认写死为false
        comment: ""
    }
    const paramsList = multipleSelection.value.map((item) => {
        return {
            taskId: item.taskId,
            businessId: item.orderOidStr,
            variables
        }
    })
    batchApprovalHandler(paramsList)
}

const commonDialogHandler = (row: ApprovalFlowInterface, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}

const handleOrderName = async (row: ApprovalFlowInterface) => {
    console.log("订单详情: ", row)
    const orderType = row.orderType
    if (orderType === 5) {
        Object.assign(addPlanningDialog, {
            visible: true,
            title: "订单详情",
            type: "detail",
            row
        })
    } else if (orderType === 1 || orderType === 2 || orderType === 3 || orderType === 4) {
        commonDialogHandler(row, "订单详情", "orderDetail")
    } else {
        ElMessage({
            type: "warning",
            message: "当前数据无详情！",
            center: true
        })
        return
    }
}

const handletThroughBtn = (row: ApprovalFlowInterface) => {
    dialogAuditType.value = "通过"
    const variables = {
        flag: true, // 通过默认写死为true
        comment: ""
    }
    const paramsList = [
        {
            taskId: row.taskId,
            businessId: row.orderOidStr,
            variables
        }
    ]
    batchApprovalHandler(paramsList)
}
const handletRejectBtn = (row: ApprovalFlowInterface) => {
    dialogAuditType.value = "驳回"
    commonDialogHandler(row, "流程任务审批：" + row.processDefinitionName, "approval")
}

const handleViewApprovalRecordsBtn = (row: ApprovalFlowInterface) => {
    console.log("查看审批记录: ", row)
    commonDialogHandler(row, "审批历史记录", "approvalRecord")
}
//#endregion
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogAuditType = ref<string>("") // 审批弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    approval: false, // 通过/驳回对话框
    approvalRecord: false, // 查看审批记录对话框
    orderDetail: false // 订单详情对话框
})

//#region 预计划选配 - 弹窗
const addPlanningDialog = reactive<any>({
    visible: false,
    title: "",
    type: "",
    row: null
})

const currentRowData = ref({
    oidStr: "", // 详情oid
    orderOidStr: "", // 订单oid
    orderType: 1 // 订单类型
}) // 当前行数据

//#endregion

// #region 关闭弹窗
// 关闭审批
const handleConfirmSuccess_approval = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // 刷新我发起列表
    emitter.emit("dashboard_refresh_initiatedProcessList", () => {})
    getList()
    resetDialog()
}

const handleConfirmSuccess_orderDetail = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
    resetDialog()
}

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

// 重置弹窗数据
const resetDialog = () => {
    Object.assign(addPlanningDialog, {
        visible: false,
        title: "",
        type: "",
        row: null
    })
    currentRowData.value = {
        oidStr: "",
        orderOidStr: "",
        orderType: 1
    }
    chooseRow.value = null
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })

onMounted(() => {
    emitter.off("dashboard_refresh_pendingApprovalList")
    // 待我审批通过/驳回时刷新列表
    emitter.on("dashboard_refresh_pendingApprovalList", () => {
        getList()
    })
})

// 向外暴露方法
defineExpose({
    tableData
})
</script>

<style lang="scss" scoped>
.pendingApprovalList {
    margin-bottom: 12px;
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
