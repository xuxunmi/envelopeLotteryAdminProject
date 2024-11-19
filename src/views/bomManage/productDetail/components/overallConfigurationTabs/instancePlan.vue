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
            :height="tableHeight"
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtPaginationType,
    PtTableColumnsType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "InstancePlan"
})

const { t, locale } = useI18n()

const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            oid: "",
            type: ""
        })
    }
})

//#region 表格相关
// 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
    },
    {
        label: "序号",
        type: "index",
        width: "60",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "planCode",
        label: "方案编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "planName",
        label: "方案名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createTime",
        label: "创建时间",
        width: 160,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "instanceCode",
        label: "实例编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "instanceName",
        label: "实例名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    }
])
// 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
})
// 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
// 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})

const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])

const handleRowClick = (row: any) => {
    console.log("row-click", row)
}
//#endregion

const tableHeight = ref(0)
// 设置表格最大高度
const setTableHeight = () => {
    nextTick(() => {
        const dropRightContainer = document.querySelector(".drop-right-container")?.clientHeight || 0
        const detailWrapper = document.querySelector(".detailWrapper")?.clientHeight || 0
        const elTabsNavScroll = document.querySelector(".el-tabs__nav-scroll")?.clientHeight || 0
        const ptTableEdit = document.querySelector(".pt-table-edit")?.clientHeight || 0
        // console.log("dropRightContainer", dropRightContainer, detailWrapper, elTabsNavScroll, ptTableEdit)
        const otherHeight = 40
        tableHeight.value = dropRightContainer - detailWrapper - elTabsNavScroll - ptTableEdit - otherHeight
    })
}

onMounted(() => {
    setTableHeight()
    window.addEventListener("resize", () => {
        setTableHeight()
    })
})
</script>

<style lang="scss" scoped></style>
