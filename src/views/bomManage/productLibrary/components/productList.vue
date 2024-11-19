<template>
    <div v-loading="loading" class="sf-container-main-content">
        <div class="sf-search-wrapper">
            <el-form :model="searchForm" size="small" @submit.prevent>
                <el-form-item :label="t('productLibraryPage.seriesName')">
                    <el-input v-model.trim="searchForm.name" clearable @keyup.enter="getProductList" />
                </el-form-item>
            </el-form>
        </div>
        <div class="sf-table-wrapper">
            <pt-table
                ref="PtTableRef"
                :tableColumns="tableColumns"
                :tableEditConfig="tableEditConfig"
                :paginationConfig="paginationConfig"
                :menuConfig="menuConfig"
                :data="filterTableData"
                :locale="locale"
                border
                highlight-current-row
                size="small"
                @row-click="handleRowClick"
                @page-current-change="handleCurrentChange"
            >
                <!-- 表格编辑插槽 -->
                <template #slot-edit>
                    <span v-if="showControls" class="table-edit">
                        <!-- <el-button size="small" type="primary" @click="handleAddEditBtn('add')">{{
                            t("productLibraryPage.add")
                        }}</el-button>
                        <el-button size="small" type="primary" @click="handleAddEditBtn('edit')" :disabled="!currentRowData.oid">{{
                            t("productLibraryPage.edit")
                        }}</el-button> -->
                    </span>
                </template>
            </pt-table>
        </div>

        <!-- 新建/编辑产品弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.product" :footer="false" width="40%">
            <createProductDialog
                v-if="dialogVisible.product"
                v-model:visible="dialogVisible.product"
                :currentRowData="currentRowData"
                @confirm-success="handleConfirmSuccess"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import createProductDialog from "./creatProductDialog.vue"
import { usePagination } from "@/hooks/usePagination"
import { ProductListDataInterface } from "@/interface/product"
import { productList } from "@/api/productLibrary"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    // 是否显示按钮
    showControls: {
        type: Boolean,
        default: true
    }
})

const emits = defineEmits(["handleProductClick"])

const { t, locale } = useI18n()
const loading = ref(false)

const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    product: false // 新增/编辑产品对话框
})
//#endregion

//#region 表单
const searchForm = reactive({
    name: ""
})

// 方法
const filterTableData = computed(() =>
    tableData.value.filter(
        (data) => !searchForm.name || data.name.toLowerCase().includes(searchForm.name.toLowerCase())
    )
)
//#endregion

const currentRowData = ref({
    oid: ""
}) // 当前行数据
const currentRowOid = ref<string>("") // 当前行id

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<ProductListDataInterface[]>([])

//#region el-table默认参数
// 方法
const handleRowClick = (row: ProductListDataInterface) => {
    currentRowData.value = row
    emits("handleProductClick", row)
    emitter.emit("productOid", currentRowData.value.oid)
    emitter.emit("clearFolderContentList", true)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false,
    show: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        prop: "name",
        label: computed(() => t("productLibraryPage.seriesName")) as any,
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    }
])

// 获取产品列表
const getProductList = async () => {
    try {
        // const params = {
        //     pageNo: pageData.currentPage,
        //     pageSize: pageData.pageSize
        // }
        loading.value = true
        const { data } = (await productList()) as { data: any }
        loading.value = false
        tableData.value = data || []
        // pageData.total = pageInfo.total
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange } = usePagination()

const paginationConfig = reactive<PtPaginationType>({
    show: tableData.value.length ? true : false,
    small: true,
    layout: "total, prev, pager, next, sizes",
    hideOnSinglePage: true,
    currentPage: pageData.currentPage,
    pageSize: pageData.pageSize,
    total: pageData.total
})

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getProductList, { immediate: true })
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
//#endregion

//#region 产品列表
const handleAddEditBtn = (type: string) => {
    dialogTitle.value = type === "add" ? t("productLibraryPage.createProduct") : t("productLibraryPage.editProduct")
    // if (type === "edit") {
    //     currentRowOid.value = currentRowData.value.oid
    // }
    const dialogType = "product"
    dialogVisible[dialogType] = true
}
//#endregion

//#region 关闭对话弹窗
const handleConfirmSuccess = (dialogType: string) => {
    dialogVisible[dialogType] = false
    resetDialog()
    getProductList()
}

// 重置dialog值
const resetDialog = () => {
    dialogTitle.value = ""
    currentRowOid.value = ""
    currentRowData.value = { oid: "" }
}
//#endregion
</script>

<style lang="scss" scoped>
.sf-container-main-content {
    .sf-search-wrapper {
        :deep(.el-form) {
            .el-form-item .el-input {
                width: 125px;
            }
        }
    }
}
</style>
