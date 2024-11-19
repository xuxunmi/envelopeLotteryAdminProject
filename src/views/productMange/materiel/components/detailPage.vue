<template>
    <div class="sf-container-main-content">
        <div
            class="sf-table-wrapper"
            :class="isCanEdit ? 'details-wrapper' : ''"
            v-loading="loading"
            :element-loading-text="elementLoadingText"
        >
            <template v-if="!isCanEdit">
                <pt-table
                    ref="PtTableRef"
                    :tableColumns="tableColumns"
                    :tableEditConfig="tableEditConfig"
                    :paginationConfig="pageData"
                    :menuConfig="menuConfig"
                    :data="tableData"
                    :locale="locale"
                    row-key="oid"
                    border
                    stripe
                    highlight-current-row
                    size="small"
                    :row-class-name="tableRowClassName"
                    @page-current-change="handleCurrentChange"
                    @page-size-change="handleSizeChange"
                    @selection-change="handleSelectionChange"
                    @row-click="handleRowClick"
                    @row-dblclick="handleRowDblclick"
                    @row-contextmenu="handleRowContextmenu"
                    @sort-change="handleSortChange"
                >
                    <template #slot-edit>
                        <span class="table-edit fromWrapper">
                            <!-- <el-form :model="searchForm" size="small" @submit.prevent>
                            <el-form-item>
                                <el-input v-model.trim="searchForm.name" clearable />
                            </el-form-item>
                        </el-form>
                        <el-button type="primary" size="small" @click="getList" :disabled="disabledBtn">{{
                            $t("materielPage.query")
                        }}</el-button> -->
                            <el-button type="primary" size="small" @click="getList" :disabled="disabledBtn"
                                >刷新</el-button
                            >
                            <el-button type="primary" size="small" @click="handleCreateBtn('add')">{{
                                $t("materielPage.create")
                            }}</el-button>
                            <el-button
                                type="primary"
                                size="small"
                                @click="handleEditBtn('edit')"
                                :disabled="
                                    disabledCreateBtn || !(multipleSelection.length === 1) || disabledEditDetailsBtn
                                "
                                >{{ $t("materielPage.edit") }}</el-button
                            >
                            <el-button type="primary" size="small" @click="handleAddBtn" :disabled="disabledBtn">{{
                                $t("materielPage.add")
                            }}</el-button>
                            <el-button type="primary" size="small" @click="handleRemoveBtn()" :disabled="disabledBtn">{{
                                $t("materielPage.remove")
                            }}</el-button>
                            <el-button
                                type="primary"
                                size="small"
                                @click="handleBrowseBtn()"
                                :disabled="disabledBtn || !(multipleSelection.length === 1)"
                                >浏览</el-button
                            >
                            <el-button type="primary" size="small" @click="handleAddToBtn()" :disabled="disabledBtn"
                                >添加到</el-button
                            >
                            <el-button type="primary" size="small" @click="handleDeleteBtn()" :disabled="disabledBtn">{{
                                $t("materielPage.delete")
                            }}</el-button>
                            <el-button
                                type="primary"
                                size="small"
                                @click="handleChangeOwnerBtn()"
                                :disabled="disabledBtn"
                                >变更所属者</el-button
                            >
                            <el-button
                                type="primary"
                                size="small"
                                :disabled="disabledBtn || !(multipleSelection.length === 1)"
                                @click="goBomHighEdit()"
                                >BOM高级编辑</el-button
                            >
                            <el-button
                                size="small"
                                type="primary"
                                @click="handleBomBatchEditBtn('升版')"
                                :disabled="disabledBtn || !(multipleSelection.length === 1)"
                                >BOM批量编辑</el-button
                            >
                            <el-button
                                size="small"
                                type="primary"
                                @click="handleBomBatchEditBtn('不升版')"
                                :disabled="disabledBtn || !(multipleSelection.length === 1)"
                                >BOM不升版批量编辑</el-button
                            >
                            <el-button type="primary" size="small" @click="handleDataImportBtn" :disabled="disabledBtn"
                                >数据导入</el-button
                            >
                            <el-button
                                type="primary"
                                size="small"
                                @click="handleExportExcelBtn"
                                :disabled="disabledBtn || !tableData.length"
                                >导出Excel</el-button
                            >
                        </span>
                    </template>
                    <!-- 自定义列模板插槽 -->
                    <template #col-materialType="{ row }">
                        <div>{{ getNameById(materielTypeList, row.materialType) }}</div>
                    </template>
                    <!-- 自定义列模板插槽 -->
                    <template #head-search="{ column }">
                        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
                    </template>

                    <!-- 右键菜单 -->
                    <template #slot-menu="{ row }">
                        <li @click="getList">
                            <el-button link>刷新</el-button>
                        </li>
                        <li>
                            <el-button link :disabled="disabledEditDetailsBtn" @click="handleEditBtn('edit', row)"
                                >编辑</el-button
                            >
                        </li>
                        <li @click="handleAddBtn">
                            <el-button link>添加</el-button>
                        </li>
                        <li @click="handleRemoveBtn(row)">
                            <el-button link>移除</el-button>
                        </li>
                        <li @click="handleBrowseBtn(row)">
                            <el-button link>浏览</el-button>
                        </li>
                        <li @click="handleAddToBtn(row)">
                            <el-button link>添加到</el-button>
                        </li>
                        <li @click="handleDeleteBtn(row)">
                            <el-button link>删除</el-button>
                        </li>
                        <li @click="handleChangeOwnerBtn(row)">
                            <el-button link>变更所属者</el-button>
                        </li>
                        <li @click="goBomHighEdit(row)">
                            <el-button link>BOM高级编辑</el-button>
                        </li>
                        <li @click="handleBomBatchEditBtn('升版', row)">
                            <el-button link>BOM批量编辑</el-button>
                        </li>
                        <li @click="handleBomBatchEditBtn('不升版', row)">
                            <el-button link>BOM不升版批量编辑</el-button>
                        </li>
                        <li @click="goDetail(row)">
                            <el-button link>查看详情</el-button>
                        </li>
                    </template>
                </pt-table>
            </template>
            <template v-else>
                <el-scrollbar>
                    <div class="pt-container-main-right">
                        <div class="ml-1 m-b-4">
                            <el-button class="mr-2" size="small" type="primary" @click="isCanEdit = false"
                                >取消</el-button
                            >
                            <el-button
                                class="mr-2"
                                size="small"
                                type="primary"
                                @click="handleEditSaveBtn(editMaterialFormRef)"
                                >保存</el-button
                            >
                        </div>
                        <el-form
                            ref="editMaterialFormRef"
                            :model="editMaterialForm"
                            :rules="isCanEdit ? rules : {}"
                            :inline="true"
                            label-position="right"
                            label-width="160px"
                            size="small"
                        >
                            <el-row>
                                <el-col
                                    :span="colSpan"
                                    v-for="item in detailItemsData"
                                    :key="item.label"
                                    class="pt-container-main-right-col"
                                >
                                    <el-form-item
                                        :label="item.label + ':'"
                                        :prop="item.prop"
                                        :rules="isCanEdit ? item.rules : []"
                                    >
                                        <template v-if="item.type === 'select'">
                                            <el-select
                                                style="width: 100%"
                                                v-model="editMaterialForm[item.prop]"
                                                :placeholder="item.placeholder"
                                                clearable
                                                filterable
                                                :disabled="item.disabled"
                                                @change="item.onChange"
                                            >
                                                <el-option
                                                    v-for="option in item.options"
                                                    :key="option.id"
                                                    :label="option.name"
                                                    :value="option.id"
                                                />
                                            </el-select>
                                        </template>
                                        <template v-else-if="item.type === 'input' || item.type === 'password'">
                                            <!-- <div class="w-full" @click="goEdit_number(item.prop)"> -->
                                            <el-input
                                                style="width: 100%"
                                                v-model="editMaterialForm[item.prop]"
                                                :show-password="item.type === 'password'"
                                                :placeholder="item.placeholder"
                                                :disabled="item.disabled"
                                            >
                                                <template #suffix v-if="item.iconSearch">
                                                    <el-button v-if="isCanEdit" type="primary" icon="Search" link />
                                                </template>
                                            </el-input>
                                            <!-- <div class="overlay" v-if="item.iconSearch" /> -->
                                            <!-- </div> -->
                                        </template>
                                        <template v-else-if="item.type === 'textarea'">
                                            <el-input
                                                style="width: 200%"
                                                v-model="editMaterialForm[item.prop]"
                                                :type="item.type"
                                                :autosize="{ minRows: 2 }"
                                                :placeholder="item.placeholder"
                                                :disabled="item.disabled"
                                            />
                                        </template>
                                        <template v-else-if="item.type === 'inputNumber'">
                                            <el-input-number
                                                style="width: 100%"
                                                v-model="editMaterialForm[item.prop]"
                                                :controls="false"
                                                :min="0"
                                                :precision="0"
                                                :disabled="item.disabled"
                                            />
                                        </template>
                                        <template v-else-if="item.type === 'daterange'">
                                            <el-date-picker
                                                style="width: 100%"
                                                v-model="editMaterialForm[item.prop]"
                                                type="date"
                                                :placeholder="item.placeholder"
                                                format="YYYY-MM-DD HH:mm:ss"
                                                value-format="YYYY-MM-DD HH:mm:ss"
                                                :disabled="item.disabled"
                                            />
                                        </template>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="24" class="last-col-child">
                                    <el-form-item style="width: 100%" label="描述:">
                                        <el-input
                                            v-model="editMaterialForm.description"
                                            style="width: 100%"
                                            autosize
                                            type="textarea"
                                            :disabled="disabledDescriptionField"
                                        />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </el-scrollbar>
            </template>
        </div>

        <!-- 新增/编辑部件弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.part" :footer="false" width="90%">
            <creatPartDialog
                v-if="dialogVisible.part"
                v-model:visible="dialogVisible.part"
                :currentRowData="dialogType === 'add' ? currentTreeNodeData : currentRowData"
                :parentNodeData="currentTreeNodeData"
                :currentTreeNodeData="currentTreeNodeData"
                :dialogType="dialogType"
                @confirmSuccess="handleConfirmSuccess_part"
            />
        </dialogFrame>

        <!-- 添加物料弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addMaterial" :footer="false" width="94%">
            <MaterialDialog
                v-if="dialogVisible.addMaterial"
                v-model:visible="dialogVisible.addMaterial"
                type="addMaterial"
                :dialog="materialDialog"
                @confirm-success="handleConfirmSuccess_addMaterial"
            />
        </dialogFrame>

        <!-- 添加到文件夹弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addToFolder" :footer="false" width="40%">
            <addToFolderDialog
                v-if="dialogVisible.addToFolder"
                v-model:visible="dialogVisible.addToFolder"
                :multipleTableSelection="multipleSelection"
                @confirm-success="handleConfirmSuccess_addToFolder"
            />
        </dialogFrame>

        <!-- 变更所属者 - 弹窗 -->
        <ChangeOwnerDialog
            v-if="changeOwnerDialog.visible"
            :dialog="changeOwnerDialog"
            @handleEditSuccess="handleEditSuccess_owner"
        />

        <!-- 数据导入弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.dataImport" :footer="false" width="40%">
            <BomDataImportDialog
                v-if="dialogVisible.dataImport"
                v-model:visible="dialogVisible.dataImport"
                @confirm-success="handleConfirmSuccess_dataImport"
            />
        </dialogFrame>

        <!-- 物料导出弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.changeExport" :footer="false" width="40%">
            <ChangeExportDialog
                ref="changeExportDialogRef"
                v-if="dialogVisible.changeExport"
                v-model:visible="dialogVisible.changeExport"
                :multipleTableSelection="multipleSelection"
                :tableData="tableData"
                @confirm-success="handleConfirmSuccess_changeExport"
            />
        </dialogFrame>

        <!-- 批量修改所属父件弹窗 -->
        <dialogFrame
            :title="dialogTitle"
            v-model:visible="dialogVisible.bomBatchEdit"
            :footer="false"
            width="40%"
            @close="handleConfirmSuccess_bomBatchEdit('bomBatchEdit')"
        >
            <bomBatchUpdateParentDialog
                v-if="dialogVisible.bomBatchEdit"
                v-model:visible="dialogVisible.bomBatchEdit"
                :currentRowData="currentRowData"
                :dialogType="dialogType"
                @confirm-success="handleConfirmSuccess_bomBatchEdit"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"
