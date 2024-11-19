<template>
    <div class="sf-container-main-content">
        <pt-table
            v-loading="loading"
            ref="PtTableRef"
            row-key="frontEndID"
            :locale="locale"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :expand-row-keys="expandRowKeys"
            :tree-props="{ children: 'children', hasChildren: 'leaf' }"
            :load="load"
            :tooltip-options="{
                placement: 'bottom'
            }"
            lazy
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @expand-change="handleExpandChange"
            @sort-change="handleSortChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" :disabled="!topObject.oid" @click="getList">{{
                        t("dashboardPage.refresh")
                    }}</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        :disabled="!(chooseRow && chooseRow.type === 'Product')"
                        @click="goAdd_group(chooseRow)"
                        >新建组</el-button
                    >
                    <el-button
                        type="primary"
                        size="small"
                        :disabled="!(chooseRow && chooseRow.type === 'Product')"
                        @click="goAdd_option(chooseRow)"
                        >{{ t("enterpriseTraitLibraryPage.addFeature") }}</el-button
                    >
                    <el-button :loading="loading_sync" type="primary" size="small" @click="goSyncFeatureValues"
                        >同步特征和特征值</el-button
                    >
                    <!-- <el-button
                type="primary"
                size="small"
                :disabled="!(chooseRow && chooseRow.type==='Option')"
                @click="goFeatureReplace(chooseRow)"
              >特征值替换</el-button> -->
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #head-search="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #head-icon="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #col-icon="{ row }">
                <ObjectIcon :objectType="row.type" style="top: 3px" />
                {{ row.number }}
            </template>
            <!-- 右键菜单 -->
            <template #slot-menu="{ row }">
                <template v-if="row?.type === 'Product'">
                    <li @click="goAdd_group(row)">新建组</li>
                    <li @click="goAdd_option(row)">{{ t("enterpriseTraitLibraryPage.addFeature") }}</li>
                </template>
                <template v-else-if="row?.type === 'Group'">
                    <li @click="goEdit_group(row)">{{ t("dashboardPage.edit") }}</li>
                    <li @click="goDel(row)">{{ t("dashboardPage.delete") }}</li>
                    <li @click="goAdd_option(row)">{{ t("enterpriseTraitLibraryPage.addFeature") }}</li>
                </template>
                <template v-else-if="row?.type === 'Option'">
                    <!-- <li @click="goDetail(row)">{{ t('dashboardPage.details') }}</li> -->
                    <li @click="goEdit_option(row)">{{ t("dashboardPage.edit") }}</li>
                    <li @click="goDel(row)">{{ t("dashboardPage.delete") }}</li>
                    <li @click="goAdd_choice(row)">{{ t("enterpriseTraitLibraryPage.addFeatureValue") }}</li>
                    <li @click="goBatchAdd_choice(row)">批量新建特征值</li>
                    <li @click="goAllocation(row)">分配到组</li>
                    <li @click="goSaveAs_option(row)">另存为</li>
                </template>
                <template v-else-if="row?.type === 'Choice'">
                    <!-- <li @click="goDetail(row)">{{ t('dashboardPage.details') }}</li> -->
                    <li @click="goEdit_choice(row)">{{ t("dashboardPage.edit") }}</li>
                    <li @click="goDel(row)">{{ t("dashboardPage.delete") }}</li>
                </template>
            </template>
        </pt-table>

        <!-- 组 - 新增/编辑弹窗 -->
        <EditGroupDialog
            v-if="editGroupDialog.visible"
            :dialog="editGroupDialog"
            @handleEditSuccess="handleEditSuccess_group"
        />
        <!-- 特征 - 新增/编辑弹窗 -->
        <EditOptionDialog
            v-if="editOptionDialog.visible"
            :productTypeList="productTypeList"
            :dialog="editOptionDialog"
            @handleEditSuccess="handleEditSuccess_option"
        />
        <!-- 特征值 - 新增/编辑弹窗 -->
        <EditChoiceDialog
            v-if="editChoiceDialog.visible"
            :dialog="editChoiceDialog"
            @handleEditSuccess="handleEditSuccess_choice"
        />
        <!-- 特征值 - 批量新增弹窗 -->
        <BatchAddChoiceDialog
            v-if="batchAddChoiceDialog.visible"
            :dialog="batchAddChoiceDialog"
            @handleEditSuccess="handleEditSuccess_batchChoice"
        />
        <!-- 分配到组 -->
        <AllocationOptionDialog
            v-if="allocationOptionDialog.visible"
            :dialog="allocationOptionDialog"
            :topObject="topObject"
            @handleEditSuccess="handleEditSuccess_allocation"
        />
        <!-- 特征值替换 -->
        <FeatureReplaceDialog
            v-if="featureReplaceDialog.visible"
            :dialog="featureReplaceDialog"
            :topObject="topObject"
            @handleEditSuccess="handleEditSuccess_replace"
        />
        <!-- 特征删除报错信息弹窗 -->
        <dialogFrame :title="delErrorTitle" v-model:visible="dialogVisible.errMsg" :footer="false" width="40%">
            <errorMessageDialog
                v-if="dialogVisible.errMsg"
                v-model:visible="dialogVisible.errMsg"
                :errorMessage="delErrorMsg"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, reactive } from "vue"
