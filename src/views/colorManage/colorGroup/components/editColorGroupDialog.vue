<template>
    <div class="addColorDialog" v-loading="loading">
        <el-form
            class="form"
            ref="colorFormRef"
            :model="formData"
            :rules="rules"
            size="small"
            label-width="76px"
            label-position="right"
        >
            <el-form-item label="默认值" prop="productLine">
                <el-select v-model="formData.defaultProductLineChild" filterable clearable multiple>
                    <el-option
                        v-for="item in (childLineList as any)"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(colorFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { editColorGroup } from "@/api/colorManage/colorGroup"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRow: {
        type: Object,
        required: true
    },
    childLineList: {
        type: Array,
        required: true
    }
})
const emits = defineEmits(["update:visible", "confirm-success"])
const { t } = useI18n()
const loading = ref(false)
console.log(props.currentRow)
//#endregion

//#region 表单
const colorFormRef = ref<FormInstance>()
const formData = reactive({
    defaultProductLineChild: []
})
const rules = reactive<FormRules>({
    // productLine: [{ required: true, message: "请选择产品线！", trigger: "change" }]
})
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            const params = {
                oidStr: props.currentRow.colorGroupOidStr,
                colorGroupCode: props.currentRow.colorGroupCode,
                productLine: props.currentRow.productLine,
                defaultProductLineChild: formData.defaultProductLineChild.join(",")
            }
            loading.value = true
            editColorGroup(params)
                .then((data) => {
                    ElMessage.success("修改成功！")
                    emits("confirm-success")
                })
                .finally(() => (loading.value = false))
        }
    })
}
// 获取数据
const getData = () => {
    console.log("getData", props.currentRow)
    formData.defaultProductLineChild = props.currentRow.defaultProductLineChildCode || []
}
getData()
//#endregion
</script>

<style lang="scss" scoped>
.addColorDialog {
    .form {
        height: 200px;
    }
}
</style>
