<template>
    <div v-loading="loading">
        <el-form
            ref="productFormRef"
            :model="productForm"
            :rules="rules"
            size="small"
            label-width="96px"
            label-position="right"
        >
            <el-form-item :label="t('productLibraryPage.name') + '：'" prop="name">
                <el-input
                    style="width: 100%"
                    v-model="productForm.name"
                    :placeholder="t('productLibraryPage.pleaseEnter')"
                />
            </el-form-item>
            <el-form-item :label="t('productLibraryPage.organization') + '：'" prop="organizationOid">
                <el-select style="width: 100%" v-model="productForm.organizationOid" :disabled="!!currentRowData.oid">
                    <el-option v-for="item in organizationList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="t('productLibraryPage.desc') + '：'">
                <el-input
                    style="width: 100%"
                    v-model="productForm.description"
                    :autosize="{ minRows: 2 }"
                    type="textarea"
                    :placeholder="t('productLibraryPage.pleaseEnter')"
                />
            </el-form-item>
            <!-- <el-form-item label="专用访问权限：">
                <el-radio-group v-model="productForm.interviewAuth">
                    <el-radio label="1">是</el-radio>
                    <el-radio label="2">否</el-radio>
                </el-radio-group>
            </el-form-item> -->
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(productFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("productLibraryPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { SelectInterface } from "@/interface/common"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import { createUpdateProduct } from "@/api/productLibrary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "createProductDialog"
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
    }
})

const emits = defineEmits(["update:visible", "confirmSuccess"])

const organizationList = ref<SelectInterface[]>([]) // 组织列表
// const templateList = ref<SelectInterface[]>([
//     {
//         id: "1",
//         name: "Document Library"
//     },
//     {
//         id: "2",
//         name: "General Library"
//     },
//     {
//         id: "3",
//         name: "MPMLink General Library"
//     },
//     {
//         id: "4",
//         name: "MPMLink Library with Advanced Lifecycle Management"
//     },
//     {
//         id: "5",
//         name: "Part Library"
//     }
// ])

const loading = ref(false)
const productFormRef = ref<FormInstance>()
const productForm = reactive({
    oid: "",
    name: "", // 名称
    organizationOid: "", // 组织
    description: "" // 说明
    // interviewAuth: "2" // 专用访问权限
})
const rules = reactive<FormRules>({
    name: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }],
    organizationOid: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }]
    // template: [{ required: true, t("productLibraryPage.requiredFields"), trigger: "change" }]
})

// 获取组织列表
const getOrganizationList = async () => {
    try {
        const params = {
            page: "1",
            limit: "99999"
        }
        const { data } = await getOrganizationManageData(params)
        organizationList.value =
            data.map((item: { productOid: string; name: string }) => {
                return {
                    id: item.productOid,
                    name: item.name
                }
            }) || []
    } catch (err: any) {
        console.log(err)
    }
}

getOrganizationList()

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
//         description: item.description,
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

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                let params: {
                    name: string
                    orgOid: string
                    desc?: string
                    oid?: string
                } = {
                    name: productForm.name,
                    orgOid: productForm.organizationOid,
                    desc: productForm.description
                }
                if (props.currentRowData.oid) {
                    params = {
                        ...params,
                        oid: props.currentRowData.oid
                    }
                }
                const { message } = (await createUpdateProduct(params)) as any
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                emits("confirmSuccess", "product")
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
        if (!val) return
        const { name, orgOid, desc } = val
        Object.assign(productForm, {
            name,
            organizationOid: orgOid,
            description: desc
        })
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped></style>