import { useRouter } from "vue-router"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import EditGroupDialog from "./editGroupDialog.vue"
import EditOptionDialog from "./editOptionDialog.vue"
import EditChoiceDialog from "./editChoiceDialog.vue"
import BatchAddChoiceDialog from "./batchAddChoiceDialog.vue"
import AllocationOptionDialog from "./allocationOptionDialog.vue"
import FeatureReplaceDialog from "./featureReplaceDialog.vue"
import ObjectIcon from "./objectIcon.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import ErrorMessageDialog from "@/views/system/systemLog/components/errorMessageDialog.vue"
import { SelectInterface } from "@/interface/common"
import {
    getFeatureTree,
    delOptionChoiceServices,
    syncOrgProductConfig,
    codeFeatureSync
} from "@/api/traitManage/enterpriseTraitLibrary"
import { filterArray, resetFilterValue, recursionArray, windowOpenTab, goSort } from "@/utils"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    topObject: {
        type: Object,
        default: {}
    },
    // 产品分类
    productTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    // 搜索参数
    searchForm: {
        type: Object,
        default: {
            oid: "", // 组织名称
            name: "", // 特征名称
            number: "" // 特征编码
        }
    }
})
const router = useRouter()
const emits = defineEmits(["handleRowClick"])
const { t, locale } = useI18n()

const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const currentRowData = ref()
let frontEndID = 1 // 唯一id
const expandRowKeys = ref<any>([])
const sortParams = reactive({
    sortBy: "",
    sorted: "",
    sortType: ""
})