import { useRouter } from "vue-router"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import creatPartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import MaterialDialog from "./materialDialog.vue"
import addToFolderDialog from "./addToFolderDialog.vue"
import ChangeOwnerDialog from "@/views/bomManage/components/changeOwnerDialog/index.vue"
import BomDataImportDialog from "./bomDataImportDialog.vue"
import ChangeExportDialog from "@/views/productMange/materielQuery/components/changeExportDialog.vue"
import bomBatchUpdateParentDialog from "@/views/bomManage/bomDetail/components/bomBatchUpdateParentDialog.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { MaterialListInterface, MaterialTreeInterface, MaterialInterface } from "@/interface/materiel"
import {
    getFolderMaterielList,
    folderMaterielRemove,
    folderMaterielDelete,
    workspaceExportParts,
    folderMaterielAdd,
    workspaceSelectedExportParts
} from "@/api/productMange/materiel"
import { multiLevelDictionaryData } from "@/api/system/multiLevelDictionary"
import { getDocumentPartDetails } from "@/api/productDetail"
import { createPart } from "@/api/productLibrary"
import {
    getNameById,
    unitList,
    partTypeList,
    impodegreeList,
    processStatusList,
    drawingList,
    lifeCycleTemplateList,
    ownerGroupList,
    productPhaseList,
    zzjissueStockList,
    fjzzjissueStockList,
    projectMethodList,
    planningMethodList
} from "@/assets/common/select-list"
import { filterArray, resetFilterValue, formatDateTime, recursionArray, goSort } from "@/utils"
import { downloadFile } from "@/utils/exportTemplate"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "detailPage"
})
const props = defineProps({
    currentTreeNodeData: {
        type: Object as () => MaterialTreeInterface,
        required: true
    },
    colSpan: {
        type: Number,
        default: 8
    }
})

