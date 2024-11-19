<template>
    <div>
        <pt-table
            ref="PtTableRef"
            :locale="locale"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            border
            highlight-current-row
            size="small"
            max-height="calc(100vh - 94px)"
            @row-click="handleRowClick"
        >
            <template #slot-edit>
                <span class="table-edit">
                    <el-button type="primary" size="small" @click="goChangeOwner">变更所属者</el-button>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #head-search="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #col-edit="{ row }">
                <el-button type="primary" text size="small" @click="goDetail(row)">{{
                    t("dashboardPage.details")
                }}</el-button>
            </template>
            <template #col-unit> 个 </template>
            <template #col-detail="{ row }">
                <el-button type="primary" icon="InfoFilled" link @click="goDetail(row)" />
            </template>
            <!-- 右键菜单 -->
            <template #slot-menu="{ row }">
                <pt-menu-li :disabled="!parentRow || !(parentRow.isCheckOut && parentRow.isCheckUser)">
                    <span @click="goEdit(row)">{{ t("dashboardPage.edit") }}</span>
                </pt-menu-li>
                <pt-menu-li :disabled="!parentRow || !(parentRow.isCheckOut && parentRow.isCheckUser)">
                    <span @click="goDel(row)">{{ t("dashboardPage.delete") }}</span>
                </pt-menu-li>
                <pt-menu-li>
                    <span @click="goDetail(row)">{{ t("dashboardPage.details") }}</span>
                </pt-menu-li>
            </template>
        </pt-table>

        <el-dialog v-if="dialog.visible" v-model="dialog.visible" :title="dialog.title" width="300px">
            <div class="formWrapper">
                <el-form :model="formData" size="small">
                    <el-form-item :label="t('productBomPage.Amount')">
                        <el-input-number v-model="formData.Amount" :min="0" :precision="0" />
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button type="primary" @click="submit" size="small">保存</el-button>
                <el-button type="primary" @click="dialog.visible = false" size="small">{{ t("dashboardPage.cancel") }}</el-button>
            </template>
        </el-dialog>
        <!-- 变更所属者 - 弹窗 -->
        <ChangeOwnerDialog
            v-if="changeOwnerDialog.visible"
            :dialog="changeOwnerDialog"
            @handleEditSuccess="handleEditSuccess_owner"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import ChangeOwnerDialog from "@/views/bomManage/components/changeOwnerDialog/index.vue"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { getProductLayerBom, editBomItem, delBomItem } from "@/api/bomManage/productBom/index"
import { filterArray, resetFilterValue, windowOpenTab } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const router = useRouter()
const emits = defineEmits(["partRefresh"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any>([])
const parentRow = ref()
const chooseRow = ref()
const params = reactive({
    topPartoid: "",
    PartOid: ""
})
// 获取列表
const getList = (data?: any) => {
    if (data) {
        parentRow.value = data.row
        params.topPartoid = data.PartOid
        params.PartOid = parentRow.value.PartOid
    }
    getProductLayerBom(params).then((data) => {
        console.log("getProductLayerBom", data)
        sourceData.value = data.data || []
        resetFilterValue(filterValue)
        search()
    })
}

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
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
    colSetShow: true
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        prop: "Number",
        label: computed(() => t("productBomPage.PartNumber")) as any,
        width: "120",
        slot: "search",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "Name",
        label: computed(() => t("productBomPage.PartName")) as any,
        minWidth: "220",
        slot: "search",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "Amount",
        label: computed(() => t("productBomPage.Amount")) as any,
        width: "60",
        slot: "amount",
        // showOverflowTooltip: true,
        show: true
    },
    {
        label: computed(() => t("productBomPage.unit")) as any,
        width: "60",
        slot: "unit",
        // showOverflowTooltip: true,
        show: true
    },
    {
        label: computed(() => t("productBomPage.Version")) as any,
        prop: "Version",
        width: "60",
        // showOverflowTooltip: true,
        show: true
    },
    {
        width: "42",
        slot: "detail",
        fixed: "right",
        // showOverflowTooltip: true,
        show: true
    }
])
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
const goEdit = (row: any) => {
    console.log("编辑", row)
    setCurrent(row)
    formData.Amount = row.Amount
    dialog.visible = true
}
const goDel = (row: any) => {
    console.log("删除", row)
    ElMessageBox.confirm(t("dashboardPage.deleteSelectedData"), t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        delBomItem({ LinkOid: row.LinkOid }).then((data) => {
            ElMessage.success(t("dashboardPage.deleteSuccess"))
            emits("partRefresh", parentRow.value)
        })
    })
}
// 查看详情
const goDetail = (row: any) => {
    console.log("查看详情", row)
    setCurrent(row)
    // const url = router.resolve({
    //     path: "/product/productDetail",
    //     query: { oid: row.PartOid, type: "WTPart", hiddenNav: "true" }
    // })
    // windowOpenTab(url.href)
    router.push({
        path: `/product/bomDetail/${row.PartOid}`,
        query: { oid: row.PartOid, type: "WTPart", tagTitle: `${row.Number}_${row.Name}_${row.Version}` }
    })
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

//#region bom编辑 - 弹窗
const dialog = reactive({
    visible: false,
    title: t("productBomPage.editBOM")
})
const formData = reactive({
    Amount: 0
})
// 编辑保存
const submit = () => {
    const params = {
        ChildOid: chooseRow.value.PartOid,
        ParentOid: parentRow.value.PartOid,
        Amount: formData.Amount
    }
    editBomItem(params).then((data) => {
        console.log(data)
        ElMessage.success(t("dashboardPage.editSuccess"))
        dialog.visible = false
        getList()
    })
}
//#endregion

//#region 变更所属者 - 弹窗
const changeOwnerDialog = reactive<any>({
    visible: false,
    title: "",
    row: null
})
// 编辑组
const goChangeOwner = () => {
    console.log("goEdit_group", chooseRow.value)
    Object.assign(changeOwnerDialog, {
        visible: true,
        title: "变更所属者",
        row: chooseRow.value
    })
}
// 组编辑成功回调
const handleEditSuccess_owner = () => {
    const row = changeOwnerDialog.row || chooseRow.value
    console.log("handleEditSuccess_owner", row)
    getList()
    Object.assign(changeOwnerDialog, {
        visible: false,
        title: "",
        row: null
    })
}
//#endregion

defineExpose({
    tableData,
    getList
})
</script>

<style lang="scss" scoped></style>
