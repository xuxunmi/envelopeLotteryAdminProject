<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main" v-loading="loading">
                <div class="sf-container-main-content">
                    <div class="sf-table-wrapper">
                        <pt-table
                            ref="PtTableRef"
                            :tableColumns="tableColumns"
                            :tableEditConfig="tableEditConfig"
                            :paginationConfig="pageData"
                            :menuConfig="menuConfig"
                            :data="tableData"
                            :locale="locale"
                            row-key="groupOid"
                            border
                            highlight-current-row
                            size="small"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @selection-change="handleSelectionChange"
                            @row-click="handleRowClick"
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <span class="table-edit fromWrapper">
                                    <el-form :model="searchForm" size="small" @submit.prevent>
                                        <el-form-item>
                                            <el-input
                                                v-model.trim="searchForm.keywords"
                                                clearable
                                                @keydown.enter="getList"
                                            />
                                        </el-form-item>
                                    </el-form>
                                    <el-button class="mr-2" type="primary" size="small" @click="getList"
                                        >刷新</el-button
                                    >
                                    <el-button class="mr-2" type="primary" size="small" @click="getList">{{
                                        $t("materielPage.query")
                                    }}</el-button>
                                    <el-button class="mr-2" type="primary" size="small" @click="handleAddEditBtn('add')"
                                        >新增</el-button
                                    >
                                    <el-button
                                        class="mr-2"
                                        type="primary"
                                        size="small"
                                        :disabled="!chooseRow"
                                        @click="handleAddEditBtn('edit')"
                                        >修改</el-button
                                    >
                                    <el-button
                                        class="mr-2"
                                        type="primary"
                                        size="small"
                                        @click="handleDeleteBtn"
                                        :disabled="!multipleSelection.length"
                                        >删除</el-button
                                    >
                                </span>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <!-- <template #col-action="{ row }">
                                <el-button type="primary" size="small" @click="handleAddEditBtn('edit', row)" link
                                    >修改</el-button
                                >
                            </template> -->
                        </pt-table>
                    </div>
                </div>

                <dialogFrame
                    :title="dialogTitle"
                    v-model:visible="dialogVisible.addEdit"
                    :footer="false"
                    width="40%"
                    @close="handleDialogClose"
                >
                    <createOrUpdateDialog
                        v-if="dialogVisible.addEdit"
                        v-model:visible="dialogVisible.addEdit"
                        :dialogType="dialogType"
                        :currentRowData="chooseRow"
                        @confirm-success="handleConfirmSuccess"
                    />
                </dialogFrame>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue"
import createOrUpdateDialog from "./components/createOrUpdateDialog.vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import { usePagination } from "@/hooks/usePagination"
import { OrganizationManageTableInterface } from "@/interface/system/organizationManage"
import { getOrganizationManageData, deleteOrganization } from "@/api/system/organizationManage"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "organizationManage"
})

const { t, locale } = useI18n()
const loading = ref(false)

//#region 显示不同的弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
const dialogVisible: { [key: string]: boolean } = reactive({
    addEdit: false // 新增/编辑对话框
})
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<OrganizationManageTableInterface[]>([])
const multipleSelection = ref<OrganizationManageTableInterface[]>([])
const chooseRow = ref() // 当前行数据

const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true,
        reserveSelection: true
    },
    {
        label: computed(() => t("organizationManagePage.sequence")) as any,
        type: "index",
        width: "50",
        headerAlign: "center",
        fixed: "left",
        show: true,
        index: (index: number) => {
            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
        }
    },
    {
        prop: "code",
        label: "组织编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "name",
        label: "组织名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "owner",
        label: "创建者",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createDate",
        label: computed(() => t("organizationManagePage.createDate")) as any,
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    }
    // {
    //     prop: "action",
    //     label: computed(() => t("organizationManagePage.action")) as any,
    //     slot: "action",
    //     headerAlign: "center",
    //     width: "60",
    //     showOverflowTooltip: true,
    //     show: true
    // }
])

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})

// 方法
const handleRowClick = (row: OrganizationManageTableInterface) => {
    console.log("handleRowClick", row)
    setCurrent(row)
}
// 事件
const setCurrent = (row?: OrganizationManageTableInterface) => {
    chooseRow.value = row
    PtTableRef.value!.setCurrentRow(row)
}

const handleSelectionChange = (val: OrganizationManageTableInterface[]) => {
    multipleSelection.value = val
}
//#endregion

// 获取组织列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            ...searchForm,
            page: String(pageData.currentPage),
            limit: String(pageData.pageSize)
        }
        const { data, total } = (await getOrganizationManageData(params)) as any
        tableData.value = data.map((item: any) => {
            return {
                productOid: item.productOid,
                groupOid: item.groupOid,
                name: item.name,
                code: item.groupNumber,
                owner: item.owner,
                createDate: item.createTime
            }
        })
        pageData.total = total
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

//#region 表单
const searchForm = reactive({
    name: ""
})

//#region 头部按钮操作
// 处理新增/编辑按钮
const handleAddEditBtn = (type: string) => {
    dialogTitle.value =
        type === "add" ? t("organizationManagePage.creatOrganization") : t("organizationManagePage.editOrganization")
    dialogType.value = type
    dialogVisible.addEdit = true
}

// 处理删除按钮
const handleDeleteBtn = () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: "请先勾选数据！",
            center: true
        })
        return
    }
    ElMessageBox.confirm("是否确认删除勾选数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            const productOids = multipleSelection.value.map((item) => item.productOid).join()
            deleteBatchHandler(productOids)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消删除！",
                center: true
            })
        })
}

const deleteBatchHandler = async (productOids: string) => {
    try {
        loading.value = true
        const params: {
            productOid: string
        } = {
            productOid: productOids
        }
        const { message } = (await deleteOrganization(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}
//#endregion

//#region 关闭对话弹窗
const handleConfirmSuccess = (dialogType: string) => {
    dialogVisible[dialogType] = false
    resetDialog()
    getList()
}

const handleDialogClose = () => {
    dialogVisible.addEdit = false
    resetDialog()
}

// 重置dialog值
const resetDialog = () => {
    dialogTitle.value = ""
    multipleSelection.value = []
    chooseRow.value = null
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion
</script>

<style lang="scss" scoped></style>
