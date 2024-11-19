<template>
    <!-- 上海整机MBOM页签 -->
    <div class="productList">
        <pt-table
            v-loading="loading"
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
            @selection-change="handleSelectionChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #col-isVirtual="{ row }">
                <el-checkbox v-model="row.isVirtual" size="small" />
            </template>
            <!-- 自定义列模板插槽 -->
            <template #head-search="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
        </pt-table>
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
import { useRouter } from "vue-router"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { filterArray } from "@/utils"
import { getCompleteMachineMBOM } from "@/api/productDetail"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "CompleteMachineMBom"
})

const { t, locale } = useI18n()

//#region 参数和方法
const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            oid: "",
            type: ""
        })
    }
})
const router = useRouter()
const loading = ref(false)
//#endregion

//#region 表格相关
// 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        label: "序号",
        type: "index",
        width: "60",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "number",
        label: "编码",
        width: "160",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "name",
        label: "名称",
        width: "160",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "materialSymbol",
        label: "代号",
        width: "160",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "partType",
        label: "零件类型",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "material",
        label: "材料",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "quantity",
        label: "数量",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "station",
        label: "工位",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "processRoute",
        label: "工艺路线",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "remark",
        label: "备注",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "isVirtual",
        label: "是否虚拟",
        width: "90",
        slot: "isVirtual",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "materialIssueMode",
        label: "发料方式",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "bomType",
        label: "U9中BOM类型",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "productionPurpose",
        label: "生产目的",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "parentNumber",
        label: "父项编码",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
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
const multipleSelection = ref<any[]>([])

const handleRowClick = (row: any) => {
    console.log("row-click", row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
}
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string // 物料oid
            viewName: string // 类型名称
        } = {
            partOid: props.data.PartOid,
            viewName: props.data.viewName || "SH-M"
        }
        const { data } = (await getCompleteMachineMBOM(params)) as any
        sourceData.value = data || []
        search()
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}
getList()
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

// 向外暴露方法
defineExpose({})
</script>

<style lang="scss" scoped></style>
