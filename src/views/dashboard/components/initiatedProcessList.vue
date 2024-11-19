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
            @page-current-change="handleCurrentChange"
            @page-size-change="handleSizeChange"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            style="width: 100%"
        >
            <!-- 自定义列模板插槽 -->
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        @click="handleSubmitProcessBtn(chooseRow)"
                        :disabled="
                            !chooseRow.taskId || !(chooseRow?.workflowStatus === 2 || chooseRow?.workflowStatus === 4)
                        "
                        >提交</el-button
                    >
                    <el-button
                        type="primary"
                        size="small"
                        @click="handleViewApprovalRecordsBtn(chooseRow)"
                        :disabled="!chooseRow.taskId"
                        >查看审批记录</el-button
                    >
                </span>
            </template>
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

        <!-- 提交流程弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.workflow" :footer="false" width="40%">
            <SubmitWorkflowExamine
                v-if="dialogVisible.workflow"
                v-model:visible="dialogVisible.workflow"
                :processSubmitDataList="processSubmitDataList"
                :dialogType="dialogTypeValue"
                @confirm-success="handleConfirmSuccess_workflow"
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
import SubmitWorkflowExamine from "@/components/submitWorkflowExamine/index.vue"
import ApprovalHistoryRecordDialog from "./approvalHistoryRecordDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { ProcessSubmitInterface } from "@/interface/orderManage"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"
import { ApprovalFlowInterface } from "@/interface/dashboard"
import { getInitiatedProcessListData } from "@/api/dashboard"

import emitter from "@/utils/mitt"

defineOptions({
    name: "InitiatedProcessList"
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
const multipleSelection = ref<any[]>([])
const chooseRow = ref<any>({
    taskId: "",
    workflowStatus: ""
})

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        const { data } = await getInitiatedProcessListData(params)
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
                comment: item.comment,
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
}
const handleSelectionChange = (val: ApprovalFlowInterface[]) => {
    multipleSelection.value = val
    // console.log(multipleSelection.value)
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
        slot: "orderNo",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "workflowStatus",
        label: "流程状态",
        slot: "workflowStatus",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "comment",
        label: "驳回理由",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "submitter",
        label: "提交人",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "submitTime",
        label: "提交时间",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "completeTime",
        label: "完成时间",
        headerAlign: "center",
        width: "160",
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

//#region 对象名称、提交、查看审批记录
//#region 订单详情、修改配置、查看配置、查看BOM、添加备注
const commonDialogHandler = (row: any, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}

const handleOrderName = async (row: any) => {
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

// 处理流程提交按钮
const processSubmitDataList = ref<ProcessSubmitInterface[]>([])
const handleSubmitProcessBtn = async (row: ApprovalFlowInterface) => {
    const orderType = row.orderType
    switch (orderType) {
        case 1:
            dialogTypeValue.value = "常备库存选配"
            break
        case 5:
            dialogTypeValue.value = "预计划选配"
            break
        default:
            break
    }
    processSubmitDataList.value = [
        {
            id: row.orderOidStr,
            businessDetailId: row.oidStr,
            businessName: row.orderName,
            businessCode: row.orderNo
        }
    ]
    commonDialogHandler(row, "选择审批人", "workflow")
}

// 处理查看审批记录啊按钮
const handleViewApprovalRecordsBtn = (row: ApprovalFlowInterface) => {
    commonDialogHandler(row, "审批历史记录", "approvalRecord")
}
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogTypeValue = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    approval: false, // 通过/驳回对话框
    approvalRecord: false, // 查看审批记录对话框
    orderDetail: false, // 订单详情对话框
    workflow: false // 提交流程对话框
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
    orderNo: "", // 订单编号
    orderName: "" // 订单名称
}) // 当前行数据
//#endregion

// #region 关闭弹窗
// 关闭订单详情
const handleConfirmSuccess_orderDetail = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
    resetDialog()
}

// 关闭提交流程
const handleConfirmSuccess_workflow = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // 刷新待我审批列表列表
    emitter.emit("dashboard_refresh_pendingApprovalList", () => {})
    getList()
    resetDialog()
}

// 添加物料回调
const handleEditSuccess_plan = (row: any) => {
    // console.log("handleEditSuccess_plan", row)
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
    Object.assign(chooseRow.value, {
        taskId: "",
        workflowStatus: ""
    })
    currentRowData.value = {
        oidStr: "",
        orderOidStr: "",
        orderNo: "",
        orderName: ""
    }
    console.log("chooseRow: ", chooseRow.value)
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })

// 向外暴露方法
defineExpose({
    tableData
})

onMounted(() => {
    emitter.off("dashboard_refresh_initiatedProcessList")
    // 待我审批通过/驳回时刷新列表
    emitter.on("dashboard_refresh_initiatedProcessList", () => {
        getList()
    })
})
</script>

<style lang="scss" scoped>
.pendingApprovalList {
    margin-bottom: 12px;
}
</style>
