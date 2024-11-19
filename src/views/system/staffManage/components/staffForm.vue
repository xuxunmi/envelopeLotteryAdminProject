<template>
    <div class="sf-form-wrapper" v-loading="loading">
        <el-form
            ref="staffFormRef"
            :model="staffForm"
            :inline="true"
            :rules="rules"
            size="small"
            label-width="124px"
            label-position="right"
        >
            <el-form-item :label="t('staffManagePage.organization') + '：'" prop="organizationOid">
                <el-select
                    style="width: 300px"
                    v-model="staffForm.organizationOid"
                    filterable
                    clearable
                    :disabled="!isCanEdit"
                    @change="handleorganizationOidChange"
                >
                    <el-option v-for="item in organizationList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="t('staffManagePage.group') + '：'" prop="groupOid">
                <el-tree-select
                    style="width: 300px"
                    v-model="staffForm.groupOid"
                    :data="groupList"
                    :props="treeSelectProps"
                    :render-after-expand="false"
                    check-strictly
                    filterable
                    clearable
                    :disabled="!isCanEdit"
                />
            </el-form-item>
            <el-form-item :label="t('staffManagePage.staffName') + '：'" prop="staffName">
                <el-input
                    style="width: 300px"
                    v-model="staffForm.staffName"
                    :placeholder="t('staffManagePage.pleaseEnter')"
                    :disabled="!isCanEdit"
                />
            </el-form-item>
            <el-form-item :label="t('staffManagePage.staffAccount') + '：'" prop="staffUserName">
                <el-input
                    style="width: 300px"
                    v-model="staffForm.staffUserName"
                    :placeholder="t('staffManagePage.pleaseEnter')"
                    :disabled="!!staffForm.userOid || !isCanEdit"
                />
            </el-form-item>
            <template v-if="!staffForm.userOid">
                <el-form-item :label="t('staffManagePage.accountPwd') + '：'" prop="password">
                    <el-input
                        style="width: 300px"
                        v-model="staffForm.password"
                        type="password"
                        autocomplete="new-password"
                        show-password
                        :placeholder="t('staffManagePage.pleaseEnter')"
                        :disabled="!isCanEdit"
                    />
                </el-form-item>
            </template>
            <el-form-item label="生效日期：" prop="effectiveDate">
                <el-date-picker
                    style="width: 300px"
                    v-model="staffForm.effectiveDate"
                    type="datetime"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    :disabled="!isCanEdit"
                    @change="handleEffectiveDateDifff"
                />
            </el-form-item>
            <el-form-item label="失效日期：">
                <el-date-picker
                    style="width: 300px"
                    v-model="staffForm.expirationDate"
                    type="datetime"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    :disabled="!isCanEdit"
                    @change="handleExpirationDateDifff"
                />
            </el-form-item>
            <el-form-item :label="t('staffManagePage.status') + '：'" prop="workStatus">
                <el-select
                    style="width: 300px"
                    v-model="staffForm.workStatus"
                    filterable
                    clearable
                    :disabled="!isCanEdit"
                >
                    <el-option v-for="item in workStatusList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <template v-if="!!staffForm.userOid">
                <el-form-item label="所属角色：">
                    <el-input
                        style="width: 300px"
                        type="textarea"
                        :autosize="{ minRows: 1 }"
                        v-model="staffForm.rolesName"
                        disabled
                    />
                </el-form-item>
            </template>
            <el-form-item :label="t('staffManagePage.email') + '：'" prop="email">
                <el-input
                    style="width: 300px"
                    v-model="staffForm.email"
                    :placeholder="t('staffManagePage.pleaseEnter')"
                    :disabled="!isCanEdit"
                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { useRouter } from "vue-router"
import { SelectInterface } from "@/interface/common"
import { StaffTableInterface } from "@/interface/system/staffManage"
import { getChildGroupTree } from "@/api/system/groupManage/index"
import { creatAndEditUser, delUser } from "@/api/system/staffManage"
import dayjs from "dayjs"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "StaffForm"
})

