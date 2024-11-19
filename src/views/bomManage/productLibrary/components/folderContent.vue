<template>
    <div v-loading="loading" class="sf-container-main-content">
        <!-- <div class="title">{{ t("productLibraryPage.folderContent") }}</div> -->
        <div class="sf-search-wrapper">
            <el-form :model="searchForm" size="small" @submit.prevent>
                <el-form-item :label="t('productLibraryPage.folderContent')">
                    <el-input
                        v-model.trim="searchForm.name"
                        @keyup.enter="handleSearch"
                        clearable
                        @clear="handleClear"
                    />
                </el-form-item>
            </el-form>
        </div>
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
                @row-dblclick="handleDblClick"
                @page-current-change="handleCurrentChange"
                @page-size-change="handleSizeChange"
            >
                <!-- 表格编辑插槽 -->
                <template #slot-edit>
                    <span class="table-edit">
                        <!-- <el-button size="small" type="primary" @click="handleChangeOwnerBtn" :disabled="!parentRowData.oid">{{
                            t("productLibraryPage.changeOwner")
                        }}</el-button>
                        <el-button size="small" type="primary" @click="handleAddFolderBtn('add')" :disabled="!parentRowData.oid">{{
                            t("productLibraryPage.createFolder")
                        }}</el-button> -->
                        <!-- <el-button
                            size="small"
                            type="primary"
                            @click="handleAddPartBtn('add')"
                            :disabled="!parentRowData.oid"
                            >{{ t("productLibraryPage.createPart") }}</el-button
                        > -->
                        <el-button
                            type="primary"
                            size="small"
                            @click="getProductFolderContentList(parentRowData.oid)"
                            :disabled="!parentRowData.oid"
                            >刷新</el-button
                        >
                        <el-button
                            size="small"
                            type="primary"
                            @click="handleAddDocumentBtn('add')"
                            :disabled="parentRowData.type !== 'folder'"
                            >{{ t("productLibraryPage.createDocument") }}</el-button
                        >
                    </span>
                </template>
                <!-- 自定义列模板插槽 -->
                <template #col-icon="{ row }">
                    <el-icon>
                        <Folder v-if="row.type === 'folder'" />
                        <Document v-else-if="row.type === 'WTDocument'" />
                        <Tools v-else-if="row.type === 'WTPart'" />
                    </el-icon>
                </template>
                <template #col-name="{ row }">
                    <div size="small">{{ row.version ? row.name + "," + row.version : row.name }}</div>
                </template>
                <!-- 自定义列模板插槽 -->
                <template #head-search="{ column }">
                    <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
                </template>
                <template #head-name="{ column }">
                    <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
                </template>
                <!-- 右键菜单 -->
                <template #slot-menu="{ row }">
                    <pt-menu-li :disabled="!row || (row.type === 'WTPart' && !checkMaterialCanEdit(row.materialType))">
                        <span @click="handleEditBtn('edit', row)">{{ t("productLibraryPage.edit") }}</span>
                    </pt-menu-li>
                    <li @click="handleGoDetail(row)">{{ t("productLibraryPage.viewDetails") }}</li>
                    <!-- <li @click="handleDeleteBtn(row)">删除</li> -->
                </template>
            </pt-table>
        </div>

        <!-- 新增/编辑文件夹弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.folder" :footer="false" width="40%">
            <creatFolderDialog
                v-if="dialogVisible.folder"
                v-model:visible="dialogVisible.folder"
                :currentRowData="dialogType === 'add' ? parentRowData : currentRowData"
                :dialogType="dialogType"
                @confirm-success="handleFolderConfirmSuccess"
            />
        </dialogFrame>

        <!-- 新增/编辑部件弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.part" :footer="false" width="90%">
            <creatPartDialog
                v-if="dialogVisible.part"
                v-model:visible="dialogVisible.part"
                :currentRowData="currentRowData"
                :parentNodeData="parentRowData"
                :grandparentProductOid="grandparentProductOid"
                :dialogType="dialogType"
                @confirmSuccess="handleWTPartConfirmSuccess"
            />
        </dialogFrame>

        <!-- 新增/编辑文档弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.document" :footer="false" width="40%">
            <creatDocumentDialog
                v-if="dialogVisible.document"
                v-model:visible="dialogVisible.document"
                :currentRowData="currentRowData"
                :parentNodeData="parentRowData"
                :dialogType="dialogType"
                :advancedSearchPartParams="advancedSearchPart_params"
                @confirm-success="handleWTDocumentConfirmSuccess"
            />
        </dialogFrame>

        <!-- 变更所属者 - 弹窗 -->
        <ChangeOwnerDialog
            v-if="changeOwnerDialog.visible"
            :dialog="changeOwnerDialog"
            @handleEditSuccess="handleEditSuccessOwner"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue"
