<template>
    <div v-loading="loading" class="sf-container-main-content">
        <div class="sf-search-wrapper">
            <el-form :model="formData" :inline="true" size="small">
                <template v-if="type === 'productListConfigure'">
                    <el-form-item :label="t('productBomPage.seriesName')">
                        <el-select v-model="formData.ProductOid" @change="handleSelectChange" style="width: 210px">
                            <el-option
                                v-for="item in options_name"
                                :key="item.oid"
                                :label="item.name"
                                :value="item.oid"
                            />
                        </el-select>
                    </el-form-item>
                </template>
                <template v-else-if="type === 'productConfigure'">
                    <el-form-item label="产品类型">
                        <el-select
                            v-model="formData.productType"
                            @change="handleProductTypeChange"
                            style="width: 210px"
                        >
                            <el-option
                                v-for="item in multiLevelDictionaryProductTypeList"
                                :key="item.oid"
                                :label="item.name"
                                :value="item.code"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品线">
                        <el-select
                            @change="handleProductLineChange"
                            v-model="formData.productLine"
                            style="width: 210px"
                        >
                            <el-option
                                v-for="item in multiLevelDictionaryProductLineList"
                                :key="item.oid"
                                :label="item.name"
                                :value="item.code"
                            />
                        </el-select>
                    </el-form-item>
                </template>
                <el-form-item>
                    <el-button type="primary" size="small" @click="getList()">刷新</el-button>
                </el-form-item>
                <el-form-item>
                    <template v-if="type === 'productListConfigure' || type === 'productConfigure'">
                        <el-button type="primary" size="small" @click="handleCreateMaterialBtn('add')"
                            >新建物料</el-button
                        >
                    </template>
                    <template v-if="type === 'productConfigure'">
                        <el-button type="primary" :disabled="!chooseRow" @click="goProductConfigure(chooseRow)"
                            >维护配置</el-button
                        >
                        <el-button type="primary" :disabled="!chooseRow" @click="goBomHighEdit(chooseRow)"
                            >BOM高级编辑</el-button
                        >
                    </template>
                    <el-button
                        v-else-if="type === 'productListConfigure'"
                        type="primary"
                        :disabled="!chooseRow"
                        @click="goDetail(chooseRow)"
                        >查看配置</el-button
                    >
                    <el-button
                        v-else-if="type === 'applicationConfigure'"
                        type="primary"
                        :disabled="!chooseRow"
                        @click="goApplicationConfigure(chooseRow)"
                        >应用配置</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
        <div class="sf-table-wrapper">
            <pt-table
                ref="PtTableRef"
                :locale="locale"
                :tableColumns="tableColumns"
                :tableEditConfig="tableEditConfig"
                :paginationConfig="pageData"
                :menuConfig="menuConfig"
                :data="tableData"
                border
                highlight-current-row
                size="small"
                @page-current-change="handleCurrentChange"
                @page-size-change="handleSizeChange"
                @row-click="handleRowClick"
                @row-dblclick="handleRowDblclick"
            >
                <!-- 表格编辑插槽 -->
                <template #slot-edit>
                    <span class="table-edit" />
                </template>
                <!-- 自定义列模板插槽 -->
                <template #head-search="{ column }">
                    <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
                </template>
                <!-- <template #col-materialType="{ row }">
                    <div>{{ getNameById(materielTypeList, row.materialType) }}</div>
                </template> -->
                <template #col-operate="{ row }">
                    <template v-if="type === 'productConfigure'">
                        <el-button type="primary" link @click="goProductConfigure(row)">维护配置</el-button>
                        <el-button type="primary" link @click="goBomHighEdit(row)">BOM高级编辑</el-button>
                    </template>
                    <el-button v-else-if="type === 'productListConfigure'" type="primary" link @click="goDetail(row)"
                        >查看配置</el-button
                    >
                    <el-button
                        v-else-if="type === 'applicationConfigure'"
                        type="primary"
                        link
                        @click="goApplicationConfigure(row)"
                        >应用配置</el-button
                    >
                </template>
                <!-- 右键菜单 -->
                <template #slot-menu="{ row }">
                    <li @click="goAdd()">{{ t("productBomPage.addProduct") }}</li>
                    <li @click="goEdit(row)">{{ t("productBomPage.editProduct") }}</li>
                </template>
            </pt-table>
        </div>

        <!-- 新建物料弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.part" :footer="false" width="90%">
            <creatPartDialog
                v-if="dialogVisible.part"
                v-model:visible="dialogVisible.part"
                :dialogType="dialogType"
                :defaultPartType="defaultPartType"
                @confirmSuccess="handleConfirmSuccess_part"
            />
        </dialogFrame>
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
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { productList } from "@/api/productLibrary"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import creatPartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import { filterArray, resetFilterValue, recursionArray } from "@/utils"
import { getNameById } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { advancedSearchPart } from "@/api/productMange/materielQuery"
import { multiLevelDictionaryData } from "@/api/system/multiLevelDictionary"
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    /**
     * 页面类型
     * productConfigure：维护配置； applicationConfigure：应用配置； productListConfigure：查看配置；choose：常备库存选配
     * @default ''
     */
    type: {
        type: String,
        default: ""
    }
})
const emits = defineEmits(["handleProductClick", "handleProductDblclick"])
const router = useRouter()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const formData = reactive({
    ProductOid: "", // 组织名称
    productType: "", // 产品类型
    productLine: "" // 产品线
})
const options_name = ref<any>([])
const handleSelectChange = (val: string) => {
    // 页面不等于维护配置
    if (props.type !== "productConfigure") {
        getList()
    }
}
// 获取组织名称列表
const getSelect = () => {
    loading.value = true
    productList()
        .then((data) => {
            console.log(data)
            options_name.value = data.data || []
            if (options_name.value[0]) {
                formData.ProductOid = options_name.value[0].oid
                handleSelectChange(formData.ProductOid)
            } else {
                // 没有组织时请求全部数据
                // 页面不等于维护配置
                if (props.type !== "productConfigure") {
                    getList()
                }
            }
        })
        .catch(() => (loading.value = false))
}

