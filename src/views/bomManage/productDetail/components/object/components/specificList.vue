<template>
    <div class="productList">
        <pt-table
            ref="PtTableRef"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :locale="locale"
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { useI18n } from "vue-i18n"

const { t, locale } = useI18n()
//#region 参数和方法
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData: any[] = [{ value: "value" }, { value: "value" }, { value: "value" }]
const multipleSelection = ref<any[]>([])

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
}
// 事件
const setCurrent = (row?: any) => {
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.code")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.replacePartType")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.name")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.context")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.bothway")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    }
])
const goEdit = (row: any) => {
    console.log("编辑", row)
}
const goDel = (row: any) => {
    console.log("删除", row)
}
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
const goCopy = (row: any) => {
    console.log("复制", row)
}
const goDetail = (row: any) => {
    console.log("查看详情", row)
}
//#endregion

//#endregion
</script>

<style lang="scss" scoped></style>
