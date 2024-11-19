<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading">
            <div class="search-container">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="80">
                    <el-form-item label="系列组织">
                        <el-select v-model="searchForm.groupName" @change="handleSelectChange_group" clearable>
                            <el-option
                                v-for="item in options_group"
                                :key="item.id"
                                :label="item.name"
                                :value="item.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="系列名称">
                        <el-select v-model="searchForm.seriesName" filterable clearable @change="getList">
                            <el-option
                                v-for="item in options_series"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="通知分类">
                        <el-select v-model="searchForm.noticeClassification" clearable @change="getList">
                            <el-option
                                v-for="item in noticeClassificationList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-date-picker
                            v-model="searchForm.createTime"
                            type="datetimerange"
                            range-separator="~"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            clearable
                            @change="getList"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleQueryBtn">查询</el-button>
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
                            @row-click="handleRowClick"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @selection-change="handleSelectionChange"
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <span class="table-edit">
                                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                                    <el-button type="primary" size="small" @click="handleBatchDeleteBtn" :disabled="!multipleSelection.length"
                                        >删除</el-button
                                    >
                                    <el-button type="primary" size="small" :disabled="!chooseRow" @click="handleViewDetailBtn(chooseRow)"
                                        >查看详情</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-action="{ row }">
                                <el-button type="primary" size="small" link @click="handleDeleteBtn(row)"
                                    >删除</el-button
                                >
                                <el-button type="primary" size="small" link @click="handleViewDetailBtn(row)"
                                    >查看详情</el-button
                                >
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>

            <!-- 详情弹窗 -->
            <dialogFrame
                :title="dialogTitle"
                v-model:visible="dialogVisible.initiateChangeNotice"
                :footer="false"
                width="40%"
            >
                <InitiateChangeNoticeDialog
                    v-if="dialogVisible.initiateChangeNotice"
                    v-model:visible="dialogVisible.initiateChangeNotice"
                    :isCanEdit="false"
                    :currentRowData="currentRowData"
                    @confirm-success="handleConfirmSuccess_initiateChangeNotice"
                />
            </dialogFrame>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import InitiateChangeNoticeDialog from "@/components/InitiateChangeNoticeDialog/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { noticeClassificationList } from "@/assets/common/select-list"
import { ChangeNoticeInterface } from "@/interface/changeNotice"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { getChangeNoticeList, changeNoticeDelete } from "@/api/changeManage/initiateChangeNotice"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

defineOptions({
    name: "initiateChangeNotice"
})

const { t, locale } = useI18n()
const route = useRoute()
const loading = ref(false)

//#region 头部搜索
const options_group = ref<SelectInterface[]>([]) // 组织名称列表
const options_series = ref<SelectInterface[]>([]) // 系列名称列表
const searchForm = reactive({
    groupName: "", // 组织名称
    seriesName: "", // 系列名称
    noticeClassification: "", // 通知分类
    createTime: "" // 创建时间
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
            data.map((item: { PartOid: string; Name: string }) => {
                return {
                    id: item.PartOid,
                    name: item.Name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    }
}

// 处理选择组织名称
const handleSelectChange_group = (val: string) => {
    searchForm.seriesName = ""
    options_series.value = []
    if (!val) return
    getOptionsSeriesList(val)
}
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<ChangeNoticeInterface[]>([])
const multipleSelection = ref<ChangeNoticeInterface[]>([])
const chooseRow = ref()

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    chooseRow.value = row
}
const handleSelectionChange = (val: ChangeNoticeInterface[]) => {
    multipleSelection.value = val
    // console.log("multipleSelection.value: ", multipleSelection.value)
}
// 事件
const setCurrent = (row?: any) => {
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
    },
    {
        type: 'index',
        label: "序号",
        width: '55',
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
        prop: "seriesName",
        label: "系列名称",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "noticeClassification",
        label: "通知分类",
        headerAlign: "center",
        width: "140",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "noticeTitle",
        label: "标题",
        headerAlign: "center",
        width: "240",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "noticeContent",
        label: "内容",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createTime",
        label: "创建时间",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    // {
    //     prop: "action",
    //     label: "操作",
    //     slot: "action",
    //     headerAlign: "center",
    //     width: "160",
    //     fixed: "right",
    //     show: true
    // }
])

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

// 获取我发起的列表
const getList = async () => {
    try {
        loading.value = true
        let startTime: string | undefined, endTime: string | undefined
        if (searchForm.createTime) {
            startTime = searchForm.createTime[0]
            endTime = searchForm.createTime[1]
        }
        const params = {
            seriesName: searchForm.seriesName,
            noticeType: searchForm.noticeClassification,
            start: startTime,
            end: endTime,
            type: 1, //  写死： 我发起的传1，发给我的传2
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        chooseRow.value = null
        multipleSelection.value = []
        const { data } = await getChangeNoticeList(params)
        tableData.value = data.list.map((item: any) => {
            return {
                oid: item.oidStr,
                seriesName: item.seriesName,
                noticeClassification: item.noticeType,
                noticeTitle: item.title,
                noticeContent: item.info,
                status: item.status,
                createTime: item.createdAt,
                createdBy: item.createdBy,
                updatedAt: item.updatedAt,
                updatedBy: item.updatedBy
            }
        })
        pageData.total = data.total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

//#region 查询，删除，查看详情
// 查询
const handleQueryBtn = () => {
    if (!searchForm.groupName) {
        ElMessage({
            type: "warning",
            message: "请先选择系列组织!",
            center: true
        })
        return
    }
    getList()
}
// 删除按钮
const handleBatchDeleteBtn = () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: t("personChangePage.selectedDataMsg"),
            center: true
        })
        return
    }
    ElMessageBox.confirm("确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            const oids = multipleSelection.value.map((item) => item.oid).join()
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
const handleDeleteBtn = (row: ChangeNoticeInterface) => {
    ElMessageBox.confirm(t("personChangePage.confirmDeleteMsg"), t("personChangePage.prompt"), {
        confirmButtonText: t("personChangePage.confirm"),
        cancelButtonText: t("personChangePage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            const oids = row.oid
            deleteBatchHandler(oids)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t("personChangePage.cancelDelMsg"),
                center: true
            })
        })
}

const deleteBatchHandler = async (oids: string) => {
    try {
        const params = {
            oidsStr: oids
        }
        await changeNoticeDelete(params)
        ElMessage({
            type: "success",
            message: "删除成功",
            center: true
        })
        getList()
    } catch (err: any) {
        console.log(err)
    }
}

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        groupName: "", // 组织名称
        seriesName: "", // 系列名称
        noticeClassification: "", // 通知分类
        createTime: "" // 创建时间
    })
    getList()
}

const commonDialogHandler = (row: ChangeNoticeInterface, title: string, dialogType: string) => {
    currentRowData.value = row
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}
// 查看详情
const handleViewDetailBtn = (row: ChangeNoticeInterface) => {
    commonDialogHandler(row, "变更通知详情", "initiateChangeNotice")
}
//#endregion
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    initiateChangeNotice: false // 发起变更通知对话框
})

const currentRowData = ref({
    oid: ""
}) // 当前行数据
//#endregion

// #region 关闭弹窗
// 关闭订单详情
const handleConfirmSuccess_initiateChangeNotice = (dialogType: string) => {
    dialogVisible[dialogType] = false
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

watch(
    () => route.query.t,
    () => {
        getList()
    },
    {
        deep: true
    }
)
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
