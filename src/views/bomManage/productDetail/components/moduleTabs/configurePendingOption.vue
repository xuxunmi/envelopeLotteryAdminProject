<template>
    <!-- 配置待选项页签 -->
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
            <!-- 自定义列模板插槽 -->
            <template #col-visibility="{ row }">
                <el-checkbox v-model="row.visibility" size="small" />
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
import { useI18n } from "vue-i18n"

defineOptions({
    name: "ConfigurePendingOption"
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

//#endregion
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
        prop: "code",
        label: "编码",
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
        prop: "owner",
        label: "所属者",
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
const tableData = ref<any[]>([
    {
        code: "20200005412",
        name: "三级全自由门架LG0030DE.10",
        owner: "沈镜娣",
        symbol: "LG0030DE.10B"
    },
    {
        code: "20200005405",
        name: "三级全自由门架LG0030DE.10",
        owner: "沈镜娣",
        symbol: "LG0030DE.10B"
    },
    {
        code: "202000054054",
        name: "三级全自由门架LG0030DE.10",
        owner: "沈镜娣",
        symbol: "LG0030DE.10B"
    },
    {
        code: "20200005401",
        name: "三级全自由门架LG0030DE.10",
        owner: "沈镜娣",
        symbol: "LG0030DE.10B"
    },
    {
        code: "20200005453",
        name: "三级全自由门架LG0030DE.10",
        owner: "沈镜娣",
        symbol: "LG0030DE.10B"
    }
])
const multipleSelection = ref<any[]>([])

const handleRowClick = (row: any) => {
    console.log("row-click", row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
}

// 向外暴露方法
defineExpose({})
</script>

<style lang="scss" scoped></style>
