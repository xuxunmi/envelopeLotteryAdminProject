<template>
    <div v-loading="loading" :element-loading-text="elementLoadingText" class="sf-container3">
        <div class="search-container">
            <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="80">
                <el-form-item label="订单号">
                    <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable @keyup.enter="getList" />
                </el-form-item>
                <el-form-item label="品名">
                    <el-input v-model="searchForm.productName" placeholder="请输入" clearable @keyup.enter="getList" />
                </el-form-item>
                <el-form-item label="系列配置号">
                    <el-input v-model="searchForm.partNumLike" placeholder="请输入" clearable @keyup.enter="getList" />
                </el-form-item>
                <el-form-item label="组织名称">
                    <el-select v-model="searchForm.groupOid" @change="handleSelectChange_group" clearable>
                        <el-option v-for="item in options_group" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="系列名称">
                    <el-select v-model="searchForm.partNum" filterable clearable @change="getList">
                        <el-option v-for="item in options_series" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select v-model="searchForm.saleOrderType" filterable clearable @change="getList">
                        <el-option
                            v-for="item in options_status"
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
                        @row-click="handleRowClick"
                        @page-current-change="handleCurrentChange"
                        @page-size-change="handleSizeChange"
                        @selection-change="handleSelectionChange"
                    >
                        <!-- 表格编辑插槽 -->
                        <template #slot-edit>
                            <span class="table-edit">
                                <template v-if="orderType === '1'">
                                    <el-button size="small" type="primary" @click="getList">{{
                                        t("dashboardPage.refresh")
                                    }}</el-button>
                                    <el-button type="primary" size="small" @click="goChoose_series">新建</el-button>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleSaveAsBtn(chooseRow)"
                                        >另存</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleReleaseInstanceBomBtn(chooseRow)"
                                        >提交实例化</el-button
                                    >
                                    <!-- <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleSubmitProcessBtn"
                                        :disabled="!multipleSelection.length"
                                        >提交</el-button
                                    > -->
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleUpdateConfigBtn(chooseRow)"
                                        >修改</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleCheckConfigBtn(chooseRow)"
                                        >查看配置</el-button
                                    >
                                    <!-- 实例BOM状态为4(完成)才能查看实例BOM -->
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow || !(chooseRow.exampleBomStatus === '4')"
                                        @click="handlePreviewBomBtn(chooseRow)"
                                        >查看实例BOM</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleAddRemarksBtn(chooseRow)"
                                        >添加备注</el-button
                                    >
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
                                        @click="handleDeleteBtn"
                                        :disabled="!multipleSelection.length"
                                        >删除</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleExportBtn"
                                        :disabled="!tableData.length"
                                        >导出</el-button
                                    >
                                </template>
                                <template v-else-if="orderType === '2'">
                                    <el-button size="small" type="primary" @click="getList">{{
                                        t("dashboardPage.refresh")
                                    }}</el-button>
                                    <!-- <el-button type="primary" size="small" @click="handleReleaseInstanceBomBtn"
                                        >提交实例化</el-button
                                    > -->
                                    <el-button type="primary" size="small" @click="handleReleaseInstanceBomBtn"
                                        >转为特殊订单</el-button
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
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleAddRemarksBtn(chooseRow)"
                                        >添加备注</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleExportBtn"
                                        :disabled="!tableData.length"
                                        >导出</el-button
                                    >
                                </template>
                                <template v-else-if="orderType === '3'">
                                    <el-button size="small" type="primary" @click="getList">{{
                                        t("dashboardPage.refresh")
                                    }}</el-button>
                                    <el-button type="primary" size="small" @click="handleReleaseInstanceBomBtn"
                                        >提交实例化</el-button
                                    >
                                    <el-button type="primary" size="small" @click="handleReleaseInstanceBomBtn"
                                        >同步到u9</el-button
                                    >
                                    <!-- <el-button type="primary" size="small" @click="handleOneClickPublishingBtn"
                                        >一键发布</el-button
                                    > -->
                                    <el-button
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
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleAddRemarksBtn(chooseRow)"
                                        >添加备注</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleExportBtn"
                                        :disabled="!tableData.length"
                                        >导出</el-button
                                    >
                                </template>
                                <template v-else-if="orderType === '4'">
                                    <el-button size="small" type="primary" @click="getList">{{
                                        t("dashboardPage.refresh")
                                    }}</el-button>
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
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleExportBtn"
                                        :disabled="!tableData.length"
                                        >导出</el-button
                                    >
                                </template>
                            </span>
                        </template>
                        <!-- 自定义列模板插槽 -->
                        <template #col-orderNo="{ row }">
                            <el-button type="primary" text size="small" @click="handleViewOrderDetail(row)">{{
                                row.orderNo
                            }}</el-button>
                        </template>
                        <template #col-orderType="{ row }">
                            <span
                                v-text="
                                    getNameById(options_orderType, row.orderType + '', {
                                        value: 'code',
                                        label: 'codeListNameC'
                                    })
                                "
                            />
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
                        <template #col-exampleBomStatus="{ row }">
                            <span
                                v-text="
                                    getNameById(options_exampleBomStatus, row.exampleBomStatus + '', {
                                        value: 'code',
                                        label: 'codeListNameC'
                                    })
                                "
                            />
                        </template>
                        <template #col-saleOrderType="{ row }">
                            <span
                                v-text="
                                    getNameById(options_status, row.saleOrderType + '', {
                                        value: 'code',
                                        label: 'codeListNameC'
                                    })
                                "
                            />
                        </template>
                        <template #col-produceOrderType="{ row }">
                            <span
                                v-text="
                                    getNameById(options_produceOrderType, row.produceOrderType + '', {
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
                        <template #col-productOrganization="{ row }">
                            <span
                                v-text="
                                    getNameById(options_productGroup, row.productOrganization + '', {
                                        value: 'code',
                                        label: 'codeListNameC'
                                    })
                                "
                            />
                        </template>
                        <template #col-action="{ row }">
                            <template v-if="orderType === '1'">
                                <el-button type="primary" size="small" link @click="handleUpdateConfigBtn(row)"
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
                                <el-button type="primary" size="small" link @click="handleAddRemarksBtn(row)"
                                    >添加备注</el-button
                                >
                                <!-- v-if="row.processInstanceId" -->
                                <!-- <el-button type="primary" size="small" link @click="handleViewApprovalRecordsBtn(row)"
                                    >查看审批记录</el-button
                                > -->
                            </template>
                            <template v-else-if="orderType === '2'">
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
                                <el-button type="primary" size="small" link @click="handleAddRemarksBtn(row)"
                                    >添加备注</el-button
                                >
                            </template>
                            <template v-else-if="orderType === '3'">
                                <el-button type="primary" size="small" link @click="handleUpdateConfigBtn(row)"
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
                                <el-button type="primary" size="small" link @click="handleAddRemarksBtn(row)"
                                    >添加备注</el-button
                                >
                            </template>
                            <template v-else-if="orderType === '4'">
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
                            </template>
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
                :fullscreen="fullscreen"
                :orderType="orderType"
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

        <!-- 添加备注弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addRemarks" :footer="false" width="50%">
            <addRemarksDialog
                v-if="dialogVisible.addRemarks"
                v-model:visible="dialogVisible.addRemarks"
                :currentRowData="currentRowData"
                @confirm-success="handleConfirmSuccess_addRemarks"
            />
        </dialogFrame>

        <!-- 选择系列 - 弹窗 -->
        <ChooseSeriesDialog
            v-if="chooseSeriesDialog.visible"
            :dialog="chooseSeriesDialog"
            @handleEditSuccess="handleEditSuccess_series"
        />

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
import { ref, reactive, type PropType } from "vue"
import { useRouter } from "vue-router"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import orderDetailDialog from "../components/orderDetailDialog.vue"
import updateConfigDialog from "../components/updateConfigDialog.vue"
import checkConfigDialog from "../components/checkConfigDialog.vue"
import previewBomDialog from "@/views/configureManage/applicationConfiguration/components/previewBomDialog.vue"
import addRemarksDialog from "../components/addRemarksDialog.vue"
import ChooseSeriesDialog from "@/views/orderManage/prePlanningOrder/components/chooseSeriesDialog.vue"
import SubmitWorkflowExamine from "@/components/submitWorkflowExamine/index.vue"
import ApprovalHistoryRecordDialog from "@/views/dashboard/components/approvalHistoryRecordDialog.vue"
import ChangeExportDialog from "@/views/productMange/materielQuery/components/changeExportDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { StandingStockOrderListDataInterface, ProcessSubmitInterface } from "@/interface/orderManage"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import {
    sysOrderMangerPage,
    exportOrderList,
    exportSelectOrderList,
    deleteByOids
} from "@/api/orderManage/standingStockOrder/index"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import type * as standingStockOrderTypes from "@/api/orderManage/standingStockOrder/types"
import { getNameById } from "@/assets/common/select-list"
import { downloadFile } from "@/utils/exportTemplate"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    // 订单类型
    orderType: {
        type: String as PropType<standingStockOrderTypes.orderType>,
        default: ""
    }
})
const { t, locale } = useI18n()
const router = useRouter()
const loading = ref(false)
//#endregion

