<template>
    <div v-loading="loading" :element-loading-text="elementLoadingText">
        <el-form
            ref="changeExportRef"
            :model="changeExportForm"
            :rules="rules"
            size="small"
            label-width="106px"
            label-position="right"
            style="height: 100px"
        >
            <el-form-item label="选择导出方式：" prop="exportMethod">
                <el-radio-group v-model="changeExportForm.exportMethod">
                    <el-radio value="1" size="small" :disabled="!multipleTableSelection.length">导出勾选数据</el-radio>
                    <el-radio value="2" size="small" :disabled="!tableData.length">导出本页数据</el-radio>
                    <el-radio value="3" size="small" :disabled="!tableData.length">导出全部数据</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(changeExportRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "changeExportDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    multipleTableSelection: {
        type: Array as any,
        default: () => []
    },
    // 表格数据
    tableData: {
        type: Array as any,
        default: () => []
    }
})

console.log("props.multipleTableSelection", props.multipleTableSelection)

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const elementLoadingText = ref<string>("") // 加载中文字
const changeExportRef = ref<FormInstance>()
const changeExportForm = reactive({
    exportMethod: "" // 导出方式
})
const rules = reactive<FormRules>({
    exportMethod: [{ required: true, message: "请选择导出方式！", trigger: "change" }]
})

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            emits("confirm-success", changeExportForm)
        }
    })
}

defineExpose({
    loading,
    elementLoadingText
})
</script>

<style lang="scss" scoped></style>
