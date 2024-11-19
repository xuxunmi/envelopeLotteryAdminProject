<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading" :element-loading-text="elementLoadingText">
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
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <span class="table-edit">
                                    <el-form :inline="true" :model="searchForm" size="small" @submit.prevent>
                                        <el-form-item label="颜色分组">
                                            <el-select
                                                v-model="searchForm.colorGroup"
                                                filterable
                                                clearable
                                                @change="getList"
                                                style="width: 180px"
                                            >
                                                <el-option
                                                    v-for="item in colorGroupList"
                                                    :key="item.id"
                                                    :label="item.name"
                                                    :value="item.id"
                                                />
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleAddBtn"
                                        :disabled="!searchForm.colorGroup"
                                        >添加</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleDeleteBtn"
                                        :disabled="!multipleSelection.length"
                                        >移除</el-button
                                    >
                                    <el-upload
                                        v-model:file-list="fileList"
                                        :auto-upload="false"
                                        :show-file-list="false"
                                        :on-change="handleUploadChange"
                                    >
                                        <el-button type="primary" size="small">导入</el-button>
                                    </el-upload>
                                    <el-button type="primary" size="small" @click="goExport">导出</el-button>
                                    <el-button type="primary" size="small" @click="goDownload">下载模板</el-button>
                                    <el-button size="small" type="primary" @click="handleClearBtn">清空</el-button>
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
                        </pt-table>
                    </div>
                </div>
            </div>

            <!-- 颜色分组添加物料弹窗 -->
            <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.material" :footer="false" width="90%">
                <materialDialog
                    v-if="dialogVisible.material"
                    v-model:visible="dialogVisible.material"
                    type="chooseRows"
                    @confirm-success="handleConfirmSuccess_material"
                />
            </dialogFrame>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { UploadProps, UploadUserFile } from "element-plus"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import MaterialDialog from "@/views/productMange/materiel/components/materialDialog.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { MaterialListInterface, MaterialInterface } from "@/interface/materiel"
import { getNameById } from "@/assets/common/select-list"
import { filterArray, resetFilterValue, formatDateTime } from "@/utils"
import { downloadFile } from "@/utils/exportTemplate"
import {
    getColorComponentManageList,
    colorComponentManageAddMaterial,
    colorComponentManageDelete,
    downColorPart,
    uploadColorPart,
    getTemplate
} from "@/api/colorManage/colorComponentManage"

import { useI18n } from "vue-i18n"

defineOptions({
    name: "colorProfile"
})

const { t, locale } = useI18n()
const loading = ref(false)

//#region 表格列表
const searchForm = reactive({
    colorGroup: "", // 颜色分组
    orderParam: "", // 排序字段
    orderType: "" // 排序类型
})
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<MaterialListInterface[]>([])
const chooseRow = ref<MaterialListInterface>()
const multipleSelection = ref<MaterialListInterface[]>([])

