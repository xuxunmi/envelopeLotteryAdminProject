<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading">
            <div class="search-container">
                <div class="mb-2 flex">
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
                        <el-button class="mr-2" size="small" type="primary" @click="handleCancelBtn">取消</el-button>
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
                            @click="handleEnableDisableBtn('启用')"
                            :disabled="!chooseRow || chooseRow.status === 1"
                            >启用</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleEnableDisableBtn('停用')"
                            :disabled="!chooseRow || chooseRow.status === 0"
                            >停用</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleDeleteBtn"
                            :disabled="!chooseRow"
                            >删除</el-button
                        >
                    </template>
                </div>
            </div>
            <div class="sf-container-main">
                <drop-line left-width="800px" :minDropWidth="[500, 400]">
                    <template #left>
                        <div class="sf-table-wrapper">
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
                                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                                highlight-current-row
                                size="small"
                                @row-click="handleRowClick"
                            >
                                <!-- 自定义列模板插槽 -->
                                <template #col-code="{ row }">
                                    <!-- 产品类型 / 产品线 -->
                                    <el-icon class="folder-icon" v-if="row.type === '01' || row.type === '02'">
                                        <Folder v-if="row.status === 1" />
                                        <FolderDelete style="color: red" v-else />
                                    </el-icon>
                                    <!-- 产品子线 -->
                                    <el-icon class="folder-icon" v-else-if="row.type === '03'">
                                        <Tickets v-if="row.status === 1" />
                                        <DocumentDelete style="color: red" v-else />
                                    </el-icon>
                                    {{ row.code }}
                                </template>
                                <template #col-type="{ row }">
                                    <span>{{ getNameById(multiLevelDictionaryList, row.type) }}</span>
                                </template>
                            </pt-table>
                        </div>
                    </template>
                    <template #right>
                        <dictionaryForm
                            ref="dictionaryFormRef"
                            :multiLevelDictionaryList="multiLevelDictionaryList"
                            :higherLevelList="higherLevelList"
                            :isCanEdit="isCanEdit"
                            :currentRowData="chooseRow"
                            @confirm-success="handleConfirmSuccess"
                        />
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { ref, getCurrentInstance } from "vue"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"
import DropLine from "@/components/dropLine/index.vue"
import dictionaryForm from "./components/dictionaryForm.vue"
import { SelectInterface } from "@/interface/common"
import { getNameById } from "@/assets/common/select-list"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { multiLevelDictionaryData, delDictionary, updateDictionaryStatus } from "@/api/system/multiLevelDictionary"
import { recursionArray } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "multiLevelDictionary"
})

const { t, locale } = useI18n()

const route = useRoute()
const tagsViewStore = useTagsViewStore()
const instance: any = getCurrentInstance()
const loading = ref(false)
const isCanEdit = ref(false)
const dictionaryFormRef = ref()
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
        prop: "code",
        label: "编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "code"
        // sortable: true
    },
    {
        prop: "name",
        label: "名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
        // sortable: true
    },
    {
        prop: "type",
        label: "类型",
        headerAlign: "center",
        // showOverflowTooltip: true,
        slot: "type",
        show: true
        // sortable: true
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
const chooseRow = ref()

const handleRowClick = (row: any) => {
    console.log("row-click", row)
    if (isCanEdit.value) {
        ElMessageBox.alert("当前处于编辑状态，不能切换!", "提示", {
            confirmButtonText: "确认",
            type: "error",
            center: true
        })
        PtTableRef.value!.setCurrentRow(chooseRow.value)
        return
    }
    chooseRow.value = row
    dictionaryFormRef.value!.getDetail(row)
}

//#region 下拉数据
const multiLevelDictionaryList = ref<SelectInterface[]>([])
const higherLevelList = ref<any[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "LEVEL_PRODUCT_TYPE" })) as { data: any }
        multiLevelDictionaryList.value =
            data.LEVEL_PRODUCT_TYPE.map((item: any) => {
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

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const { data } = (await multiLevelDictionaryData({})) as any

        tableData.value = data
        higherLevelList.value = JSON.parse(JSON.stringify(data))
        recursionArray(higherLevelList.value, (item: any) => {
            const type = getNameById(multiLevelDictionaryList.value, item.type)
            item.name = `${item.code} ${item.name} ${type}`
        })
        console.log(tableData.value)
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

getList()

//#region 按钮操作
// 新增/修改/复制
const handleAddModifyBtn = (type: string) => {
    console.log("dictionaryFormRef: ", dictionaryFormRef.value)
    isCanEdit.value = true
    if (type === "add") {
        dictionaryFormRef.value!.handleClear()
    }
}
// 取消
const handleCancelBtn = () => {
    isCanEdit.value = false
    // handleNodeClick(currentTreeNodeData.value)
}
// 保存
const handleSaveBtn = (leaveParams: any) => {
    dictionaryFormRef.value!.handleSaveBtn(leaveParams)
}
// 启用/停用
const handleEnableDisableBtn = (type: string) => {
    ElMessageBox.confirm(`确定要${type}此数据吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            try {
                console.log("chooseRow： ", chooseRow.value)
                loading.value = true
                const { oid } = chooseRow.value
                const params: {
                    oid: string
                    status: string
                } = {
                    oid,
                    status: type === "启用" ? "1" : "0"
                }
                await updateDictionaryStatus(params)
                ElMessage({
                    type: "success",
                    message: "操作成功！",
                    center: true
                })
                chooseRow.value = null
                getList()
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消操作！",
                center: true
            })
        })
}

// 处理删除按钮
const handleDeleteBtn = () => {
    ElMessageBox.confirm(t("staffManagePage.confirmDelete"), t("staffManagePage.prompt"), {
        confirmButtonText: t("staffManagePage.confirm"),
        cancelButtonText: t("staffManagePage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            try {
                loading.value = true
                const params = {
                    oid: chooseRow.value.oid
                }
                const { message } = (await delDictionary(params)) as any
                loading.value = false
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                dictionaryFormRef.value!.handleClear()
                getList()
            } catch (error) {
                loading.value = false
                console.log(error)
            }
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t("staffManagePage.cancelDelMsg"),
                center: true
            })
        })
}

const handleConfirmSuccess = () => {
    isCanEdit.value = false
    chooseRow.value = null
    getList()
}

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
.app-container {
    .sf-container3 {
        .sf-container-main {
            .sf-table-wrapper {
                .folder-icon {
                    position: relative;
                    top: 2px;
                    margin-right: 5px;
                    font-size: 14px;
                }
            }
        }
    }
}
</style>
