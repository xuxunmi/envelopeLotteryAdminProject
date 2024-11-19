<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading">
            <div class="search-container">
                <el-form ref="formRef" :model="searchForm" :rules="rules" size="small" label-width="70" inline>
                    <el-form-item label="产品分类" prop="productLine">
                        <el-select
                            :loading="loading_select"
                            v-model="searchForm.productLine"
                            filterable
                            clearable
                            @change="getList"
                        >
                            <el-option
                                v-for="item in option_productLine"
                                :key="item.code"
                                :label="item.codeListNameC"
                                :value="item.code"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="颜色分组" prop="colorGroupCode">
                        <el-select
                            :loading="loading_select"
                            v-model="searchForm.colorGroupCode"
                            filterable
                            clearable
                            @change="getList"
                        >
                            <el-option
                                v-for="item in colorGroupList"
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
                    <el-form-item label="默认值">
                        <el-select v-model="searchForm.defaultProductLineChild" filterable clearable @change="getList">
                            <el-option
                                v-for="item in childLineList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
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
                            @selection-change="handleSelectionChange"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @sort-change="handleSortChange"
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <span class="table-edit">
                                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                                    <el-button type="primary" size="small" @click="handleAddBtn">新增</el-button>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow || !(multipleSelection.length === 1)"
                                        @click="handleEditBtn(chooseRow)"
                                        >设置默认值</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleDeleteBtn(multipleSelection)"
                                        :disabled="!multipleSelection.length"
                                        >删除</el-button
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
                            <template #col-colorGroupCode="{ row }">
                                <span
                                    v-text="
                                        getNameById(colorGroupList, row.colorGroupCode, {
                                            value: 'code',
                                            label: 'codeListNameC'
                                        })
                                    "
                                />
                            </template>
                            <template #col-color="{ row }">
                                <div :style="{ width: '100%', height: '32px', backgroundColor: row.colorCode }" />
                            </template>
                            <template #col-action="{ row }">
                                <!-- <el-button type="primary" size="small" link @click="handleDeleteBtn([row])"
                                    >移除</el-button
                                > -->
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>

            <!-- 添加颜色弹窗 -->
            <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.material" :footer="false" width="40%">
                <AddColorDialog
                    v-if="dialogVisible.material"
                    v-model:visible="dialogVisible.material"
                    :searchForm="searchForm"
                    @confirm-success="handleConfirmSuccess_material"
                />
            </dialogFrame>
            <!-- 编辑颜色分组弹窗 -->
            <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.colorGroup" :footer="false" width="40%">
                <EditColorGroupDialog
                    v-if="dialogVisible.colorGroup"
                    v-model:visible="dialogVisible.colorGroup"
                    :currentRow="currentRow"
                    :childLineList="childLineList"
                    @confirm-success="handleConfirmSuccess_colorGroup"
                />
            </dialogFrame>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import AddColorDialog from "@/views/colorManage/colorGroup/components/addColorDialog.vue"
import EditColorGroupDialog from "@/views/colorManage/colorGroup/components/editColorGroupDialog.vue"
// import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { usePagination } from "@/hooks/usePagination"
// import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { MaterialListInterface, MaterialInterface } from "@/interface/materiel"
import { filterArray } from "@/utils/index"
import { colorGroupPage, deleteColorGroupOids, editColorGroup } from "@/api/colorManage/colorGroup"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "colorGroup"
})

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 头部搜索
const formRef = ref<FormInstance>()
const searchForm = reactive({
    productLine: "", // 产品分类
    colorGroupCode: "", // 颜色分组
    code: "", // 编码
    name: "", // 名称
    defaultProductLineChild: "", // 默认值
    colorCode: "" // RAL色号
})
const rules = reactive<FormRules>({
    // productLine: [{ required: true, message: '请选择产品分类！', trigger: "change" }],
    // colorGroupCode: [{ required: true, message: '请选择颜色分组！', trigger: "change" }],
})
//#endregion

//#region 下拉数据
const loading_select = ref(false)
const colorGroupList = ref<any[]>([])
const option_productLine = ref<any[]>([]) // 产品分类
const option_childLine = ref<any[]>([]) // 产品子类
const getSelectData = async () => {
    try {
        loading.value = true
        loading_select.value = true
        const { data } = (await getDictionarySelect({ codes: "COLOR_GROUP,PRODUCT_LINE,PRODUCT_LINE_CHILD" })) as {
            data: any
        }
        colorGroupList.value = data.COLOR_GROUP || []
        option_productLine.value = data.PRODUCT_LINE || []
        option_childLine.value = data.PRODUCT_LINE_CHILD || []

        // 默认选择颜色分组第一个数据
        if (colorGroupList.value.length) {
            // searchForm.colorGroupCode = colorGroupList.value[0].code
            getList()
        }
    } catch (error: any) {
        console.log(error)
    } finally {
        loading.value = false
        loading_select.value = false
    }
}
getSelectData()
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<MaterialListInterface[]>([])
const sortParams = reactive({
    sortField: "", //排序字段 为空则默认创建时间
    sortWay: "" //排序方式 为空则默认倒序(desc、asc)
})

