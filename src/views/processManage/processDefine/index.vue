<template>
    <div class="app-container">
        <div class="sf-container3">
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
                            border
                            highlight-current-row
                            size="small"
                            @page-current-change="handleCurrentChange"
                            @page-size-change="handleSizeChange"
                            @row-click="handleRowClick"
                        >
                            <template #slot-edit>
                                <span class="table-edit fromWrapper">
                                    <el-button size="small" type="primary" @click="getList">刷新</el-button>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="handleRowEditClick(chooseRow)"
                                        :disabled="!chooseRow.oid"
                                        >编辑</el-button
                                    >
                                    <el-button
                                        type="success"
                                        size="small"
                                        @click="handleRowReleaseBtn(chooseRow)"
                                        :disabled="!chooseRow.oid || chooseRow.deploymentId !== ''"
                                        >发布</el-button
                                    >
                                </span>
                            </template>
                        </pt-table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
import { usePagination } from "@/hooks/usePagination"
import { TableInterface } from "@/interface/processManage/processDefine"
import { getProcessList, processRelease } from "@/api/processManage/processDefine"
import dayjs from "dayjs"

import { useI18n } from "vue-i18n"

defineOptions({
    name: "processDefine"
})

const { t, locale } = useI18n()
const loading = ref(false)

//#region 表格列表
// 表格数据
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<TableInterface[]>([])
const chooseRow = ref({
    oid: "",
    deploymentId: ""
})

const tableColumns = ref<PtTableColumnsType>([
    {
        label: computed(() => t("materielPage.sequence")) as any,
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
        prop: "processCode",
        label: "流程编码",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "processName",
        label: "流程名称",
        headerAlign: "center",
        // showOverflowTooltip: true,
        sortable: true,
        show: true
    },
    {
        prop: "createTime",
        label: "创建时间",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "lastUpdateTime",
        label: "修改时间",
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

// 获取流程列表
const getList = async () => {
    try {
        chooseRow.value = { oid: "", deploymentId: "" }
        loading.value = true
        const params = {
            pageNo: pageData.currentPage,
            pageSize: pageData.pageSize
        }
        const { data } = await getProcessList(params)
        tableData.value = data.rows.map((item: any) => {
            return {
                oid: item.id,
                processCode: item.key,
                processName: item.name,
                createTime: dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss"),
                lastUpdateTime: dayjs(item.lastUpdateTime).format("YYYY-MM-DD HH:mm:ss"),
                deploymentId: item.deploymentId
            }
        })
        pageData.total = data.totalRows
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

const handleRowClick = (row: any) => {
    console.log("row-click", row)
    chooseRow.value = row
}

//#region 编辑

// 跳转到流程设计页面
const getActivitiHref = (id: string) => {
    window.open("/static/index.html?modelId=" + id)
}

const handleVisiable = (e: Event) => {
    const document = e.target as Document
    if (document.visibilityState === "visible") {
        getList()
    }
}

// 编辑按钮
const handleRowEditClick = (row: any) => {
    getActivitiHref(row.oid)
}

// 发布按钮
const handleRowReleaseBtn = async (row: any) => {
    try {
        const params = {
            modelId: row.oid
        }
        const { message } = (await processRelease(params)) as any
        ElMessage({
            type: "success",
            message: message,
            center: true
        })
        getList()
    } catch (err: any) {
        console.log(err)
    }
}
//#endregion
//#endregion

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList, { immediate: true })
//#endregion

onMounted(() => {
    // 监听浏览器流程tab页关闭后回来重新刷新页面
    document.addEventListener("visibilitychange", handleVisiable, true)
})

onUnmounted(() => {
    // 手动销毁
    document.removeEventListener("visibilitychange", handleVisiable, true)
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