//#region 头部搜索
const options_group = ref<SelectInterface[]>([]) // 组织名称列表
const options_series = ref<SelectInterface[]>([]) // 系列名称列表
const createTime = ref("") // 创建时间
const searchForm = reactive({
    orderType: props.orderType as standingStockOrderTypes.orderType, // 订单类型
    orderNo: "", // 订单号
    productName: "", // 品名
    partNumLike: "", // 系列配置号
    groupOid: "", // 组织名称
    partNum: "", // 系列名称
    saleOrderType: "", // 订单状态
    startTime: "", // 开始时间
    endTime: "" // 结束时间
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
        // 默认选中第一个
        // if (options_group.value.length) {
        //     searchForm.groupOid = options_group.value[0].name as string
        //     handleSelectChange_group(searchForm.groupOid)
        // }
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
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<StandingStockOrderListDataInterface[]>([])
const chooseRow = ref()
const multipleSelection = ref<StandingStockOrderListDataInterface[]>([])

//#region 增、删、改、查
// 获取订单列表
const getList = async () => {
    try {
        loading.value = true
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
        // console.log("params: ", params)
        const { data } = await sysOrderMangerPage(params)
        loading.value = false
        tableData.value = data.list || []
        pageData.total = data.total
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

// 处理新建按钮
const updateConfigType = ref("")
const handleCreateBtn = (row: any) => {
    console.log("处理新建按钮", row)
    updateConfigType.value = "add"
    commonDialogHandler(row, "新增常备库存订单", "updateConfig")
}

// 处理另存按钮
const handleSaveAsBtn = (row: any) => {
    updateConfigType.value = "saveAs"
    commonDialogHandler(row, "另存为", "updateConfig")
}

// 处理发布实例BOM按钮
const handleReleaseInstanceBomBtn = (row: any) => {
    console.log("处理发布实例BOM按钮")
    ElMessage.info("待开发！")
    // if (!multipleSelection.value.length) {
    //   ElMessage.error('请选择一条数据！')
    //   return false
    // }
}

// 处理一键发布按钮
const handleOneClickPublishingBtn = () => {
    console.log("处理一键发布按钮")
    ElMessage.info("待开发！")
    // if (!multipleSelection.value.length) {
    //   ElMessage.error('请选择一条数据！')
    //   return false
    // }
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
        orderType: props.orderType as standingStockOrderTypes.orderType, // 订单类型
        orderNo: "", // 订单号
        productName: "", // 品名
        partNumLike: "", // 系列配置号
        groupOid: "", // 组织名称
        partNum: "", // 系列名称
        saleOrderType: "", // 订单状态
        startTime: "", // 开始时间
        endTime: "" // 结束时间
    })
    createTime.value = ""
    options_series.value = []
    getList()
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
    dialogTypeValue.value = "常备库存选配"
    const dialogType = "workflow"
    dialogVisible[dialogType] = true
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
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
        prop: "orderNo",
        label: "订单号-行号",
        slot: "orderNo",
        headerAlign: "center",
        width: "180",
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
        width: "210",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "exampleBomStatus",
        label: "实例BOM状态",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "exampleBomStatus"
    },
    {
        prop: "num",
        label: "数量",
        headerAlign: "center",
        width: "90",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "productOrganization",
        label: "生产组织",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "productOrganization"
    },
    // {
    //     prop: "orderType",
    //     label: "订单类型",
    //     headerAlign: "center",
    //     width: "120",
    //     sortable: true,
    //     // showOverflowTooltip: true,
    //     show: true,
    //     slot: "orderType"
    // },
    {
        prop: "saleOrderType",
        label: "订单状态",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "saleOrderType"
    },
    {
        prop: "produceOrderType",
        label: "生产订单状态",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "produceOrderType"
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
        prop: "agent",
        label: "代理商名称",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "receiveAddress",
        label: "收货地址",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "oaFlowld",
        label: "OA流水单号",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "marketRemark",
        label: "销售备注",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "remark",
        label: "技术备注",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createdName",
        label: "创建人",
        headerAlign: "center",
        width: "90",
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
    },
    {
        prop: "updatedAt",
        label: "更新时间",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    }
    // {
    //     prop: "action",
    //     label: "操作",
    //     slot: "action",
    //     headerAlign: "center",
    //     width: "211",
    //     fixed: "right",
    //     show: true
    // }
])
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    if (!row) return
    setCurrent(row)
    // PtTableRef.value!.toggleRowSelection(row)
}
const handleSelectionChange = (val: StandingStockOrderListDataInterface[]) => {
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

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
//#endregion

//#region 订单详情、修改配置、查看配置、查看BOM、添加备注
const commonDialogHandler = (row: StandingStockOrderListDataInterface, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}
// 查看订单详情
const handleViewOrderDetail = (row: StandingStockOrderListDataInterface) => {
    console.log("订单详情: ", row)
    commonDialogHandler(row, "订单详情", "orderDetail")
}
// 处理修改配置按钮
const handleUpdateConfigBtn = (row: StandingStockOrderListDataInterface) => {
    console.log("处理修改配置按钮: ", row)
    updateConfigType.value = "edit"
    commonDialogHandler(row, "修改配置", "updateConfig")
}

// 处理查看配置按钮
const handleCheckConfigBtn = (row: StandingStockOrderListDataInterface) => {
    console.log("处理查看配置按钮: ", row)
    commonDialogHandler(row, "查看配置", "checkConfig")
}

// 处理查看BOM按钮
const handlePreviewBomBtn = (row: any) => {
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
    console.log("处理查看BOM按钮: ", row)
    ElMessage.info("跳转到实例BOM的物料详情页")
    //commonDialogHandler(row, "预览BOM", "previewBom")
}

// 处理添加备注按钮
const handleAddRemarksBtn = (row: StandingStockOrderListDataInterface) => {
    console.log("处理添加备注按钮: ", row)
    commonDialogHandler(row, "添加备注", "addRemarks")
}

// 处理查看审批记录按钮
const handleViewApprovalRecordsBtn = (row: StandingStockOrderListDataInterface) => {
    console.log("处理查看审批记录按钮: ", row)
    commonDialogHandler(row, "审批历史记录", "approvalRecord")
}

const handleDeleteBtn = () => {
    ElMessageBox.confirm("是否确认删除所勾选的数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            for (let index = 0; index < multipleSelection.value.length; index++) {
                const element = multipleSelection.value[index]
                if (element.planStatus !== 1) {
                    ElMessage({
                        type: "warning",
                        message: "当前选中的数据中有方案状态不处于编制中状态，请检查勾选数据！",
                        center: true,
                        duration: 5000
                    })
                    return
                }
            }
            const oids = multipleSelection.value.map((item) => item.oidStr).join()
            deleteBatchHandler(oids)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消删除操作！",
                center: true
            })
        })
}

