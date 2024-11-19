<template>
    <div class="sf-form-wrapper" v-loading="loading">
        <el-form
            ref="roleFormRef"
            :model="roleForm"
            :inline="true"
            :rules="rules"
            size="small"
            label-width="98px"
            label-position="right"
        >
            <el-form-item label="角色名称：" prop="roleName">
                <el-input
                    style="width: 280px"
                    v-model="roleForm.roleName"
                    :placeholder="t('groupManagePage.pleaseEnter')"
                    :disabled="!isCanEdit"
                />
            </el-form-item>
            <el-form-item label="所属组织：" prop="organizationOid">
                <el-select
                    style="width: 280px"
                    v-model="roleForm.organizationOid"
                    filterable
                    clearable
                    :disabled="!isCanEdit"
                >
                    <el-option
                        v-for="item in organizationList"
                        :key="item.groupOid"
                        :label="item.name"
                        :value="item.groupOid"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="table-container">
            <div class="staff-info-title w-full mt-4 px-2">
                <div>{{ t("groupManagePage.staffInformation") }}</div>
                <div>
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleAddUserBtn"
                        :disabled="!roleForm.roleOid || !isCanEdit"
                        >添加</el-button
                    >
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleRemoveUserBtn"
                        :disabled="!multipleSelection.length || !isCanEdit"
                        >移除</el-button
                    >
                </div>
            </div>
            <div class="mt-2" v-loading="loading">
                <el-table
                    ref="tableRef"
                    :data="staffTableData"
                    max-height="520"
                    size="small"
                    border
                    row-key="userOid"
                    highlight-current-row
                    @selection-change="handleSelectionChange"
                >
                    <el-table-column type="selection" reserve-selection width="34" />
                    <el-table-column
                        type="index"
                        label="序号"
                        width="55"
                        align="center"
                        :index="(index: number) => {
                            return (pageData.currentPage - 1) * pageData.pageSize + index + 1
                        }"
                    />
                    <el-table-column
                        prop="userCode"
                        :label="t('groupManagePage.staffCode')"
                        header-align="center"
                        sortable
                    />
                    <el-table-column
                        prop="userName"
                        :label="t('groupManagePage.staffName')"
                        header-align="center"
                        sortable
                    />
                    <el-table-column
                        prop="status"
                        :label="t('groupManagePage.workStatus')"
                        header-align="center"
                        sortable
                    />
                </el-table>
                <div class="pagination-wrapper mt-4 flex justify-end">
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
        </div>

        <!-- 分配权限弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.auth" :footer="false" width="40%">
            <AuthDialog
                v-if="dialogVisible.auth"
                v-model:visible="dialogVisible.auth"
                :currentTreeNodeData="currentTreeNodeData"
                @confirm-success="handleConfirmSuccess_auth"
            />
        </dialogFrame>

        <!-- 添加用户弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addUser" :footer="false" width="40%">
            <AddUserDialog
                v-if="dialogVisible.addUser"
                v-model:visible="dialogVisible.addUser"
                :currentTreeNodeData="currentTreeNodeData"
                @confirm-success="handleConfirmSuccess_addUser"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import type { FormInstance, FormRules, ElTable } from "element-plus"
import dialogFrame from "@/components/dialogFrame/index.vue"
import AuthDialog from "./authDialog.vue"
import AddUserDialog from "./addUserDialog.vue"
// import { SelectInterface } from "@/interface/common"
import { usePagination } from "@/hooks/usePagination"
import { StaffTableInterface } from "@/interface/system/staffManage"
// import { getOrganizationManageData } from "@/api/system/organizationManage"
import { creatAndEditRole, delRole, roleDeleteUser } from "@/api/system/roleManage"
import { getGroupMembers } from "@/api/system/groupManage"
// import { recursionArray } from "@/utils"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "roleForm"
})

const { t } = useI18n()

//#region 参数和方法
const props = defineProps({
    organizationList: {
        type: Array as any,
        default: () => []
    },
    currentTreeNodeData: {
        type: Object,
        default: () => {}
    },
    isCanEdit: {
        type: Boolean,
        default: false
    }
})

const emits = defineEmits(["refreshTree"])

// 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

const loading = ref(false)
//#endregion

//#region 表单
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
    roleOid: "", // 角色oid
    roleName: "", // 角色名称
    organizationOid: "" // 所属组织
})
const rules = reactive<FormRules>({
    roleName: [{ required: true, message: "请输入必填项！", trigger: "blur" }],
    organizationOid: [{ required: true, message: "请输入必填项！", trigger: "change" }]
})

const tableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<StaffTableInterface[]>([])
const staffTableData = ref<StaffTableInterface[]>([]) // 员工信息列表

