<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading" :element-loading-text="elementLoadingText">
            <div class="search-container">
                <div class="mb-4 flex">
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
                            @click="handleDeleteBtn"
                            :disabled="!currentRowData.userOid"
                            >删除</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleCopyBtn"
                            :disabled="!currentRowData.userOid"
                            >复制</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleEnableDisableBtn('启用')"
                            :disabled="!currentRowData.userOid || currentRowData.status === '已启用'"
                            >启用</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleEnableDisableBtn('停用')"
                            :disabled="!currentRowData.userOid || currentRowData.status === '已停用'"
                            >停用</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleResetPasswordBtn"
                            :disabled="!currentRowData.userOid"
                            plan
                            >重置密码</el-button
                        >
                        <el-button class="mr-4" type="primary" size="small" @click="goDownload">下载模板</el-button>
                        <el-upload
                            class="mr-4"
                            v-model:file-list="fileList"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleUploadChange"
                        >
                            <el-button type="primary" size="small">导入</el-button>
                        </el-upload>
                        <el-button class="mr-2" type="primary" size="small" @click="handleExportExcelBtn"
                            >导出</el-button
                        >
                    </template>
                </div>
                <el-form ref="searchFormRef" :inline="true" :model="searchForm" size="small">
                    <el-form-item label="用户组织：">
                        <el-select
                            style="width: 180px"
                            v-model="searchForm.organizationOid"
                            filterable
                            clearable
                            @change="handleorganizationOidChange"
                        >
                            <el-option
                                v-for="item in organizationList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="t('staffManagePage.group') + '：'">
                        <el-tree-select
                            style="width: 180px"
                            v-model="searchForm.groupOid"
                            :data="groupList"
                            :props="treeSelectProps"
                            :render-after-expand="false"
                            check-strictly
                            filterable
                            clearable
                            @change="getList"
                        />
                    </el-form-item>
                    <el-form-item :label="t('staffManagePage.codeName') + '：'">
                        <el-input
                            style="width: 180px"
                            v-model="searchForm.codeName"
                            :placeholder="t('staffManagePage.pleaseEnter')"
                        />
                    </el-form-item>
                    <el-form-item :label="t('staffManagePage.workStatus') + '：'">
                        <el-select
                            style="width: 180px"
                            v-model="searchForm.status"
                            filterable
                            clearable
                            @change="getList"
                        >
                            <el-option
                                v-for="item in workStatusList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="mr-2" size="small" type="primary" @click="getList">{{
                            t("staffManagePage.search")
                        }}</el-button>
                        <el-button class="mr-2" size="small" type="primary" @click="handleClearBtn">清空</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="sf-container-main">
                <div class="sf-container-main-left">
                    <div ref="tableWrapper" class="sf-table-wrapper">
                        <el-table
                            ref="tableRef"
                            class="row-click"
                            :data="tableData"
                            :max-height="tableMaxHeight"
                            size="small"
                            border
                            highlight-current-row
                            @row-click="handleRowClick"
                        >
                            <el-table-column prop="topOid" label="组织" header-align="center" sortable>
                                <template #default="scope">
                                    <div>{{ getNameById(organizationList, scope.row.topOid) }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column
                                prop="code"
                                :label="t('staffManagePage.staffAccount')"
                                header-align="center"
                                sortable
                            />
                            <el-table-column
                                prop="name"
                                :label="t('staffManagePage.staffName')"
                                header-align="center"
                                sortable
                            />
                            <el-table-column
                                prop="status"
                                :label="t('staffManagePage.status')"
                                header-align="center"
                                sortable
                            />
                            <el-table-column prop="superName" label="所属部门" header-align="center" sortable />
                        </el-table>
                    </div>
                    <div class="sf-table-edit">
                        <el-pagination
                            :layout="pageData.layout"
                            :page-sizes="pageData.pageSizes"
                            :total="pageData.total"
                            :page-size="pageData.pageSize"
                            :currentPage="pageData.currentPage"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            size="small"
                        />
                    </div>
                </div>
                <div v-dropLine="[400, 400]" class="sf-container-main-line" />
                <div class="sf-container-main-right">
                    <staffForm
                        v-if="refreshStaffFormFlag"
                        ref="staffFormRef"
                        :organizationList="organizationList"
                        :treeSelectProps="treeSelectProps"
                        :currentRowData="currentRowData"
                        :workStatusList="workStatusList"
                        :isCanEdit="isCanEdit"
                        @confirm-success="handleConfirmSuccess"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { ElTable, UploadProps, UploadUserFile } from "element-plus"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"
import staffForm from "./components/staffForm.vue"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { StaffTableInterface } from "@/interface/system/staffManage"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import {
    userList,
    resetPassword,
    creatAndEditUser,
    exportUserTemplate,
    uploadUserExcel,
    userExport
} from "@/api/system/staffManage"
import { getChildGroupTree } from "@/api/system/groupManage"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { downloadFile } from "@/utils/exportTemplate"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "staffManage"
})

