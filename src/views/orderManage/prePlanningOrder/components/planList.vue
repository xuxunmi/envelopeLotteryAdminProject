<template>
    <div v-loading="loading" class="planList">
        <template v-if="from === 'order'">
            <div v-if="type === 'chooseRows'" class="fromWrapper">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small">
                    <el-form-item label="方案编码">
                        <el-input
                            v-model="searchForm.schemeCode"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="方案名称">
                        <el-input
                            v-model="searchForm.schemeName"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="系列配置号">
                        <el-input v-model="searchForm.partNum" placeholder="请输入" clearable @keyup.enter="getList" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getList">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <template v-else-if="from === 'general'">
            <div class="fromWrapper">
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small">
                    <el-form-item label="订单类型">
                        <el-select v-model="searchForm.orderType" clearable>
                            <el-option
                                v-for="item in orderTypeList_general"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="系列车型">
                        <el-select v-model="searchForm.partOid" filterable clearable>
                            <el-option
                                v-for="item in seriesModelsList"
                                :key="item.PartOid"
                                :label="item.Name"
                                :value="item.PartOid"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="品名">
                        <el-input
                            v-model="searchForm.productName"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item label="配置方案编码">
                        <el-input
                            v-model="searchForm.schemeCode"
                            placeholder="请输入"
                            clearable
                            @keyup.enter="getList"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getList">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>
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
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
            @page-current-change="handleCurrentChange"
            @page-size-change="handleSizeChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span v-if="canEdit" class="table-edit">
                    <el-button type="primary" size="small" @click="goChoose_series">选配添加</el-button>
                    <el-button type="primary" size="small" @click="goInsetPlan">查找添加</el-button>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <!-- <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template> -->
            <template #col-preparePlanType="{ row }">
                <span
                    v-text="
                        getNameById(option_prePlanType, row.preparePlanType, {
                            value: 'code',
                            label: 'codeListNameC'
                        })
                    "
                />
            </template>
            <template #col-quantity="{ row }">
                <el-input-number
                    v-model="row.num"
                    :min="0"
                    size="small"
                    controls-position="right"
                    style="width: auto"
                />
            </template>
            <template #col-group="{ row }">
                <template v-if="canEdit">
                    <el-select :loading="loading_group" v-model="row.productionOrganization" size="small">
                        <el-option
                            v-for="item in options_group"
                            :key="item.code"
                            :label="item.codeListNameC"
                            :value="item.code"
                        />
                    </el-select>
                </template>
                <template v-else>
                    <span
                        v-text="
                            getNameById(options_group, row.productionOrganization + '', {
                                value: 'code',
                                label: 'codeListNameC'
                            })
                        "
                    />
                </template>
            </template>
            <template #col-time="{ row }">
                <template v-if="canEdit">
                    <el-date-picker
                        v-model="row.planReachDate"
                        type="date"
                        size="small"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: auto"
                    />
                </template>
                <template v-else>
                    <span>{{ row.planReachDate }}</span>
                </template>
            </template>
            <template #col-orderType="{ row }">
                <span
                    v-text="
                        getNameById(options_orderType, row.orderType + '', {
                            value: 'code',
                            label: 'codeListNameC'
                        })
                    "
                />
            </template>
            <template #col-exampleBomStatus="{ row }">
                <span
                    v-text="
                        getNameById(options_exampleBomStatus, row.exampleBomStatus + '', {
                            value: 'code',
                            label: 'codeListNameC'
                        })
                    "
                />
            </template>
            <template #col-remark="{ row }">
                <el-input v-model="row.remark" clearable size="small" />
            </template>
            <template #col-operate="{ index }">
                <el-button type="primary" link @click="goDel(index)">删除</el-button>
            </template>
        </pt-table>

        <!-- 选择系列 - 弹窗 -->
        <ChooseSeriesDialog
            v-if="chooseSeriesDialog.visible"
            :dialog="chooseSeriesDialog"
            @handleEditSuccess="handleEditSuccess_series"
        />
        <!-- 编辑配置 - 弹窗 -->
        <EditAllocationDialog
            v-if="editAllocationDialog.visible"
            :dialog="editAllocationDialog"
            @handleEditSuccess="handleEditSuccess_allocation"
        />
        <!-- 查找添加 - 弹窗 -->
        <InsertPlanningDialog
            v-if="insertPlanningDialog.visible"
            :dialog="insertPlanningDialog"
            @handleEditSuccess="handleEditSuccess_insert"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance, computed } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import ChooseSeriesDialog from "./chooseSeriesDialog.vue"