const deleteBatchHandler = async (oids: string) => {
    try {
        loading.value = true
        const params = {
            oidsStr: oids
        }
        await deleteByOids(params)
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

//#endregion

//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogTypeValue = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    updateConfig: false, // 修改配置对话框
    checkConfig: false, // 查看配置对话框
    previewBom: false, // 预览BOM对话框
    addRemarks: false, // 添加备注对话框
    orderDetail: false, // 订单详情对话框
    workflow: false, // 提交流程对话框
    approvalRecord: false, // 查看审批记录对话框
    changeExport: false // 订单导出弹窗
})

const currentRowData = ref({
    oidStr: "", // 详情oid
    orderOidStr: "", // 订单oid
    orderNo: "", // 订单编号
    orderName: "" // 订单名称
}) // 当前行数据
//#endregion

//#region 设置全屏
const fullscreen = ref(false)
const changeFullScreen = (type: boolean) => {
    console.log("changeFullScreen", type)
    fullscreen.value = type
}
//#endregion

// #region 关闭弹窗
// 关闭订单详情
const handleConfirmSuccess_orderDetail = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // getList()
    // resetDialog()
}
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

// 关闭添加备注
const handleConfirmSuccess_addRemarks = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
    // resetDialog()
}

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
        let pageName = ""
        switch (props.orderType) {
            case "1":
                pageName = "常备库存"
                break
            case "2":
                pageName = "常规订单"
                break
            case "3":
                pageName = "特殊订单"
                break
            case "4":
                pageName = "在库订单"
                break
            case "5":
                pageName = "预计划"
                break

            default:
                pageName = "订单管理"
                break
        }
        const filename = `${pageName}-${formatDateTime(new Date(), "YYYY-MM-DD")}`
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

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