//#region 增、删、改、查
// 获取流程列表
const getList = () => {
    formRef.value?.validate((valid) => {
        if (valid) {
            loading.value = true
            const params = {
                ...searchForm,
                ...sortParams,
                pageNo: pageData.currentPage,
                pageSize: pageData.pageSize
            }
            multipleSelection.value = []
            chooseRow.value = null
            colorGroupPage(params)
                .then((data) => {
                    tableData.value = (data.data.list || []).map((ele: any) => {
                        return {
                            ...ele,
                            defaultProductLineChildCode: ele.defaultProductLineChild
                                ? ele.defaultProductLineChild.split(",")
                                : ""
                        }
                    })
                    pageData.total = data.data.total || 0
                })
                .catch((err) => {
                    console.log(err)
                })
                .finally(() => (loading.value = false))
        }
    })
}
const handleAddBtn = () => {
    dialogTitle.value = "添加颜色"
    const dialogType = "material"
    dialogVisible[dialogType] = true
}
// 移除
const handleDeleteBtn = (rows: any[]) => {
    if (!rows.length) {
        ElMessage.error("请选择一条数据！")
        return false
    }
    const oids = rows.map((item) => item.colorGroupOidStr)
    ElMessageBox.confirm("是否确认删除选择数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(async () => {
        const params = {
            groupOidsStr: oids.join(",")
        }
        loading.value = true
        deleteColorGroupOids(params)
            .then((data) => {
                ElMessage.success("移除成功！")
                getList()
            })
            .finally(() => (loading.value = false))
    })
}
// 编辑
const currentRow = ref()
const handleEditBtn = (row: any) => {
    console.log("handleEditBtn", row)
    currentRow.value = row
    dialogTitle.value = "编辑颜色分组"
    const dialogType = "colorGroup"
    dialogVisible[dialogType] = true
}
// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        productLine: "", // 产品分类
        colorGroupCode: "", // 颜色分组
        code: "", // 编码
        name: "", // 名称
        defaultProductLineChild: "", // 默认值
        colorCode: "" // RAL色号
    })
    getList()
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    if (!row) return
    chooseRow.value = row
    setCurrent(row)
    // PtTableRef.value!.toggleRowSelection(row)
}
const handleSelectionChange = (val: any[]) => {
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
const childLineList = computed(() =>
    option_childLine.value.map((item) => {
        return {
            value: item.code,
            label: item.codeListNameC
        }
    })
)
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
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
        prop: "productLine",
        label: "产品分类",
        headerAlign: "center",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true,
        slot: "productLine"
    },
    {
        prop: "colorGroupCode",
        label: "颜色分组",
        headerAlign: "center",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true,
        slot: "colorGroupCode"
    },
    {
        prop: "code",
        label: "编码",
        headerAlign: "center",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "name",
        label: "名称",
        headerAlign: "center",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "defaultProductLineChildName",
        label: "默认值",
        headerAlign: "center",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true,
        colEdit: {
            show: false,
            type: "select",
            options: childLineList,
            editProp: "defaultProductLineChildCode",
            controlPropConfig: {
                loading: loading_select,
                multiple: true
            },
            afterEditInline: (options: any) => {
                console.log("afterEditInline", options)
                if (options.oldValue === options.row.defaultProductLineChildCode) return false
                let defaultProductLineChild = ""
                if (options.row.defaultProductLineChildCode?.length) {
                    defaultProductLineChild = options.row.defaultProductLineChildCode.join(",")
                }
                const params = {
                    oidStr: options.row.colorGroupOidStr,
                    defaultProductLineChild
                }
                loading.value = true
                editColorGroup(params)
                    .then((data) => {
                        ElMessage.success("修改成功！")
                        getList()
                    })
                    .finally(() => (loading.value = false))
            }
        }
    },
    {
        prop: "colorCode",
        label: "RAL色号",
        headerAlign: "center",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true
    }
    // {
    //     prop: "color",
    //     label: "颜色",
    //     slot: "color",
    //     headerAlign: "center",
    //     showOverflowTooltip: true,
    //     show: true
    // },
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

const handleSortChang = (data: { column: any; prop: string; order: any }) => {
    console.log(data)
    if (data.order === "ascending") {
        Object.assign(searchForm, {
            ...searchForm,
            orderParam: data.prop,
            orderType: "asc"
        })
    } else {
        Object.assign(searchForm, {
            ...searchForm,
            orderParam: data.prop,
            orderType: "desc"
        })
    }
    getList()
}
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    material: false, // 添加物料对话框
    colorGroup: false // 编辑颜色分组对话框
})

// const currentRowData = ref({
//     oid: ""
// }) // 当前行数据
//#endregion

// #region 关闭弹窗
// 关闭添加物料弹窗
const handleConfirmSuccess_material = (rows: MaterialInterface[]) => {
    console.log("rows: ", rows)
    dialogVisible.material = false
    getList()
}
// 关闭添加物料弹窗
const handleConfirmSuccess_colorGroup = (rows: MaterialInterface[]) => {
    console.log("rows: ", rows)
    dialogVisible.colorGroup = false
    getList()
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList)
//#endregion
</script>

<style lang="scss" scoped>
.sf-container3 {
    .search-container {
        .el-form-item {
            margin-bottom: 15px;
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
