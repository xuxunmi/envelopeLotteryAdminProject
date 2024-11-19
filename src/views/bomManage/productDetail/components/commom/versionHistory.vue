<template>
    <!-- 版本历史页签 -->
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
            height="100%"
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <!-- <el-button type="primary" size="small" @click="goCompare" :disabled="multipleSelection.length !== 2"
                        >比较</el-button
                    > -->
                </span>
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
import { windowOpenTab } from "@/utils"
import { versionHistoryData } from "@/api/productDetail"
import { filterArray } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "VersionHistory"
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

console.log("版本历史data", props.data)
const router = useRouter()
const loading = ref(false)
//#endregion

//#region 表格相关
// 表格列
const tableColumns = ref<PtTableColumnsType>([
    // {
    //     type: "selection",
    //     width: "32",
    //     show: true
    // },
    {
        label: "序号",
        type: "index",
        width: "60",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "identification",
        label: "版本规则标识",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "iteration",
        label: "版本标签",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "number",
        label: "编码",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "name",
        label: "名称",
        width: "180",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "version",
        label: "版本",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "cnState",
        label: "生命周期",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "plmOwner",
        label: "所有者",
        headerAlign: "center",
        width: "100",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "creator",
        label: "创建者",
        headerAlign: "center",
        width: "100",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "createTime",
        label: "创建时间",
        width: "180",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "updater",
        label: "修改者",
        headerAlign: "center",
        width: "100",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "updateTime",
        label: "修改时间",
        headerAlign: "center",
        width: "180",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "checkOuter",
        label: "检出者",
        headerAlign: "center",
        width: "100",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "checkTime",
        label: "检出时间",
        width: "180",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "invalidTime",
        label: "失效时间",
        width: "180",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "takeEffectTime",
        label: "生效时间",
        width: "180",
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

// 版本比较
// const goCompare = () => {
//     if (multipleSelection.value.length === 2) {
//         const url = router.resolve({
//             path: "/bomManage/bomCompare",
//             query: {
//                 code: props.data.oid,
//                 version1: multipleSelection.value[0].Number,
//                 version2: multipleSelection.value[1].Number,
//                 type: "version",
//                 hiddenNav: true
//             } as any
//         })
//         windowOpenTab(url.href)
//     } else {
//         ElMessage.error(t("productDetailPage.selectVersionsData"))
//     }
// }

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params: {
            PartOid: string // 物料oid
        } = {
            PartOid: props.data.PartOid
        }
        const { data } = (await versionHistoryData(params)) as any
        sourceData.value = data || []
        search()
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

watch(
    () => props.data.oid,
    (val) => {
        if (!val) return
        getList()
    },
    {
        immediate: true
    }
)

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