// 获取产品类型列表
const multiLevelDictionaryProductTypeList = ref<any>([]) // 产品类型列表
const multiLevelDictionaryProductLineList = ref<any>([]) // 产品线列表
const getMultiLevelDictionaryType = async () => {
    try {
        loading.value = true
        const params = {
            status: 1
        }
        const { data } = (await multiLevelDictionaryData(params)) as any
        multiLevelDictionaryProductTypeList.value = data
        if (multiLevelDictionaryProductTypeList.value[0]) {
            formData.productType = multiLevelDictionaryProductTypeList.value[0].code
            handleProductTypeChange(formData.productType)
        }
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

// 页面类型为：查看配置 / 常备库存
if (props.type === "productListConfigure" || props.type === "choose") {
    getSelect()
}

// 页面类型为：维护配置
if (props.type === "productConfigure") {
    getMultiLevelDictionaryType()
}

// 处理产品类型选择获取产品线列表
const handleProductTypeChange = (val: string) => {
    formData.productLine = ""
    multiLevelDictionaryProductLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductLineList.value = item.children
        }
    })
    getList()
}

// 处理产品线选择
const handleProductLineChange = (val: string) => {
    getList()
}
//#endregion

//#region 下拉数据
// const materielTypeList = ref<SelectInterface[]>([])
// const getSelectData = async () => {
//     try {
//         const { data } = (await getDictionarySelect({ codes: "MATERIAL_TYPE" })) as { data: any }
//         materielTypeList.value =
//             data.MATERIAL_TYPE.map((item: any) => {
//                 return {
//                     id: item.code,
//                     name: item.codeListNameC
//                 }
//             }) || []
//     } catch (error: any) {
//         console.log(error)
//     }
// }
// getSelectData()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const sortParams = reactive({
    sortBy: "",
    sorted: ""
})