//#region 增、删、改、查
// 获取列表
const getList = (row?: any) => {
    console.log("getList列表row: ", row)
    loading.value = true
    handleRowClick(props.topObject)
    tableData.value = []
    expandRowKeys.value = ["0"]
    chooseRow.value = null
    frontEndID = 1
    getFeatureTree(props.searchForm)
        .then((data) => {
            // console.log(data)
            const arr = formatData(data.data) || []
            const list = [
                {
                    frontEndID: "0",
                    oid: props.topObject.oid,
                    name: props.topObject.name,
                    number: props.topObject.name,
                    type: "Product",
                    children: arr
                }
            ]
            sourceData.value = list
            resetFilterValue(filterValue)
            search()
            if (!row) {
                setTimeout(() => setCurrent(tableData.value[0]), 1)
            } else {
                // 编辑后，高亮当前编辑行
                recursionArray(tableData.value, (item: any) => {
                    if (item.oid && item.oid === row.oid) {
                        nextTick(() => {
                            setCurrent(item)
                        })
                    }
                })
            }
        })
        .finally(() => (loading.value = false))
}
// 懒加载物料列表
const load = (tree: any, treeNode?: unknown, resolve?: (date: any) => void) => {
    console.log(tree, treeNode)
    loading.value = true
    const params = {
        oid: tree.oid
    }
    getFeatureTree(params)
        .then((data: any) => {
            const list = formatData(data.data)
            if (list.length) {
                insertAllTableData(tree.frontEndID, list)
                if (resolve) resolve([])
            } else {
                insertAllTableData(tree.frontEndID, [])
                if (resolve) resolve([])
            }
            search()
            setTimeout(() => resetCurrent(tree.frontEndID), 1)
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
    recursionArray(sourceData.value, (item: any) => {
        if (item.frontEndID === id) {
            item.children = JSON.parse(JSON.stringify(arr))
            item.leaf = false
        }
    })
}
// 局部刷新
const partRefresh = (row: any, isParent?: boolean) => {
    // console.log('partRefresh', row, isParent);
    // 刷新bom
    const refreshRow = row
    if (refreshRow.type === "Product") {
        // 第一层
        getList(currentRowData.value)
    } else {
        // 非第一层
        if (isParent) {
            // 父级
            recursionArray(tableData.value, (item: any, i: number, parent: any) => {
                if (item.oid && item.oid === refreshRow.pid) {
                    // console.log('parent', item);
                    partRefresh(item)
                }
            })
        } else {
            // 当前
            load(refreshRow) // 刷新左侧树
            emits("handleRowClick", refreshRow) // 刷新右侧详情
        }
    }
    // 刷新list
    if (row === chooseRow.value) handleRowClick(refreshRow)
}
// 格式化返回数据
const formatData = (list: any[]) => {
    const arr = JSON.parse(JSON.stringify(list || []))
    recursionArray(arr, (item: any, i: any, parent) => {
        item.frontEndID = "" + frontEndID++ // 生成唯一id
        if (item.expanded) expandRowKeys.value.push(item.frontEndID) // 默认展开行
        // if (parent) item.parentOid = parent.PartOid // 添加父级oid
    })
    return arr
}
// 重置当前行
const resetCurrent = (frontEndID: string) => {
    console.log("resetCurrent", frontEndID, currentRowData.value)
    if (!frontEndID) return false
    let flag = true
    if (currentRowData.value) {
        recursionArray(tableData.value, (item: any) => {
            // 编辑后，高亮当前编辑行
            if (item.oid && item.oid === currentRowData.value.oid) {
                setCurrent(item)
                flag = false
                return "return"
            }
        })
    }
    if (flag) {
        recursionArray(tableData.value, (item: any) => {
            if (item.frontEndID === frontEndID) {
                setCurrent(item)
                return "return"
            }
        })
    }
}
// 大删除接口（组/特征/特征值）
//#region 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    errMsg: false // 异常信息对话框
})
const delErrorTitle = ref<string>("")
const delErrorMsg = ref<string>("")
//#endregion
const goDel = (row: any) => {
    console.log("goDel", row)
    ElMessageBox.confirm(`是否确认删除${row.name}?`, t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        loading.value = true
        delOptionChoiceServices({
            oid: row.oid,
            number: row.number
        })
            .then((data) => {
                ElMessage.success("删除成功！")
                partRefresh(row, true)
            })
            .catch((error) => {
                console.log("error: ", error)
                delErrorTitle.value = `删除报错信息: ${row.name}`
                delErrorMsg.value = error.message
                const dialogType = "errMsg"
                dialogVisible[dialogType] = true
                loading.value = false
            })
    })
}
// 查看详情（特征/特征值）
const goDetail = (row: any) => {
    console.log("查看详情", row)
    const url = router.resolve({
        path: "/traitManage/traitDetail",
        query: { oid: row.oid, type: row.type, hiddenNav: "true" }
    })
    windowOpenTab(url.href)
}
// 同步特征值
const loading_sync = ref(false)
const goSyncFeatureValues = () => {
    const oid = props.topObject.oid
    if (!oid) {
        ElMessage.error("请选择组织！")
        return false
    }
    loading_sync.value = true
    syncOrgProductConfig({ oid: props.topObject.oid })
        .then((data) => {
            ElMessage.success("同步到中间表成功！")
        })
        .finally(() => (loading_sync.value = false))

    codeFeatureSync({ productOid: props.topObject.oid })
        .then((data) => {
            ElMessage.success("同步到U9成功！")
        })
        .finally(() => (loading_sync.value = false))
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any) => {
    console.log("row-click", row)
    setCurrent(row)
    emits("handleRowClick", row)
}
// 展开回调
const handleExpandChange = (row: any, expanded: any) => {
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
// 排序回调
const handleSortChange = (data: { column: any; prop: string; order: any }) => {
    console.log("handleSortChange", data)
    sortParams.sortBy = data.prop
    sortParams.sorted = data.order
    search()
}
// 事件
const setCurrent = (row?: any) => {
    chooseRow.value = row
    currentRowData.value = row
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "index",
        label: "序号",
        width: "55",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "number",
        label: "特征编码",
        minWidth: "160",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true,
        slot: "icon",
        headerAlign: "center"
    },
    {
        prop: "name",
        label: "特征名称",

        minWidth: "180",
        sortable: "custom",
        // showOverflowTooltip: true,
        show: true,
        slot: "search",
        headerAlign: "center"
    }
])
const goEdit = (row: any) => {
    console.log("编辑", row)
}
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
const goCopy = (row: any) => {
    console.log("复制", row)
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

//#endregion

//#region 组 - 新增/编辑弹窗
const editGroupDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ""
})
// 新建组
const goAdd_group = (row: any) => {
    console.log("goAdd_group", row)
    Object.assign(editGroupDialog, {
        visible: true,
        title: t("enterpriseTraitLibraryPage.addGroup"),
        row,
        type: "add"
    })
}
// 编辑组
const goEdit_group = (row: any) => {
    console.log("goEdit_group", row)
    Object.assign(editGroupDialog, {
        visible: true,
        title: t("enterpriseTraitLibraryPage.editGroup"),
        row,
        type: "edit"
    })
}
// 组编辑成功回调
const handleEditSuccess_group = () => {
    const row = editGroupDialog.row || chooseRow.value
    partRefresh(row, editGroupDialog.type === "edit")
    console.log("handleEditSuccess_group", row)
    Object.assign(editGroupDialog, {
        visible: false,
        title: "",
        row: null,
        type: ""
    })
}
//#endregion

