<template>
    <!-- 附件页签 -->
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
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" @click="handleBrowseBtn">浏览</el-button>
                    <el-button type="primary" size="small" @click="handleBrowseBtn">下载</el-button>
                    <el-button type="primary" size="small" @click="handleBrowseBtn">比较</el-button>
                    <el-button type="primary" size="small" @click="handleBrowseBtn">离线浏览</el-button>
                    <el-button type="primary" size="small" @click="handleBrowseBtn">批注</el-button>
                    <el-button type="primary" size="small" @click="handleBrowseBtn">浏览历史批注</el-button>
                </span>
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
import { getPartHistoryRecord, getDocumentHistoryRecord } from "@/api/bomManage/productDetail/index"
import { useRouter } from "vue-router"
import { windowOpenTab } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "Attachment"
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
        type: "selection",
        width: "32",
        headerAlign: "center",
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
        prop: "type",
        label: "类型",
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
        prop: "createAt",
        label: "创建者",
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
        prop: "bomType",
        label: "BOM类型",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "versionOwnerUserGroup",
        label: "版本所有者用户组",
        width: 140,
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
        prop: "storageLocation",
        label: "存储位置",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "fileFormat",
        label: "文件格式",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "tovoid",
        label: "tovoid",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "fileName",
        label: "物理文件名称",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "version",
        label: computed(() => t("productDetailPage.version")) as any,
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

// 版本比较
const handleBrowseBtn = () => {
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
//#endregion

// 向外暴露方法
defineExpose({})
</script>

<style lang="scss" scoped></style>
