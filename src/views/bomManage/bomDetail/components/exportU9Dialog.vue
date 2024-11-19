<template>
    <div class="export-u9-dialog">
        <pt-table
            ref="PtTableRef"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :locale="locale"
            row-key="oid"
            border
            stripe
            height="150px"
            :row-class-name="tableRowClassName"
            highlight-current-row
            size="small"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
        >
            <!-- 自定义列模板插槽 -->
            <template #col-systemType="{ row }">
                <div>{{ row.systemType }}</div>
            </template>
        </pt-table>
        <el-form
            class="mt-4"
            ref="u9ErpRef"
            :model="u9ErpForm"
            :rules="rules"
            size="small"
            label-width="150px"
            label-position="right"
            style="height: 100px"
        >
            <el-form-item label="选择导出的BOM类型：" prop="exportBomType">
                <el-select v-model="u9ErpForm.exportBomType" clearable filterable @change="handleExportBomTypeChange">
                    <el-option
                        v-for="item in option_exportBomType"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="选择导出类型：" prop="exportType">
                <el-radio-group v-model="u9ErpForm.exportType" size="small">
                    <el-radio v-for="item in option_exportType" :key="item.id" :value="item.id">{{
                        item.name
                    }}</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div class="mt-4" v-loading="loading">
            <pt-table
                :key="onlyKey"
                ref="PtTableTreeRef"
                row-key="frontEndID"
                :locale="locale"
                :tableColumns="tableTreeColumns"
                :tableEditConfig="tableEditConfig"
                :paginationConfig="paginationConfig"
                :menuConfig="menuConfig"
                :data="tableTreeData"
                :expand-row-keys="expandRowKeys"
                :tree-props="{ children: 'children', hasChildren: 'leaf', checkStrictly: false }"
                :load="load"
                lazy
                border
                highlight-current-row
                size="small"
                height="300px"
                @selection-change="handleTreeSelectionChange"
                @expand-change="handleTreeExpandChange"
            >
                <!-- 自定义列模板插槽 -->
                <template #head-icon="{ column }">
                    <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
                </template>
                <template #col-icon="{ row }">
                    <span class="textHidden">
                        <span>
                            {{ row.icon }}
                        </span>
                    </span>
                </template>
            </pt-table>
        </div>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(u9ErpRef)">导出</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { recursionArray, filterArray } from "@/utils"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getProductPZBom, showRuleDetail } from "@/api/bomManage/productBom"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "exportU9Dialog"
})

const { t, locale } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    topObject: {
        type: Object,
        default: () => ({})
    }
})

console.log("props.topObject: ", props.topObject)

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const option_exportBomType = ref<SelectInterface[]>([])
const option_exportType = ref<SelectInterface[]>([
    {
        id: "1",
        name: "同步物料"
    },
    {
        id: "2",
        name: "同步BOM和物料"
    }
])
const handleRowClick = (row: any) => {
    PtTableRef.value!.toggleRowSelection(row)
}

const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (multipleSelection.value.some((selectedRow) => selectedRow === row)) {
        return "front-checked"
    }
    return "front-not-checked"
}

//#region
// 获取列表
const getList = async () => {
    try {
        const { data } = (await getDictionarySelect({
            codes: "PRODUCTION_ORGANIZATION,RELATION_IMPORT"
        })) as {
            data: any
        }
        tableData.value =
            data.PRODUCTION_ORGANIZATION.map((item: any) => {
                return {
                    ...item,
                    systemType: "U9"
                }
            }) || []

        option_exportBomType.value = data.RELATION_IMPORT.map((item: any) => {
            return { id: item.code, name: item.codeListNameC }
        }).filter((item: any) => item.id.includes("-M"))
    } catch (error: any) {
        console.log(error)
    }
}

getList()

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false
})
//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true,
        reserveSelection: true
    },
    {
        prop: "code",
        label: "组织编码",
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "codeListNameC",
        label: "组织名称",
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "systemType",
        label: "系统类型",
        headerAlign: "center",
        show: true,
        sortable: true,
        slot: "systemType"
    }
])