// import { ElMessageBox } from "element-plus"
import dialogFrame from "@/components/dialogFrame/index.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import creatFolderDialog from "./creatFolderDialog.vue"
import creatPartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import creatDocumentDialog from "./creatDocumentDialog.vue"
import ChangeOwnerDialog from "@/views/bomManage/components/changeOwnerDialog/index.vue"
import { useRouter } from "vue-router"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { ProductListDataInterface } from "@/interface/product"
import { productFolderContentList } from "@/api/productLibrary"
import { advancedSearchPart } from "@/api/productMange/materielQuery"
import emitter from "@/utils/mitt"
import { windowOpenTab, filterArray, resetFilterValue, checkMaterialCanEdit } from "@/utils"
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const { t, locale } = useI18n()
const loading = ref(false)
const router = useRouter()

const currentRowData = ref<any>({
    oid: "",
    name: "",
    type: ""
}) // 当前行数据
const parentRowData = ref<any>({
    oid: "",
    name: "",
    type: ""
}) // 父级节点表格行数据
const grandparentProductOid = ref<string>("") // 当前产品oid
//#endregio

// #region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    folder: false, // 新增/编辑文件夹对话框
    part: false, // 新增/编辑部件对话框
    document: false // 新增/编辑文档对话框
})
//变更所属者 - 弹窗
const changeOwnerDialog = reactive<any>({
    visible: false,
    title: "",
    row: null
})
//#endregion

//#region 表单
const searchForm = reactive({
    name: ""
})
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const sortParams = reactive({
    sortBy: "",
    sorted: ""
})
const tableData = ref<ProductListDataInterface[]>([])

const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
})
const tableColumns = ref<PtTableColumnsType>([
    // {
    //     type: "selection",
    //     width: "32",
    //     show: true
    // },
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
    {
        width: "42",
        slot: "icon",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "number",
        label: "编号",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        slot: "search",
        sortable: true,
        show: true
    },
    {
        prop: "name",
        label: computed(() => t("productLibraryPage.name")) as any,
        minWidth: "160",
        headerAlign: "center",
        // showOverflowTooltip: true,
        slot: "name",
        sortable: true,
        show: true
    },
    {
        prop: "updateTime",
        label: computed(() => t("productLibraryPage.lastModifyTime")) as any,
        width: "180",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "version",
        label: computed(() => t("productLibraryPage.version")) as any,
        width: "90",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    }
])

