<template>
    <!-- 库存信息页签 -->
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
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-form :model="searchForm" size="small" @submit.prevent>
                        <el-form-item label="生产组织：">
                            <el-select
                                style="width: 180px"
                                v-model="searchForm.orgCode"
                                @change="getList"
                                filterable
                                clearable
                            >
                                <el-option
                                    v-for="item in options_group"
                                    :key="item.code"
                                    :label="item.codeListNameC"
                                    :value="item.code"
                                />
                            </el-select>
                        </el-form-item>
                    </el-form>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #col-visibility="{ row }">
                <el-checkbox v-model="row.visibility" size="small" />
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
import { getInventoryViewList } from "@/api/bomManage/productDetail"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { filterArray } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: {
            oid: "", // 当前物料oid
            parentOid: "", // 当前物料父级oid
            topObjectOid: "", // 当前物料顶层系列oid
            Number: "", // 编号
            ProductName: "", // 组织名称
            Name: "", // 名称
            materialType: "" // 物料类型
        }
    }
})
const router = useRouter()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region 表格相关
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const searchForm = reactive({
    orgCode: ""
})

//#region 增、删、改、查
// 获取列表
const getList = async () => {
    loading.value = true
    const params = {
        ...searchForm,
        oid: props.objectRow.oid
    }
    getInventoryViewList(params)
        .then((data) => {
            sourceData.value = data.data || []
            search()
        })
        .finally(() => (loading.value = false))
}
getList()
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any) => {
    console.log("row-click", row)
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        label: "序号",
        type: "index",
        width: "60",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    // {
    //     prop: "status",
    //     label: "状态",
    //     headerAlign: "center",
    //     showOverflowTooltip: true,
    //     show: true
    // },
    {
        prop: "orgCode",
        label: "生产组织编号",
        headerAlign: "center",
        minWidth: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "orgName",
        label: "生产组织名称",
        headerAlign: "center",
        minWidth: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "itemCode",
        label: "物料编号",
        headerAlign: "center",
        minWidth: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "itemName",
        label: "物料名称",
        headerAlign: "center",
        minWidth: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "whCode",
        label: "仓库编号",
        headerAlign: "center",
        minWidth: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "whName",
        label: "仓库名称",
        headerAlign: "center",
        minWidth: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "storeQty",
        label: "数量",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    }
])
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
})
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
//#endregion

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
        const otherHeight = 55
        tableHeight.value = dropRightContainer - detailWrapper - elTabsNavScroll - ptTableEdit - otherHeight
    })
}

//#region 字典数据
const loading_group = ref(false)
const options_group = ref<any[]>([]) // 生产组织下拉
loading_group.value = true
getDictionarySelect({ codes: "PRODUCTION_ORGANIZATION" })
    .then((data) => {
        options_group.value = data.data.PRODUCTION_ORGANIZATION || []
    })
    .finally(() => (loading_group.value = false))
//#endregion

onMounted(() => {
    setTableHeight()
    window.addEventListener("resize", () => {
        setTableHeight()
    })
})

// 向外暴露方法
defineExpose({})
</script>

<style lang="scss" scoped>
.productList {
    .table-edit {
        :deep(.el-form) {
            .el-form-item--small {
                margin-bottom: 0;
            }
        }
    }
}
</style>
