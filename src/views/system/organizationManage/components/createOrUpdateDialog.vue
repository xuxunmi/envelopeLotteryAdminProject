<template>
    <div v-loading="loading">
        <el-form
            ref="organizationFormRef"
            :model="organizationForm"
            :rules="rules"
            size="small"
            label-width="120px"
            label-position="right"
        >
            <el-form-item label="组织编码：" :prop="organizationForm.productOid ? 'empty' : 'code'">
                <el-input
                    style="width: 100%"
                    v-model="organizationForm.code"
                    :placeholder="t('organizationManagePage.pleaseEnter')"
                    :disabled="!!organizationForm.productOid"
                />
            </el-form-item>
            <el-form-item :label="t('organizationManagePage.organizationName') + '：'" prop="name">
                <el-input
                    style="width: 100%"
                    v-model="organizationForm.name"
                    :placeholder="t('organizationManagePage.pleaseEnter')"
                />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(organizationFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('confirmSuccess', 'addEdit')">{{
                t("organizationManagePage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
// import { SelectInterface } from "@/interface/common"
import { OrganizationManageTableInterface } from "@/interface/system/organizationManage"
import { creatOrganization, updateOrganization } from "@/api/system/organizationManage"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "createOrUpdateDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        default: () => {}
    },
    dialogType: {
        type: String,
        default: ""
    }
})

const emits = defineEmits(["update:visible", "confirmSuccess"])

const loading = ref(false)
const organizationFormRef = ref<FormInstance>()
const organizationForm = reactive<OrganizationManageTableInterface>({
    productOid: "", // 组织Oid
    groupOid: "", // 用户组Oid
    name: "", // 组织名称
    code: "", // 组织编码
    owner: "" // 创建者
})
const rules = reactive<FormRules>({
    name: [{ required: true, message: t("organizationManagePage.requiredFields"), trigger: "blur" }],
    code: [{ required: true, message: t("organizationManagePage.requiredFields"), trigger: "blur" }]
})

// 获取产品详情
// const getProductDetail = async (oid: string) => {
// try {
//     loading.value = true
//     const params = {
//         id: id,
//         type: props.formType
//     }
//     const { data } = (await getProjectDetails(params)) as { data: any }
//     const { item } = data
//     Object.assign(productForm, {
//         id: item.id,
//         parentId: item.parentId,
//         name: item.name,
//         status: item.status,
//         isTemplate: item.isTemplate,
//         isDeleted: item.isDeleted
//     })
//     loading.value = false
// } catch (err: any) {
//     loading.value = false
//     if (err.msg)
//         ElMessage({
//             type: "error",
//             message: err.msg,
//             center: true
//         })
//     return
// }
// }

// 处理保存按钮
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                let params: {
                    productOid?: string
                    groupOid?: string
                    productName: string
                    groupNumber?: string
                } = {
                    productName: organizationForm.name,
                    groupNumber: organizationForm.code
                }
                if (organizationForm.productOid) {
                    params = {
                        ...params,
                        productOid: organizationForm.productOid,
                        groupOid: organizationForm.groupOid,
                        groupNumber: undefined // 编辑的时候不传编码
                    }
                }
                console.log("params: ", params)
                const { message } = organizationForm.productOid
                    ? ((await updateOrganization(params)) as any)
                    : ((await creatOrganization(params)) as any)
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                emits("confirmSuccess", "addEdit")
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
    () => props.currentRowData,
    (val) => {
        if (!val || props.dialogType === "add") return
        const { productOid, groupOid, name, code } = val
        Object.assign(organizationForm, {
            productOid,
            groupOid,
            name,
            code
        })
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped></style>
