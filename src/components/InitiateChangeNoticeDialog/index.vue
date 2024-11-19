<template>
    <div v-loading="loading">
        <el-form
            ref="changeNoticeFormRef"
            :model="changeNoticeForm"
            :rules="rules"
            size="small"
            label-width="96px"
            label-position="right"
            :disabled="!isCanEdit"
        >
            <el-form-item label="日期" prop="noticeDate">
                <div>{{ changeNoticeForm.noticeDate }}</div>
            </el-form-item>
            <el-form-item label="发起人">
                <template v-if="isCanEdit">
                    <div>{{ userStore.userInfo.fullName }}</div>
                </template>
                <template v-else>
                    <el-input v-model="changeNoticeForm.promoter" disabled />
                </template>
            </el-form-item>
            <el-form-item label="系列组织" prop="groupOid">
                <el-select v-model="changeNoticeForm.groupOid" filterable @change="handleOrganizationOidChange">
                    <el-option v-for="item in options_group" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="系列名称" prop="seriesName">
                <el-select style="width: 100%" v-model="changeNoticeForm.seriesName" :loading="loading_group">
                    <el-option v-for="item in options_series" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="通知分类" prop="noticeClassification">
                <el-select style="width: 100%" v-model="changeNoticeForm.noticeClassification">
                    <el-option
                        v-for="item in noticeClassificationList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="通知标题" prop="noticeTitle">
                <el-input
                    style="width: 100%"
                    v-model="changeNoticeForm.noticeTitle"
                    :placeholder="t('productLibraryPage.pleaseEnter')"
                />
            </el-form-item>
            <el-form-item label="通知内容" prop="noticeContent">
                <el-input
                    style="width: 100%"
                    v-model="changeNoticeForm.noticeContent"
                    :autosize="{ minRows: 4 }"
                    type="textarea"
                    :placeholder="t('productLibraryPage.pleaseEnter')"
                />
            </el-form-item>
            <!-- 根据组织选人， 查看详情时不显示 -->
            <el-form-item label="用户组织" v-if="isCanEdit">
                <el-select
                    v-model="changeNoticeForm.organizationOid"
                    filterable
                    @change="handleOrganizationOidChange_user"
                >
                    <el-option v-for="item in options_userGroup" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="接收人" prop="recipient">
                <template v-if="isCanEdit">
                    <el-select
                        style="width: 100%"
                        v-model="changeNoticeForm.recipient"
                        multiple
                        filterable
                        clearable
                        value-key="id"
                        :loading="loading_user"
                    >
                        <el-option v-for="item in recipientList" :key="item.id" :label="item.name" :value="item" />
                    </el-select>
                </template>
                <template v-else>
                    <div>{{ changeNoticeForm.recipientName }}</div>
                </template>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center" v-if="isCanEdit">
            <el-button size="small" type="primary" @click="handleConfirm(changeNoticeFormRef)">保存</el-button>
            <el-button size="small" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { useUserStore } from "@/store/modules/user"
import { noticeClassificationList } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { getProductTopBom } from "@/api/bomManage/productBom/index"
import { productList } from "@/api/productLibrary"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import { userList } from "@/api/system/staffManage/index"
import { createOrEditNotice, changeNoticeDetail } from "@/api/changeManage/initiateChangeNotice"
import { getNameById } from "@/assets/common/select-list"
import dayjs from "dayjs"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "InitiateChangeNoticeDialog"
})

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    isCanEdit: {
        type: Boolean,
        default: true
    },
    currentRowData: {
        type: Object,
        default: () => ({})
    }
})
const userStore = useUserStore()

const { t } = useI18n()

const emits = defineEmits(["update:visible", "confirm-success"])

const currentDateTime = computed(() => {
    return dayjs(new Date()).format("YYYY-MM-DD")
})

const options_series = ref<SelectInterface[]>([]) // 系列名称列表
const recipientList = ref<SelectInterface[]>([]) // 接收人列表

const loading = ref(false)
const changeNoticeFormRef = ref<FormInstance>()
const changeNoticeForm = reactive({
    noticeDate: currentDateTime.value, // 日期
    promoter: userStore.userInfo.fullName, // 发起人
    seriesName: "", // 系列名称
    noticeClassification: "", // 通知分类
    noticeTitle: "", // 通知标题
    noticeContent: "", // 通知内容
    organizationOid: "", // 组织oid
    recipient: [], // 接收人
    recipientName: [], // 接收人回显
    groupOid: "" // 系列组织oid
})
const rules = reactive<FormRules>({
    groupOid: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    noticeDate: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    seriesName: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    noticeClassification: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    noticeTitle: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    recipient: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }]
})

