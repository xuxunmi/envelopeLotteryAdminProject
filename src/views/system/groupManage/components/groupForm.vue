<template>
    <div class="sf-form-wrapper" v-loading="loading">
        <el-form
            ref="groupFormRef"
            :model="groupForm"
            :inline="true"
            :rules="rules"
            size="small"
            label-width="98px"
            label-position="right"
        >
            <el-form-item label="部门编码：" prop="groupNumber">
                <el-input
                    style="width: 280px"
                    v-model="groupForm.groupNumber"
                    :placeholder="t('groupManagePage.pleaseEnter')"
                    :disabled="!!groupForm.groupOid || !isCanEdit"
                />
            </el-form-item>
            <el-form-item label="部门名称：" prop="groupName">
                <el-input
                    style="width: 280px"
                    v-model="groupForm.groupName"
                    :placeholder="t('groupManagePage.pleaseEnter')"
                    :disabled="!isCanEdit"
                />
            </el-form-item>

            <el-form-item :label="t('groupManagePage.organization') + '：'" prop="organizationOid">
                <el-select
                    style="width: 280px"
                    v-model="groupForm.organizationOid"
                    filterable
                    clearable
                    @change="handleorganizationOidChange"
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
            <el-form-item :label="t('groupManagePage.group') + '：'">
                <!-- <el-select style="width: 280px" v-model="groupForm.groupOid" filterable clearable :disabled="!isCanEdit">
                    <el-option v-for="item in parentGroupList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select> -->
                <el-tree-select
                    style="width: 280px"
                    v-model="groupForm.parentGroupOid"
                    :data="parentGroupList"
                    :props="defaultProps"
                    :render-after-expand="false"
                    check-strictly
                    filterable
                    clearable
                    :disabled="!isCanEdit"
                />
            </el-form-item>
            <el-form-item :label="t('groupManagePage.status') + '：'" prop="status">
                <el-select style="width: 280px" v-model="groupForm.status" filterable clearable :disabled="!isCanEdit">
                    <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <template v-if="!groupForm.groupOid">
                <el-form-item label="创建时间：">
                    <el-date-picker
                        style="width: 280px"
                        v-model="groupForm.createTime"
                        type="datetime"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择"
                        :disabled="!isCanEdit"
                    />
                </el-form-item>
            </template>
        </el-form>
        <div class="table-container">
            <div class="staff-info-title w-full mt-4 px-2">
                <div>{{ t("groupManagePage.staffInformation") }}</div>
                <div>
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleAddUserBtn"
                        :disabled="!groupForm.groupOid || !isCanEdit"
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
import AddUserDialog from "@/views/system/roleManage/components/addUserDialog.vue"
import { statusList } from "@/assets/common/select-list"
import { usePagination } from "@/hooks/usePagination"
import { StaffTableInterface } from "@/interface/system/staffManage"
import { creatAndEditGroup, getGroupMembers, getChildGroupTree, delGroup } from "@/api/system/groupManage"
import { roleDeleteUser } from "@/api/system/roleManage"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "groupForm"
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
const parentGroupList = ref<any[]>([]) // 上级部门列表
const defaultProps = {
    value: "groupOid",
    label: "name",
    children: "children"
}
//#endregion

//#region 表单
const groupFormRef = ref<FormInstance>()
const groupForm = reactive({
    groupOid: "", // 部门oid
    groupName: "", // 部门名称
    groupNumber: "", // 部门编码
    organizationOid: "", // 组织名称
    parentGroupOid: "", // 上级部门
    roleOid: "", // 角色oid
    status: "启用", // 状态
    createTime: "" // 创建时间
})
const rules = reactive<FormRules>({
    groupName: [{ required: true, message: t("groupManagePage.requiredFields"), trigger: "blur" }],
    groupNumber: [{ required: true, message: t("groupManagePage.requiredFields"), trigger: "blur" }],
    organizationOid: [{ required: true, message: t("groupManagePage.requiredFields"), trigger: "change" }],
    status: [{ required: true, message: t("groupManagePage.requiredFields"), trigger: "change" }]
})

const tableRef = ref<InstanceType<typeof ElTable>>()
const staffTableData = ref<StaffTableInterface[]>([]) // 员工信息列表
const multipleSelection = ref<StaffTableInterface[]>([])

