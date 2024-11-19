<template>
    <div class="app-container">
        <div v-loading="loading" class="sf-container3">
            <div class="search-container">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="80">
                    <el-form-item label="系列车型">
                        <el-select :loading="loading_series" v-model="searchForm.partNum" filterable clearable>
                            <el-option
                                v-for="item in seriesModelsList"
                                :key="item.Number"
                                :label="item.Name"
                                :value="item.Number"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="品名">
                        <el-input
                            v-model="searchForm.productName"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="实例编码">
                        <el-input
                            v-model="searchForm.instanceCode"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
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
                            border
                            highlight-current-row
                            size="small"
                            :row-class-name="tableRowClassName"
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
                                    <!-- <el-button type="primary" size="small" @click="goEdit_rule">规则设置</el-button> -->
                                    <el-button type="primary" size="small" @click="goChoose_plan">查找添加</el-button>
                                    <el-button type="primary" size="small" @click="goChoose_series">新建</el-button>
                                    <el-button type="primary" size="small" @click="handleOneClickPublishingBtn"
                                        >提交实例化</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="goDelOrEnable(multipleSelection, 1)"
                                        :disabled="!multipleSelection.length"
                                        >启用</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="goDelOrEnable(multipleSelection, 0)"
                                        :disabled="!multipleSelection.length"
                                        >禁用</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="goDelOrEnable(multipleSelection, -1)"
                                        :disabled="!multipleSelection.length"
                                        >移除</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                                        @click="handleCheckConfigBtn"
                                        >查看配置</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                                        @click="handlePreviewBomBtn"
                                        >查看实例BOM</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-status="{ row }">
                                <span v-if="row.status === 0">禁用</span>
                                <span v-else-if="row.status === 1">启用</span>
                            </template>
                            <template #col-action="{ row }">
                                <el-button type="primary" size="small" link @click="goEdit(row)">编辑</el-button>
                                <el-button type="primary" size="small" link @click="goDelOrEnable([row], -1)"
                                    >移除</el-button
                                >
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>

            <!-- 选择系列 - 弹窗 -->
            <ChooseSeriesDialog
                v-if="chooseSeriesDialog.visible"
                :dialog="chooseSeriesDialog"
                @handleEditSuccess="handleEditSuccess_series"
            />
            <!-- 查找添加 - 弹窗 -->
            <InsertPlanningDialog
                v-if="insertPlanningDialog.visible"
                :dialog="insertPlanningDialog"
                from="general"
                @handleEditSuccess="handleEditSuccess_insert"
            />
            <!-- 规则 - 编辑弹窗 -->
            <EditRuleDialog
                v-if="editRuleDialog.visible"
                :dialog="editRuleDialog"
                @handleEditSuccess="handleEditSuccess_rule"
            />
            <!-- 修改配置弹窗 -->
            <dialogFrame
                :title="updateConfigDialog.title"
                v-model:visible="updateConfigDialog.visible"
                :footer="false"
                width="90%"
                :fullscreen="fullscreen"
            >
                <UpdateConfigDialog
                    v-if="updateConfigDialog.visible"
                    v-model:visible="updateConfigDialog.visible"
                    :currentRowData="updateConfigDialog.row"
                    :type="updateConfigDialog.type"
                    :fullscreen="fullscreen"
                    :orderType="updateConfigDialog.orderType"
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
                <PreviewBomDialog
                    v-if="dialogVisible.previewBom"
                    v-model:visible="dialogVisible.previewBom"
                    :objectRow="currentRowData"
                    @confirm-success="handleConfirmSuccess_previewBom"
                />
            </dialogFrame>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import UpdateConfigDialog from "../components/updateConfigDialog.vue"
import ChooseSeriesDialog from "@/views/orderManage/prePlanningOrder/components/chooseSeriesDialog.vue"
import InsertPlanningDialog from "@/views/orderManage/prePlanningOrder/components/insertPlanningDialog.vue"
import EditRuleDialog from "./components/editRuleDialog.vue"
import CheckConfigDialog from "@/views/orderManage/components/checkConfigDialog.vue"
import PreviewBomDialog from "@/views/configureManage/applicationConfiguration/components/previewBomDialog.vue"
import { generalMangerPage, generalMangerDelete, insertGenerals } from "@/api/orderManage/generalProductLibrary"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "generalProductLibrary"
})

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 头部搜索
const searchForm = reactive({
    partNum: "", // 系列车型
    productName: "", // 品名
    instanceCode: "" // 实例编码
})
const loading_series = ref(false)
// 系列车型下拉列表
const seriesModelsList = ref<any[]>([])
const getSelect = () => {
    loading_series.value = true
    productList()
        .then((data) => {
            console.log(data)
            if (data.data[0]) {
                const ProductName = data.data[0].name
                getProductTopBom({ ProductName })
                    .then((data) => {
                        console.log("getProductTopBom", data)
                        seriesModelsList.value = data.data || []
                    })
                    .finally(() => (loading_series.value = false))
            }
        })
        .catch(() => (loading_series.value = false))
}
getSelect()
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])

