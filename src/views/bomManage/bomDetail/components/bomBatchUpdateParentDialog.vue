<template>
    <div class="bom-batch-update-parent-dialog">
        <pt-table
            v-loading="loading"
            ref="PtTableRef"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :locale="locale"
            border
            stripe
            highlight-current-row
            size="small"
            height="500px"
            :row-class-name="tableRowClassName"
            @page-current-change="handleCurrentChange"
            @page-size-change="handleSizeChange"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
        >
            <template #slot-edit>
                <span class="table-edit fromWrapper">
                    <el-form :model="searchForm" size="small" @submit.prevent>
                        <el-form-item label="链接类型：">
                            <el-select v-model="searchForm.type" filterable @change="getList">
                                <el-option
                                    v-for="item in linkTypeList"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleBatchRemoveBtn"
                        round
                        :disabled="!multipleSelection.length"
                        >移除</el-button
                    >
                    <el-button
                        size="small"
                        type="primary"
                        plain
                        @click="handleBatchReplaceBtn"
                        round
                        :disabled="!multipleSelection.length"
                        >替换</el-button
                    >
                </span>
            </template>
        </pt-table>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="emits('confirm-success', 'bomBatchEdit')">取消</el-button>
        </div>

        <!-- 添加物料弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.materialReplace" :footer="false" width="94%">
            <MaterialDialog
                v-if="dialogVisible.materialReplace"
                v-model:visible="dialogVisible.materialReplace"
                type="materialReplace"
                :dialog="materialDialog"
                @confirm-success="handleConfirmSuccess_materialReplace"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtMenuConfigType,
    PtPaginationType
} from "@/plugins/pt-front"
import { usePagination } from "@/hooks/usePagination"
import dialogFrame from "@/components/dialogFrame/index.vue"
import MaterialDialog from "@/views/productMange/materiel/components/materialDialog.vue"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import {
    getMaterieLatestAllParentPart,
    materieRemoveParentPart,
    materieReplaceParentPart
} from "@/api/productMange/materiel"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "bomBatchUpdateParentDialog"
})

const { t, locale } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        default: () => {}
    },
    dialogType: {
        type: String,
        default: "升版"
    }
})

console.log("props.dialogType: ", props.dialogType)

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)

//#region 表单
const searchForm = reactive({
    type: "" // 链接类型
})
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false
})

//#region 表格列
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
        show: true
        // index: (index: number) => {
        //     return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        // }
    },
    {
        prop: "code",
        label: computed(() => t("materielPage.code")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "name",
        label: computed(() => t("materielPage.name")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "version",
        label: computed(() => t("materielPage.version")) as any,
        width: "90",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "state",
        label: computed(() => t("materielPage.lifeCycle")) as any,
        width: "110",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    },
    {
        prop: "number",
        label: "数量",
        width: "90",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: true,
        show: true
    }
])

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})

const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
}

// 处理行点击
const handleRowClick = (row: any) => {
    PtTableRef.value!.toggleRowSelection(row)
}
const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (multipleSelection.value.some((selectedRow) => selectedRow === row)) {
        return "front-checked"
    }
    return "front-not-checked"
}
//#endregion

// 获取当前物料所有最新版本的父物料
const getList = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string
            type: string
        } = {
            partOid: props.currentRowData.oid,
            type: searchForm.type
        }
        const { data } = await getMaterieLatestAllParentPart(params)
        tableData.value = data.map((item: any) => {
            return {
                ...item,
                code: item.number,
                number: item.quantity
            }
        })
        loading.value = false
    } catch (err: any) {
        loading.value = false
        if (err.msg)
            ElMessage({
                type: "error",
                message: err.msg,
                center: true
            })
        return
    }
}

//#region 下拉数据
const linkTypeList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        loading.value = true
        const { data } = (await getDictionarySelect({ codes: "LINK_TYPE" })) as { data: any }
        linkTypeList.value =
            data.LINK_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        Object.assign(searchForm, {
            ...searchForm,
            type: linkTypeList.value[0].id
        })
        getList()
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}
getSelectData()
//#endregion

//#region 编辑弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    materialReplace: false // 添加物料对话框
})
const materialDialog = reactive<any>({
    loading: false
})
//#endregion

//#region 处理移除按钮
const handleBatchRemoveBtn = () => {
    ElMessageBox.confirm("确认移除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            const linkOids = multipleSelection.value.map((item) => item.linkOid).join()
            removeBatchHandler(linkOids)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消移除操作！",
                center: true
            })
        })
}

const removeBatchHandler = async (linkOids: string) => {
    try {
        loading.value = true
        let params: {
            LinkOid: string
            editOid?: string // 当前批量编辑物料oid
        } = {
            LinkOid: linkOids
        }
        if (props.dialogType === "升版") {
            params = {
                ...params,
                editOid: props.currentRowData.oid
            }
        }
        const { message } = (await materieRemoveParentPart(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        PtTableRef.value!.clearSelection()
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}
//#endregion

//#region 处理替换按钮
const handleBatchReplaceBtn = () => {
    dialogTitle.value = "物料替换"
    const dialogType = "materialReplace"
    dialogVisible[dialogType] = true
}
// 关闭物料替换弹窗
const handleConfirmSuccess_materialReplace = async (rows: any[]) => {
    try {
        materialDialog.loading = true
        const linkOids = multipleSelection.value.map((item) => item.linkOid).join()
        const parentPartOids = multipleSelection.value.map((item) => item.partOid).join()
        const [row] = rows
        let params: {
            LinkOid: string
            ParentPartOid: string
            PartOid: string
            editOid?: string // 当前批量编辑物料oid
        } = {
            LinkOid: linkOids,
            ParentPartOid: parentPartOids,
            PartOid: row.oid
        }
        if (props.dialogType === "升版") {
            params = {
                ...params,
                editOid: props.currentRowData.oid
            }
        }
        const { message } = (await materieReplaceParentPart(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        dialogVisible.materialReplace = false
        getList()
    } catch (err: any) {
        console.log(err)
    } finally {
        materialDialog.loading = false
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
.bom-batch-update-parent-dialog {
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