//#region 选择系列 - 弹窗
const chooseSeriesDialog = reactive<any>({
    visible: false,
    title: "选择系列"
})
const goChoose_series = () => {
    chooseSeriesDialog.visible = true
}
// 选择系列回调
const handleEditSuccess_series = (row: any) => {
    console.log("handleEditSuccess_series", row)
    chooseSeriesDialog.visible = false
    handleCreateBtn({
        ...row,
        partOid: row.PartOid,
        partNumber: row.Number,
        partName: row.Name
    })
}
//#endregion

//#region 字典数据
const options_status = ref<any[]>([]) // 订单状态
const options_plan = ref<any[]>([]) // 方案状态
const options_processStatus = ref<any[]>([]) // 订单状态
const options_productGroup = ref<any[]>([]) // 生产组织下拉
const options_exampleBomStatus = ref<any[]>([]) // 实例BOM状态
const options_produceOrderType = ref<any[]>([]) // 生产订单状态
const options_orderType = ref<any[]>([]) // 订单类型
getDictionarySelect({
    codes: "SALE_ORDER_TYPE,PLAN_STATUS,PROCESS_STATUS,PRODUCTION_ORGANIZATION,EXAMPLE_BOM_STATUS,PRODUCE_ORDER_TYPE,ORDER_TYPE"
}).then((data) => {
    options_status.value = data.data.SALE_ORDER_TYPE || []
    options_plan.value = data.data.PLAN_STATUS || []
    options_processStatus.value = data.data.PROCESS_STATUS || []
    options_productGroup.value = data.data.PRODUCTION_ORGANIZATION || []
    options_exampleBomStatus.value = data.data.EXAMPLE_BOM_STATUS || []
    options_produceOrderType.value = data.data.PRODUCE_ORDER_TYPE || []
    options_orderType.value = data.data.ORDER_TYPE || []
})
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