// 获取表格列表
const advancedSearchPart_params = ref({}) // 缓存参数
const getProductFolderContentList = async (oid: string) => {
    if (!oid) return
    try {
        loading.value = true
        const params = {
            ...sortParams,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize,
            types: ["wt.part.WTPart", "wt.doc.WTDocument"],
            conditions: [
                {
                    key: "name",
                    symbol: "包含",
                    value: searchForm.name
                },
                {
                    key: "folderingInfo.parentFolder",
                    symbol: "等于",
                    value: oid
                }
            ]
        }
        advancedSearchPart_params.value = params
        const { data } = await advancedSearchPart(params)
        loading.value = false
        pageData.total = data.total
        sourceData.value = data.content || []
        // 格式化数据
        sourceData.value.forEach((ele) => {
            if (ele.type === "文档") {
                ele.type = "WTDocument"
            } else {
                ele.type = "WTPart"
            }
        })
        resetFilterValue(filterValue)
        search()
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region el-table默认参数
// 方法
const handleSearch = () => {
    if (!parentRowData.value.oid) return
    getProductFolderContentList(parentRowData.value.oid)
}

const handleClear = () => {
    if (!parentRowData.value.oid) return
    getProductFolderContentList(parentRowData.value.oid)
}

const handleDblClick = (row: ProductListDataInterface) => {
    console.log("row-click", row)
    handleGoDetail(row)
}

const handleGoDetail = (row: any) => {
    if (row.type === "WTPart") {
        // 物料
        router.push({
            path: `/product/bomDetail/${row.oid}`,
            query: {
                oid: row.oid,
                number: row.number,
                type: row.type,
                parentOid: parentRowData.value.oid,
                tagTitle: `${row.number}_${row.name}_${row.version}`
            }
        })
    } else {
        // 文档
        detailWTPartHandler(row)
    }
}
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
//     getProductFolderContentList(parentRowData.value.oid)
// }
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], () => {
    getProductFolderContentList(parentRowData.value.oid)
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
//#endregion

//#endregion

// 处理变更所属者按钮
const handleChangeOwnerBtn = () => {
    Object.assign(changeOwnerDialog, {
        visible: true,
        title: "变更所属者",
        row: currentRowData.value
    })
}

//#region 新建编辑文件夹
const handleAddFolderBtn = (type: string) => {
    dialogTitle.value = t("productLibraryPage.createFolder")
    dialogType.value = type
    dialogVisible.folder = true
}

// 处理编辑文件
const editFolderHandler = (type: string, row: ProductListDataInterface) => {
    dialogTitle.value = t("productLibraryPage.editFolder")
    dialogType.value = type
    currentRowData.value = row
    dialogVisible.folder = true
}

// 处理新建部件按钮
const handleAddPartBtn = (type: string) => {
    dialogTitle.value = t("productLibraryPage.createPart")
    dialogType.value = type
    dialogVisible.part = true
}

// 处理编辑部件
const editWTPartHandler = (type: string, row: ProductListDataInterface) => {
    dialogTitle.value = t("productLibraryPage.editPart")
    dialogType.value = type
    currentRowData.value = row
    dialogVisible.part = true
}

//#region 文档
// 处理新建文档按钮
const handleAddDocumentBtn = (type: string) => {
    dialogTitle.value = t("productLibraryPage.createDocument")
    dialogType.value = type
    dialogVisible.document = true
}

// 处理编辑文档
const editWTDocumentHandler = (type: string, row: ProductListDataInterface) => {
    dialogTitle.value = t("productLibraryPage.editDocument")
    dialogType.value = type
    currentRowData.value = row
    dialogVisible.document = true
}

// 处理文档详情
const detailWTPartHandler = (row: ProductListDataInterface) => {
    dialogTitle.value = "文档详情"
    dialogType.value = "detail"
    currentRowData.value = row
    dialogVisible.document = true
}
//#endregion

// 处理菜单文档新增编辑按钮
const handleEditBtn = (type: string, row: ProductListDataInterface) => {
    const editType = row.type
    switch (editType) {
        case "folder":
            editFolderHandler(type, row)
            break
        case "WTPart":
            editWTPartHandler(type, row)
            break
        case "WTDocument":
            editWTDocumentHandler(type, row)
            break
        default:
            break
    }
}

// 处理菜单删除按钮
// const handleDeleteBtn = (row: ProductListDataInterface) => {
//     ElMessageBox.confirm(t("productLibraryPage.confirmDelete"), t("productLibraryPage.prompt"), {
//         confirmButtonText: t("productLibraryPage.confirm"),
//         cancelButtonText: t("productLibraryPage.cancel"),
//         confirmButtonClass: "confirmButton",
//         cancelButtonClass: "cancelButton",
//         type: "warning",
//         center: true
//     })
//         .then(async () => {
//             const oids = [row.oid]
//             const type = row.type
//             console.log("oids: ", oids, type)
//             deleteBatchHandler(oids, type)
//         })
//         .catch(() => {
//             ElMessage({
//                 type: "info",
//                 message: t("productLibraryPage.cancelDelMsg"),
//                 center: true
//             })
//         })
// }

// const deleteBatchHandler = async (oids: string[], type: string) => {
//     try {
//         const params = {
//             oids,
//             type
//         }
//         await deleteBatch(params)
//         getProductFolderContentList(parentRowData.value.oid)
//     } catch (err: any) {
//         console.log(err)
//     }
// }
//#endregion

//#region 关闭文件夹对话弹窗
const handleFolderConfirmSuccess = (oid: string) => {
    dialogVisible.folder = false
    if (dialogType.value === "edit") {
        // 如果是编辑弹窗，则更新父节点数据
        emitter.emit("localRefreshProductParentNodeOId", parentRowData.value.oid)
        getProductFolderContentList(parentRowData.value.oid)
    } else {
        emitter.emit("localRefreshProductParentNodeOId", oid)
        getProductFolderContentList(oid)
    }

    resetDialog()
}
//#endregion

//#region 关闭部件对话弹窗
const handleWTPartConfirmSuccess = () => {
    dialogVisible.part = false
    getProductFolderContentList(parentRowData.value.oid)
    resetDialog()
}
//#endregion

//#region 关闭文档对话弹窗
const handleWTDocumentConfirmSuccess = (parentOid: string) => {
    dialogVisible.document = false
    getProductFolderContentList(parentOid)
    resetDialog()
}

const handleEditSuccessOwner = () => {
    getProductFolderContentList(parentRowData.value.oid)
    Object.assign(changeOwnerDialog, {
        visible: false,
        title: "",
        row: null
    })
}

// 重置dialog值
const resetDialog = () => {
    dialogTitle.value = ""
    dialogType.value = ""
}
//#endregion

onMounted(() => {
    emitter.on("productFolderRowData", (data: ProductListDataInterface) => {
        if (!data) return
        parentRowData.value = data
        getProductFolderContentList(data.oid)
    })

    emitter.on("clearFolderContentList", (data: boolean) => {
        if (!data) return
        tableData.value = []
    })
})

// 页面关闭卸载掉emitter订阅
onBeforeUnmount(() => {
    emitter.off("productFolderRowData")
    emitter.off("clearFolderContentList")
    emitter.off("productOid")
})
</script>

<style lang="scss" scoped>
.sf-container-main-content {
    .title {
        height: 30px;
        line-height: 30px;
        background: #409eff;
        color: #fff;
        font-weight: bold;
        padding-left: 12px;
    }
}
</style>