const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log("multipleSelection.value: ", multipleSelection.value)
}
//#endregion

//#region 表单
const u9ErpRef = ref<FormInstance>()
const u9ErpForm = reactive({
    exportBomType: "SH-M", // 选择导出的BOM类型
    exportType: "" // 选择导出类型
})
const rules = reactive<FormRules>({
    exportBomType: [{ required: true, message: "请选择导出的BOM类型！", trigger: "change" }],
    exportType: [{ required: true, message: "请选择导出类型！", trigger: "change" }]
})
//#endregion

//#region 表格树
const PtTableTreeRef = ref<PtTableComponent>()
const tableTreeData = ref<any[]>([])
const multipleTreeSelection = ref<any[]>([])
let frontEndID = 1 // 唯一id
const onlyKey = ref(1)
const expandRowKeys = ref<any>([])
const topPart = reactive({
    PartOid: "",
    Name: "",
    Number: ""
})
const showRuleForm = reactive({
    sortBy: "",
    sorted: "",
    version: "" // 版本规则
})
const tableTreeColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true,
        reserveSelection: true
    },
    {
        prop: "icon",
        label: computed(() => t("productBomPage.icon")) as any,
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
        slot: "icon"
    }
])

// const tableTreeRowClassName = ({ row }: { row: any; rowIndex: number }) => {
//     // 如果当前行被勾选，返回一个自定义的类名
//     if (multipleTreeSelection.value.some((selectedRow) => selectedRow === row)) {
//         return "front-checked"
//     }
//     return "front-not-checked"
// }

const handleTreeSelectionChange = (val: any[]) => {
    multipleTreeSelection.value = val
    console.log("multipleTreeSelection.value: ", multipleTreeSelection.value)
}
// 展开回调
const handleTreeExpandChange = (row: any, expanded: any) => {
    // console.log(row, expanded, texpandRowKeys.value);
    if (expanded) {
        // 添加id
        expandRowKeys.value.push(row.frontEndID)
    } else {
        // 删除id
        for (let i = 0; i < expandRowKeys.value.length; i++) {
            if (expandRowKeys.value[i] === row.frontEndID) {
                expandRowKeys.value.splice(i, 1)
                return false
            }
        }
    }
}

// 获取显示规则详情
const getShowRuleDetails = async () => {
    try {
        const { data } = (await showRuleDetail({})) as { data: any }
        if (!Object.keys(data).length) return
        console.log("显示规则接口返回是否data: ", data, Object.keys(data).length)
        Object.assign(showRuleForm, {
            sortBy: data.sortBy,
            sorted: data.sorted,
            version: data.versionRule
        })
    } catch (err: any) {
        console.log(err)
    }
}

getShowRuleDetails()

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceTreeData = ref<any[]>([])
const search = () => {
    tableTreeData.value = filterArray(filterValue, sourceTreeData.value)
}
//#endregion

const getTreeList = () => {
    loading.value = true
    tableTreeData.value = []
    expandRowKeys.value = []
    multipleTreeSelection.value = []
    frontEndID = 1
    const params = {
        topPartoid: props.topObject.oid,
        Number: props.topObject.code,
        ProductName: "",
        trimMethod: "",
        hierarchy: "",
        version: showRuleForm.version,
        viewName: u9ErpForm.exportBomType
    }
    getProductPZBom(params)
        .then((data) => {
            console.log("pBom懒加载data: ", data)
            data.data[0].children[0].isTop = true // 顶层系列添加字段
            Object.assign(topPart, {
                PartOid: data.data[0].children[0].PartOid,
                Name: data.data[0].children[0].Name,
                Number: data.data[0].children[0].Number
            })
            const list = formatData(data.data[0].children)
            sourceTreeData.value = list
            refresh()
        })
        .catch((err) => {
            console.log("err", err)
            sourceTreeData.value = []
        })
        .finally(() => (loading.value = false))
}

