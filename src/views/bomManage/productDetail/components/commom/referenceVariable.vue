<template>
    <!-- 引用变量页签 -->
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
import { windowOpenTab } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "ReferenceVariable"
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
        prop: "cloneVariableCode",
        label: "克隆变量编码",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "variableName",
        label: "变量名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "versionCreateTime",
        label: "版本创建时间",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "visibility",
        label: "可见性",
        slot: "visibility",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "defaultValue",
        label: "默认值",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "allowValue",
        label: "允许值",
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
//#endregion

// 向外暴露方法
defineExpose({})
</script>

<style lang="scss" scoped></style>
