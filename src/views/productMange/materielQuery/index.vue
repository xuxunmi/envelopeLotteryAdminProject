<template>
    <div class="app-container">
        <div v-loading="loading" :element-loading-text="elementLoadingText" class="sf-container">
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
                            row-key="oid"
                            border
                            stripe
                            highlight-current-row
                            size="small"
                            :row-class-name="tableRowClassName"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @selection-change="handleSelectionChange"
                            @row-click="handleRowClick"
                            @row-dblclick="handleRowDblclick"
                            @sort-change="handleSortChange"
                        >
                            <template #slot-edit>
                                <span class="table-edit fromWrapper">
                                    <el-button type="primary" size="small" @click="getList">{{
                                        t("dashboardPage.refresh")
                                    }}</el-button>
                                    <el-button type="primary" size="small" @click="handleCreateBtn('add')">{{
                                        $t("materielPage.create")
                                    }}</el-button>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleBrowseBtn()"
                                        :disabled="!(multipleSelection.length === 1)"
                                        >浏览</el-button
                                    >
                                    <el-button type="primary" size="small" @click="handleAddToBtn()">添加到</el-button>
                                    <el-button type="primary" size="small" @click="handleChangeOwnerBtn()"
                                        >变更所属者</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!(multipleSelection.length === 1)"
                                        @click="goBomHighEdit()"
                                        >BOM高级编辑</el-button
                                    >
                                    <!-- <el-button type="primary" size="small" @click="handleDeleteBtn">{{
                                        $t("materielPage.delete")
                                    }}</el-button> -->

                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleExportExcelBtn"
                                        :disabled="!tableData.length"
                                        >导出Excel</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-materialType="{ row }">
                                <div>{{ getNameById(materielTypeList, row.materialType) }}</div>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #head-search="{ column }">
                                <HeadFilter
                                    v-model="filterValue[column.property]"
                                    @search="search"
                                    :name="column.label"
                                />
                            </template>
                            <!-- 右键菜单 -->
                            <template #slot-menu="{ row }">
                                <li @click="getList">刷新</li>
                                <li @click="handleBrowseBtn(row)">浏览</li>
                                <li @click="handleAddToBtn(row)">添加到</li>
                                <li @click="handleChangeOwnerBtn(row)">变更所属者</li>
                                <li @click="goBomHighEdit(row)">BOM高级编辑</li>
                                <li @click="goDetail(row)">查看详情</li>
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增部件弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.part" :footer="false" width="90%">
            <creatPartDialog
                v-if="dialogVisible.part"
                v-model:visible="dialogVisible.part"
                :currentRowData="currentRowData"
                :parentNodeData="parentRowData"
                :dialogType="dialogType"
                @confirmSuccess="handleConfirmSuccess_part"
            />
        </dialogFrame>

        <!-- 添加到文件夹弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addToFolder" :footer="false" width="40%">
            <addToFolderDialog
                v-if="dialogVisible.addToFolder"
                v-model:visible="dialogVisible.addToFolder"
                :multipleTableSelection="multipleSelection"
                @confirm-success="handleConfirmSuccess_addToFolder"
            />
        </dialogFrame>

        <!-- 变更所属者 - 弹窗 -->
        <ChangeOwnerDialog
            v-if="changeOwnerDialog.visible"
            :dialog="changeOwnerDialog"
            @handleEditSuccess="handleEditSuccess_owner"
        />

        <!-- 物料导出弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.changeExport" :footer="false" width="40%">
            <changeExportDialog
                ref="changeExportDialogRef"
                v-if="dialogVisible.changeExport"
                v-model:visible="dialogVisible.changeExport"
                :multipleTableSelection="multipleSelection"
                :tableData="tableData"
                @confirm-success="handleConfirmSuccess_changeExport"
            />
        </dialogFrame>

        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.document" :footer="false" width="40%">
            <creatDocumentDialog
                v-if="dialogVisible.document"
                v-model:visible="dialogVisible.document"
                :currentRowData="currentRowData"
                :dialogType="dialogType"
                @confirm-success="handleWTDocumentConfirmSuccess"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import creatPartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import creatDocumentDialog from "@/views/bomManage/productLibrary/components/creatDocumentDialog.vue"
