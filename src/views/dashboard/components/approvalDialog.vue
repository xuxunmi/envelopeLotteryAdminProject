<template>
    <div v-loading="loading">
        <el-form
            ref="approvalFormRef"
            :model="approvalForm"
            :rules="rules"
            size="small"
            label-width="96px"
            label-position="right"
        >
            <el-form-item label="流程节点：">
                <div>{{ currentRowData.taskName }}</div>
            </el-form-item>
            <!-- <el-form-item label="审批：" prop="approve">
                <el-radio-group v-model="approvalForm.approve">
                    <el-radio v-for="item in approveTypeList" :key="item.id" :label="item.id">{{ item.name }}</el-radio>
                </el-radio-group>
            </el-form-item> -->
            <!-- <el-form-item label="描述：">
                <el-input v-model="approvalForm.description" :rows="6" type="textarea" />
            </el-form-item> -->
            <el-form-item label="驳回理由：" prop="rejectReason">
                <el-input v-model="approvalForm.rejectReason" :rows="6" type="textarea" />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(approvalFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("productLibraryPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { approveTypeList } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"
import { processTaskComplete } from "@/api/dashboard"

defineOptions({
    name: "ApprovalDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        required: true
    },
    dialogType: {
        type: String,
        required: true,
        default: "通过"
    }
})

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const approvalFormRef = ref<FormInstance>()
const approvalForm = reactive({
    oid: "",
    // approve: "0", // 审批类型
    // description: undefined, // 描述
    rejectReason: undefined // 驳回理由
})
const rules = reactive<FormRules>({
    // approve: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
    rejectReason: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }]
})

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const variables = {
                    flag: false, // 驳回默认写死为false
                    comment: approvalForm.rejectReason
                }
                const completeTaskDtoList = [
                    {
                        taskId: props.currentRowData.taskId,
                        businessId: props.currentRowData.orderOidStr,
                        variables
                    }
                ]
                await processTaskComplete(completeTaskDtoList)
                ElMessage({
                    type: "success",
                    message: "驳回成功",
                    center: true
                })
                emits("confirm-success", "approval")
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
</script>

<style lang="scss" scoped></style>