//#region 增、删、改、查
const getList = (id?: string) => {
    loading.value = true
    chooseRow.value = null
    const params: {
        sortBy: string
        sorted: string
        pageNo: number
        pageSize: number
        types: string[]
        containers: string[]
        conditions: Array<{ key: string; type: string; symbol: string; value: string }>
    } = {
        ...sortParams,
        pageNo: pageData.currentPage,
        pageSize: pageData.pageSize,
        types: ["wt.part.WTPart"],
        containers: [],
        conditions: [
            {
                key: "endItem",
                type: "",
                symbol: "等于",
                value: "true"
            }
        ]
    }
    // 页面类型为：查看配置
    if (props.type === "productListConfigure") {
        if (formData.ProductOid) {
            params.containers.push(formData.ProductOid)
        }
    }
    // 页面类型为：维护配置
    if (props.type === "productConfigure") {
        const newParams = [
            {
                key: "productType",
                type: "",
                symbol: "等于",
                value: formData.productType
            },
            {
                key: "productLineChild",
                type: "",
                symbol: "等于",
                value: formData.productLine
            }
        ]
        params.conditions.push(...newParams)
    }
    advancedSearchPart(params)
        .then((data) => {
            pageData.total = data.data.total
            sourceData.value = data.data.content || []
            // 格式化数据
            sourceData.value.forEach((ele) => {
                Object.assign(ele, {
                    PartOid: ele.oid,
                    Number: ele.number,
                    Name: ele.name
                })
            })
            resetFilterValue(filterValue)
            search()
            // 默认选中
            if (id) {
                tableData.value.forEach((ele) => {
                    if (ele.PartOid === id) {
                        setCurrent(ele)
                        handleRowClick(ele)
                    }
                })
            }
        })
        .finally(() => (loading.value = false))
}
// 查看配置
const goDetail = (row: any) => {
    router.push({
        path: `/configuration/productionConfigurationDetail/${row.PartOid}/${row.Number}`,
        query: {
            tagTitle: `查看配置(${row.Number})`
        }
    })
}
// 维护配置
const goProductConfigure = (row: any) => {
    router.push({
        path: `/configuration/productionConfiguration/${row.PartOid}/${row.Number}`,
        query: {
            tagTitle: `维护配置(${row.Number})`
        }
    })
}
// BOM高级编辑
const goBomHighEdit = (row: any) => {
    router.push({
        path: `/bomManage/bomHighEdit/${row.PartOid}`,
        query: {
            oid: row.PartOid,
            number: row.Number,
            tagTitle: `BOM高级编辑(${row.Number})`
        }
    })
}
// 应用配置
const goApplicationConfigure = (row: any) => {
    router.push({
        path: `/configuration/applicationConfiguration/${row.PartOid}/${row.Number}`,
        query: {
            tagTitle: `应用配置(${row.Number})`
        }
    })
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    chooseRow.value = row
    emits("handleProductClick", row)
}
const handleRowDblclick = (row: any, column?: any, event?: any) => {
    console.log("row-dblclick", row)
    emits("handleProductDblclick", row)
    if (props.type === "productConfigure") {
        router.push({
            path: `/configuration/productionConfigurationDetail/${row.PartOid}/${row.Number}`,
            query: {
                tagTitle: `查看配置(${row.Number})`
            }
        })
    }
}
// const handleSortChange = (data: { column: any; prop: string; order: any }) => {
//     console.log("handleSortChange", data)
//     sortParams.sortBy = data.prop
//     if (data.prop == "type") {
//         return
//     }
//     switch (data.order) {
//         case "descending":
//             sortParams.sorted = "DESC"
//             break
//         case "ascending":
//             sortParams.sorted = "ASC"
//             break

//         default:
//             sortParams.sorted = ""
//             break
//     }
//     getList()
// }
// 事件
const setCurrent = (row?: any) => {
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    show: false,
    colSetShow: true,
    size: "small"
})
//#endregion