//#region 增、删、改、查
// 获取列表
const getList = () => {
    console.log("getList", pageData)
    chooseRow.value = null
    multipleSelection.value = []
    const params = {
        ...searchForm,
        pageNo: pageData.currentPage,
        pageSize: pageData.pageSize
    }
    loading.value = true
    generalMangerPage(params)
        .then((data) => {
            tableData.value = data.data.list
            pageData.total = data.data.total
        })
        .finally(() => (loading.value = false))
}
const goAdd = (rows: any[]) => {
    const params = rows.map((item) => {
        return {
            oid: item.oid,
            oidStr: item.oidStr,
            partOid: item.partOid,
            partNum: item.partNum,
            partName: item.partName,
            productName: item.productName,
            schemeCode: item.schemeCode,
            schemeOid: item.schemeOid,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            updatedBy: item.updatedBy,
            updatedAt: item.updatedAt,
            status: item.status,
            statisticsCount: item.statisticsCount,
            referenceCount: item.referenceCount,
            instanceCode: item.exampleBom, // 实例编码
            //instanceOid: item.materialOid, // 实例oid--物料oid
            schemeInfo: item.schemeInfoDB
        }
    })
    loading.value = true
    insertGenerals(params)
        .then((data) => {
            console.log("insertGenerals", data)
            ElMessage.success("插入成功！")
            getList()
        })
        .finally(() => (loading.value = false))
}
const goEdit = (row: any) => {}
// 删除/禁用/启用
// status：删除-1 禁用0 启用1
const goDelOrEnable = (rows: any[], status: -1 | 0 | 1) => {
    if (!rows.length) {
        ElMessage.error("请选择一条数据！")
        return false
    }
    let msg
    switch (status) {
        case -1:
            msg = "是否确认移除选择数据？"
            break
        case 0:
            msg = "是否确认禁用选择数据？"
            break
        case 1:
            msg = "是否确认启用选择数据？"
            break
    }
    ElMessageBox.confirm(msg, t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        const params = {
            oidsStr: rows.map((item) => item.oidStr).join(","),
            status
        }
        loading.value = true
        generalMangerDelete(params)
            .then((data) => {
                switch (status) {
                    case -1:
                        ElMessage.success("移除成功")
                        break
                    case 0:
                        ElMessage.success("禁用成功")
                        break
                    case 1:
                        ElMessage.success("启用成功")
                        break
                }
                getList()
            })
            .finally(() => (loading.value = false))
    })
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
//#region 查看配置、查看BOM
const dialogTitle = ref<string>("") // 弹窗标题
const dialogTypeValue = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    checkConfig: false, // 查看配置对话框
    previewBom: false // 预览BOM对话框
})
const currentRowData = ref({
    oidStr: "", // 详情oid
    orderOidStr: "", // 订单oid
    orderNo: "", // 订单编号
    orderName: "" // 订单名称
}) // 当前行数据

const commonDialogHandler = (row: any, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}

// 处理查看配置按钮
const handleCheckConfigBtn = () => {
    const row = multipleSelection.value[0]
    commonDialogHandler(row, "查看配置", "checkConfig")
}

// 处理查看BOM按钮
const handlePreviewBomBtn = () => {
    const row = multipleSelection.value[0]
    ElMessage.info("跳转到实例BOM的物料详情页")
    //commonDialogHandler(row, "预览BOM", "previewBom")
}
//#endregion

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        partNum: "", // 系列车型
        productName: "", // 品名
        instanceCode: "" // 实例编码
    })
    getList()
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
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
        prop: "partNum",
        label: "系列编码",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partName",
        label: "系列名称",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "productName",
        label: "品名",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "schemeCode",
        label: "方案编码",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "instanceCode",
        label: "实例编码",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "statisticsCount",
        label: "统计次数",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "referenceCount",
        label: "引用次数",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "status",
        label: "状态",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        slot: "status",
        show: true
    }
    // {
    //     prop: "action",
    //     label: "操作",
    //     align: "center",
    //     width: "100",
    //     fixed: "right",
    //     show: true,
    //     slot: "action",
    // }
])
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    setCurrent(row)
}
const handleSelectionChange = (val: any[]) => {
    console.log("handleSelectionChange", val)
    multipleSelection.value = val
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

//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

//#region 规则 - 编辑弹窗
const editRuleDialog = reactive<any>({
    visible: false,
    title: ""
})
// 编辑规则
const goEdit_rule = () => {
    console.log("goEdit_group")
    Object.assign(editRuleDialog, {
        visible: true,
        title: "规则设置"
    })
}
// 规则编辑成功回调
const handleEditSuccess_rule = () => {
    console.log("handleEditSuccess_group")
    getList()
    Object.assign(editRuleDialog, {
        visible: false,
        title: ""
    })
}

// 关闭查看配置
const handleConfirmSuccess_checkConfig = (dialogType: string) => {
    dialogVisible[dialogType] = false
}

// 关闭查看BOM
const handleConfirmSuccess_previewBom = (dialogType: string) => {
    dialogVisible[dialogType] = false
}
//#endregion

//#region 查找添加 - 弹窗
const insertPlanningDialog = reactive<any>({
    visible: false,
    title: "查找添加"
})
const goChoose_plan = () => {
    insertPlanningDialog.visible = true
}
// 添加物料回调
const handleEditSuccess_insert = (rows: any[]) => {
    console.log("handleEditSuccess_insert", rows)
    goAdd(rows)
    insertPlanningDialog.visible = false
}
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
    goAdd_updateConfig({
        ...row,
        partOid: row.PartOid,
        partNumber: row.Number,
        partName: row.Name
    })
}
//#endregion

//#region 修改配置 - 弹窗
const updateConfigDialog = reactive<any>({
    visible: false,
    title: "新建通用产品",
    type: "add",
    orderType: "6",
    row: null
})
const goAdd_updateConfig = (row: any) => {
    Object.assign(updateConfigDialog, {
        visible: true,
        row
    })
}
// 修改配置回调
const handleConfirmSuccess_updateConfig = (row: any) => {
    console.log("handleConfirmSuccess_updateConfig", row)
    getList()
    Object.assign(updateConfigDialog, {
        visible: false,
        row: null
    })
}
//#endregion

//#region 设置全屏
const fullscreen = ref(false)
const changeFullScreen = (type: boolean) => {
    console.log("changeFullScreen", type)
    fullscreen.value = type
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