//#region 系列组织&系列名称
const loading_group = ref(false)
const options_group = ref<SelectInterface[]>([]) // 系列组织列表

// 获取系列组织列表
const getOrganizationList = async () => {
    loading.value = true
    productList()
        .then((data) => {
            options_group.value = (data.data || []).map((item: any) => {
                return {
                    id: item.oid,
                    name: item.name
                }
            })
        })
        .finally(() => (loading.value = false))
}
getOrganizationList()
// 获取系列名称列表
const getOptionsSeriesList = async (name: string) => {
    try {
        loading_group.value = true
        const { data } = await getProductTopBom({ ProductName: name })
        options_series.value =
            data.map((item: { PartOid: string; Name: string }) => {
                return {
                    id: item.PartOid,
                    name: item.Name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    } finally {
        loading_group.value = false
    }
}
// 系列组织下拉回调
const handleOrganizationOidChange = (val: string) => {
    console.log("handleOrganizationOidChange: ", val)
    changeNoticeForm.seriesName = ""
    options_series.value = []
    if (!val) return
    const name = getNameById(options_group.value, val)
    getOptionsSeriesList(name)
}
//#endregion

//#region 用户组织&接收人
const loading_user = ref(false)
const options_userGroup = ref<SelectInterface[]>([]) // 用户组织列表

// 获取用户组织列表
const getOrganizationList_user = async () => {
    const params = {
        page: "1",
        limit: "99999"
    }
    loading.value = true
    getOrganizationManageData(params)
        .then((data) => {
            options_userGroup.value = (data.data || []).map((item: any) => {
                return {
                    id: item.groupOid,
                    name: item.name
                }
            })
        })
        .finally(() => (loading.value = false))
}
getOrganizationList_user()
// 根据组织获取人
const handleOrganizationOidChange_user = (val: string) => {
    console.log("handleOrganizationOidChange_user: ", val)
    // changeNoticeForm.recipient = []
    recipientList.value = []
    if (!val) return
    getRecipientList(val)
}
// 获取接收人列表
const getRecipientList = async (organizationOid: string) => {
    try {
        const params = {
            status: "已启用",
            topOid: organizationOid,
            page: "1",
            limit: "99999"
        }
        loading_user.value = true
        const { data } = await userList(params)
        recipientList.value =
            data.map((item: any) => {
                return {
                    id: item.userOid,
                    name: `${item.name}(${item.superName})`
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    } finally {
        loading_user.value = false
    }
}
//#endregion

// getRecipientList()

// 获取变更通知详情
const getDetails = async (oid: string) => {
    try {
        loading.value = true
        const params: {
            oidStr: string
        } = {
            oidStr: oid
        }
        const { data } = (await changeNoticeDetail(params)) as { data: any }
        Object.assign(changeNoticeForm, {
            oid: data.oidStr,
            noticeDate: data.createdAt,
            seriesName: data.seriesName,
            noticeClassification: data.noticeType,
            noticeTitle: data.title,
            noticeContent: data.info,
            promoter: data.promoter,
            recipient: data.noticeUsers.map((user: any) => {
                return {
                    id: user.noticeUserOid,
                    name: user.noticeUser
                }
            }),
            recipientName: data.noticeUsers
                .map((user: any) => {
                    const statusString = user.status === 1 ? "(未读)" : "(已读)"
                    return `${user.noticeUser}${statusString}`
                })
                .join("，")
        })
        loading.value = false
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const noticeUsers = (changeNoticeForm.recipient as SelectInterface[]).map((item) => {
                    return {
                        noticeUserOid: item.id,
                        noticeUser: item.name
                    }
                })
                const params: {
                    groupOid: string
                    seriesName: string
                    noticeType: string
                    title: string
                    info?: string
                    noticeUsers: any[]
                } = {
                    groupOid: changeNoticeForm.groupOid,
                    seriesName: changeNoticeForm.seriesName,
                    noticeType: changeNoticeForm.noticeClassification,
                    title: changeNoticeForm.noticeTitle,
                    info: changeNoticeForm.noticeContent,
                    noticeUsers
                }
                await createOrEditNotice(params)
                ElMessage({
                    type: "success",
                    message: "新建成功",
                    center: true
                })
                emits("confirm-success", "initiateChangeNotice")
            } catch (err: any) {
                loading.value = false
                if (err.msg)
                    ElMessage({
                        type: "error",
                        message: err.msg,
                        center: true
                    })
                return
            }
        }
    })
}

watch(
    () => props.currentRowData.oid,
    (val) => {
        if (!val) return
        getDetails(val)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
:deep(.el-date-editor) {
    .el-input__wrapper {
        width: 100%;
    }
}
</style>