import addToFolderDialog from "@/views/productMange/materiel/components/addToFolderDialog.vue"
import ChangeOwnerDialog from "@/views/bomManage/components/changeOwnerDialog/index.vue"
import changeExportDialog from "./components/changeExportDialog.vue"
import { getNameById } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { folderMaterielAdd } from "@/api/productMange/materiel"
import {
    advancedSearchPart,
    quickQuerySearchPart,
    advancedSearchExportParts,
    advancedSearchExportAllParts,
    exportQuickAllAdvancedPart
} from "@/api/productMange/materielQuery"
import { usePagination } from "@/hooks/usePagination"
import { MaterialListInterface } from "@/interface/materiel"
import { filterArray, resetFilterValue, formatDateTime, goSort } from "@/utils"
import { useRouter, useRoute } from "vue-router"
import { downloadFile } from "@/utils/exportTemplate"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "materielQuery"
})

const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()
const query = ref<{
    queryParam: any
    tagTitle: string
}>(route.query as any)
/**
 * 搜索类型（fast：快速搜索；global：高级搜索）
 */
const searchType = (route.params as any).type
console.log("快速、高级查询路由参数query：", query.value, searchType)

const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    part: false, // 新增/编辑部件对话框
    material: false, // 添加物料对话框
    addToFolder: false, // 添加到文件夹话框
    query: false, // 高级查询对话框
    changeExport: false, // 物料导出弹窗
    document: false // 新增/编辑文档对话框
})

const currentRowData = ref<any>({
    oid: ""
}) // 当前行数据

const parentRowData = ref<any>({
    oid: ""
}) // 父级节点表格行数据
const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<MaterialListInterface[]>([])
const multipleSelection = ref<MaterialListInterface[]>([])
const sortParams = reactive({
    sortBy: "",
    sorted: "",
    sortType: ""
})
const chooseRow = ref()

//#region 增、删、改、查

//#region 获取列表
// 获取列表
const getList = () => {
    // console.log('getList', searchType);
    switch (searchType) {
        case "fast":
            getList_fast()
            break
        case "global":
            getList_global()
            break

        default:
            break
    }
}
const getList_fast = () => {
    console.log("getList_fast快速", query.value.queryParam)
    loading.value = true
    const queryParam = JSON.parse(query.value.queryParam)
    const params = {
        id: queryParam.selectValue,
        condition: queryParam.searchValue,
        symbol: queryParam.symbol,
        page: String(pageData.currentPage),
        limit: String(pageData.pageSize)
    }
    quickQuerySearchPart(params)
        .then((data: any) => {
            pageData.total = data.total
            sourceData.value = data.data
            resetFilterValue(filterValue)
            search()
        })
        .finally(() => (loading.value = false))
}
// 高级搜索
const getList_global = () => {
    console.log("getList_global高级", query.value.queryParam)
    const conditions: any[] = []
    let types = ["wt.part.WTPart"]
    try {
        loading.value = true
        const queryParam: any[] = JSON.parse(query.value.queryParam)
        queryParam.forEach((item) => {
            if (item[0] === "type") {
                types = [item[2]]
            } else {
                conditions.push({
                    key: item[0],
                    symbol: item[1],
                    value: item[2]
                })
            }
        })
    } catch (error) {
        console.log("getList_global: error", error)
    }
    const params = {
        // ...sortParams,
        pageNo: pageData.currentPage,
        pageSize: pageData.pageSize,
        types,
        conditions
    }
    advancedSearchPart(params)
        .then((data) => {
            pageData.total = data.data.total
            sourceData.value = data.data.content
            resetFilterValue(filterValue)
            search()
        })
        .finally(() => (loading.value = false))
}
//#endregion

// 查看详情
const goDetail = (row: any) => {
    // 判断物料
    if (row.oid.includes("WTPart")) {
        router.push({
            path: `/product/bomDetail/${row.oid}`,
            query: { oid: row.oid, type: "WTPart", tagTitle: `${row.number}_${row.name}_${row.version}` }
        })
    } else if (row.oid.includes("WTDocument")) {
        // 判断文档
        dialogTitle.value = "文档详情"
        dialogType.value = "detail"
        currentRowData.value = row
        dialogVisible.document = true
    }
}
//#endregion