//#region 特征值替换 - 弹窗
const featureReplaceDialog = reactive<any>({
    visible: false,
    title: "",
    row: null
})
// 特征值替换
const goFeatureReplace = (row: any) => {
    console.log("goAdd_replace")
    Object.assign(featureReplaceDialog, {
        visible: true,
        title: "特征值替换",
        row
    })
}
// 特征值替换编辑成功回调
const handleEditSuccess_replace = () => {
    console.log("handleEditSuccess_replace")
    getList()
    Object.assign(featureReplaceDialog, {
        visible: false,
        title: "",
        row: null
    })
}
//#endregion

//#region 特征 - 新增/编辑弹窗
const editOptionDialog = reactive<any>({
    visible: false,
    title: "",
    row: {},
    type: ""
})
// 新建特征
const goAdd_option = (row: any) => {
    console.log("goAdd_option", row)
    Object.assign(editOptionDialog, {
        title: t("enterpriseTraitLibraryPage.addFeature"),
        type: "add",
        row,
        visible: true
    })
}
// 编辑特征
const goEdit_option = (row: any) => {
    console.log("goEdit_option", row)
    currentRowData.value = row
    Object.assign(editOptionDialog, {
        title: t("enterpriseTraitLibraryPage.editFeature"),
        type: "edit",
        row,
        visible: true
    })
}
// 另存为特征
const goSaveAs_option = (row: any) => {
    console.log("goSaveAs_option", row)
    Object.assign(editOptionDialog, {
        title: t("enterpriseTraitLibraryPage.editFeature"),
        type: "saveAs",
        row,
        visible: true
    })
}
// 特征编辑成功回调
const handleEditSuccess_option = (formData: any) => {
    const row = editOptionDialog.row || chooseRow.value
    console.log("handleEditSuccess_option特征保存回调", row, formData, PtTableRef.value)
    if (editOptionDialog.type === "add") {
        partRefresh(row, editOptionDialog.type === "edit" || editOptionDialog.type === "saveAs")
    } else {
        // 编辑后，高亮当前编辑行并滚动到当前编辑行
        const rowDoms = document.querySelectorAll(".el-table .el-table__body-wrapper .el-table__row")
        // console.dir(rowDoms)
        let findItem: any = null
        recursionArray(sourceData.value, (item: any, i: number) => {
            if (item.oid && item.oid === row.oid) {
                item.name = formData.name
                findItem = item
                search()
                nextTick(() => {
                    resetCurrent(findItem.frontEndID)
                    const scrollto = rowDoms[i]?.clientHeight * (i + 1) - 50
                    PtTableRef.value!.scrollTo({ top: scrollto, behavior: "smooth" })
                    emits("handleRowClick", findItem)
                })
            }
        })
    }

    Object.assign(editOptionDialog, {
        visible: false,
        title: "",
        row: null,
        type: ""
    })
}
//#endregion