//#region 增、删、改、查
// 下载模板
const goDownload = () => {
    loading.value = true
    getTemplate()
        .then((data) => {
            const filename = `颜色件管理模板`
            downloadFile(data, filename)
        })
        .finally(() => (loading.value = false))
}
//#endregion

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
        minWidth: "50",
        headerAlign: "center",
        fixed: "left",
        show: true
    },
    {
        prop: "materialType",
        label: computed(() => t("materielPage.materialType")) as any,
        slot: "materialType",
        width: "120",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "code",
        label: computed(() => t("materielPage.code")) as any,
        width: "150",
        minWidth: "100",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true,
        slot: "search"
    },
    {
        prop: "symbol",
        label: computed(() => t("materielPage.symbol")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true,
        slot: "search"
    },
    {
        prop: "name",
        label: computed(() => t("materielPage.name")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true,
        slot: "search"
    },
    {
        prop: "material",
        label: computed(() => t("materielPage.material")) as any,
        width: "120",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "processRoute",
        label: computed(() => t("materielPage.processRoute")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "partType",
        label: computed(() => t("materielPage.partType")) as any,
        width: "110",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "parentNumber",
        label: computed(() => t("materielPage.parentCode")) as any,
        width: "150",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "jgyyParentNumber",
        label: computed(() => t("materielPage.jgyyParentCode")) as any,
        width: "160",
        minWidth: "145",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "description",
        label: computed(() => t("materielPage.description")) as any,
        width: "180",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "machineModel",
        label: computed(() => t("materielPage.machineModel")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "state",
        label: computed(() => t("materielPage.lifeCycle")) as any,
        width: "110",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "ownerGroup",
        label: computed(() => t("materielPage.versionOwnerUserGroup")) as any,
        width: "190",
        minWidth: "145",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "owner",
        label: computed(() => t("materielPage.owner")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "updateAt",
        label: computed(() => t("materielPage.updateAt")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "updateTime",
        label: computed(() => t("materielPage.updateTime")) as any,
        width: "160",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "checkoutor",
        label: computed(() => t("materielPage.checkoutBy")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "checkoutTime",
        label: computed(() => t("materielPage.checkoutTime")) as any,
        width: "160",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "typeNumber",
        label: computed(() => t("materielPage.typeCode")) as any,
        width: "150",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "version",
        label: computed(() => t("materielPage.version")) as any,
        width: "90",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "trimMethod",
        label: "裁剪方式",
        width: "140",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "partOid",
        label: computed(() => t("materielPage.identification")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    }
])

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    chooseRow.value = row
    setCurrent(row)
}
const handleSelectionChange = (val: MaterialListInterface[]) => {
    multipleSelection.value = val
    // console.log("multipleSelection.value: ", multipleSelection.value)
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

// const handleSortChang = (data: { column: any; prop: string; order: any }) => {
//     // console.log(data)
//     if (data.order === "ascending") {
//         Object.assign(searchForm, {
//             ...searchForm,
//             orderParam: data.prop,
//             orderType: "asc"
//         })
//     } else {
//         Object.assign(searchForm, {
//             ...searchForm,
//             orderParam: data.prop,
//             orderType: "desc"
//         })
//     }
//     getList()
// }
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

// 获取流程列表
const getList = async () => {
    try {
        loading.value = true
        const params: {
            colorPartCode: string
            // orderParam: string
            // orderType: string
            pageNo: number
            pageSize: number
        } = {
            colorPartCode: searchForm.colorGroup,
            // orderParam: searchForm.orderParam,
            // orderType: searchForm.orderType,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        const { data } = await getColorComponentManageList(params)
        sourceData.value = data.list.map((item: any) => {
            return {
                oid: item.oidStr,
                partOid: item.PartOid,
                materialType: item.materialType,
                type: item.type,
                code: item.PartNumber,
                symbol: item.materialSymbol,
                name: item.PartName,
                material: item.material,
                processRoute: item.processRoute,
                partType: item.partCategory,
                parentNumber: item.parentNumber,
                jgyyParentNumber: item.jgyyParentNumber,
                description: item.desc,
                machineModel: item.machineModel,
                state: item.state,
                ownerGroup: item.ownerGroup,
                owner: item.plmOwner,
                updateAt: item.updater,
                updateTime: item.updateTime,
                checkoutor: item.checkoutor,
                checkoutTime: item.checkoutTime,
                typeNumber: item.typeNumber,
                version: item.version,
                trimMethod: item.trimMethod
            }
        })
        resetFilterValue(filterValue)
        search()
        pageData.total = data.total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}
//#endregion

//#region 下拉数据
const colorGroupList = ref<SelectInterface[]>([])
const materielTypeList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "COLOR_GROUP,MATERIAL_TYPE" })) as { data: any }
        colorGroupList.value =
            data.COLOR_GROUP.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        materielTypeList.value =
            data.MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        Object.assign(searchForm, {
            ...searchForm,
            colorGroup: colorGroupList.value[0].id
        })
        getList()
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion

//#region 新增、编辑、移除
const handleAddBtn = () => {
    dialogTitle.value = "添加物料"
    const dialogType = "material"
    dialogVisible[dialogType] = true
}

const handleDeleteBtn = () => {
    ElMessageBox.confirm("是否确认移除勾选数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(async () => {
        const oids = multipleSelection.value.map((item) => item.oid).join()
        deleteBatchHandler(oids)
    })
}

const deleteBatchHandler = async (oids: string) => {
    try {
        loading.value = true
        const params: {
            partOidsStr: string
        } = {
            partOidsStr: oids
        }
        await colorComponentManageDelete(params)
        ElMessage({
            type: "success",
            message: "移除成功！",
            center: true
        })
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        colorGroup: "", // 颜色分组
        orderParam: "", // 排序字段
        orderType: "" // 排序类型
    })
    getList()
}
//#endregion

//#region 导入
const fileList = ref<UploadUserFile[]>([])
const handleUploadChange: UploadProps["onChange"] = (uploadFile) => {
    console.log("handleUploadChange", uploadFile)
    if (uploadFile.raw) {
        const formData = new FormData()
        formData.append("file", uploadFile.raw)
        loading.value = true
        uploadColorPart(formData)
            .then((data) => {
                ElMessage.success("导入成功！")
                getList()
            })
            .finally(() => (loading.value = false))
    }
}
// 导出
const elementLoadingText = ref<string>("")
const goExport = () => {
    if (!searchForm.colorGroup) {
        ElMessage.error("请选择颜色分组！")
        return false
    }
    loading.value = true
    elementLoadingText.value = "正在导出到Excel，请稍等..."
    downColorPart({ colorPartCode: searchForm.colorGroup })
        .then((data) => {
            const filename = `颜色件_${formatDateTime(new Date(), "YYYY-MM-DD")}`
            downloadFile(data, filename)
        })
        .finally(() => {
            elementLoadingText.value = ""
            loading.value = false
        })
}
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    material: false // 添加物料对话框
})

// const currentRowData = ref({
//     oid: ""
// }) // 当前行数据
//#endregion

// #region 关闭弹窗
// 关闭添加物料弹窗
type colorPartsType = {
    partOid: string
    partNum: string
}
const handleConfirmSuccess_material = async (rows: MaterialInterface[]) => {
    dialogVisible.material = false
    try {
        const colorParts: colorPartsType[] = rows.map((item) => {
            return {
                partOid: item.oid,
                partNum: item.code
            }
        })
        const params: {
            colorPartCode: string
            colorParts: colorPartsType[]
        } = {
            colorPartCode: searchForm.colorGroup,
            colorParts
        }
        await colorComponentManageAddMaterial(params)
        ElMessage({
            type: "success",
            message: "添加成功！",
            center: true
        })
        getList()
    } catch (err: any) {
        console.log(err)
    }
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
