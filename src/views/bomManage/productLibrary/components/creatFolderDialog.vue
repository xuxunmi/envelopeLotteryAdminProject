<template>
    <div v-loading="loading">
        <el-form
            ref="folderFormRef"
            :model="folderForm"
            :rules="rules"
            size="small"
            label-width="76px"
            label-position="right"
        >
            <el-form-item :label="t('productLibraryPage.name') + '：'" prop="name">
                <el-input
                    style="width: 100%"
                    v-model="folderForm.name"
                    :placeholder="t('productLibraryPage.pleaseEnter')"
                />
            </el-form-item>
            <el-form-item :label="t('productLibraryPage.desc') + '：'">
                <el-input
                    style="width: 100%"
                    v-model="folderForm.description"
                    :autosize="{ minRows: 2 }"
                    type="textarea"
                    :placeholder="t('productLibraryPage.pleaseEnter')"
                />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(folderFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("productLibraryPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { ProductListDataInterface } from "@/interface/product"
import { getFolderDetails, createFolder } from "@/api/productLibrary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "creatFolderDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object as () => ProductListDataInterface,
        required: true
    },
    dialogType: {
        type: String,
        default: "add"
    }
})
console.log("props.currentRowData: ", props.currentRowData)

const emits = defineEmits(["update:visible", "confirmSuccess"])

const loading = ref(false)
const folderFormRef = ref<FormInstance>()
const folderForm = reactive({
    oid: "",
    name: "", // 名称
    description: "" // 说明
})
const rules = reactive<FormRules>({
    name: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }]
})

// 获取产品详情
const getProductFolderDetail = async (rowData: ProductListDataInterface) => {
    try {
        loading.value = true
        const params: {
            oid: string
            type: string
        } = {
            oid: rowData.oid,
            type: rowData.type
        }
        const { data } = (await getFolderDetails(params)) as { data: any }
        Object.assign(folderForm, {
            oid: data.oid,
            name: data.name,
            description: data.desc
        })
        loading.value = false
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

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const params: {
                    oid: string
                    name: string
                    desc: string
                    flag?: string
                } = {
                    oid: props.currentRowData.oid,
                    name: folderForm.name,
                    desc: folderForm.description,
                    flag: props.dialogType
                }
                await createFolder(params)
                loading.value = false
                ElMessage({
                    type: "success",
                    message:
                        props.dialogType === "add"
                            ? t("productLibraryPage.createSuccess")
                            : t("productLibraryPage.editSuccess"),
                    center: true
                })
                emits("confirmSuccess", props.currentRowData.oid)
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
        if (props.dialogType === "add") return
        getProductFolderDetail(val)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped></style>