//#region 特征值 - 新增/编辑弹窗
const editChoiceDialog = reactive<any>({
    visible: false,
    title: "",
    row: {},
    type: ""
})
// 新建特征值
const goAdd_choice = (row: any) => {
    console.log("goAdd_choice", row)
    Object.assign(editChoiceDialog, {
        title: t("enterpriseTraitLibraryPage.addFeatureValue"),
        type: "add",
        row,
        visible: true
    })
}
// 编辑特征值
const goEdit_choice = (row: any) => {
    console.log("goEdit_choice", row)
    currentRowData.value = row
    Object.assign(editChoiceDialog, {
        title: t("enterpriseTraitLibraryPage.editFeatureValue"),
        type: "edit",
        row,
        visible: true
    })
}
// 特征值编辑成功回调
const handleEditSuccess_choice = (formData: any) => {
    const row = editChoiceDialog.row || chooseRow.value
    console.log("handleEditSuccess_choic特征值保存回调", row, currentRowData.value, formData, tableData.value)
    if (editOptionDialog.type === "add") {
        partRefresh(row, editChoiceDialog.type === "edit")
    } else {
        // 编辑后，高亮当前编辑行并滚动到当前编辑行
        const rowDoms = document.querySelectorAll(".el-table .el-table__body-wrapper .el-table__row")
        // console.dir(rowDoms)
        let findItem: any = null
        recursionArray(sourceData.value, (item: any, i: number) => {
            if (item.oid && item.oid === row.oid) {
                item.name = formData.name
                findItem = item
                search()
                nextTick(() => {
                    resetCurrent(findItem.frontEndID)
                    const scrollto = rowDoms[i]?.clientHeight * (i + 1) - 50
                    PtTableRef.value!.scrollTo({ top: scrollto, behavior: "smooth" })
                    emits("handleRowClick", findItem)
                })
            }
        })
    }
    Object.assign(editChoiceDialog, {
        visible: false,
        title: "",
        row: null,
        type: ""
    })
}
//#endregion

//#region 特征值 - 批量新增弹窗
const batchAddChoiceDialog = reactive<any>({
    title: "批量新增特征值",
    visible: false,
    row: {}
})
// 新建特征值
const goBatchAdd_choice = (row: any) => {
    console.log("goBatchAdd_choice", row)
    Object.assign(batchAddChoiceDialog, {
        visible: true,
        row
    })
}
// 特征值编辑成功回调
const handleEditSuccess_batchChoice = () => {
    const row = batchAddChoiceDialog.row || chooseRow.value
    console.log("handleEditSuccess_batchChoice", row)
    partRefresh(row, batchAddChoiceDialog.type === "edit")
    Object.assign(batchAddChoiceDialog, {
        visible: false,
        row: null
    })
}
//#endregion

//#region 分配到组
const allocationOptionDialog = reactive<any>({
    visible: false,
    title: "",
    row: {}
})
// 分配到组
const goAllocation = (row: any) => {
    console.log("goAllocation", row, props.topObject)
    Object.assign(allocationOptionDialog, {
        title: "分配到组",
        row,
        visible: true
    })
}
// 特征值编辑成功回调
const handleEditSuccess_allocation = () => {
    const row = allocationOptionDialog.row || chooseRow.value
    console.log("handleEditSuccess_allocation", row)
    getList()
    Object.assign(allocationOptionDialog, {
        visible: false,
        title: "",
        row: null
    })
}
//#endregion

//#region 挂载全局变量
emitter.off("enterpriseTraitLibrary_goDetail", goDetail)
emitter.on("enterpriseTraitLibrary_goDetail", goDetail)

emitter.off("enterpriseTraitLibrary_goDel", goDel)
emitter.on("enterpriseTraitLibrary_goDel", goDel)

emitter.off("enterpriseTraitLibrary_goAdd_option", goAdd_option)
emitter.on("enterpriseTraitLibrary_goAdd_option", goAdd_option)

emitter.off("enterpriseTraitLibrary_goEdit_option", goEdit_option)
emitter.on("enterpriseTraitLibrary_goEdit_option", goEdit_option)

emitter.off("enterpriseTraitLibrary_goAllocation", goAllocation)
emitter.on("enterpriseTraitLibrary_goAllocation", goAllocation)

emitter.off("enterpriseTraitLibrary_goAdd_choice", goAdd_choice)
emitter.on("enterpriseTraitLibrary_goAdd_choice", goAdd_choice)

emitter.off("enterpriseTraitLibrary_goBatchAdd_choice", goBatchAdd_choice)
emitter.on("enterpriseTraitLibrary_goBatchAdd_choice", goBatchAdd_choice)

emitter.off("enterpriseTraitLibrary_goEdit_choice", goEdit_choice)
emitter.on("enterpriseTraitLibrary_goEdit_choice", goEdit_choice)
//#endregion

defineExpose({
    getList,
    partRefresh
})
</script>

<style lang="scss" scoped></style>