//#region 表格列
// 列是否禁用
const tableColumnsDisabled = (column?: string) => {
    if (
        props.type === "choose" ||
        props.type === "productConfigure" ||
        props.type === "applicationConfigure" ||
        props.type === "productListConfigure"
    ) {
        if (props.type === "choose" && column === "operate") {
            return true
        }
        return false
    } else {
        return true
    }
}
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "index",
        label: "序号",
        width: "55",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
    {
        prop: "type",
        label: computed(() => t("materielPage.materialType")) as any,
        width: "120",
        minWidth: "70",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        disabled: tableColumnsDisabled(),
        sortable: true
    },
    {
        prop: "number",
        label: computed(() => t("productBomPage.ProductCode")) as any,
        width: "150",
        minWidth: "100",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
        sortable: true
    },
    {
        prop: "materialSymbol",
        label: computed(() => t("materielPage.symbol")) as any,
        width: "180",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
        disabled: tableColumnsDisabled(),
        sortable: true
    },
    {
        prop: "name",
        label: computed(() => t("productBomPage.ProductName")) as any,
        width: "180",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
        sortable: true
    },
    {
        prop: "material",
        label: computed(() => t("materielPage.material")) as any,
        width: "120",
        minWidth: "70",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "processRoute",
        label: computed(() => t("materielPage.processRoute")) as any,
        width: "180",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "partCategory",
        label: computed(() => t("materielPage.partType")) as any,
        width: "110",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "parentNumber",
        label: computed(() => t("materielPage.parentCode")) as any,
        width: "150",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "jgyyParentNumber",
        label: computed(() => t("materielPage.jgyyParentCode")) as any,
        width: "160",
        minWidth: "145",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "desc",
        label: computed(() => t("materielPage.description")) as any,
        width: "180",
        minWidth: "70",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "machineModel",
        label: computed(() => t("materielPage.machineModel")) as any,
        width: "120",
        minWidth: "85",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "state.state",
        label: computed(() => t("materielPage.lifeCycle")) as any,
        width: "110",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "ownerGroup",
        label: computed(() => t("materielPage.versionOwnerUserGroup")) as any,
        width: "190",
        minWidth: "145",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "plmOwner",
        label: computed(() => t("materielPage.owner")) as any,
        width: "120",
        minWidth: "85",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "updater",
        label: computed(() => t("materielPage.updateAt")) as any,
        width: "120",
        minWidth: "85",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "updateTime",
        label: computed(() => t("materielPage.updateTime")) as any,
        width: "160",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "checkoutor",
        label: computed(() => t("materielPage.checkoutBy")) as any,
        width: "120",
        minWidth: "85",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "checkoutTime",
        label: computed(() => t("materielPage.checkoutTime")) as any,
        width: "160",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "typeNumber",
        label: computed(() => t("materielPage.typeCode")) as any,
        width: "150",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "version",
        label: computed(() => t("materielPage.version")) as any,
        width: "90",
        minWidth: "70",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    },
    {
        prop: "trimMethod",
        label: "裁剪方式",
        width: "140",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "oid",
        label: computed(() => t("materielPage.identification")) as any,
        width: "180",
        minWidth: "95",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        sortable: true,
        disabled: tableColumnsDisabled()
    }
    // {
    //     label: "操作",
    //     width: computed(() => {
    //         if (props.type === "productConfigure") {
    //             return "190"
    //         } else if (props.type === "productListConfigure") {
    //             return "90"
    //         } else if (props.type === "applicationConfigure") {
    //             return "90"
    //         }
    //     }) as any,
    //     fixed: "right",
    //     headerAlign: "center",
    //     showOverflowTooltip: true,
    //     show: true,
    //     slot: "operate",
    //     disabled: tableColumnsDisabled("operate")
    // }
])
//#endregion

//#region 头部操作按钮
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
const defaultPartType = ref<string>("物料") // 页面类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    part: false // 新建物料对话框
})

const handleCreateMaterialBtn = (type: string) => {
    dialogTitle.value = t("materielPage.createMaterial")
    dialogType.value = type
    dialogVisible.part = true
}

// 关闭物料弹窗
const handleConfirmSuccess_part = async () => {
    dialogVisible.part = false
    getList()
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], () => {
    getList()
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
const goAdd = () => {
    console.log("新建")
}
const goEdit = (row: any) => {
    console.log("编辑", row)
}
//#endregion

//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

defineExpose({
    getList
})
</script>

<style lang="scss" scoped>
.sf-container-main-content {
    .sf-search-wrapper {
        :deep(.el-form) {
            .el-form-item .el-input {
                width: 50%;
            }
        }
    }
}
</style>