getTreeList()

// 懒加载物料列表
const load = (tree: any, treeNode?: unknown, resolve?: (date: any) => void) => {
    console.log("load", tree, treeNode)
    loading.value = true
    const params = {
        topPartoid: props.topObject.oid,
        Number: props.topObject.code,
        Name: "",
        PartOid: tree?.PartOid,
        trimMethod: tree?.trimMethod,
        viewName: u9ErpForm.exportBomType
    }
    getProductPZBom(params)
        .then((data: any) => {
            let list = formatData(data.data[0].children, {
                parentOid: tree.PartOid,
                parentFrontEndID: tree.frontEndID
            })
            if (!list.length) list = []
            insertAllTableData(tree.frontEndID, list)
            if (resolve) resolve([])
            search()
        })
        .catch((err: any) => {
            console.log("err", err)
            insertAllTableData(tree.frontEndID, [])
            if (resolve) resolve([])
        })
        .finally(() => (loading.value = false))
}

// 插入最新物料展开数据
const insertAllTableData = (id: any, arr: any) => {
    recursionArray(sourceTreeData.value, (item: any) => {
        if (item.frontEndID === id) {
            item.children = JSON.parse(JSON.stringify(arr))
            item.leaf = false
        }
    })
}

// 格式化返回数据
const formatData = (
    list: any[],
    options?: {
        parentOid: string
        parentFrontEndID: string
    }
) => {
    const arr: any[] = JSON.parse(JSON.stringify(list || []))
    recursionArray(arr, (item: any, i: any, parent) => {
        item.frontEndID = "" + frontEndID++ // 生成唯一id
        // 默认展开行
        if (item.expanded) expandRowKeys.value.push(item.frontEndID)
        // 添加父级oid
        if (options?.parentOid) {
            // 懒加载
            item.parentOid = options?.parentOid
            item.parentFrontEndID = options?.parentFrontEndID
        } else {
            // 首次获取数据
            if (parent) {
                item.parentOid = parent.PartOid
                item.parentFrontEndID = parent.frontEndID
            }
        }
        item.topObjectOid = topPart.PartOid // 添加顶层oid
        item.topObjectNumber = topPart.Number // 添加顶层oid
        item.topObjectName = topPart.Name // 添加顶层name
        item.oldData = {
            // 缓存数据
            isCropping: item.isCropping,
            Amount: item.Amount,
            remark: item.remark,
            location: item.location
        }
        item.icon = `${item.Number} ${item.Name}`
    })
    return arr
}

const refresh = () => {
    Object.keys(filterValue).forEach((key) => (filterValue[key] = ""))
    search()
    nextTick(() => {
        onlyKey.value++
    })
}

// 处理选择导出的BOM类型
const handleExportBomTypeChange = (value: string) => {
    if (!value) return
    Object.assign(u9ErpForm, {
        ...u9ErpForm,
        exportBomType: value
    })
    getTreeList()
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            if (!multipleSelection.value.length) {
                ElMessage({
                    type: "warning",
                    message: "请选择要导入的组织！",
                    center: true,
                    duration: 5000
                })
                return
            }

            if (!multipleTreeSelection.value.length) {
                ElMessage({
                    type: "warning",
                    message: "请选择要导入的物料数据！",
                    center: true,
                    duration: 5000
                })
                return
            }
            const dataFrom = {
                ...u9ErpForm,
                productOrgMultipleData: multipleSelection.value,
                // 当选择导出类型为同步物料（1）时，勾选多少数据传多少数据partOid
                bomTreeMultipleData: multipleTreeSelection.value,
                // 当选择导出类型为同步BOM和物料（2）时，bom必须勾选一条数据，不管勾选哪条只传顶层物料partOid
                topPartOid: tableTreeData.value[0].PartOid
            }
            emits("confirm-success", dataFrom)
        }
    })
}
</script>

<style lang="scss" scoped>
.export-u9-dialogex {
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
