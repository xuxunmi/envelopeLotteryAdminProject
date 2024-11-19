<template>
    <div class="addEditProfileDialog" v-loading="loading">
        <el-form
            class="form"
            ref="colorFormRef"
            :model="colorForm"
            :rules="rules"
            size="small"
            label-width="76px"
            label-position="right"
        >
            <el-form-item label="产品分类" prop="productLine">
                <el-select
                    :loading="loading_select"
                    v-model="colorForm.productLine"
                    filterable
                    clearable
                    @change="handleSelectChange"
                >
                    <el-option
                        v-for="item in option_productLine"
                        :key="item.code"
                        :label="item.codeListNameC"
                        :value="item.code"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="编码" prop="code">
                <el-input v-model="colorForm.code" disabled placeholder="选择产品分类自动生成" />
            </el-form-item>
            <el-form-item label="名称" prop="name">
                <el-input v-model="colorForm.name" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="RAL色号" prop="colorCode">
                <el-input v-model="colorForm.colorCode" placeholder="请输入" />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(colorFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { colorProfileDetail, colorProfileAddEdit, getColorCode } from "@/api/colorManage/colorProfile"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "addEditProfileDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    dialogType: {
        type: String,
        default: "add"
    },
    currentRowData: {
        type: Object,
        required: true
    }
})

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const colorFormRef = ref<FormInstance>()
const colorForm = reactive({
    oid: "",
    code: "", // 编码
    name: "", // 名称
    colorCode: "", // RAL色号
    productLine: "" // 产品分类
})
const rules = reactive<FormRules>({
    code: [{ required: true, message: "必填项不能为空！", trigger: ["blur", "change"] }],
    name: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
    productLine: [{ required: true, message: "必填项不能为空！", trigger: "change" }]
})

// 获取详情
const getDetails = async (oid: string) => {
    try {
        loading.value = true
        const params: {
            oidStr: string
        } = {
            oidStr: oid
        }
        const { data } = (await colorProfileDetail(params)) as { data: any }
        Object.assign(colorForm, {
            oid: data.oidStr,
            code: data.code,
            name: data.name,
            colorCode: data.colorCode,
            productLine: data.productLine
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
                let params: {
                    oidStr?: string
                    code: string
                    name: string
                    colorCode: string
                    productLine: string
                } = {
                    code: colorForm.code,
                    name: colorForm.name,
                    colorCode: colorForm.colorCode,
                    productLine: colorForm.productLine
                }
                if (colorForm.oid) {
                    params = {
                        ...params,
                        oidStr: props.currentRowData.oid
                    }
                }
                await colorProfileAddEdit(params)
                ElMessage({
                    type: "success",
                    message: colorForm.oid ? "编辑成功" : "新建成功",
                    center: true
                })
                loading.value = false
                emits("confirm-success", "addEdit")
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        }
    })
}

const handleSelectChange = (val: any) => {
    // console.log('handleSelectChange', val);
    if (val) {
        loading.value = true
        getColorCode({ productLine: val })
            .then((data) => {
                colorForm.code = data.data || ""
            })
            .finally(() => (loading.value = false))
    } else {
        colorForm.code = ""
    }
}
//#region 字典数据
const loading_select = ref(false)
const option_productLine = ref<any[]>([]) // 产品分类
loading_select.value = true
getDictionarySelect({ codes: "PRODUCT_LINE" })
    .then((data) => {
        option_productLine.value = data.data.PRODUCT_LINE || []
    })
    .finally(() => (loading_select.value = false))
//#endregion

watch(
    () => props.currentRowData,
    (val) => {
        if (props.dialogType === "add" || !val) return
        getDetails(val.oid)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.addEditProfileDialog {
  .form {
    height: 300px;
  }
}
</style>
