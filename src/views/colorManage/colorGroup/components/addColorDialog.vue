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
            <el-form-item label="产品分类" prop="productLine">
                <el-select
                    :loading="loading_select"
                    v-model="formData.productLine"
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
            <el-form-item label="颜色分组" prop="colorGroupCode">
                <el-select
                    :loading="loading_select"
                    v-model="formData.colorGroupCode"
                    filterable
                    clearable
                    @change="handleSelectChange"
                >
                    <el-option
                        v-for="item in option_colorGroup"
                        :key="item.code"
                        :label="item.codeListNameC"
                        :value="item.code"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="可选颜色" prop="oidsStr">
                <el-select :loading="loading_color" v-model="formData.oidsStr" multiple>
                    <el-option v-for="item in options_color" :key="item.oid" :label="item.name" :value="item.oid">
                        <div class="flex items-center">
                            <span>{{ item.name }}</span>
                        </div>
                    </el-option>
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
import { getColorProfileAllList } from "@/api/colorManage/colorProfile"
import { createColorGroup } from "@/api/colorManage/colorGroup"
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
    searchForm: {
        type: Object,
        required: true
    }
})

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const colorFormRef = ref<FormInstance>()
const formData = reactive({
    oidsStr: [],
    productLine: "", // 产品分类
    colorGroupCode: "" // 产品分类
})
const rules = reactive<FormRules>({
    oidsStr: [{ required: true, message: "请选择至少一个颜色！", trigger: "change" }],
    productLine: [{ required: true, message: "请选择产品分类！", trigger: "change" }],
    colorGroupCode: [{ required: true, message: "请选择颜色分组！", trigger: "change" }]
})
// 可选颜色
const loading_color = ref(false)
const options_color = ref<any[]>([])
// 获取颜色列表
const getList = (productLine: string) => {
    if (productLine) {
        loading_color.value = true
        getColorProfileAllList({ productLine })
            .then((data) => {
                options_color.value = data.data.map((item: any) => {
                    return {
                        oid: item.oidStr,
                        name: item.name,
                        color: item.colorCode || "#000000"
                    }
                })
            })
            .finally(() => (loading_color.value = false))
    } else {
        options_color.value = []
    }
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            const params = {
                colorGroupCode: formData.colorGroupCode,
                productLine: formData.productLine,
                oidsStr: formData.oidsStr.join(",")
            }
            createColorGroup(params)
                .then(() => {
                    ElMessage.success("添加成功！")
                    emits("confirm-success", "addEdit")
                })
                .catch((err) => {
                    console.log(err)
                    loading.value = false
                })
        }
    })
}

const handleSelectChange = (val: any) => {
    getList(val)
}

//#region 字典数据
const loading_select = ref(false)
const option_productLine = ref<any[]>([]) // 产品分类
const option_colorGroup = ref<any[]>([]) // 颜色分组
loading_select.value = true
getDictionarySelect({ codes: "PRODUCT_LINE,COLOR_GROUP" })
    .then((data) => {
        // 默认数据
        Object.assign(formData, {
            productLine: props.searchForm.productLine,
            colorGroupCode: props.searchForm.colorGroupCode
        })
        option_productLine.value = data.data.PRODUCT_LINE || []
        option_colorGroup.value = data.data.COLOR_GROUP || []
        handleSelectChange(formData.productLine)
    })
    .finally(() => (loading_select.value = false))
//#endregion
</script>

<style lang="scss" scoped>
.addColorDialog {
    .form {
        height: 200px;
    }
}
</style>
