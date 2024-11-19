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
            <el-form-item label="备注" prop="remarks">
                <el-input
                    style="width: 100%"
                    v-model="folderForm.remark"
                    :rows="6"
                    type="textarea"
                    placeholder="请输入"
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
import { ref, reactive, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { createOrEditOrder } from "@/api/orderManage/standingStockOrder/index"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "addRemarksDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        required: true
    }
})
const emits = defineEmits(["update:visible", "confirm-success"])

const { t } = useI18n()
const loading = ref(false)
//#endregion

const folderFormRef = ref<FormInstance>()
const folderForm = reactive({
    oidStr: "",
    remark: "" // 备注
})
const rules = reactive<FormRules>({
    // remarks: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }]
})

// 获取产品详情
const getDetails = async (rowData: any) => {
    Object.assign(folderForm, {
        oidStr: rowData.oidStr,
        remark: rowData.remark
    })
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
    loading.value = true
    createOrEditOrder(folderForm)
        .then((data) => {
            ElMessage.success("修改成功！")
            emits("confirm-success", "addRemarks")
        })
        .finally(() => (loading.value = false))
    // if (!formEl) return
    // await formEl.validate(async (valid) => {
    //     if (valid) {
    //     }
    // })
}

watch(
    () => props.currentRowData,
    (val) => {
        getDetails(val)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped></style>