const router = useRouter()
const { t, locale } = useI18n()
const loading = ref(false)
const isCanEdit = ref(false) // 判断是否可编辑

const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    part: false, // 新增/编辑部件对话框
    material: false, // 添加物料对话框
    addToFolder: false, // 添加到文件夹话框
    dataImport: false, // 数据导入对话框
    changeExport: false, // 物料导出弹窗
    bomBatchEdit: false // BOM批量编辑状态话框
})
const materialDialog = reactive<any>({
    loading: false
})

const currentRowData = ref<any>({
    oid: ""
}) // 当前行数据

// const parentRowData = ref<any>({
//     oid: ""
// }) // 父级节点表格行数据
//#endregion

//#region 表单
const searchForm = reactive({
    name: ""
})

// 禁用按钮
const disabledBtn = computed(() => {
    return (
        !props.currentTreeNodeData.oid ||
        props.currentTreeNodeData.oid === "0" ||
        props.currentTreeNodeData.oid === "1" ||
        props.currentTreeNodeData.type === "PDMLinkProduct"
    )
})

// 禁用新建按钮
const disabledCreateBtn = computed(() => {
    return (
        !props.currentTreeNodeData.oid ||
        props.currentTreeNodeData.oid === "0" ||
        props.currentTreeNodeData.oid === "1" ||
        props.currentTreeNodeData.flag === 0 ||
        props.currentTreeNodeData.type === "PDMLinkProduct"
    )
})
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<MaterialListInterface[]>([])
const multipleSelection = ref<MaterialListInterface[]>([])
const sortParams = reactive({
    sortBy: "",
    sorted: "",
    sortType: ""
})
const chooseRow = ref()

//#region 增、删、改、查
// 获取列表
const getList = () => {
    getWorkspaceMaterieList()
}