const { t } = useI18n()

interface Props {
    organizationList: SelectInterface[]
    workStatusList: SelectInterface[]
    currentRowData: StaffTableInterface
    treeSelectProps: object
    isCanEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
    organizationList: () => [],
    workStatusList: () => [],
    currentRowData: () => ({
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
    }),
    treeSelectProps: () => ({}),
    isCanEdit: false
})

const emits = defineEmits(["confirm-success"])

const currentDateTime = computed(() => {
    return dayjs(new Date()).format("YYYY-MM-DD")
})

const router = useRouter()
const loading = ref(false)
const groupList = ref<any[]>([]) // 组列表
// 邮箱正则校验
const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
const passwordReg = "^(?![A-Za-z]+$)(?![A-Z\\d]+$)(?![A-Z\\W]+$)(?![a-z\\d]+$)(?![a-z\\W]+$)(?![\\d\\W]+$)\\S{6,20}$"
// 手机校验正则（1开头 + 10个数字）
// const mobileReg = /^1\d{10}$/
const staffFormRef = ref<FormInstance>()
const staffForm = reactive({
    userOid: "",
    staffName: "", // 员工名称
    staffUserName: "", // 员工账号
    organizationOid: "", // 组织
    groupOid: "", // 部门
    oldGroupOid: "", // 前部门oid
    workStatus: "已启用", // 在职状态
    password: "", // 账号密码
    effectiveDate: currentDateTime.value, // 生效日期
    expirationDate: "", //  失效日期
    email: "", // 邮箱
    rolesName: "" // 所属角色
})
const rules = reactive<FormRules>({
    staffName: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "blur" }],
    staffUserName: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "blur" }],
    organizationOid: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }],
    groupOid: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }],
    workStatus: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }],
    // expirationDate: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }],
    effectiveDate: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }],
    email: [{ pattern: emailReg, message: t("staffManagePage.correctEmailAddress"), trigger: "blur" }],
    password: [
        { required: true, message: t("staffManagePage.requiredFields"), trigger: "blur" },
        {
            pattern: passwordReg,
            message: "账号密码为英文大小写、数字、特殊字符3种组合而成且长度不低于6位",
            trigger: "blur"
        }
    ]
})

// 处理生效日期
const handleEffectiveDateDifff = (value: string) => {
    if (!value || !staffForm.expirationDate) return
    if (dayjs(value).isAfter(staffForm.expirationDate)) {
        Object.assign(staffForm, {
            ...staffForm,
            effectiveDate: ""
        })
        ElMessage({
            type: "warning",
            message: "生效日期不能大于失效日期!",
            center: true
        })
    }
}

// 处理失效日期
const handleExpirationDateDifff = (value: string) => {
    if (!value || !staffForm.effectiveDate) return
    if (dayjs(staffForm.effectiveDate).isAfter(value)) {
        Object.assign(staffForm, {
            ...staffForm,
            expirationDate: ""
        })
        ElMessage({
            type: "warning",
            message: "生效日期不能大于失效日期!",
            center: true
        })
    }
}

// 处理组织选择
const handleorganizationOidChange = (value: string) => {
    Object.assign(staffForm, {
        ...staffForm,
        organizationOid: value,
        groupOid: ""
    })
    groupList.value = []
    getGroupList(value, undefined)
}