const { t } = useI18n()

const organizationList = ref<SelectInterface[]>([]) // 组织列表
const groupList = ref<any[]>([]) // 组列表
const treeSelectProps = {
    value: "groupOid",
    label: "name",
    children: "children"
}

const route = useRoute()
const tagsViewStore = useTagsViewStore()
const loading = ref(false)
const isCanEdit = ref(false) // 判断是否默认可编辑
const staffFormRef = ref()

// 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 头部搜索
const searchForm = reactive<any>({
    organizationOid: "", // 组织oid
    groupOid: "", // 部门oid
    codeName: "", // 编号/名称
    status: "已启用" // 在职状态
})

// 获取组织列表
const getOrganizationList = async () => {
    try {
        loading.value = true
        const params = {
            page: "1",
            limit: "99999"
        }
        const { data } = await getOrganizationManageData(params)
        organizationList.value =
            data.map((item: { groupOid: string; name: string }) => {
                return {
                    id: item.groupOid,
                    name: item.name
                }
            }) || []
        searchForm.organizationOid = organizationList.value[0].id
        handleorganizationOidChange(searchForm.organizationOid)
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

getOrganizationList()

//#region 下拉数据
const workStatusList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "WORK_STATUS" })) as { data: any }
        workStatusList.value =
            data.WORK_STATUS.map((item: any) => {
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

// 处理组织选择
const handleorganizationOidChange = (value: string) => {
    Object.assign(searchForm, {
        ...searchForm,
        organizationOid: value,
        groupOid: ""
    })
    groupList.value = []
    getGroupList(value)
}

// 根据组织获取上级部门列表
const getGroupList = async (organizationOid: string) => {
    if (!organizationOid) return
    try {
        loading.value = true
        const params = {
            topOid: organizationOid
        }
        const { data } = await getChildGroupTree(params)
        groupList.value = data[0].children || []
        loading.value = false
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

//#region 左侧员工表格
// 获取表格列表
const tableRef = ref<InstanceType<typeof ElTable>>()
const tableWrapper = ref()
const tableMaxHeight = ref(0)
// 表格数据
const tableData = ref<StaffTableInterface[]>([])
const currentRowData = ref<any>() // 当前行oid

// 重置当前行
const resetCurrentRowData = () => {
    currentRowData.value = {
        userOid: "",
        code: "",
        name: "",
        topOid: "",
        superName: "",
        superOid: "",
        status: "",
        first: "",
        last: "",
        email: "",
        roles: ""
    }
}
resetCurrentRowData()

// 获取用户列表
const getList = async () => {
    try {
        resetCurrentRowData()
        refreshDetail()
        loading.value = true
        const params = {
            topOid: searchForm.organizationOid,
            groupOid: searchForm.groupOid,
            codeName: searchForm.codeName,
            status: searchForm.status,
            page: String(pageData.currentPage),
            limit: String(pageData.pageSize)
        }
        const { data, total } = (await userList(params)) as any
        tableData.value = data
        pageData.total = total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

const handleRowClick = (row: StaffTableInterface) => {
    console.log("用户row: ", row)
    if (isCanEdit.value) {
        ElMessageBox.alert("当前处于编辑状态，不能切换!", "提示", {
            confirmButtonText: "确认",
            type: "error",
            center: true
        })
        tableRef.value!.setCurrentRow(currentRowData.value)
        return
    }
    currentRowData.value = row
    staffFormRef.value!.getDetail(row)
}

//#region 按钮操作
// 新增/修改
const handleAddModifyBtn = (type: string) => {
    console.log("staffFormRef: ", staffFormRef.value)
    isCanEdit.value = true
    if (type === "add") {
        staffFormRef.value!.handleClear()
    }
}
// 取消
const handleCancelBtn = () => {
    isCanEdit.value = false
    handleRowClick(currentRowData.value)
}
// 保存
const handleSaveBtn = (leaveParams: any) => {
    staffFormRef.value!.handleSaveBtn(leaveParams)
}
// 删除
const handleDeleteBtn = () => {
    staffFormRef.value!.handleDeleteBtn()
}
// 复制
const handleCopyBtn = () => {
    isCanEdit.value = true
    staffFormRef.value!.copyHandler()
}

// 启用/停用
const handleEnableDisableBtn = (type: string) => {
    ElMessageBox.confirm(`确定要${type}此账号吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            try {
                console.log("currentRowData: ", currentRowData.value)
                loading.value = true
                const { userOid, code, name, superOid, first, last, email } = currentRowData.value
                const params: {
                    userOid: string
                    fullName: string
                    userName: string
                    groupOid: string
                    first: string
                    last?: string
                    status: string
                    email?: string
                } = {
                    userOid,
                    fullName: name,
                    userName: code,
                    groupOid: superOid,
                    first,
                    last,
                    status: type === "启用" ? "已启用" : "已停用",
                    email
                }
                await creatAndEditUser(params)
                ElMessage({
                    type: "success",
                    message: "操作成功！",
                    center: true
                })
                resetDialog()
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
// 重置按钮
const handleResetPasswordBtn = async () => {
    ElMessageBox.confirm("确定要重置密码吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            try {
                loading.value = true
                const params = {
                    userOid: currentRowData.value.userOid
                }
                const { message } = (await resetPassword(params)) as any
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                resetDialog()
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
// 下载模板
const goDownload = async () => {
    try {
        loading.value = true
        elementLoadingText.value = "正在下载导入模板，请稍等..."
        const res = await exportUserTemplate()
        const filename = `用户管理导入模板.xlsx`
        downloadFile(res, filename)
    } catch (error: any) {
        console.error(error)
    } finally {
        loading.value = false
        elementLoadingText.value = ""
    }
}
//#region 导入
const fileList = ref<UploadUserFile[]>([])
const handleUploadChange: UploadProps["onChange"] = (uploadFile) => {
    if (uploadFile.raw) {
        const formData = new FormData()
        formData.append("file", uploadFile.raw)
        loading.value = true
        elementLoadingText.value = "正在导入，请稍等..."
        uploadUserExcel(formData)
            .then((data: any) => {
                ElMessage.success(data.message)
                getList()
            })
            .catch((err: any) => {
                console.log(err)
            })
            .finally(() => {
                loading.value = false
                elementLoadingText.value = ""
            })
    }
}
// 处理导出Excel按钮
const elementLoadingText = ref<string>("")
const handleExportExcelBtn = async () => {
    alert("功能开发中，敬请期待！")
    // try {
    //     loading.value = true
    //     elementLoadingText.value = "正在导出到Excel，请稍等..."
    //     const params = {
    //         topOid: searchForm.organizationOid,
    //         groupOid: searchForm.groupOid,
    //         codeName: searchForm.codeName,
    //         status: searchForm.status
    //     }
    //     const res = await userExport(params)
    //     const filename = `用户管理_${formatDateTime(new Date(), "YYYY-MM-DD")}`
    //     downloadFile(res, filename)
    // } catch (error: any) {
    //     console.error(error)
    // } finally {
    //     loading.value = false
    //     elementLoadingText.value = ""
    // }
}
// 处理清空按钮
const handleClearBtn = () => {
    Object.assign(searchForm, {
        organizationOid: "",
        groupOid: "",
        codeName: "",
        status: "已启用"
    })
    getList()
}
//#endregion

const resetDialog = () => {
    currentRowData.value = {
        userOid: "",
        code: "",
        name: "",
        topOid: "",
        superName: "",
        superOid: "",
        first: "",
        last: "",
        status: "",
        email: ""
    }
}

const handleConfirmSuccess = () => {
    isCanEdit.value = false
    resetDialog()
    getList()
}

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList)
//#endregion

//#region 刷新详情
const refreshStaffFormFlag = ref(true)
const refreshDetail = () => {
    refreshStaffFormFlag.value = false
    nextTick(() => (refreshStaffFormFlag.value = true))
}
//#endregion

onMounted(() => {
    // 修改表格高度
    tableMaxHeight.value = tableWrapper.value.clientHeight
})

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
    .sf-container-main {
        .sf-container-main-left {
            width: 500px;
        }
    }
}
</style>