// 获取工作区物料列表
const getWorkspaceMaterieList = async () => {
    try {
        loading.value = true
        const params: {
            folderIdStr: string
            param: string
            pageNo: number
            pageSize: number
        } = {
            // ...sortParams,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize,
            folderIdStr: props.currentTreeNodeData.oid,
            param: searchForm.name
        }
        const { data } = await getFolderMaterielList(params)
        loading.value = false
        pageData.total = data.total
        sourceData.value = data.list || []
        resetFilterValue(filterValue)
        search()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}
// 查看详情
const goDetail = (row: any) => {
    router.push({
        path: `/product/bomDetail/${row.oid}`,
        query: { oid: row.oid, type: "WTPart", tagTitle: `${row.number}_${row.name}_${row.version}` }
    })
}
//#endregion

//#region el-table默认参数
// 方法
const handleSortChange = (data: { column: any; prop: string; order: any }) => {
    console.log("handleSortChange", data)
    sortParams.sortBy = data.prop
    sortParams.sorted = data.order
    search()
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
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
        label: computed(() => t("materielPage.sequence")) as any,
        type: "index",
        width: "50",
        minWidth: "50",
        headerAlign: "center",
        fixed: "left",
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
    {
        prop: "type",
        label: computed(() => t("materielPage.materialType")) as any,
        width: "120",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "number",
        label: computed(() => t("materielPage.code")) as any,
        width: "150",
        minWidth: "100",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: "custom",
        show: true,
        slot: "search"
    },
    {
        prop: "materialSymbol",
        label: computed(() => t("materielPage.symbol")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        sortable: "custom",
        show: true,
        slot: "search"
    },
    {
        prop: "name",
        label: computed(() => t("materielPage.name")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        slot: "search",
        sortable: "custom"
    },
    {
        prop: "material",
        label: computed(() => t("materielPage.material")) as any,
        width: "120",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "processRoute",
        label: computed(() => t("materielPage.processRoute")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "partCategory",
        label: computed(() => t("materielPage.partType")) as any,
        width: "110",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "parentNumber",
        label: computed(() => t("materielPage.parentCode")) as any,
        width: "150",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "jgyyParentNumber",
        label: computed(() => t("materielPage.jgyyParentCode")) as any,
        width: "160",
        minWidth: "145",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "desc",
        label: computed(() => t("materielPage.description")) as any,
        width: "180",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "machineModel",
        label: computed(() => t("materielPage.machineModel")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "state.state",
        label: computed(() => t("materielPage.lifeCycle")) as any,
        width: "110",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "ownerGroup",
        label: computed(() => t("materielPage.versionOwnerUserGroup")) as any,
        width: "190",
        minWidth: "145",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "plmOwner",
        label: computed(() => t("materielPage.owner")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "updater",
        label: computed(() => t("materielPage.updateAt")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "updateTime",
        label: computed(() => t("materielPage.updateTime")) as any,
        width: "160",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "checkOuter",
        label: computed(() => t("materielPage.checkoutBy")) as any,
        width: "120",
        minWidth: "85",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "checkoutTime",
        label: computed(() => t("materielPage.checkoutTime")) as any,
        width: "160",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "typeNumber",
        label: computed(() => t("materielPage.typeCode")) as any,
        width: "150",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "version",
        label: computed(() => t("materielPage.version")) as any,
        width: "90",
        minWidth: "70",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "trimMethod",
        label: "裁剪方式",
        width: "140",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    },
    {
        prop: "oid",
        label: computed(() => t("materielPage.identification")) as any,
        width: "180",
        minWidth: "95",
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true,
        sortable: "custom"
    }
])
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})

const handleSelectionChange = (val: MaterialListInterface[]) => {
    multipleSelection.value = val
    console.log("multipleSelection.value: ", multipleSelection.value)
}

// 处理行点击
const handleRowClick = (row: MaterialListInterface) => {
    console.log("row-click", row)
    chooseRow.value = row
    const isSelected = multipleSelection.value.some((selectedRow) => selectedRow === row)
    // console.log(isSelected)
    if (isSelected) {
        PtTableRef.value!.toggleRowSelection(row, false)
    } else {
        PtTableRef.value!.toggleRowSelection(row, true)
    }
}
// 处理行点击
const handleRowDblclick = (row: MaterialListInterface) => {
    goDetail(row)
}
const handleRowContextmenu = (row: MaterialListInterface) => {
    chooseRow.value = row
}
const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (multipleSelection.value.some((selectedRow) => selectedRow === row)) {
        return "front-checked"
    }
    return "front-not-checked"
}
// const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: MouseEvent) => {
//     column.width = newWidth < column?.minWidth ? column.minWidth : (column.width = newWidth)
// }

//#region 头部按钮操作
// 处理新建按钮
const handleCreateBtn = (type: string) => {
    dialogTitle.value = t("materielPage.createMaterial")
    dialogType.value = type
    dialogVisible.part = true
}

// 处理编辑按钮
const handleEditBtn = async (type: string, row?: any) => {
    // if (!row) {
    //     const [row] = multipleSelection.value
    //     currentRowData.value = row
    // } else {
    //     currentRowData.value = row
    // }

    // dialogTitle.value = t("materielPage.editMaterial")
    // dialogType.value = type
    // dialogVisible.part = true

    try {
        const editRow = !row ? multipleSelection.value[0] : row
        console.log("editRow: ", editRow)
        const params = {
            oid: editRow.oid,
            type: editRow.type
        }
        loading.value = true
        const { data } = (await getDocumentPartDetails(params)) as any
        initDetailItem(data.materialType)
        // 回显数据
        // 根据产品类型回显产品线
        if (data.productType) {
            handleProductTypeChange(data.productType)
        }
        // 根据产品线回显产品子线
        if (data.productLineChild) {
            handleProductLineChildChange(data.productLineChild)
        }
        Object.assign(editMaterialForm, {
            oid: data.oid,
            materialType: data.materialType, // 类型
            lgPartType: data.partCategory, // 零件类型
            selectProductOid: data.productOid, // 选择产品oid
            selectProductName: data.selectProductName, // 选择产品name
            selectFolderOid: data.folderOid, // 选择文件夹oid
            selectFolderName: data.selectFolderName, // 选择文件夹name
            code: data.number, // 编号
            name: data.name, // 名称
            lgDrawingNo: data.materialSymbol, // 代号
            material: data.material, // 材料
            lgModel: data.machineModel, // 机型号
            lgImpodegree: data.importantDegree, // 关重件特性
            lifeCycle: data.cnState, // 生命周期name
            enState: data.enState, // 生命周期id
            processStatus: data.processState, // 工艺状态
            weight: data.netWeight ? +data.netWeight : undefined, // 单件净重
            lgGrossWeight: data.grossWeight ? +data.grossWeight : undefined, // 单件毛重
            lgRawpartCode: data.rawPartCode, // 原材料编码
            lgBlankStandard: data.blankSpecification, // 毛胚规格
            lgBlankSize: data.blankSize, // 毛坯外形尺寸
            lgBlankType: data.blankType, // 毛胚种类
            lgEachBlankNumber: data.blankNumber ? +data.blankNumber : undefined, // 毛胚件数
            lgFeedSection: data.feedSection, // 下料工段
            lgUnit: data.unit, // 单位
            lgDrawing: data.drawing, // 图幅
            ownerGroup: data.ownerGroup, // 所属用户组
            productPhase: data.productPhase, // 阶段标识
            lgProRoute: data.processRoute, // 工艺路线
            description: data.desc, // 描述
            lgBelongCompany: data.belongCompany, // 所属公司
            lgAnotherName: data.anotherName, // 别名
            planningMethod: data.layout, // 规划方法
            projectMethod: data.planMethod, // 计划方法
            fjzzjissueStock2: data.loaderIssuingStock, // 装载机发料仓库
            fjzzjissueStock: data.fujianLoaderIssuingStock, // 福建装载机发料仓库
            syncTime: data.synchronizationTime, // 同步时间
            type1: data.shanghaiMechanicalPartType, // 上海机械零件类型
            type2: data.shanghaiExcavatorPartsType, // 上海挖机零件类型
            type3: data.fujianMechanicalPartType, // 福建机械零件类型
            type4: data.shanghaiRoadbedPartType, // 上海路面自制零件
            type5: data.shanghaiForkliftPartType, // 上海叉车零件类型
            type6: data.shanghaiComponentPartType, // 上海部件零件类型
            type7: data.jiangxiMechanicalPartType, // 江西机械零件类型
            type8: data.shanghaiHydraulicPartType, // 上海液压零件类型
            type9: data.fujianHydraulicPartType, // 福建液压零件类型
            type10: data.fujianBridgeBoxPartType, // 福建桥箱零件类型
            type11: data.fujianCastPartType, // 福建铸锻零件类型
            type12: data.precisionHydraulicPartType, // 精工液压零件类型
            type13: data.fujianExcavatorPartType, // 福建挖机零件类型
            type14: data.fujianSparePartsType, // 福建配件零件类型
            version: data.version, // 版本
            owner: data.owner, // 所有者
            checkOuter: data.checkOuter, // 检出者
            checkTime: data.checkTime, // 检出时间
            modifor: data.updater, // 修改者
            modifyTime: data.updateTime, // 修改时间
            releasedTime: data.releasedTime, // 发布时间
            createTime: data.createTime, // 创建时间
            creator: data.creator, // 创建者
            preparePlanType: data.preparePlanType, // 预计划分类
            productType: data.productType, // 产品类型
            productLineChild: data.productLineChild, // 产品线
            productSubLine: data.productSubLine, // 产品子线
            trimMethod: data.trimMethod, // 裁剪方式
            viewName: data.view // 显示规则类型名称
        })
        console.log("editMaterialForm: ", editMaterialForm)
        isCanEdit.value = true
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false
    }
}

// 处理菜单添加按钮
const handleAddBtn = () => {
    dialogTitle.value = t("materielPage.addMaterial")
    const dialogType = "addMaterial"
    dialogVisible[dialogType] = true
}

// 处理浏览按钮
const handleBrowseBtn = (row?: MaterialListInterface) => {
    const paramRow = !row ? multipleSelection.value[0] : row
    goDetail(paramRow)
}

// 处理菜单移除按钮
const handleRemoveBtn = (row?: MaterialListInterface) => {
    if (!row) {
        if (!multipleSelection.value.length) {
            ElMessage({
                type: "warning",
                message: "请选择至少一条数据！",
                center: true
            })
            return
        }
    }
    ElMessageBox.confirm(t("materielPage.removeSelectedDataMsg"), t("materielPage.prompt"), {
        confirmButtonText: t("materielPage.confirm"),
        cancelButtonText: t("materielPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        const needRemovedData = !row ? multipleSelection.value : [row]
        const folderPartOids = needRemovedData.map((item) => item.folderPartOid).join()
        const params = { folderPartOids }
        loading.value = true
        folderMaterielRemove(params)
            .then(() => {
                ElMessage.success("移除成功！")
                getList()
            })
            .catch((err) => {
                console.log(err)
                loading.value = false
            })
    })
}

// 处理菜单删除按钮
const handleDeleteBtn = (row?: MaterialListInterface) => {
    if (!row) {
        if (!multipleSelection.value.length) {
            ElMessage({
                type: "warning",
                message: "请选择至少一条数据！",
                center: true
            })
            return
        }
    }

    ElMessageBox.confirm(t("materielPage.deleteSelectedDataMsg"), t("materielPage.prompt"), {
        confirmButtonText: t("materielPage.confirm"),
        cancelButtonText: t("materielPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(async () => {
        const needDeletwData = !row ? multipleSelection.value : [row]
        const folderPartOids = needDeletwData.map((item) => item.folderPartOid).join()
        const partOids = needDeletwData.map((item) => item.oid).join()
        const params = { folderPartOids, partOids }
        loading.value = true
        folderMaterielDelete(params)
            .then(() => {
                ElMessage.success("删除成功！")
                getList()
            })
            .catch((err) => {
                console.log(err)
                loading.value = false
            })
    })
}

// 处理添加到按钮
const handleAddToBtn = (row?: MaterialListInterface) => {
    if (!row) {
        if (!multipleSelection.value.length) {
            ElMessage({
                type: "warning",
                message: "请选择至少一条数据！",
                center: true
            })
            return
        }
    } else {
        multipleSelection.value = [row]
    }

    dialogTitle.value = "添加到工作区"
    const dialogType = "addToFolder"
    dialogVisible[dialogType] = true
}

// 处理变更所属者按钮
//变更所属者 - 弹窗
const changeOwnerDialog = reactive<any>({
    visible: false,
    title: "",
    row: null
})
const handleChangeOwnerBtn = (row?: MaterialListInterface) => {
    if (!row) {
        if (!multipleSelection.value.length) {
            ElMessage({
                type: "warning",
                message: t("materielPage.selectedDataMsg"),
                center: true
            })
            return
        }
    }

    const needChangeOwnerData = !row ? multipleSelection.value : [row]
    Object.assign(changeOwnerDialog, {
        visible: true,
        title: "变更所属者",
        row: needChangeOwnerData
    })
}

// BOM高级编辑
const goBomHighEdit = (row?: MaterialListInterface) => {
    const routerRow = !row ? multipleSelection.value[0] : row
    router.push({
        path: `/bomManage/bomHighEdit/${routerRow.oid}`,
        query: {
            oid: routerRow.oid,
            number: routerRow.number,
            tagTitle: `BOM高级编辑(${routerRow.number})`
        }
    })
}

// 处理BOM批量编辑/BOM不升版批量编辑按钮
const handleBomBatchEditBtn = (type: string, row?: MaterialListInterface) => {
    currentRowData.value = !row ? multipleSelection.value[0] : row
    dialogTitle.value = type === "升版" ? "升版：批量修改所属父件" : "不升版：批量修改所属父件"
    dialogType.value = type
    dialogVisible.bomBatchEdit = true
}
const handleConfirmSuccess_bomBatchEdit = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
}

// 处理数据导入按钮
const handleDataImportBtn = () => {
    dialogTitle.value = "数据导入"
    const dialogType = "dataImport"
    dialogVisible[dialogType] = true
}

// 处理导出Excel按钮
const elementLoadingText = ref<string>("")
const handleExportExcelBtn = async () => {
    dialogTitle.value = "输出到Excel"
    const dialogType = "changeExport"
    dialogVisible[dialogType] = true
}
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
    goSort(sortParams, tableData.value)
    console.log("search", filterValue, sourceData.value, tableData.value)
}
//#endregion

//#region 下拉数据
const materielTypeList = ref<SelectInterface[]>([]) // 全部物料类型
const typeList = ref<SelectInterface[]>([]) // 物料类型
const optionTrimList = ref<SelectInterface[]>([]) // 裁剪方式
const optionLineList = ref<SelectInterface[]>([]) // 产品分类
const optionChildLineList = ref<SelectInterface[]>([]) // 产品子类
const optionPrePlanTypeList = ref<SelectInterface[]>([]) // 预计划分类
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({
            codes: "MATERIAL_TYPE,KBOM_MATERIAL_TYPE,TRIM_METHOD,PRODUCT_LINE,PRODUCT_LINE_CHILD,PRE_PLAN_TYPE"
        })) as {
            data: any
        }
        materielTypeList.value =
            data.MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        typeList.value =
            data.KBOM_MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionTrimList.value =
            data.TRIM_METHOD.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionLineList.value =
            data.PRODUCT_LINE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionChildLineList.value =
            data.PRODUCT_LINE_CHILD.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionPrePlanTypeList.value =
            data.PRE_PLAN_TYPE.map((item: any) => {
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

//#region 关闭部件对话弹窗
// 关闭部件弹窗
const handleConfirmSuccess_part = async () => {
    dialogVisible.part = false
    PtTableRef.value!.clearSelection()
    getList()
    resetDialog()
}

// 关闭添加物料弹窗
const handleConfirmSuccess_addMaterial = async (rows: MaterialInterface[]) => {
    try {
        materialDialog.loading = true
        const parts = rows.map((item) => {
            return {
                partOid: item.oid,
                materialCode: item.code,
                name: item.name
            }
        })
        const params: {
            folderIdStr: string
            parts: Array<{ partOid: string; materialCode: string; name: string }>
        } = {
            folderIdStr: props.currentTreeNodeData.oid,
            parts
        }
        await folderMaterielAdd(params)
        ElMessage({
            type: "success",
            message: t("materielPage.addSuccessMsg"),
            center: true
        })
        dialogVisible.addMaterial = false
        resetDialog()
        getList()
    } catch (err: any) {
        console.log(err)
    } finally {
        materialDialog.loading = false
    }
}

// 关闭添加到文件夹弹窗
const handleConfirmSuccess_addToFolder = (dialogType: string) => {
    dialogVisible[dialogType] = false
    PtTableRef.value!.clearSelection()
    resetDialog()
    getList()
}

// 关闭变更所属者弹窗
const handleEditSuccess_owner = () => {
    Object.assign(changeOwnerDialog, {
        visible: false,
        title: "",
        row: null
    })
    resetDialog()
    getList()
}

// 关闭数据导入弹窗
const handleConfirmSuccess_dataImport = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getList()
}

// 关闭物料导出弹窗
const changeExportDialogRef = ref()
const handleConfirmSuccess_changeExport = async (changeExportForm: any) => {
    try {
        console.log("changeExportDialogRef: ", changeExportForm, changeExportDialogRef.value)
        changeExportDialogRef.value!.loading = true
        changeExportDialogRef.value!.elementLoadingText = "正在导出到Excel，请稍等..."
        if (changeExportForm.exportMethod === "1") {
            if (!multipleSelection.value.length) {
                ElMessage({
                    type: "warning",
                    message: "请先勾选列表数据！",
                    center: true
                })
                return
            }
        }
        const params: {
            folderIdStr: string
            param: string
        } = {
            // ...sortParams,
            folderIdStr: props.currentTreeNodeData.oid,
            param: searchForm.name
        }
        // 判断是勾选导出还是本页导出1（勾选），2（本页），3（全部）
        const content = changeExportForm.exportMethod === "1" ? multipleSelection.value : tableData.value
        let result = null
        if (changeExportForm.exportMethod === "1" || changeExportForm.exportMethod === "2") {
            result = await workspaceSelectedExportParts(content)
        } else {
            result = await workspaceExportParts(params)
        }
        const filename = `${props.currentTreeNodeData.name}_${formatDateTime(new Date(), "YYYY-MM-DD")}`
        downloadFile(result, filename)
        dialogVisible.changeExport = false
        PtTableRef.value!.clearSelection()
    } catch (err: any) {
        console.log(err)
    } finally {
        changeExportDialogRef.value!.elementLoadingText = ""
        changeExportDialogRef.value!.loading = false
    }
}

// 重置dialog值
const resetDialog = () => {
    dialogTitle.value = ""
    dialogType.value = ""
    multipleSelection.value = []
}
//#endregion

//#region 编辑详情
const rules = reactive<FormRules>({})
const editMaterialFormRef = ref<FormInstance>()
const editMaterialForm = reactive<any>({
    oid: "",
    materialType: "", // 类型
    lgPartType: "", // 零件类型
    selectProductOid: "", // 选择产品oid
    selectProductName: "", // 选择产品name
    selectFolderOid: "", // 选择文件夹oid
    selectFolderName: "", // 选择文件夹name
    code: "", // 编号
    name: "", // 名称
    lgDrawingNo: "", // 代号
    material: "", // 材料
    lgModel: "", // 机型号
    lgImpodegree: "", // 关重件特性
    lifeCycle: "", // 生命周期name
    enState: "", // 生命周期id
    processStatus: "", // 工艺状态
    weight: undefined, // 单件净重
    lgGrossWeight: undefined, // 单件毛重
    lgRawpartCode: "", // 原材料编码
    lgBlankStandard: "", // 毛胚规格
    lgBlankSize: "", // 毛坯外形尺寸
    lgBlankType: "", // 毛胚种类
    lgEachBlankNumber: undefined, // 毛胚件数
    lgFeedSection: "", // 下料工段
    lgUnit: "", // 单位
    lgDrawing: "", // 图幅
    ownerGroup: "", // 所属用户组
    productPhase: "", // 阶段标识
    lgProRoute: "", // 工艺路线
    description: "", // 描述
    lgBelongCompany: "", // 所属公司
    lgAnotherName: "", // 别名
    planningMethod: "", // 规划方法
    projectMethod: "", // 计划方法
    fjzzjissueStock2: "", // 装载机发料仓库
    fjzzjissueStock: "", // 福建装载机发料仓库
    syncTime: "", // 同步时间
    type1: "", // 上海机械零件类型
    type2: "", // 上海挖机零件类型
    type3: "", // 福建机械零件类型
    type4: "", // 上海路面自制零件
    type5: "", // 上海叉车零件类型
    type6: "", // 上海部件零件类型
    type7: "", // 江西机械零件类型
    type8: "", // 上海液压零件类型
    type9: "", // 福建液压零件类型
    type10: "", // 福建桥箱零件类型
    type11: "", // 福建铸锻零件类型
    type12: "", // 精工液压零件类型
    type13: "", // 福建挖机零件类型
    type14: "", // 福建配件零件类型
    version: "", // 版本
    owner: "", // 所有者
    checkOuter: "", // 检出者
    checkTime: "", // 检出时间
    modifor: "", // 修改者
    modifyTime: "", // 修改时间
    releasedTime: "", // 发布时间
    createTime: "", // 创建时间
    creator: "", // 创建者
    preparePlanType: "", // 预计划分类
    productType: "", // 产品类型
    productLineChild: "", // 产品线
    productSubLine: "", // 产品子线
    trimMethod: "", // 裁剪方式
    viewName: "" // 显示规则类型名称
})

//#region 多级字典获取产品类型
const multiLevelDictionaryProductTypeList = ref<any>([]) // 产品类型列表
const multiLevelDictionaryProductLineList = ref<any>([]) // 产品线列表
const multiLevelDictionaryProductSubLineList = ref<any>([]) // 产品子线列表
const getMultiLevelDictionaryTypeData = async () => {
    try {
        loading.value = true
        const params = {
            status: 1
        }
        const { data } = (await multiLevelDictionaryData(params)) as any
        multiLevelDictionaryProductTypeList.value = data.map((item: any) => {
            return {
                ...item,
                id: item.code
            }
        })
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

getMultiLevelDictionaryTypeData()

// 处理产品类型选择获取产品线列表
const handleProductTypeChange = (val: string) => {
    editMaterialForm.productLineChild = ""
    editMaterialForm.productSubLine = ""
    multiLevelDictionaryProductLineList.value = []
    multiLevelDictionaryProductSubLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductLineList.value =
                item.children.map((item: any) => {
                    return {
                        ...item,
                        id: item.code
                    }
                }) || []
        }
    })
}
// 处理产品线选择获取产品子线列表
const handleProductLineChildChange = (val: string) => {
    editMaterialForm.productSubLine = ""
    multiLevelDictionaryProductSubLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductSubLineList.value =
                item.children.map((item: any) => {
                    return {
                        ...item,
                        id: item.code
                    }
                }) || []
        }
    })
}
//#endregion

