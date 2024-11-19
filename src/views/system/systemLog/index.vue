<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main">
                <div class="sf-container-main-content">
                    <!-- <div class="title">{{ t("systemLogPage.systemOperateLog") }}</div> -->
                    <div class="sf-table-wrapper">
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
                            size="small"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            v-loading="loading"
                        >
                            <!-- 表格编辑插槽 -->
                            <template #slot-edit>
                                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small">
                                    <el-form-item :label="t('systemLogPage.user') + '：'">
                                        <el-input
                                            v-model="searchForm.userName"
                                            :placeholder="t('systemLogPage.pleaseEnter')"
                                            clearable
                                        />
                                    </el-form-item>
                                    <el-form-item :label="t('systemLogPage.userOperate') + '：'">
                                        <el-input
                                            v-model="searchForm.userOperate"
                                            :placeholder="t('systemLogPage.pleaseEnter')"
                                            clearable
                                        />
                                    </el-form-item>
                                    <el-form-item :label="t('systemLogPage.status') + '：'">
                                        <el-select
                                            style="width: 180px"
                                            v-model="searchForm.status"
                                            filterable
                                            clearable
                                        >
                                            <el-option
                                                v-for="item in operateStatusList"
                                                :key="item.id"
                                                :label="item.name"
                                                :value="item.id"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button class="mr-2" size="small" type="primary" @click="getList"
                                            >刷新</el-button
                                        >
                                        <el-button type="primary" @click="getList">{{
                                            t("systemLogPage.search")
                                        }}</el-button>
                                        <el-button class="mr-2" size="small" type="primary" @click="handleClearBtn"
                                            >清空</el-button
                                        >
                                    </el-form-item>
                                </el-form>
                            </template>
                            <!-- 自定义列模板插槽 -->
                            <template #col-requestUrl="{ row }">
                                <div>{{ row.requestUrl === "null" ? "" : row.requestUrl }}</div>
                            </template>
                            <template #col-requestMethod="{ row }">
                                <div>{{ row.requestMethod === "null" ? "" : row.requestMethod }}</div>
                            </template>
                            <template #col-requestParams="{ row }">
                                <div>{{ row.requestParams === "{}" ? "" : row.requestParams }}</div>
                            </template>
                            <template #col-status="{ row }">
                                <el-tag :type="row.status === 0 ? 'danger' : 'success'">{{
                                    row.status === 0 ? t("systemLogPage.fail") : t("systemLogPage.success")
                                }}</el-tag>
                            </template>
                            <template #col-errMsg="{ row }">
                                <div v-if="row.errMsg === 'null'" />
                                <template v-else>
                                    <el-link
                                        type="primary"
                                        :underline="false"
                                        @click="handleErrorMsgBtn(row)"
                                        v-if="row.status === 0"
                                        >{{ t("systemLogPage.exceptionMessage") }}</el-link
                                    >
                                </template>
                            </template>
                        </pt-table>
                    </div>
                </div>

                <dialogFrame
                    :title="t('systemLogPage.exceptionMessage')"
                    v-model:visible="dialogVisible.errMsg"
                    :footer="false"
                    width="40%"
                >
                    <errorMessageDialog
                        v-if="dialogVisible.errMsg"
                        v-model:visible="dialogVisible.errMsg"
                        :errorMessage="currentRowData.errMsg"
                    />
                </dialogFrame>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import errorMessageDialog from "./components/errorMessageDialog.vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import { usePagination } from "@/hooks/usePagination"
import { operateStatusList } from "@/assets/common/select-list"
import { SystemLogFormInterface, SystemLogTableInterface } from "@/interface/system/systemLog"
import { getSystemLog } from "@/api/system/systemLog"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "systemLog"
})

const { t, locale } = useI18n()
const loading = ref(false)

//#region 头部搜索
const searchForm = reactive<SystemLogFormInterface>({
    userName: "", // 用户名
    userOperate: "", // 用户操作
    status: 1 // 状态
})
//#endregion

//#region 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    errMsg: false // 异常信息对话框
})
//#endregion

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<SystemLogTableInterface[]>([])
const currentRowData = ref<SystemLogTableInterface>({
    oid: "",
    userName: "",
    userOperate: "",
    requestParams: "",
    requestDuration: "",
    status: 1,
    errMsg: "",
    createDate: ""
}) // 当前行数据

const tableColumns = ref<PtTableColumnsType>([
    {
        label: computed(() => t("systemLogPage.sequence")) as any,
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
        prop: "userName",
        label: computed(() => t("systemLogPage.user")) as any,
        headerAlign: "center",
        width: "180",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "userOperate",
        label: computed(() => t("systemLogPage.userOperate")) as any,
        headerAlign: "center",
        minWidth: "180",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "requestUrl",
        label: computed(() => t("systemLogPage.requestUrl")) as any,
        slot: "requestUrl",
        headerAlign: "center",
        minWidth: "300",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "requestMethod",
        label: computed(() => t("systemLogPage.requestMethod")) as any,
        slot: "requestMethod",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "requestParams",
        label: computed(() => t("systemLogPage.requestParams")) as any,
        slot: "requestParams",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "status",
        label: computed(() => t("systemLogPage.status")) as any,
        slot: "status",
        headerAlign: "center",
        width: "90",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "errMsg",
        label: computed(() => t("systemLogPage.exceptionMessage")) as any,
        slot: "errMsg",
        headerAlign: "center",
        width: "120",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "createDate",
        label: computed(() => t("systemLogPage.createDate")) as any,
        headerAlign: "center",
        width: "160",
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

// 获取用户列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            operation: searchForm.userOperate,
            creatorName: searchForm.userName,
            status: searchForm.status,
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        const { data } = await getSystemLog(params)
        tableData.value = data.list.map((item: any) => {
            return {
                oid: item.id,
                userName: item.creatorName,
                userOperate: item.operation,
                requestUrl: item.requestUri,
                requestMethod: item.requestMethod,
                requestParams: item.requestParams,
                requestDuration: item.requestTime,
                status: item.status,
                errMsg: item.errorMessage,
                ip: item.ip,
                userAgent: item.userAgent,
                createDate: item.createDate
            }
        })
        pageData.total = data.total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        userName: "",
        userOperate: "",
        status: 1
    })
    getList()
}

// 处理导出按钮
// const handleExportBtn = () => {
//     console.log("导出")
// }

// 处理异常信息
const handleErrorMsgBtn = (row: SystemLogTableInterface) => {
    currentRowData.value = row
    const dialogType = "errMsg"
    dialogVisible[dialogType] = true
}
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion
</script>

<style lang="scss" scoped>
.sf-container-main {
    .title {
        width: 100%;
        height: 30px;
        line-height: 30px;
        background: #409eff;
        color: #fff;
        font-weight: bold;
        padding-left: 12px;
    }
}
</style>
