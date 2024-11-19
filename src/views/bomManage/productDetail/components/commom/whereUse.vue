<template>
    <!-- 何处使用页签 -->
    <div class="productList" v-loading="loading">
        <pt-table
            ref="PtTableRef"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :locale="locale"
            :height="tableHeight"
            row-key="partOid"
            border
            lazy
            :load="load"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-form :model="searchForm" :inline="true" size="small" @submit.prevent>
                        <el-form-item label="多列表切换：">
                            <el-select style="width: 180px" clearable filterable v-model="searchForm.ownerGroup">
                                <el-option
                                    v-for="item in multilistToggleList"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="组织名称：">
                            <el-select
                                style="width: 180px"
                                clearable
                                filterable
                                v-model="searchForm.organizationName"
                                @change="getList"
                            >
                                <el-option
                                    v-for="item in organizationList"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size="small" @click="getList">刷新</el-button>
                        </el-form-item>
                    </el-form>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #head-search="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #head-type="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #head-number="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #col-type="{ row }">
                <div>{{ row.type }}</div>
            </template>
            <template #col-number="{ row }">
                <div>{{ row.number }}</div>
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
import { SelectInterface } from "@/interface/common"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import { whereUseLazyData } from "@/api/productDetail"
import { filterArray } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "WhereUse"
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

// console.log("何处使用data", props.data)
const router = useRouter()
const loading = ref(false)
//#endregion

//#region 表格相关
// 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        label: "序号",
        type: "index",
        width: "50",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "type",
        type: "index",
        label: "类型",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "type",
        sortable: true
    },
    {
        prop: "number",
        type: "index",
        label: "编码",
        width: "120",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "number",
        sortable: true
    },
    {
        prop: "name",
        label: "名称",
        width: "240",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "Ver",
        label: "版本",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "Iter",
        label: "最新版次",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "state",
        label: "生命周期",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        slot: "search"
    },
    {
        prop: "owner",
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
        headerAlign: "center",
        width: "180",
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

const load = async (row: any, treeNode: unknown, resolve: (date: any[]) => void) => {
    console.log("row: ", row)
    try {
        loading.value = true
        const params: {
            partOid: string // 物料oid
            containerName?: string // 组织名称
        } = {
            partOid: row.partOid,
            containerName: searchForm.organizationName
        }
        const res = await whereUseLazyData(params)
        loading.value = false
        const data = res.data.map((item: any) => {
            return {
                ...item,
                partOid: item.partOid,
                hasChildren: true
            }
        })
        resolve(data)
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}

const handleRowClick = (row: any) => {
    console.log("row-click", row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
}
//#endregion

//#region 表单
// 多列表切换
const multilistToggleList = ref<any>([])
const organizationList = ref<SelectInterface[]>([]) // 组织列表
const searchForm = reactive({
    ownerGroup: "", // 多表切换
    organizationName: "" // 组织名称
})
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

// 获取组织列表
const getOrganizationList = async () => {
    try {
        const params = {
            page: "1",
            limit: "99999"
        }
        const { data } = await getOrganizationManageData(params)
        organizationList.value =
            data.map((item: { productOid: string; name: string }) => {
                return {
                    id: item.name,
                    name: item.name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    }
}

getOrganizationList()

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string // 物料oid
            containerName?: string // 组织名称
        } = {
            partOid: props.data.oid,
            containerName: searchForm.organizationName
        }
        const { data } = (await whereUseLazyData(params)) as any
        sourceData.value = data.map((item: any) => {
            return {
                ...item,
                partOid: item.partOid,
                hasChildren: true
            }
        })
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
        const otherHeight = 55
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