// 获取角色里的员工信息
const getGroupMembersData = async (roleOid: string) => {
    try {
        loading.value = true
        const params = {
            page: String(pageData.currentPage),
            limit: String(pageData.pageSize),
            groupOid: roleOid
        }
        const { data, total } = (await getGroupMembers(params)) as any
        staffTableData.value = data
        pageData.total = total ? total : 0
        loading.value = false
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 处理组织选择
// const handleorganizationOidChange = (value: string) => {
//     Object.assign(roleForm, {
//         ...roleForm,
//         organizationOid: value
//     })
//     getParentGroupList(value, undefined)
// }

// // 获取角色详情
// const getRoleDetailData = async (oid: string) => {
//     // try {
//     //     const params: {
//     //         oid: string
//     //     } = {
//     //         oid
//     //     }
//     //     const { data } = (await getGroupDetail(params)) as { data: any }
//     //     Object.assign(roleForm, {
//     //         ...data,
//     //         oid: data.oid,
//     //         name: data.name,
//     //         organizationOid: data.organizationOid,
//     //         groupOid: data.groupOid,
//     //         desc: data.desc,
//     //         status: data.status
//     //     })
//     //     staffTableData.value = data.users
//     // } catch (err: any) {
//     //     console.log(err)
//     // }
// }

// 清除表单
const handleClear = () => {
    if (!roleFormRef.value) return
    roleFormRef.value!.resetFields()
    Object.assign(roleForm, {
        roleOid: "",
        roleName: "",
        organizationOid: ""
    })
    staffTableData.value = []
    pageData.total = 0
}

const handleAllClear = () => {
    if (!roleFormRef.value) return
    roleFormRef.value!.resetFields()
    Object.assign(roleForm, {
        roleOid: "",
        roleName: "",
        organizationOid: ""
    })
    staffTableData.value = []
    pageData.total = 0
}
//#endregion

// 处理保存
const handleSaveBtn = async (leaveParams: any) => {
    if (!roleFormRef.value) return
    await roleFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                let params: {
                    groupOid: string
                    groupName: string
                    groupNumber: string
                    parentGroupOid: string
                    editOid?: string
                    status: string
                    type: string
                } = {
                    groupName: roleForm.roleName,
                    groupNumber: "",
                    parentGroupOid: "",
                    groupOid: roleForm.organizationOid,
                    status: "",
                    type: "角色", // 写死
                    editOid: "" // 需要编辑的时候传值（角色oid)，不编辑传空字符串
                }

                if (roleForm.roleOid) {
                    params = {
                        ...params,
                        editOid: roleForm.roleOid
                    }
                }
                const { message } = (await creatAndEditRole(params)) as any
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                if (!roleForm.roleOid) {
                    handleClear()
                }
                if (leaveParams.isCanLeave) {
                    roleFormRef.value!.resetFields()
                    if (typeof leaveParams.fn === "function") {
                        leaveParams.fn()
                    }
                }
                loading.value = false
                emits("refreshTree")
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        } else {
            if (leaveParams.isCanLeave) {
                ElMessage({
                    type: "warning",
                    message: "页面已离开，数据未保存成功！",
                    center: true
                })
                if (typeof leaveParams.fn === "function") {
                    leaveParams.fn()
                }
            }
        }
    })
}

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    auth: false, // 分配权限对话框
    addUser: false // 添加用户对话框
})

const commonDialogHandler = (title: string, dialogType: string) => {
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}

// 处理分配权限按钮
const handleDistributionAuthBtn = async () => {
    commonDialogHandler("新增/编辑角色权限", "auth")
}

// 处理添加用户接口
const handleAddUserBtn = () => {
    commonDialogHandler("添加用户", "addUser")
}
//#endregion

// #region 关闭弹窗
const handleConfirmSuccess_auth = (dialogType: string) => {
    dialogVisible[dialogType] = false
}

const handleConfirmSuccess_addUser = (dialogType: string) => {
    dialogVisible[dialogType] = false
    getGroupMembersData(props.currentTreeNodeData.roleOid)
}
//#endregion

// 处理删除按钮
const handleDeleteBtn = () => {
    ElMessageBox.confirm(t("groupManagePage.wantDelete"), t("groupManagePage.prompt"), {
        confirmButtonText: t("groupManagePage.confirm"),
        cancelButtonText: t("groupManagePage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            try {
                loading.value = true
                const params = {
                    groupOid: roleForm.roleOid
                }
                const { message } = (await delRole(params)) as any
                loading.value = false
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                handleClear()
                emits("refreshTree")
            } catch (error) {
                console.log(error)
                loading.value = false
            }
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t("groupManagePage.cancelDelMsg"),
                center: true
            })
        })
}

// 处理员工信息表格多选
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
}

// 处理移除用户接口
const handleRemoveUserBtn = () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: t("personChangePage.selectedDataMsg"),
            center: true
        })
        return
    }
    try {
        const userOids = multipleSelection.value.map((item) => item.userOid).join()
        removeBatchHandler(userOids)
    } catch (error: any) {
        console.log(error)
    }
}

const removeBatchHandler = async (userOids: string) => {
    try {
        loading.value = true
        const params: {
            groupOid: string
            userOid: string
        } = {
            groupOid: roleForm.roleOid,
            userOid: userOids
        }
        const { message } = (await roleDeleteUser(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        tableRef.value!.clearSelection()
        multipleSelection.value = []
        getGroupMembersData(props.currentTreeNodeData.roleOid)
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 获取详情
const getDetail = (currentTreeNodeData: any) => {
    if (!currentTreeNodeData.groupOid) return
    const { roleOid, name, topOid } = currentTreeNodeData
    Object.assign(roleForm, {
        roleOid,
        roleName: name,
        organizationOid: topOid
    })
    // 回显员工信息
    getGroupMembersData(roleOid)
}

defineExpose({
    getDetail,
    handleClear,
    handleSaveBtn,
    handleDistributionAuthBtn,
    handleDeleteBtn
})
</script>

<style lang="scss" scoped>
.sf-form-wrapper {
    padding: 5px;
    .table-container {
        .staff-info-title {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            line-height: 30px;
            background-color: #efefef;
        }
    }
}
</style>
