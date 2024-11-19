<template>
    <div v-loading="loading || dialog.loading" class="material-page">
        <div class="fromWrapper">
            <el-form :model="formData" size="small" label-width="60px" inline>
                <el-form-item label="编码">
                    <el-select size="small" v-model="formData.selectCodeValue" style="width: 100px">
                        <el-option
                            v-for="item in queryConditionList_material"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                    <el-input v-model="formData.code" @keydown.enter="getList" clearable />
                </el-form-item>
                <el-form-item label="名称">
                    <el-select size="small" v-model="formData.selectNameValue" style="width: 100px">
                        <el-option
                            v-for="item in queryConditionList_material"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                    <el-input v-model="formData.name" @keydown.enter="getList" clearable />
                </el-form-item>
                <el-form-item label="代号">
                    <el-select size="small" v-model="formData.selectMaterialSymbolValue" style="width: 100px">
                        <el-option
                            v-for="item in queryConditionList_material"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                    <el-input v-model="formData.materialSymbol" @keydown.enter="getList" clearable />
                </el-form-item>
                <el-form-item label="物料类型">
                    <el-select v-model="formData.type" clearable filterable>
                        <el-option
                            v-for="item in materielTypeList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="零件类型">
                    <el-select v-model="formData.partCategory" clearable filterable>
                        <el-option v-for="item in partTypeList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="small" @click="getList">{{ $t("materielPage.query") }}</el-button>
                    <el-button size="small" type="primary" @click="handleResetBtn">{{
                        $t("materielPage.reset")
                    }}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="tableWrapper">
            <pt-table
                ref="PtTableRef"
                :tableColumns="tableColumns"
                :tableEditConfig="tableEditConfig"
                :paginationConfig="pageData"
                :menuConfig="menuConfig"
                :data="tableData"
                :locale="locale"
                border
                highlight-current-row
                row-key="oid"
                size="small"
                @row-click="handleRowClick"
                @selection-change="handleSelectionChange"
                @page-current-change="handleCurrentChange"
                @page-size-change="handleSizeChange"
            >
                <!-- 自定义列模板插槽 -->
                <template #col-type="{ row }">
                    <div>{{ getNameById(materielTypeList, row.type) }}</div>
                </template>
            </pt-table>
        </div>
        <div class="mt-6 text-center">
            <el-button :loading="loading" size="small" type="primary" @click="submit">确定</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                $t("materielPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import { getNameById, partTypeList, queryConditionList_material } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { MaterialInterface } from "@/interface/materiel"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { advancedSearchPart } from "@/api/productMange/materielQuery"
import { usePagination } from "@/hooks/usePagination"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "materialDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    type: {
        type: String,
        default: ""
    },
    dialog: {
        type: Object,
        default: () => ({
            loading: false
        })
    }
})
console.log("物料添加弹窗props.type: ", props.type)

const emits = defineEmits(["update:visible", "confirm-success"])

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单