// 获取部门里的员工信息
const getGroupMembersData = async (groupOid: string) => {
    try {
        loading.value = true
        const params = {
            page: String(pageData.currentPage),
            limit: String(pageData.pageSize),
            groupOid
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
const handleorganizationOidChange = (value: string) => {
    Object.assign(groupForm, {
        ...groupForm,
        organizationOid: value,
        parentGroupOid: ""
    })
    parentGroupList.value = []
    getParentGroupList(value, undefined)
}

// 根据组织获取上级部门列表
const getParentGroupList = async (organizationOid: string, details: any | undefined) => {
    if (!organizationOid) return
    try {
        loading.value = true
        const params = {
            topOid: organizationOid
        }
        const { data } = await getChildGroupTree(params)
        parentGroupList.value = data[0].children || []
        if (details) {
            const { groupOid, groupNumber, name, topOid, superOid, status, roleOid, createTime } = details
            Object.assign(groupForm, {
                groupOid,
                groupNumber,
                groupName: name,
                organizationOid: topOid,
                parentGroupOid: superOid,
                roleOid,
                status,
                createTime
            })
        }
        loading.value = false
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// // 获取组详情
// const getGroupDetailData = async (oid: string) => {
//     try {
//         const params: {
//             oid: string
//         } = {
//             oid
//         }
//         const { data } = (await getGroupDetail(params)) as { data: any }
//         // 回显组
//         if (data.organizationOid) {
//             getGroupList(data.organizationOid)
//         }
//         Object.assign(groupForm, {
//             ...data,
//             oid: data.oid,
//             name: data.name,
//             organizationOid: data.organizationOid,
//             groupOid: data.groupOid,
//             desc: data.desc,
//             status: data.status
//         })

//         staffTableData.value = data.users
//     } catch (err: any) {
//         console.log(err)
//     }
// }

// 清除表单
const handleClear = () => {
    console.log("groupForm： ", groupForm)
    if (!groupFormRef.value) return
    // groupFormRef.value!.resetFields()
    Object.assign(groupForm, {
        ...groupForm,
        groupNumber: "",
        // organizationOid: "",
        parentGroupOid: groupForm.groupOid,
        groupOid: "",
        groupName: "",
        roleOid: "",
        status: "启用",
        createTime: ""
    })
    console.log("groupForm： ", groupForm)
    // parentGroupList.value = []
    staffTableData.value = []
    pageData.total = 0
}

// 复制表单
const copyHandler = () => {
    Object.assign(groupForm, {
        ...groupForm,
        groupOid: "",
        groupName: "",
        createTime: ""
    })
}

const handleAllClear = () => {
    if (!groupFormRef.value) return
    groupFormRef.value!.resetFields()
    Object.assign(groupForm, {
        ...groupForm,
        parentGroupOid: "",
        groupOid: "",
        groupName: "",
        roleOid: "",
        status: "启用",
        createTime: ""
    })
    parentGroupList.value = []
    staffTableData.value = []
    pageData.total = 0
}
//#endregion

// 处理保存
const handleSaveBtn = async (leaveParams: any) => {
    if (!groupFormRef.value) return
    await groupFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                let params: {
                    groupOid: string
                    groupName: string
                    groupNumber: string
                    parentGroupOid: string
                    editOid?: string
                    status?: string
                    type: string
                } = {
                    groupName: groupForm.groupName,
                    groupNumber: groupForm.groupNumber,
                    parentGroupOid: groupForm.organizationOid,
                    groupOid: groupForm.parentGroupOid,
                    status: groupForm.status,
                    type: "部门" // 写死
                }

                if (groupForm.groupOid) {
                    params = {
                        ...params,
                        editOid: groupForm.groupOid
                    }
                }
                console.log("params: ", params)
                const { message } = (await creatAndEditGroup(params)) as any
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                if (!groupForm.groupOid) {
                    handleClear()
                }
                if (leaveParams.isCanLeave) {
                    groupFormRef.value!.resetFields()
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
    addUser: false // 添加用户对话框
})

const commonDialogHandler = (title: string, dialogType: string) => {
    dialogTitle.value = title
    dialogVisible[dialogType] = true
}

// 处理添加用户接口
const handleAddUserBtn = () => {
    commonDialogHandler("添加用户", "addUser")
}
//#endregion

// #region 关闭弹窗
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
                    groupOid: groupForm.groupOid
                }
                const { message } = (await delGroup(params)) as any
                loading.value = false
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                handleAllClear()
                emits("refreshTree")
            } catch (error) {
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
            groupOid: groupForm.roleOid,
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
    const { groupOid, topOid } = currentTreeNodeData
    // 回显上级部门
    if (topOid) {
        getParentGroupList(topOid, currentTreeNodeData)
    }

    // 回显员工信息
    getGroupMembersData(groupOid)
}

defineExpose({
    getDetail,
    handleClear,
    handleAllClear,
    handleSaveBtn,
    handleDeleteBtn,
    copyHandler
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