// 禁用描述输入框
const disabledDescriptionField = computed(() => {
    return chooseRow.value?.materialType === "wt.part.WTPart"
        ? true
        : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomRawMaterial"
        ? true
        : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial"
        ? true
        : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomCompleteMachine"
        ? true
        : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomStandardParts"
        ? true
        : (computed(() => !isCanEdit.value) as any).value
})
// 禁用编辑详情按钮
const disabledEditDetailsBtn = computed(() => {
    const row = multipleSelection.value.length ? multipleSelection.value[0] : chooseRow.value
    return !(
        row.materialType === "wt.part.WTPart|com.pdinfo.kbomPHANTOM" ||
        row.materialType === "wt.part.WTPart|com.pdinfo.kbomCAR" ||
        row.materialType === "wt.part.WTPart|com.pdinfo.kbomMODULE"
    )
})
interface ItemInterface {
    type: string
    label: string
    prop: string
    rules?: any[]
    placeholder?: string
    disabled?: boolean
    iconSearch?: boolean
    options?: SelectInterface[]
    onChange?: Function
    formatter?: Function
}
// 公共字段
const publicItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "裁剪方式",
        prop: "trimMethod",
        placeholder: "请选择",
        options: computed(() => optionTrimList.value) as any,
        disabled:
            chooseRow.value?.materialType === "wt.part.WTPart"
                ? true
                : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomRawMaterial"
                ? true
                : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial"
                ? true
                : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomCompleteMachine"
                ? true
                : chooseRow.value?.materialType === "wt.part.WTPart|com.pdinfo.kbomStandardParts"
                ? true
                : (computed(() => !isCanEdit.value) as any)
    }
    // {
    //     type: "textarea",
    //     label: "描述",
    //     prop: "description",
    //     disabled:
    //         chooseRow.value.materialType === "wt.part.WTPart"
    //             ? true
    //             : chooseRow.value.materialType === "wt.part.WTPart|com.pdinfo.kbomRawMaterial"
    //             ? true
    //             : chooseRow.value.materialType === "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial"
    //             ? true
    //             : chooseRow.value.materialType === "wt.part.WTPart|com.pdinfo.kbomCompleteMachine"
    //             ? true
    //             : chooseRow.value.materialType === "wt.part.WTPart|com.pdinfo.kbomStandardParts"
    //             ? true
    //             : (computed(() => !isCanEdit.value) as any),
    //     placeholder: "请输入"
    // }
])

