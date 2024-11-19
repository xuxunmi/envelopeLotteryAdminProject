<template>
    <!-- 上海整机PBOM页签 -->
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
            :row-class-name="tableRowClassName"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" @click="getList">刷新</el-button>
                    <el-button type="primary" size="small" @click="goCropping">BOM裁剪</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        @click="handleSyncU9Btn"
                        :disabled="!multipleSelection.length"
                        >导出到U9</el-button
                    >
                    <el-button type="primary" size="small" @click="goBOMCompare">BOM比较</el-button>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #col-isVirtual="{ row }">
                <!-- <el-checkbox v-model="row.isVirtual" size="small" /> -->
            </template>
            <template #col-isCropping="{ row, index }">
                <el-checkbox
                    v-model="row.isCropping"
                    label=""
                    true-value="是"
                    false-value="否"
                    size="small"
                    :disabled="!row.isCroppingCanEdit"
                    @click.stop
                />
            </template>
            <!-- 自定义列模板插槽 -->
            <template #head-search="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
        </pt-table>

        <!-- BOM比较设置 - 弹窗 -->
        <BomCompareSetDialog
            v-if="bomCompareSetDialog.visible"
            :dialog="bomCompareSetDialog"
            @handleEditSuccess="handleEditSuccess_compareSet"
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
import { useRouter } from "vue-router"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { getAllChild, pbomToMBOM } from "@/api/bomManage/productBom"
import BomCompareSetDialog from "@/views/bomManage/bomCompare/components/bomCompareSetDialog.vue"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { pbomSyncU9 } from "@/api/productMange/materiel"
import { filterArray } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "CompleteMachinePBom"
})
const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            oid: "",
            type: ""
        })
    },
    objectRow: {
        type: Object,
        default: {}
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
const multipleSelection = ref<any[]>([])

//#region 增、删、改、查
const getList = () => {
    console.log("getList", props.objectRow)
    const params = {
        partOid: props.objectRow.oid
    }
    multipleSelection.value = []
    loading.value = true
    getAllChild(params)
        .then((data: any) => {
            sourceData.value = data.data || []
            search()
        })
        .finally(() => (loading.value = false))
}
getList()
// BOM裁剪
const goCropping = () => {
    loading.value = true
    pbomToMBOM({ oid: props.objectRow.oid })
        .then((data) => {
            ElMessage.success("裁剪成功！")
        })
        .finally(() => (loading.value = false))
}
//#endregion

//#region 导出到U9
const handleSyncU9Btn = async () => {
    try {
        loading.value = true
        const partOids = multipleSelection.value.map((item) => item.partOid).join(",")
        const params: {
            partOids: string
        } = {
            partOids
        }
        const { message } = (await pbomSyncU9(params)) as any
        ElMessage({
            type: "success",
            message: "导出到U9成功！",
            center: true
        })
        getList()
    } catch (error) {
        console.log(error)
        loading.value = false
    }
}
//#endregion

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
        prop: "isCropping",
        label: "是否裁剪",
        width: "90",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "isCropping"
    },
    {
        prop: "type",
        label: "零件类型",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "number",
        label: "编码",
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "materialSymbol",
        label: "代号",
        headerAlign: "center",
        width: "180",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "name",
        label: "名称",
        headerAlign: "center",
        width: "200",
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
        prop: "workstation",
        label: "工位",
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
        width: "90",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "checkOuter",
        label: "版本检出人",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "owner",
        label: "版本所有者",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
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
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "weight",
        label: "单件净重",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "hasCondition",
        label: "是否有条件",
        width: 120,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "bomType",
        label: "U9中BOM类型",
        headerAlign: "center",
        width: 120,
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "toMoid",
        label: "To端Moid",
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
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "createTime",
        label: "创建时间",
        width: 160,
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

const handleRowClick = (row: any) => {
    console.log("row-click", row)
    const isSelected = multipleSelection.value.some((selectedRow) => selectedRow === row)
    // console.log(isSelected)
    if (isSelected) {
        PtTableRef.value!.toggleRowSelection(row, false)
    } else {
        PtTableRef.value!.toggleRowSelection(row, true)
    }
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log("multipleSelection.value: ", multipleSelection.value)
}
const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (multipleSelection.value.some((selectedRow) => selectedRow === row)) {
        return "front-checked"
    }
    return "front-not-checked"
}
//#endregion

//#region BOM比较设置 - 弹窗
const bomCompareSetDialog = reactive<any>({
    visible: false,
    title: "BOM比较设置",
    material1: null,
    material2: null
})
// 格式化物料
const formatData_material = (material: any) => {
    const versionArr = material.version?.split(".")
    return {
        oid: material.partOid,
        number: material.number,
        name: material.name,
        typeName: material.type,
        version: versionArr[0] || "",
        iteration: versionArr[1] || ""
    }
}
// BOM比较
const goBOMCompare = () => {
    let material1, material2
    if (multipleSelection.value.length === 1) {
        material1 = formatData_material(multipleSelection.value[0])
        material2 = formatData_material(multipleSelection.value[0])
    } else if (multipleSelection.value.length === 2) {
        material1 = formatData_material(multipleSelection.value[0])
        material2 = formatData_material(multipleSelection.value[1])
    } else {
        ElMessage.warning("请选择一个或两个物料！")
        return false
    }
    Object.assign(bomCompareSetDialog, {
        visible: true,
        material1,
        material2
    })
}
// BOM比较设置回调
const handleEditSuccess_compareSet = () => {
    console.log("handleEditSuccess_compareSet")
    Object.assign(bomCompareSetDialog, {
        visible: false,
        material1: null,
        material2: null
    })
}
//#endregion

//#region 字典数据
const option_type = ref<any[]>([]) // 物料类型
getDictionarySelect({ codes: "MATERIAL_TYPE" }).then((data) => {
    option_type.value = data.data.MATERIAL_TYPE || []
})
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

<style lang="scss" scoped>
.productList {
    :deep(.pt-table) {
        .front-checked {
            td.el-table__cell {
                background-color: #f9e2d0 !important;
            }
        }
        .front-not-checked {
            td.el-table__cell {
                background-color: transparent !important;
            }
            td.el-table-fixed-column--left {
                background-color: #fff !important;
            }
        }
    }
}
</style>