// 获取部门列表
const getGroupList = async (organizationOid: string, details: any | undefined) => {
    if (!organizationOid) return
    try {
        loading.value = true
        const params = {
            topOid: organizationOid
        }
        const { data } = await getChildGroupTree(params)

        groupList.value = data[0].children || []
        if (details) {
            const { userOid, code, name, topOid, superOid, first, last, status, roles, email } = details
            Object.assign(staffForm, {
                userOid,
                staffName: name,
                staffUserName: code,
                organizationOid: topOid,
                groupOid: superOid, // 老部门oid
                oldGroupOid: superOid,
                effectiveDate: first,
                expirationDate: last,
                workStatus: status,
                rolesName: roles,
                email: email
            })
        }
        loading.value = false
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 获取用户详情
// const getUserDetailData = async (oid: string) => {
//     try {
//         const params: {
//             oid: string
//         } = {
//             oid
//         }
//         const { data } = (await getUserDetail(params)) as { data: any }
//         // 根据组织回显部门
//         if (data.organizationOid) {
//             getGroupList(data.organizationOid)
//         }
//         Object.assign(staffForm, {
//             ...data,
//             oid: data.oid,
//             staffName: data.staffName,
//             staffUserName: data.staffUserName,
//             organizationOid: data.organizationOid,
//             groupOid: data.groupOid,
//             workStatus: data.status ? t("staffManagePage.working") : t("staffManagePage.dimission"),
//             email: data.email
//         })
//     } catch (err: any) {
//         console.log(err)
//     }
// }

// 清除表单
const handleClear = () => {
    if (!staffFormRef.value) return
    staffFormRef.value!.resetFields()
    Object.assign(staffForm, {
        ...staffForm,
        userOid: "",
        password: "",
        workStatus: "已启用",
        effectiveDate: "",
        expirationDate: "",
        rolesName: "",
        email: ""
    })
    groupList.value = []
}

// 复制表单
const copyHandler = () => {
    Object.assign(staffForm, {
        ...staffForm,
        userOid: "",
        staffName: "",
        staffUserName: ""
    })
}

// 处理保存
const handleSaveBtn = async (leaveParams: any) => {
    if (!staffFormRef.value) return
    await staffFormRef.value!.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                let params: {
                    userOid?: string
                    fullName: string
                    userName?: string
                    password?: string
                    groupOid: string
                    oldGroupOid?: string
                    first: string
                    last: string
                    status: string
                    email: string
                } = {
                    fullName: staffForm.staffName,
                    userName: staffForm.staffUserName,
                    password: staffForm.password,
                    groupOid: staffForm.groupOid,
                    first: staffForm.effectiveDate,
                    last: staffForm.expirationDate,
                    status: staffForm.workStatus,
                    email: staffForm.email
                }

                if (staffForm.userOid) {
                    params = {
                        ...params,
                        userOid: staffForm.userOid,
                        oldGroupOid: staffForm.oldGroupOid
                    }
                }
                await creatAndEditUser(params)
                ElMessage({
                    type: "success",
                    message: staffForm.userOid ? t("staffManagePage.editSuccess") : t("staffManagePage.createSuccess"),
                    center: true
                })
                if (!staffForm.userOid) {
                    handleClear()
                }
                if (leaveParams.isCanLeave) {
                    staffFormRef.value!.resetFields()
                    if (typeof leaveParams.fn === "function") {
                        leaveParams.fn()
                    }
                }
                loading.value = false
                emits("confirm-success")
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        } else {
            if (leaveParams.isCanLeave) {
                ElMessage({
                    type: "warning",
                    message: "页面离开，数据未编辑成功！",
                    center: true
                })
                if (typeof leaveParams.fn === "function") {
                    leaveParams.fn()
                }
            }
        }
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
                    userOid: staffForm.userOid
                }
                const { message } = (await delUser(params)) as any
                loading.value = false
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                handleClear()
                emits("confirm-success")
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

// 获取详情
const getDetail = (currentRowData: any) => {
    if (!currentRowData.userOid) return
    const { topOid } = currentRowData
    if (topOid) {
        getGroupList(topOid, currentRowData)
    }
}

defineExpose({
    getDetail,
    handleClear,
    handleSaveBtn,
    handleDeleteBtn,
    copyHandler
})
</script>

<style lang="scss" scoped>
.sf-form-wrapper {
    :deep(.el-form) {
        .el-form-item {
            margin-bottom: 32px;
        }
    }
    :deep(.el-date-editor) {
        .el-input__wrapper {
            width: 100%;
        }
    }
}
</style>
