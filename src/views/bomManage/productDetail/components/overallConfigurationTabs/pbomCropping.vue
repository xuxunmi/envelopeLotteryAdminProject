<template>
    <!-- PBOM裁剪页签 -->
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
                    <el-button type="primary" size="small" @click="handleAddRawMaterialBtn">增加原材料</el-button>
                    <el-button type="primary" size="small" @click="goCompare">BOM比较</el-button>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #col-isCropping="{ row }">
                <el-checkbox v-model="row.isCropping" size="small" />
            </template>
            <template #col-isVirtual="{ row }">
                <el-checkbox v-model="row.isVirtual" size="small" />
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
import { windowOpenTab } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "PbomCropping"
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
        prop: "isCropping",
        label: "是否裁剪",
        slot: "isCropping",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "partType",
        label: "零件类型",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "code",
        label: "编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "symbol",
        label: "代号",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "name",
        label: "名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "material",
        label: "材料",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "remark",
        label: "备注",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "workstation",
        label: "工位",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "number",
        label: "数量",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "versionCheckoutAt",
        label: "版本检出人",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "versionOwner",
        label: "版本所有者",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "isVirtual",
        label: "是否虚拟",
        slot: "isVirtual",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "lgGrossWeight",
        label: "单件毛重",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "weight",
        label: "单件净重",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "hasCondition",
        label: "是否有条件",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "bomType",
        label: "U9中BOM类型",
        headerAlign: "center",
        width: 120,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "toMoid",
        label: "To端Moid",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "productionPurpose",
        label: "生产目的",
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

// 处理增加原材料按钮
const handleAddRawMaterialBtn = () => {
    console.log("处理增加原材料按钮")
}

//#endregion

// 处理bom比较按钮
const goCompare = () => {
    if (multipleSelection.value.length === 2) {
        const url = router.resolve({
            path: "/bomManage/bomCompare",
            query: {
                code: props.data.oid,
                version1: multipleSelection.value[0].Number,
                version2: multipleSelection.value[1].Number,
                type: "version",
                hiddenNav: true
            } as any
        })
        windowOpenTab(url.href)
    } else {
        ElMessage.error(t("productDetailPage.selectVersionsData"))
    }
}

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
