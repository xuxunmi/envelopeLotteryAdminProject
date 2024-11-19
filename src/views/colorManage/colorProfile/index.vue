<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading">
            <div class="search-container">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small" label-width="80">
                    <el-form-item label="产品分类">
                        <el-select
                            :loading="loading_select"
                            v-model="searchForm.productLine"
                            filterable
                            clearable
                            @change="getList"
                            style="width: 180px"
                        >
                            <el-option
                                v-for="item in option_productLine"
                                :key="item.code"
                                :label="item.codeListNameC"
                                :value="item.code"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="编码">
                        <el-input v-model="searchForm.code" placeholder="请输入" clearable @keyup.enter="getList" />
                    </el-form-item>
                    <el-form-item label="名称">
                        <el-input v-model="searchForm.name" placeholder="请输入" clearable @keyup.enter="getList" />
                    </el-form-item>
                    <el-form-item label="RAL色号">
                        <el-input
                            v-model="searchForm.colorCode"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item>
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
                            @sort-change="handleSortChange"
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <span class="table-edit">
                                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                                    <el-button type="primary" size="small" @click="handleAddEditBtn('add', undefined)"
                                        >新增</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleAddEditBtn('edit', chooseRow)"
                                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                                        >编辑</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleDeleteBtn"
                                        :disabled="!multipleSelection.length"
                                        >删除</el-button
                                    >
                                    <el-button type="primary" size="small" @click="handleSyncBtn"
                                        >同步颜色档案</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-productLine="{ row }">
                                <span
                                    v-text="
                                        getNameById(option_productLine, row.productLine, {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-color="{ row }">
                                <div :style="{ width: '100%', height: '32px', backgroundColor: row.colorCode }" />
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>

            <!-- 新增/编辑颜色档案弹窗 -->
            <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addEdit" :footer="false" width="40%">
                <addEditProfileDialog
                    v-if="dialogVisible.addEdit"
                    v-model:visible="dialogVisible.addEdit"
                    :dialogType="dialogType"
                    :currentRowData="chooseRow"
                    @confirm-success="handleConfirmSuccess_addEdit"
                />
            </dialogFrame>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import addEditProfileDialog from "./components/addEditProfileDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { TableDataInterface } from "@/interface/colorManage/colorProfile"
import {
    getColorProfileList,
    colorProfileDelete,
    colorProfileSync,
    colorProjectSync
} from "@/api/colorManage/colorProfile"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "colorProfile"
})

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 头部搜索
const searchForm = reactive({
    productLine: "", // 产品分类
    code: "", // 编码
    name: "", // 名称
    colorCode: "" // RAL色号
})
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<TableDataInterface[]>([])
const chooseRow = ref() // 当前行数据
const multipleSelection = ref<TableDataInterface[]>([])
const sortParams = reactive({
    sortField: "", //排序字段 为空则默认创建时间
    sortWay: "" //排序方式 为空则默认倒序(desc、asc)
})

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    chooseRow.value = row
    const isSelected = multipleSelection.value.some((selectedRow) => selectedRow === row)
    // console.log(isSelected)
    if (isSelected) {
        PtTableRef.value!.toggleRowSelection(row, false)
    } else {
        PtTableRef.value!.toggleRowSelection(row, true)
    }
}
const handleSelectionChange = (val: any[]) => {
    console.log("handleSelectionChange", val)
    multipleSelection.value = val
}
const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (multipleSelection.value.some((selectedRow) => selectedRow === row)) {
        return "front-checked"
    }
    return "front-not-checked"
}
const handleSortChange = (data: { column: any; prop: string; order: any }) => {
    console.log("handleSortChange", data)
    sortParams.sortField = data.prop
    switch (data.order) {
        case "descending":
            sortParams.sortWay = "desc"
            break
        case "ascending":
            sortParams.sortWay = "asc"
            break

        default:
            sortParams.sortField = ""
            sortParams.sortWay = ""
            break
    }
    getList()
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
        prop: "productLine",
        label: "产品分类",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: "custom",
        slot: "productLine"
    },
    {
        prop: "code",
        label: "编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: "custom",
        show: true
    },
    {
        prop: "name",
        label: "名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: "custom",
        show: true
    },
    {
        prop: "colorCode",
        label: "RAL色号",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: "custom",
        show: true
    }
    // ,
    // {
    //     prop: "color",
    //     label: "颜色",
    //     slot: "color",
    //     headerAlign: "center",
    //     showOverflowTooltip: true,
    //     show: true
    // }
    // {
    //     prop: "action",
    //     label: "操作",
    //     slot: "action",
    //     headerAlign: "center",
    //     width: "90",
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

// 获取颜色档案列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            ...searchForm,
            ...sortParams,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        multipleSelection.value = []
        chooseRow.value = null
        const { data } = await getColorProfileList(params)
        tableData.value = (data.list || []).map((item: any) => {
            return {
                oid: item.oidStr,
                code: item.code,
                name: item.name,
                colorCode: item.colorCode,
                productLine: item.productLine
            }
        })
        pageData.total = data.total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}
//#endregion

//#region 新增、编辑、删除
const handleAddEditBtn = (type: string, row?: TableDataInterface) => {
    dialogType.value = type
    dialogTitle.value = type === "add" ? "新增颜色档案" : "编辑颜色档案"
    if (type === "edit" && row) {
        chooseRow.value = row
    }
    dialogVisible.addEdit = true
}

const handleSyncBtn = async () => {
    colorProfileSync({}).then((res: any) => {
        if (res.resultCode == 200) {
            loading.value = false
            ElMessage.success("同步到u9料品成功")
        } else {
            ElMessage.error("同步到u9料品失败：" + res.errorInfo)
        }
    })

    colorProjectSync({}).then((res: any) => {
        if (res.resultCode == 200) {
            loading.value = false
            ElMessage.success("同步到u9项目成功")
        } else {
            ElMessage.error("同步到u9项目：" + res.errorInfo)
        }
    })
}
const handleDeleteBtn = () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: "请先勾选数据！",
            center: true
        })
        return
    }
    ElMessageBox.confirm("是否确认删除勾选数据?", "提示", {
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

const deleteBatchHandler = async (oids: string) => {
    try {
        loading.value = true
        const params = {
            oidsStr: oids
        }
        await colorProfileDelete(params)
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        productLine: "",
        code: "",
        name: "",
        colorCode: ""
    })
    getList()
}
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("add") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    addEdit: false // 新增/编辑对话框
})
//#endregion

// #region 关闭弹窗
// 关闭新增编辑弹窗
const handleConfirmSuccess_addEdit = (dialogType: string) => {
    dialogVisible[dialogType] = false
    resetDialog()
    getList()
}
//#endregion

//#region 重置dialog值
const resetDialog = () => {
    dialogTitle.value = ""
    dialogType.value = ""
    chooseRow.value = null
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

//#region 字典数据
const loading_select = ref(false)
const option_productLine = ref<any[]>([]) // 产品分类
loading_select.value = true
getDictionarySelect({ codes: "PRODUCT_LINE" })
    .then((data) => {
        option_productLine.value = data.data.PRODUCT_LINE || []
    })
    .finally(() => (loading_select.value = false))
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