//#region el-table默认参数
// 方法
// const handleSortChange = (data: { column: any; prop: string; order: any }) => {
//     console.log("handleSortChange", data)
//     sortParams.sortBy = data.prop
//     switch (data.order) {
//         case "descending":
//             sortParams.sorted = "DESC"
//             break
//         case "ascending":
//             sortParams.sorted = "ASC"
//             break

//         default:
//             sortParams.sorted = ""
//             break
//     }
//     getList()
// }
const handleSelectionChange = (val: MaterialListInterface[]) => {
    multipleSelection.value = val
    console.log("multipleSelection", multipleSelection.value)
}
// 处理行点击
const handleRowClick = (row: any) => {
    console.log("row-click", row)
    setCurrent(row)
}
// 处理行点击
const handleRowDblclick = (row: any) => {
    console.log("row-dblclick", row)
    goDetail(row)
}
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
// 方法
const handleSortChange = (data: { column: any; prop: string; order: any }) => {
    console.log("handleSortChange", data)
    sortParams.sortBy = data.prop
    sortParams.sorted = data.order
    search()
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
        label: computed(() => t("materielPage.sequence")) as any,
        type: "index",
        width: "50",
        minWidth: "50",
        headerAlign: "center",
        fixed: "left",
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
    {
        prop: "type",
        label: computed(() => t("materielPage.materialType")) as any,
        // slot: "materialType",
        width: "120",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: "custom",
        show: true
    },
    {
        prop: "number",
        label: computed(() => t("materielPage.code")) as any,
        width: "150",
        minWidth: "100",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom",
        slot: "search"
    },
    {
        prop: "materialSymbol",
        label: computed(() => t("materielPage.symbol")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom",
        slot: "search"
    },
    {
        prop: "name",
        label: computed(() => t("materielPage.name")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        slot: "search",
        sortable: "custom"
    },
    {
        prop: "material",
        label: computed(() => t("materielPage.material")) as any,
        width: "120",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "processRoute",
        label: computed(() => t("materielPage.processRoute")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "partCategory",
        label: computed(() => t("materielPage.partType")) as any,
        width: "110",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "parentNumber",
        label: computed(() => t("materielPage.parentCode")) as any,
        width: "150",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "jgyyParentNumber",
        label: computed(() => t("materielPage.jgyyParentCode")) as any,
        width: "160",
        minWidth: "145",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "desc",
        label: computed(() => t("materielPage.description")) as any,
        width: "180",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "machineModel",
        label: computed(() => t("materielPage.machineModel")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "state.state",
        label: computed(() => t("materielPage.lifeCycle")) as any,
        width: "110",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "ownerGroup",
        label: computed(() => t("materielPage.versionOwnerUserGroup")) as any,
        width: "190",
        minWidth: "145",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "plmOwner",
        label: computed(() => t("materielPage.owner")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "updater",
        label: computed(() => t("materielPage.updateAt")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "updateTime",
        label: computed(() => t("materielPage.updateTime")) as any,
        width: "160",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "checkoutor",
        label: computed(() => t("materielPage.checkoutBy")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "checkoutTime",
        label: computed(() => t("materielPage.checkoutTime")) as any,
        width: "160",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "typeNumber",
        label: computed(() => t("materielPage.typeCode")) as any,
        width: "150",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "version",
        label: computed(() => t("materielPage.version")) as any,
        width: "90",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "trimMethod",
        label: "裁剪方式",
        width: "140",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "oid",
        label: computed(() => t("materielPage.identification")) as any,
        width: "220",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
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
    showMenu: true
})
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList)
//#endregion

//#endregion

//#region 头部按钮操作
// 处理浏览按钮
const handleBrowseBtn = (row?: MaterialListInterface) => {
    const paramRow = !row ? multipleSelection.value[0] : row
    goDetail(paramRow)
}

// 处理添加到按钮
const handleAddToBtn = (row?: MaterialListInterface) => {
    if (!row) {
        if (!multipleSelection.value.length) {
            ElMessage({
                type: "warning",
                message: "请选择至少一条数据！",
                center: true
            })
            return
        }
    } else {
        multipleSelection.value = [row]
    }
    dialogTitle.value = "添加到工作区"
    const dialogType = "addToFolder"
    dialogVisible[dialogType] = true
}

// 处理变更所属者按钮
//变更所属者 - 弹窗
const changeOwnerDialog = reactive<any>({
    visible: false,
    title: "",
    row: null
})
const handleChangeOwnerBtn = (row?: MaterialListInterface) => {
    if (!row) {
        if (!multipleSelection.value.length) {
            ElMessage({
                type: "warning",
                message: "请选择至少一条数据！",
                center: true
            })
            return
        }
    }

    const needChangeOwnerData = !row ? multipleSelection.value : [row]
    Object.assign(changeOwnerDialog, {
        visible: true,
        title: "变更所属者",
        row: needChangeOwnerData
    })
}

// BOM高级编辑
const goBomHighEdit = (row?: MaterialListInterface) => {
    const routerRow = !row ? multipleSelection.value[0] : row
    router.push({
        path: `/bomManage/bomHighEdit/${routerRow.oid}`,
        query: {
            oid: routerRow.oid,
            number: routerRow.number,
            tagTitle: `BOM高级编辑(${routerRow.number})`
        }
    })
}

// 处理菜单删除按钮
// const handleDeleteBtn = () => {
//     if (!multipleSelection.value.length) {
//         ElMessage({
//             type: "warning",
//             message: "请选择至少一条数据！",
//             center: true
//         })
//         return
//     }
//     ElMessageBox.confirm(t("materielPage.deleteSelectedDataMsg"), t("materielPage.prompt"), {
//         confirmButtonText: t("materielPage.confirm"),
//         cancelButtonText: t("materielPage.cancel"),
//         confirmButtonClass: "confirmButton",
//         cancelButtonClass: "cancelButton",
//         type: "warning",
//         center: true
//     })
//         .then(async () => {
//             const folderOidStrs = multipleSelection.value.map((item) => item.folderOidStr).join()
//             const partOids = multipleSelection.value.map((item) => item.oid).join()
//             deleteBatchHandler(folderOidStrs, partOids)
//         })
//         .catch(() => {
//             ElMessage({
//                 type: "info",
//                 message: t("materielPage.cancelDelMsg"),
//                 center: true
//             })
//         })
// }

// const deleteBatchHandler = async (folderOidStrs: string, partOids: string) => {
//     try {
//         // const params = {
//         //     folderOidStrs,
//         //     partOids
//         // }
//         // await folderMaterielDelete(params)
//         // getList()
//     } catch (err: any) {
//         console.log(err)
//     }
// }

// 处理新建按钮
const handleCreateBtn = (type: string) => {
    dialogTitle.value = t("materielPage.createMaterial")
    dialogType.value = type
    dialogVisible.part = true
}

// 处理导出按钮
const elementLoadingText = ref<string>("")
const handleExportExcelBtn = async () => {
    dialogTitle.value = "输出到Excel"
    const dialogType = "changeExport"
    dialogVisible[dialogType] = true
}
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
    goSort(sortParams, tableData.value)
}
//#endregion

//#region 下拉数据
const materielTypeList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "MATERIAL_TYPE" })) as { data: any }
        materielTypeList.value =
            data.MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion

//#region 关闭部件对话弹窗
// 关闭部件弹窗
const handleConfirmSuccess_part = async (data: { oid: string; number: string; name: string }) => {
    dialogVisible.part = false
    if (dialogType.value === "add") {
        try {
            const parts = [
                {
                    partOid: data.oid,
                    materialCode: data.number,
                    name: data.name
                }
            ]
            const params: {
                // folderIdStr: string
                parts: Array<{ partOid: string; materialCode: string; name: string }>
            } = {
                // folderIdStr: props.currentTreeNodeData.oid,
                parts
            }
            await folderMaterielAdd(params)
            ElMessage({
                type: "success",
                message: t("materielPage.createdsuccessMsg"),
                center: true
            })
        } catch (err: any) {
            if (err.msg)
                ElMessage({
                    type: "error",
                    message: err.msg,
                    center: true
                })
            return
        }
    }
    PtTableRef.value!.clearSelection()
    getList()
    resetDialog()
}

// 关闭添加到文件夹弹窗
const handleConfirmSuccess_addToFolder = (dialogType: string) => {
    dialogVisible[dialogType] = false
    PtTableRef.value!.clearSelection()
    resetDialog()
    getList()
}

// 关闭变更所属者弹窗
const handleEditSuccess_owner = () => {
    Object.assign(changeOwnerDialog, {
        visible: false,
        title: "",
        row: null
    })
    resetDialog()
    getList()
}

// 关闭物料导出弹窗
const changeExportDialogRef = ref()
const handleConfirmSuccess_changeExport = async (changeExportForm: any) => {
    try {
        console.log("changeExportDialogRef: ", changeExportForm, changeExportDialogRef.value)
        changeExportDialogRef.value!.loading = true
        changeExportDialogRef.value!.elementLoadingText = "正在导出到Excel，请稍等..."
        let params = {} as any
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
        if (changeExportForm.exportMethod === "1" || changeExportForm.exportMethod === "2") {
            // 判断是勾选导出还是本页导出1（勾选），2（本页），3（全部）
            const content = changeExportForm.exportMethod === "1" ? multipleSelection.value : tableData.value
            params = {
                content
            }
            const res = await advancedSearchExportParts(params)
            const title = "物料"
            const filename = `${title}_${formatDateTime(new Date(), "YYYY-MM-DD")}`
            downloadFile(res, filename)
            dialogVisible.changeExport = false
        } else {
            if (searchType === "fast") {
                console.log("query.value.queryParam: ", query.value.queryParam, JSON.parse(query.value.queryParam))
                const queryParam = JSON.parse(query.value.queryParam)
                params = {
                    id: queryParam.selectValue,
                    condition: queryParam.searchValue,
                    symbol: queryParam.symbol
                }
            } else {
                const conditions: any[] = []
                let types = ["wt.part.WTPart"]
                const queryParam: any[] = JSON.parse(query.value.queryParam)
                queryParam.forEach((item) => {
                    if (item[0] === "type") {
                        types = [item[2]]
                    } else {
                        conditions.push({
                            key: item[0],
                            symbol: item[1],
                            value: item[2]
                        })
                    }
                })
                params = {
                    types,
                    conditions
                }
            }
            let result = null
            if (searchType === "fast") {
                result = await exportQuickAllAdvancedPart(params)
            } else {
                result = await advancedSearchExportAllParts(params)
            }
            const title = "物料"
            const filename = `${title}_${formatDateTime(new Date(), "YYYY-MM-DD")}`
            downloadFile(result, filename)
            dialogVisible.changeExport = false
        }
        PtTableRef.value!.clearSelection()
    } catch (err: any) {
        console.log(err)
    } finally {
        changeExportDialogRef.value!.elementLoadingText = ""
        changeExportDialogRef.value!.loading = false
    }
}

// 关闭文档查查详情弹窗
const handleWTDocumentConfirmSuccess = () => {
    dialogVisible.document = false
}

// 重置dialog值
const resetDialog = () => {
    dialogTitle.value = ""
    dialogType.value = ""
    multipleSelection.value = []
}
//#endregion

// 监听参数变化
const newParams = ref<any>(route.query.queryParam)
watch(
    () => route.query.queryParam,
    (val) => {
        console.log("watch(route.query.queryParam): ", val)
        if (val && route.params.type === searchType) {
            newParams.value = route.query.queryParam
        }
    },
    {
        deep: true
    }
)
watch(
    () => newParams.value,
    (val) => {
        console.log("watch(newParams): ", newParams.value)
        query.value.queryParam = val as any
        getList()
    },
    {
        immediate: true
    }
)
</script>

<style lang="scss" scoped>
.app-container {
    .sf-container {
        .sf-container-main {
            .sf-container-main-content {
                .sf-table-wrapper {
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
            }
        }
    }
}
</style>
