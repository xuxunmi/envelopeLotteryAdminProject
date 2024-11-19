<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading">
            <div class="search-container">
                <el-form :inline="true" :model="searchForm" size="small" @submit.prevent>
                    <el-form-item>
                        <el-input
                            v-model.trim="searchForm.codeName"
                            placeholder="请输入代码/名称"
                            @keyup.enter="getList"
                            @input="getList"
                            clearable
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-select
                            v-model="searchForm.status"
                            filterable
                            clearable
                            @change="getList"
                            style="width: 180px"
                        >
                            <el-option
                                v-for="item in dictionaryStatusList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="mr-2" size="small" type="primary" @click="getList" :disabled="isCanEdit"
                            >刷新</el-button
                        >
                        <template v-if="!isCanEdit">
                            <el-button class="mr-2" size="small" type="primary" @click="handleAddModifyBtn('add')"
                                >新增</el-button
                            >
                            <el-button class="mr-2" size="small" type="primary" @click="handleAddModifyBtn('modify')"
                                >修改</el-button
                            >
                        </template>
                        <template v-if="isCanEdit">
                            <el-button class="mr-2" size="small" type="primary" @click="handleCancelBtn"
                                >取消</el-button
                            >
                            <el-button
                                class="mr-2"
                                size="small"
                                type="primary"
                                @click="handleSaveBtn({ isCanLeave: false })"
                                >保存</el-button
                            >
                        </template>
                        <template v-if="!isCanEdit">
                            <el-button
                                class="mr-2"
                                size="small"
                                type="primary"
                                @click="handleDeleteBtn"
                                :disabled="!multipleSelection.length"
                                >删除</el-button
                            >
                            <el-button class="mr-2" size="small" type="primary" @click="handleClearData"
                                >清空</el-button
                            >
                        </template>
                    </el-form-item>
                </el-form>
            </div>
            <div class="sf-container-main">
                <drop-line left-width="600px" :minDropWidth="[400, 400]">
                    <template #left>
                        <div class="sf-table-wrapper">
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
                                highlight-current-row
                                size="small"
                                @page-current-change="handleCurrentChange"
                                @page-size-change="handleSizeChange"
                                @selection-change="handleSelectionChange"
                                @row-click="handleRowClick"
                            >
                                <!-- 自定义列模板插槽 -->
                                <template #col-status="{ row }">
                                    <div>{{ getNameById(dictionaryStatusList, row.status) }}</div>
                                </template>
                            </pt-table>
                        </div>
                    </template>
                    <template #right>
                        <detail-page
                            ref="detailPageRef"
                            :currentRowData="currentRowData"
                            :isCanEdit="isCanEdit"
                            :dialogType="dialogType"
                            @save-success="handleFormSaveSuccess"
                        />
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"
import detailPage from "./components/detailPage.vue"
import { usePagination } from "@/hooks/usePagination"
import { getNameById, dictionaryStatusList } from "@/assets/common/select-list"
import { TableDataInterface } from "@/interface/system/dataDictionary"
import { getDataDictionaryList, dataDictionaryDelete } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "dataDictionary"
})

const { t, locale } = useI18n()
const loading = ref(false)
const route = useRoute()
const tagsViewStore = useTagsViewStore()

//#region 表格列表
const searchForm = reactive({
    codeName: "", // 代码/名称
    status: "1" // 状态
})
const currentRowData = ref<any>({
    oid: ""
}) // 当前行数据
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<TableDataInterface[]>([])
const multipleSelection = ref<TableDataInterface[]>([])

const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        align: "center",
        show: true,
        reserveSelection: true
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
        prop: "code",
        label: "字典代码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "name",
        label: "字典名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "status",
        label: "状态",
        width: 90,
        slot: "status",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    }
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
//#endregion

// 获取订单列表
const getList = async () => {
    try {
        loading.value = true
        const params: {
            param: string
            status: string
            pageNo: number
            pageSize: number
        } = {
            param: searchForm.codeName,
            status: searchForm.status,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        const { data } = await getDataDictionaryList(params)
        tableData.value = data.list.map((item: any) => {
            return {
                oid: item.oidStr,
                code: item.code,
                name: item.codeNameC,
                status: String(item.status)
            }
        })
        pageData.total = data.total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

const handleSelectionChange = (val: TableDataInterface[]) => {
    multipleSelection.value = val
    // console.log("multipleSelection.value: ", multipleSelection.value)
}

const handleRowClick = (row: TableDataInterface) => {
    if (isCanEdit.value) {
        ElMessageBox.alert("当前处于编辑状态，不能切换!", "提示", {
            confirmButtonText: "确认",
            type: "error",
            center: true
        })
        PtTableRef.value!.setCurrentRow(currentRowData.value)
        return
    }
    currentRowData.value = row
    detailPageRef.value!.getDetailsData(row.oid)
}

//#region 按钮操
const dialogType = ref("add")
// 新增/修改
const handleAddModifyBtn = (type: string) => {
    console.log("detailPageRef: ", detailPageRef.value)
    dialogType.value = type
    isCanEdit.value = true
    if (type === "add") {
        detailPageRef.value!.handleClear()
    }
}
// 取消
const handleCancelBtn = () => {
    isCanEdit.value = false
    if (!currentRowData.value.oid) return
    handleRowClick(currentRowData.value)
}
// 保存
const handleSaveBtn = (leaveParams: any) => {
    detailPageRef.value!.handleSaveBtn(leaveParams)
}
// 处理菜单删除按钮
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
            const oids = multipleSelection.value.map((item) => item.oid).join()
            deleteBatchHandler(oids)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消删除操作！",
                center: true
            })
        })
}
//#endregion

const deleteBatchHandler = async (oids: string) => {
    try {
        const params = {
            oidsStr: oids
        }
        await dataDictionaryDelete(params)
        detailPageRef.value!.handleClear()
        getList()
    } catch (err: any) {
        console.log(err)
    }
}

const detailPageRef = ref()
const isCanEdit = ref(false) // 判断是否默认可编辑

const handleFormSaveSuccess = (oid: string) => {
    isCanEdit.value = false
    getList()
    detailPageRef.value!.getDetailsData(oid)
}

const handleClearData = () => {
    Object.assign(searchForm, {
        codeName: "",
        status: "1"
    })
    getList()
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })

onBeforeRouteLeave((to, from, next) => {
    if (isCanEdit.value) {
        ElMessageBox.confirm("是否离开当前页面？", "提示", {
            confirmButtonText: "是(Y)",
            cancelButtonText: "否(N)",
            confirmButtonClass: "confirmButton",
            cancelButtonClass: "cancelButton",
            type: "warning",
            center: true
        })
            .then(() => {
                // const leaveParams = {
                //     isCanLeave: true,
                //     fn: next()
                // }
                // isCanEdit.value = false
                // handleSaveBtn(leaveParams)
                // 防止页签丢失
                if (route.name) {
                    tagsViewStore.addVisitedView(route)
                    tagsViewStore.addCachedView(route)
                }
                ElMessage({
                    type: "warning",
                    message: "当前处于编辑状态!",
                    center: true
                })
                return
            })
            .catch(() => {
                // 防止页签丢失
                if (route.name) {
                    tagsViewStore.addVisitedView(route)
                    tagsViewStore.addCachedView(route)
                }
            })
    } else {
        next()
    }
})
</script>

<style lang="scss" scoped>
.sf-container3 {
    .search-container {
        .el-form-item {
            margin-bottom: 10px;
        }
    }
}
</style>