const formData = reactive({
    selectCodeValue: "左包含", // 编码表达式
    code: "", // 物料编号
    selectNameValue: "包含", // 名称表达式
    name: "", // 物料名称
    selectMaterialSymbolValue: "左包含", // 代号表达式
    materialSymbol: "", // 代号
    partCategory: "", // 零件类型
    type: "" // 物料类型
})
// 处理确认按钮
const submit = () => {
    switch (props.type) {
        case "choose":
            if (!chooseRow.value) {
                ElMessage.error("请选择一条数据！")
                return false
            }
            emits("confirm-success", chooseRow.value)
            break
        case "chooseRows":
            if (!multipleSelection.value.length) {
                ElMessage.error("请选择至少一条数据！")
                return false
            }
            emits("confirm-success", multipleSelection.value)
            break
        case "materialReplace":
            // 物料替换
            if (!multipleSelection.value.length) {
                ElMessage({
                    type: "warning",
                    message: t("materielPage.selectedDataMsg"),
                    center: true
                })
                return
            }
            if (multipleSelection.value.length > 1) {
                ElMessage({
                    type: "warning",
                    message: "有且仅能勾选一条数据！",
                    center: true
                })
                return
            }
            emits("confirm-success", multipleSelection.value)
            break
        case "addMaterial":
            // 添加物料
            if (!multipleSelection.value.length) {
                ElMessage({
                    type: "warning",
                    message: t("materielPage.selectedDataMsg"),
                    center: true
                })
                return
            }
            emits("confirm-success", multipleSelection.value)
            break
        default:
            handleConfirm()
            break
    }
}
// 重置
const handleResetBtn = () => {
    Object.assign(formData, {
        selectCodeValue: "左包含",
        code: "",
        selectNameValue: "包含",
        name: "",
        selectMaterialSymbolValue: "左包含",
        materialSymbol: "",
        partCategory: "",
        type: ""
    })
    // getList()
    tableData.value = []
    pageData.total = 0
}
// 处理确认按钮
const handleConfirm = async () => {}
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<MaterialInterface[]>([])
const chooseRow = ref()
const multipleSelection = ref<MaterialInterface[]>([])

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize,
            types: ["wt.part.WTPart"],
            conditions: [
                {
                    key: "number",
                    symbol: formData.selectCodeValue,
                    value: formData.code
                },
                {
                    key: "name",
                    symbol: formData.selectNameValue,
                    value: formData.name
                },
                {
                    key: "materialSymbol",
                    symbol: formData.selectMaterialSymbolValue,
                    value: formData.materialSymbol
                },
                {
                    key: "partCategory",
                    symbol: "包含",
                    value: formData.partCategory
                }
            ],
            sortBy: "",
            sorted: ""
        }
        if (formData.type) params.types = [formData.type]
        chooseRow.value = null
        multipleSelection.value = []
        const { data } = await advancedSearchPart(params)
        loading.value = false
        pageData.total = data.total
        tableData.value = data.content.map((item: any) => {
            return {
                oid: item.oid,
                code: item.number,
                name: item.name,
                type: item.type,
                symbol: item.materialSymbol,
                processRoute: item.processRoute,
                partType: item.partCategory,
                material: item.material,
                version: item.version
            }
        })
    } catch (err: any) {
        console.log("advancedSearchPart", err)
        loading.value = false
    }
}

//#region el-table默认参数
// 方法
const handleRowClick = (row: MaterialInterface) => {
    console.log("物料添加弹窗行点击handleRowClick", row)
    chooseRow.value = row
    PtTableRef.value!.toggleRowSelection(row)
}
const handleSelectionChange = (val: MaterialInterface[]) => {
    multipleSelection.value = val
    // console.log("multipleSelection.value:", multipleSelection.value)
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true,
        disabled: props.type === "choose"
    },
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
        // slot: "type",
        width: "120",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "code",
        label: computed(() => t("materielPage.code")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "symbol",
        label: computed(() => t("materielPage.symbol")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "name",
        label: computed(() => t("materielPage.name")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "processRoute",
        label: computed(() => t("materielPage.processRoute")) as any,
        width: "180",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "partType",
        label: computed(() => t("materielPage.partType")) as any,
        width: "120",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "material",
        label: computed(() => t("materielPage.material")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    },
    {
        prop: "version",
        label: computed(() => t("materielPage.version")) as any,
        width: "90",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: true
    }
])
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    show: false
})
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], () => {
  if (pageData.total) getList()
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
//#endregion

//#region 下拉数据
const materielTypeList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "MATERIAL_TYPE" })) as { data: any }
        materielTypeList.value =
            data.MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion

//#endregion
</script>

<style lang="scss" scoped>
.material-page {
    height: calc(100vh - 168px);
    display: flex;
    flex-direction: column;
    .tableWrapper {
        flex: 1;
        height: 0;
    }
    .fromWrapper {
        :deep(.el-form) {
            .el-form-item {
                margin-right: 8px;
            }
        }
    }
}
</style>