// 物料为零部件类型
const partsItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "关重件特性",
        prop: "lgImpodegree",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: impodegreeList
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "工艺状态",
        prop: "processStatus",
        placeholder: "请选择",
        options: processStatusList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: computed(() => !isCanEdit.value) as any,
        iconSearch: false
    },
    {
        type: "inputNumber",
        label: "单件毛重",
        prop: "lgGrossWeight",
        disabled: computed(() => !isCanEdit.value) as any,
        iconSearch: false
    },
    {
        type: "input",
        label: "原材料编码",
        prop: "lgRawpartCode",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯外形尺寸",
        prop: "lgBlankSize",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯规格",
        prop: "lgBlankStandard",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯种类",
        prop: "lgBlankType",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "inputNumber",
        label: "毛坯件数",
        prop: "lgEachBlankNumber",
        disabled: computed(() => !isCanEdit.value) as any,
        iconSearch: false
    },
    {
        type: "input",
        label: "下料工段",
        prop: "lgFeedSection",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "input",
        label: "工艺路线",
        prop: "lgProRoute",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "预计划分类",
        prop: "preparePlanType",
        placeholder: "请选择",
        options: computed(() => optionPrePlanTypeList.value) as any,
        disabled: computed(() => !isCanEdit.value) as any
    }
])
// 物料为原材料类型
const rawMaterialItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "下料工段",
        prop: "lgFeedSection",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    }
])
// 物料为辅料类型
const accessoryItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: true
    }
])
// 物料为模块类型
const moduleTypeItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: true
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    }
])
// 物料为整机配置类型
const overallConfigurationItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: computed(() => !isCanEdit.value) as any,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: computed(() => !isCanEdit.value) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "产品类型",
        prop: "productType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductTypeList.value) as any,
        disabled: computed(() => !isCanEdit.value) as any,
        onChange: handleProductTypeChange
    },
    {
        type: "select",
        label: "产品线",
        prop: "productLineChild",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductLineList.value) as any,
        disabled: computed(() => !isCanEdit.value) as any,
        onChange: handleProductLineChildChange
        // formatter: (value: string) => {
        //     return getNameById(option_childLine.value, value, {
        //         value: "code",
        //         label: "codeListNameC"
        //     })
        // }
    },
    {
        type: "select",
        label: "产品子线",
        prop: "productSubLine",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductSubLineList.value) as any,
        disabled: computed(() => !isCanEdit.value) as any
        // formatter: (value: string) => {
        //     return getNameById(option_childLine.value, value, {
        //         value: "code",
        //         label: "codeListNameC"
        //     })
        // }
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: computed(() => !isCanEdit.value) as any
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: computed(() => !isCanEdit.value) as any
    }
])
// 物料为整机类型
const completeMachineItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "产品类型",
        prop: "productType",
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "产品线",
        prop: "productLineChild",
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductLineList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "产品子线",
        prop: "productSubLine",
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductSubLineList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: true
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件毛重",
        prop: "lgGrossWeight",
        disabled: true
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "工艺状态",
        prop: "processStatus",
        placeholder: "请选择",
        options: processStatusList,
        disabled: true
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    }
])
// 物料为标准件类型
const standardPartItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "原材料编码",
        prop: "lgRawpartCode",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: true
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    }
])
const itemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => materielTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "产品位置",
        prop: "selectProductName",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "文件夹位置",
        prop: "selectFolderName",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "关重件特性",
        prop: "lgImpodegree",
        placeholder: "请选择",
        disabled: true,
        options: impodegreeList
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "select",
        label: "工艺状态",
        prop: "processStatus",
        placeholder: "请选择",
        options: processStatusList,
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件毛重",
        prop: "lgGrossWeight",
        disabled: true
    },
    {
        type: "input",
        label: "原材料编码",
        prop: "lgRawpartCode",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯外形尺寸",
        prop: "lgBlankSize",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯规格",
        prop: "lgBlankStandard",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯种类",
        prop: "lgBlankType",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "inputNumber",
        label: "毛坯件数",
        prop: "lgEachBlankNumber",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "下料工段",
        prop: "lgFeedSection",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: true
    },
    {
        type: "input",
        label: "工艺路线",
        prop: "lgProRoute",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: true
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "textarea",
        label: "描述",
        prop: "description",
        disabled: true,
        placeholder: "请输入"
    }
    // {
    //     label: "同步时间",
    //     prop: "syncTime"
    // }
    //#endregion
])
const detailItemsData = ref<any[]>([]) // 详情列
// 初始化详情列
const initDetailItem = (materialType: string) => {
    switch (materialType) {
        case "wt.part.WTPart" || "wt.part.WTPart|com.pdinfo.kbomMATERIAL":
            detailItemsData.value = itemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomPHANTOM": // 物料为零部件类型
            detailItemsData.value = partsItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomRawMaterial": // 物料为原材料类型
            detailItemsData.value = rawMaterialItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial": // 物料为辅料类型
            detailItemsData.value = accessoryItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomMODULE": // 物料为模块类型
            detailItemsData.value = moduleTypeItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomCAR": // 物料为整机配置类型
            detailItemsData.value = overallConfigurationItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomCompleteMachine": // 物料为整机类型
            detailItemsData.value = completeMachineItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomStandardParts": // 物料为标准件类型
            detailItemsData.value = standardPartItemsData.value
            break

        default:
            detailItemsData.value = []
            break
    }
    publicItemsData.value.forEach((ele) => detailItemsData.value.push(ele))

    console.log("detailItemsData.value： ", detailItemsData.value)
}