import EditAllocationDialog from "./editAllocationDialog.vue"
import InsertPlanningDialog from "./insertPlanningDialog.vue"
import { schedulePage } from "@/api/orderManage/prePlanningOrder"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { sysGeneralMangerSchedulePage } from "@/api/orderManage/generalProductLibrary"
import { productList } from "@/api/productLibrary"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { getSchemeCode, getShortNameList } from "@/api/configureManage/defineBasicTypes"
import { getNameById } from "@/assets/common/select-list"
import { usePagination } from "@/hooks/usePagination"
import { equalsArray } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    /**
     * 类型（add、detail、saveAs、chooseRows）
     */
    type: {
        type: String,
        default: ""
    },
    /**
     * 默认到货日期
     */
    defaultTime: {
        type: String,
        default: ""
    },
    /**
     * 页面（general：通用产品库；order：预计划选配）
     */
    from: {
        type: String,
        default: "order"
    }
})
const emits = defineEmits(["partRefresh"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)

const canEdit = computed(() => props.type === "add" || props.type === "saveAs")
//#endregion

//#region 表单
const searchForm = reactive({
    schemeCode: "", // 方案编码
    schemeName: "", // 方案名称
    partNum: "", // 系列配置号
    orderType: "", // 订单类型
    partOid: "", // 系列车型
    productName: "" // 品名
})
const orderTypeList_general = ref([
    {
        id: 2,
        name: "常规订单"
    },
    {
        id: 3,
        name: "特殊订单"
    },
    {
        id: 4,
        name: "在库订单"
    }
])
// 系列车型下拉列表
const seriesModelsList = ref<any[]>([])
const getSelect_product = () => {
    loading.value = true
    productList()
        .then((data) => {
            console.log("productList", data)
            if (data.data[0]) {
                const ProductName = data.data[0].name
                getProductTopBom({ ProductName })
                    .then((data2) => {
                        console.log("getProductTopBom", data2)
                        seriesModelsList.value = data2.data || []
                    })
                    .finally(() => (loading.value = false))
            }
        })
        .catch(() => (loading.value = false))
}
if (props.from === "general") getSelect_product()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const chooseRow = ref()

//#region 增、删、改、查
// 获取列表
const getList = () => {
    console.log("getList", props)
    const params = {
        ...searchForm,
        pageNo: pageData.currentPage,
        pageSize: pageData.pageSize
    }
    switch (props.from) {
        case "order":
            loading.value = true
            schedulePage(params)
                .then((data) => {
                    tableData.value = data.data.list
                    pageData.total = data.data.total
                })
                .finally(() => (loading.value = false))
            break
        case "general":
            loading.value = true
            sysGeneralMangerSchedulePage(params)
                .then((data) => {
                    tableData.value = data.data.list
                    pageData.total = data.data.total
                })
                .finally(() => (loading.value = false))
            break
    }
}
// 初始化列表
const initList = (list: any[]) => {
    tableData.value = list
}
// 添加
const goAdd_allocation = (data: any) => {
    console.log("goAdd_allocation", data)
    loading.value = true
    editAllocationDialog.loading = true
    const row = JSON.parse(JSON.stringify(data))
    // 格式化配置清单
    const arr: string[] = []
    if (row.optionList && row.optionList.length) {
        row.optionList.forEach((option: any) => {
            if (option.checkChoiceOid) {
                const find = option.choice.find((choice: any) => option.checkChoiceOid === choice.oid)
                const str = `${option.name}：${find.name}；`
                arr.push(str)
            }
        })
    }
    row.configureList = arr
    row.configure = arr.join("")
    initDefaultData(row)
    // 初始化方案名称和方案编码
    const optionList = row.optionList || []
    const params_name = {
        // 初始化品名和方案名称参数
        sfinpartId: row.materialNum,
        optionalItem: [] as any[]
    }
    // const params_code = {
    //     // 初始化编码参数
    //     oid: row.materialOid,
    //     orderType: "5",
    //     choiceInfos: [] as any
    // }
    optionList.forEach((option: any) => {
        if (option.checkChoiceOid && option.checkChoiceName) {
            // 初始化品名和方案名称参数
            //if (option.checkChoiceOid) {
            params_name.optionalItem.push({
                optional: option.name,
                value: option.checkChoiceName
            })
            //}
            // 初始化编码参数
            // params_code.choiceInfos.push({
            //     optionOid: option.oid,
            //     choiceOid: option.checkChoiceOid
            // })
        }
    })
    const initName = getShortNameList(params_name)
    const initCode = getSchemeCode({
      ...params_name,
      orderType: "5",
    })
    Promise.all([initName, initCode])
        .then((data) => {
            // formData.productName = `${data[1].data.modelNumber}-${data[0].data}`
            const preparePlanTypeName = getNameById(option_prePlanType.value, row.preparePlanType, {
                value: "code",
                label: "codeListNameC"
            })
            // 方案编码
            row.schemeCode = `${data[1].data.serialNumber}-${data[1].data.date}-${data[1].data.streamNumber}`
            // 方案名称
            row.schemeName = row.productName = `${data[1].data.modelNumber}-${preparePlanTypeName}-${data[0].data}`
            if (row.schemeCode) addData(row)
        })
        .finally(() => {
            loading.value = false
            editAllocationDialog.loading = false
        })
}
// 删除
const goDel = (index: number) => {
    ElMessageBox.confirm("是否删除该方案？", t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        tableData.value.splice(index, 1)
    })
}
// 初始化默认值
const initDefaultData = (obj: any) => {
    obj.num = 1 // 默认数量
    obj.planReachDate = props.defaultTime // 计划到货日期默认值为默认到货日期
}
// 列表插入数据
const addData = (row: any) => {
    if (!row.configure) {
        ElMessage.error("选配项为空！")
        return false
    }
    // 判断当前预计划中是否有相同的选配项
    if (row.isExist) {
        // 已有方案
        row.configureList = row.configure?.split("; ") || []
    }
    row.configureList = row.configureList.filter((item: string) => item)
    for (let i = 0; i < tableData.value.length; i++) {
        const ele = tableData.value[i]
        const flag = equalsArray(ele.configureList, row.configureList)
        if (flag) {
            ElMessage.error("存在相同的选配项！")
            return false
        }
    }
    tableData.value.push(row)
    return true
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
    PtTableRef.value!.toggleRowSelection(row)
}
const handleSelectionChange = (val: any[]) => {
    console.log("handleSelectionChange", val)
    multipleSelection.value = val
}
// 事件
const setCurrent = (row?: any) => {
    chooseRow.value = row
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true,
    show: props.type !== "chooseRows"
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([])
switch (props.from) {
    case "order":
        tableColumns.value = [
            {
                type: "selection",
                width: "32",
                show: true,
                disabled: props.type !== "chooseRows"
            },
            {
                label: "序号",
                type: "index",
                width: "50",
                headerAlign: "center",
                show: true
            },
            {
                prop: "schemeCode",
                label: "方案编码",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "schemeName",
                label: "方案名称",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "partName",
                label: "系列名称",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "partNum",
                label: "系列编码",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "preparePlanType",
                label: "预计划分类",
                headerAlign: "center",
                width: "100",
                // showOverflowTooltip: true,
                show: true,
                slot: "preparePlanType"
            },
            {
                prop: "num",
                label: "数量",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: canEdit.value ? "quantity" : "",
                disabled: props.type === "chooseRows"
            },
            {
                prop: "productionOrganization",
                label: "生产组织",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "group",
                disabled: props.type === "chooseRows"
            },
            {
                prop: "planReachDate",
                label: "计划到货日期",
                headerAlign: "center",
                width: "140",
                // showOverflowTooltip: true,
                show: true,
                slot: canEdit.value ? "time" : "",
                disabled: props.type === "chooseRows"
            },
            {
                prop: "configure",
                label: "配置清单",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "remark",
                label: "备注",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: canEdit.value ? "remark" : ""
            },
            {
                label: "操作",
                width: "60",
                fixed: "right",
                // showOverflowTooltip: true,
                show: true,
                slot: "operate",
                disabled: !canEdit.value
            }
        ]
        break
    case "general":
        tableColumns.value = [
            {
                type: "selection",
                width: "32",
                show: true,
                disabled: props.type !== "chooseRows"
            },
            {
                label: "序号",
                type: "index",
                width: "50",
                headerAlign: "center",
                show: true
            },
            {
                prop: "orderType",
                label: "订单类型",
                headerAlign: "center",
                width: "120",
                // showOverflowTooltip: true,
                slot: "orderType",
                show: true
            },
            {
                prop: "orderNo",
                label: "编号",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "partNum",
                label: "系列配置号",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "partName",
                label: "系列名称",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "productName",
                label: "品名",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "schemeCode",
                label: "配置方案编码",
                headerAlign: "center",
                width: "220",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "exampleBom",
                label: "实例BOM编码",
                headerAlign: "center",
                width: "210",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "exampleBomStatus",
                label: "实例BOM状态",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true,
                slot: "exampleBomStatus"
            },
            {
                prop: "num",
                label: "数量",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "createdName",
                label: "创建人",
                headerAlign: "center",
                width: "120",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "orderCreateTime",
                label: "创建时间",
                headerAlign: "center",
                width: "160",
                // showOverflowTooltip: true,
                show: true
            }
        ]
        break
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination({
    show: props.type === "chooseRows"
})

/** 监听分页参数的变化 */
if (props.type === "chooseRows") {
    watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
}
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
//#endregion

//#endregion

//#region 字典数据
const loading_group = ref(false)
const options_group = ref<any[]>([]) // 生产组织下拉
const option_prePlanType = ref<any[]>([]) // 预计划分类下拉
const options_exampleBomStatus = ref<any[]>([]) // 实例BOM状态
const options_orderType = ref<any[]>([]) // 订单类型
loading_group.value = true
getDictionarySelect({ codes: "PRODUCTION_ORGANIZATION,PRE_PLAN_TYPE,EXAMPLE_BOM_STATUS,ORDER_TYPE" })
    .then((data) => {
        options_group.value = data.data.PRODUCTION_ORGANIZATION || []
        option_prePlanType.value = data.data.PRE_PLAN_TYPE || []
        options_exampleBomStatus.value = data.data.EXAMPLE_BOM_STATUS || []
        options_orderType.value = data.data.ORDER_TYPE || []
    })
    .finally(() => (loading_group.value = false))
//#endregion

//#region 选择系列 - 弹窗
const chooseSeriesDialog = reactive<any>({
    visible: false,
    title: "选择系列"
})
const goChoose_series = () => {
    chooseSeriesDialog.visible = true
}
// 选择系列回调
const handleEditSuccess_series = (row: any) => {
    console.log("handleEditSuccess_series", row)
    chooseSeriesDialog.visible = false
    goEdit_allocation(row)
}
//#endregion

//#region 编辑配置 - 弹窗
const editAllocationDialog = reactive<any>({
    visible: false,
    title: "编辑配置",
    row: null,
    loading: false
})
const goEdit_allocation = (row: any) => {
    Object.assign(editAllocationDialog, {
        visible: true,
        loading: false,
        row
    })
}
// 编辑配置回调
const handleEditSuccess_allocation = (data: any) => {
    console.log("handleEditSuccess_allocation", data)
    // Object.assign(editAllocationDialog, {
    //   visible: false,
    //   row: null
    // })
    goAdd_allocation(data)
}
//#endregion

//#region 查找添加 - 弹窗
const insertPlanningDialog = reactive<any>({
    visible: false,
    title: "查找添加"
})
const goInsetPlan = () => {
    insertPlanningDialog.visible = true
}
// 添加物料回调
const handleEditSuccess_insert = (rows: any[]) => {
    console.log("handleEditSuccess_insert", rows)
    insertPlanningDialog.visible = false
    rows.forEach((ele) => {
        ele.isExist = true // 已有方案
        initDefaultData(ele)
        addData(ele)
    })
}
//#endregion

defineExpose({
    tableData,
    multipleSelection,
    getList,
    initList
})
</script>

<style scoped lang="scss">
.planList {
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
