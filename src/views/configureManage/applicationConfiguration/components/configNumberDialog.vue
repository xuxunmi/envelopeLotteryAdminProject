<template>
    <div>
        <el-form ref="formRef" :model="formData" :rules="rules" size="small" label-width="130px" label-position="left">
            <el-form-item label="整机编号(11位)" prop="serialNumber">
                <el-input v-model="formData.serialNumber" maxlength="11" />
            </el-form-item>
            <el-form-item label="日期(年份+月份)" prop="date">
                <el-input v-model="formData.date" maxlength="6" disabled />
            </el-form-item>
            <el-form-item label="流水码(5位)" prop="streamNumber">
                <el-input v-model="formData.streamNumber" maxlength="5" />
            </el-form-item>
            <el-form-item label="编码值预览">
                <div class="numberBox">{{ number }}</div>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(formRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "configNumberDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    objectRow: {
        type: Object,
        default: () => ({})
    },
    codeObj: {
        type: Object,
        default: () => ({})
    }
})

const emits = defineEmits(["update:visible", "edit-success"])
//#endregion

//#region 表单
const number = computed(() => `${formData.serialNumber || ''}-${formData.date || ''}-${formData.streamNumber || ''}`) // 编码值预览
const formRef = ref<FormInstance>()
const formData = reactive<any>({
    serialNumber: "", //  整机编号
    date: "", // 年份月份
    streamNumber: "" // 5位流水码
})
const rules = reactive<FormRules>({
    serialNumber: [
        { required: true, message: "请输入整机编号！", trigger: "blur" },
        { min: 11, max: 11, message: "请输入11位整机编号！", trigger: "blur" }
    ],
    date: [
        { required: true, message: "请输入日期！", trigger: "blur" },
        { min: 6, max: 6, message: "请输入6位日期！", trigger: "blur" }
    ],
    streamNumber: [
        { required: true, message: "请输入流水码！", trigger: "blur" },
        { min: 5, max: 5, message: "请输入5位流水码！", trigger: "blur" }
    ],
})

// 处理保存按钮
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            emits("edit-success", number.value)
        }
    })
}
Object.assign(formData, {
  serialNumber: props.codeObj.serialNumber, //  整机编号
  date: props.codeObj.date, // 年份月份
  streamNumber: props.codeObj.streamNumber // 5位流水码
})
//#endregion

</script>

<style lang="scss" scoped>
.numberBox {
    width: 100%;
    height: 120px;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
