<template>
    <div v-loading="loading">
        <el-form
            ref="workspaceFormRef"
            :model="workspaceForm"
            :rules="rules"
            size="small"
            label-width="76px"
            label-position="right"
        >
            <el-form-item :label="t('productLibraryPage.name') + '：'" prop="name">
                <el-input
                    style="width: 100%"
                    v-model="workspaceForm.name"
                    :placeholder="t('materielPage.pleaseEnter')"
                />
            </el-form-item>
            <el-form-item :label="t('materielPage.description') + '：'">
                <el-input
                    style="width: 100%"
                    v-model="workspaceForm.description"
                    :autosize="{ minRows: 2 }"
                    type="textarea"
                    :placeholder="t('materielPage.pleaseEnter')"
                />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(workspaceFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("materielPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { MaterialTreeInterface } from "@/interface/materiel"
import { createWorkspaceFolder, editWorkspaceFolder, workspaceFolderDetail } from "@/api/productMange/materiel"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "workspaceAddFolderDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentTreeNodeData: {
        type: Object as () => MaterialTreeInterface,
        required: true
    },
    dialogType: {
        type: String,
        default: "add"
    }
})

// console.log("props.currentTreeNodeData", props.currentTreeNodeData)

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const workspaceFormRef = ref<FormInstance>()
const workspaceForm = reactive({
    oid: "",
    pidStr: "",
    name: "", // 名称
    description: "" // 说明
})
const rules = reactive<FormRules>({
    name: [{ required: true, message: t("materielPage.requiredFields"), trigger: "blur" }]
})

// 获取产品详情
const getWorkspaceDetail = async (rowData: MaterialTreeInterface) => {
    try {
        loading.value = true
        const params: {
            oidStr: string
        } = {
            oidStr: rowData.oid
        }
        const { data } = (await workspaceFolderDetail(params)) as { data: any }
        Object.assign(workspaceForm, {
            oid: data.oidStr,
            pidStr: data.pidStr,
            name: data.name,
            description: data.remark
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
                let params: {
                    oidStr?: string
                    pidStr?: string
                    name: string
                    remark: string
                    flag: number
                    pdmLinkProductOid?: string
                } = {
                    name: workspaceForm.name,
                    remark: workspaceForm.description,
                    flag: props.currentTreeNodeData.flag === 0 ? 0 : 1
                }
                if (props.dialogType === "add") {
                    params = {
                        ...params,
                        // 当类型为公共工作区组织时，pidStr为0
                        pidStr:
                            props.currentTreeNodeData.type === "PDMLinkProduct" ? "0" : props.currentTreeNodeData.oid
                    }
                } else {
                    params = {
                        ...params,
                        oidStr: workspaceForm.oid,
                        pidStr: workspaceForm.pidStr
                    }
                }
                // 当新建公共工作区的文件夹时，新增参数pdmLinkProductOid
                if (props.currentTreeNodeData.flag === 1) {
                    params = {
                        ...params,
                        pdmLinkProductOid: props.currentTreeNodeData.pdmLinkProductOid
                    }
                }
                props.dialogType === "add" ? await createWorkspaceFolder(params) : await editWorkspaceFolder(params)
                ElMessage({
                    type: "success",
                    message:
                        props.dialogType === "add"
                            ? t("materielPage.createdsuccessMsg")
                            : t("materielPage.editSuccessMsg"),
                    center: true
                })
                emits("confirm-success", "workspace")
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
    () => props.currentTreeNodeData,
    (val) => {
        if (props.dialogType === "add") return
        getWorkspaceDetail(val)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped></style>