// 处理编辑保存按钮
const handleEditSaveBtn = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                const params: {
                    oid: string
                    materialType: string // 类型
                    partCategory: string // 零件类型
                    productOid: string // 选择产品
                    pid: string // 选择文件夹
                    number: string // 编号
                    name: string // 名称
                    materialSymbol?: string // 代号
                    material?: string // 材料
                    machineModel?: string // 机型号
                    importantDegree?: string // 关重件特性
                    lifeCycle?: string // 生命周期
                    processState?: string // 工艺状态
                    netWeight?: number // 单件净重
                    grossWeight?: number // 单件毛重
                    rawPartCode?: string // 原材料编码
                    blankSpecification?: string // 毛胚规格
                    blankSize?: string // 毛坯外形尺寸
                    blankType?: string // 毛胚种类
                    blankNumber?: number // 毛胚件数
                    feedSection?: string // 下料工段
                    unit?: string // 单位
                    drawing?: string // 图幅
                    ownerGroup?: string // 所属用户组
                    productPhase?: string // 阶段标识
                    processRoute?: string // 工艺路线
                    desc?: string // 描述
                    // version: "" // 版本
                    owner?: string // 所有者
                    // checkOuter: "" // 检出者
                    // checkTime: "" // 检出时间
                    // updater: "" // 修改者
                    // updateTime: "" // 修改时间
                    // releasedTime: "" // 发布时间
                    // createTime: "" // 创建时间
                    // creator: "" // 创建者
                    belongCompany?: string // 所属公司
                    anotherName?: string // 别名
                    layout?: string // 规划方法
                    planMethod?: string // 计划方法
                    loaderIssuingStock?: string // 装载机发料仓库
                    fujianLoaderIssuingStock?: string // 福建装载机发料仓库
                    synchronizationTime?: string // 同步时间
                    shanghaiMechanicalPartType?: string // 上海机械零件类型
                    shanghaiExcavatorPartsType?: string // 上海挖机零件类型
                    fujianMechanicalPartType?: string // 福建机械零件类型
                    shanghaiRoadbedPartType?: string // 上海路面零件类型自制零件
                    shanghaiForkliftPartType?: string // 上海叉车零件类型
                    shanghaiComponentPartType?: string // 上海部件零件类型
                    jiangxiMechanicalPartType?: string // 江西机械零件类型
                    shanghaiHydraulicPartType?: string // 上海液压零件类型
                    fujianHydraulicPartType?: string // 福建液压零件类型
                    fujianBridgeBoxPartType?: string // 福建桥箱零件类型
                    fujianCastPartType?: string // 福建铸锻零件类型
                    precisionHydraulicPartType?: string // 精工液压零件类型
                    fujianExcavatorPartType?: string // 福建挖机零件类型
                    fujianSparePartsType?: string // 福建配件零件类型
                    preparePlanType: string // 预计划分类
                    productType: string // 产品类型
                    productLineChild: string // 产品线
                    productSubLine: string // 产品子线
                    trimMethod: string // 裁剪方式
                    viewName: string // 显示规则类型名称
                } = {
                    oid: editMaterialForm.oid,
                    materialType: editMaterialForm.materialType, // 类型
                    partCategory: editMaterialForm.lgPartType, // 零件类型
                    productOid: editMaterialForm.selectProductOid, // 选择产品
                    pid: editMaterialForm.selectFolderOid, // 选择文件夹
                    number: editMaterialForm.code, // 编号
                    name: editMaterialForm.name, // 名称
                    materialSymbol: editMaterialForm.lgDrawingNo, // 代号
                    material: editMaterialForm.material, // 材料
                    machineModel: editMaterialForm.lgModel, // 机型号
                    importantDegree: editMaterialForm.lgImpodegree, // 关重件特性
                    lifeCycle: editMaterialForm.lifeCycleTemplate, // 生命周期
                    processState: editMaterialForm.processStatus, // 工艺状态
                    netWeight: editMaterialForm.weight, // 单件净重
                    grossWeight: editMaterialForm.lgGrossWeight, // 单件毛重
                    rawPartCode: editMaterialForm.lgRawpartCode, // 原材料编码
                    blankSpecification: editMaterialForm.lgBlankStandard, // 毛胚规格
                    blankSize: editMaterialForm.lgBlankSize, // 毛坯外形尺寸
                    blankType: editMaterialForm.lgBlankType, // 毛胚种类
                    blankNumber: editMaterialForm.lgEachBlankNumber, // 毛胚件数
                    feedSection: editMaterialForm.lgFeedSection, // 下料工段
                    unit: editMaterialForm.lgUnit, // 单位
                    drawing: editMaterialForm.lgDrawing, // 图幅
                    ownerGroup: editMaterialForm.ownerGroup, // 所属用户组
                    productPhase: editMaterialForm.productPhase, // 阶段标识
                    processRoute: editMaterialForm.lgProRoute, // 工艺路线
                    desc: editMaterialForm.description, // 描述
                    // version: "" // 版本
                    owner: editMaterialForm.owner, // 所有者
                    // checkoutBy: "" // 检出者
                    // checkoutTime: "" // 检出时间
                    // modifor: "" // 修改者
                    // modifyTime: "" // 修改时间
                    // papproveTime: "" // 发布时间
                    // createTime: "" // 创建时间
                    // creator: "" // 创建者
                    belongCompany: editMaterialForm.lgBelongCompany, // 所属公司
                    anotherName: editMaterialForm.lgAnotherName, // 别名
                    layout: editMaterialForm.planningMethod, // 规划方法
                    planMethod: editMaterialForm.projectMethod, // 计划方法
                    loaderIssuingStock: editMaterialForm.fjzzjissueStock2, // 装载机发料仓库
                    fujianLoaderIssuingStock: editMaterialForm.fjzzjissueStock, // 福建装载机发料仓库
                    synchronizationTime: editMaterialForm.syncTime, // 同步时间
                    shanghaiMechanicalPartType: editMaterialForm.type1, // 上海机械零件类型
                    shanghaiExcavatorPartsType: editMaterialForm.type2, // 上海挖机零件类型
                    fujianMechanicalPartType: editMaterialForm.type3, // 福建机械零件类型
                    shanghaiRoadbedPartType: editMaterialForm.type4, // 上海路面零件类型自制零件
                    shanghaiForkliftPartType: editMaterialForm.type5, // 上海叉车零件类型
                    shanghaiComponentPartType: editMaterialForm.type6, // 上海部件零件类型
                    jiangxiMechanicalPartType: editMaterialForm.type7, // 江西机械零件类型
                    shanghaiHydraulicPartType: editMaterialForm.type8, // 上海液压零件类型
                    fujianHydraulicPartType: editMaterialForm.type9, // 福建液压零件类型
                    fujianBridgeBoxPartType: editMaterialForm.type10, // 福建桥箱零件类型
                    fujianCastPartType: editMaterialForm.type11, // 福建铸锻零件类型
                    precisionHydraulicPartType: editMaterialForm.type12, // 精工液压零件类型
                    fujianExcavatorPartType: editMaterialForm.type13, // 福建挖机零件类型
                    fujianSparePartsType: editMaterialForm.type14, // 福建配件零件类型
                    preparePlanType: editMaterialForm.preparePlanType, // 预计划分类
                    productType: editMaterialForm.productType, // 产品类型
                    productLineChild: editMaterialForm.productLineChild, // 产品线
                    productSubLine: editMaterialForm.productSubLine, // 产品子线
                    trimMethod: editMaterialForm.trimMethod, // 裁剪方式
                    viewName: editMaterialForm.viewName // 显示规则类型名称
                }
                const { data } = (await createPart(params)) as any
                console.log("data: ", data)
                ElMessage({
                    type: "success",
                    message: "编辑成功！",
                    center: true
                })
                isCanEdit.value = false
                console.log("PtTableRef.value!: ", PtTableRef.value)
                // PtTableRef.value!.toggleRowSelection(row, true)
                getList()
            } catch (err: any) {
                console.log(err)
                loading.value = false
            }
        }
    })
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList)
//#endregion

watch(
    () => props.currentTreeNodeData,
    (val) => {
        // 判断有无oid，或者为个人工作区，或者为公共工作区
        if (!val.oid || val.oid === "0" || val.oid === "1" || val.type === "PDMLinkProduct") return
        // 切换文件夹时清空选中状态及选中数据
        if (PtTableRef.value) {
            PtTableRef.value!.clearSelection()
        }
        getList()
    },
    { immediate: true }
)

// 向外父组件暴露方法
defineExpose({
    getList,
    isCanEdit
})
</script>

<style lang="scss" scoped>
.sf-container-main-content {
    .sf-table-wrapper {
        .table-edit {
            :deep(.el-form) {
                .el-form-item {
                    margin-bottom: 0px;
                }
            }
        }
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
        .pt-container-main-right {
            margin-left: 5px;
            :deep(.el-form) {
                width: 100%;
                .el-form-item {
                    width: 100%;
                    margin-right: 0px;
                    margin-bottom: 16px;
                }
                .el-row:last-child {
                    .el-col:last-child {
                        .el-form-item {
                            width: 200%;
                        }
                    }
                }
            }
        }
    }
}
</style>
