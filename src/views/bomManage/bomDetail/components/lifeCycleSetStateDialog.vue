<template>
    <div v-loading="loading">
        <el-form
            ref="lifeCycleStateFormRef"
            :model="lifeCycleStateForm"
            :rules="rules"
            size="small"
            label-width="132px"
            label-position="right"
        >
            <el-form-item label="跃迁生命周期状态：" prop="state">
                <el-select style="width: 100%" v-model="lifeCycleStateForm.state">
                    <el-option v-for="item in lifeCycleStateList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(lifeCycleStateFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('confirm-success', 'setState')">{{
                t("organizationManagePage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { useI18n } from "vue-i18n"
import { SelectInterface } from "@/interface/common"
import { getLifeCycleTemplateNode, materieSetState } from "@/api/productMange/materiel"

defineOptions({
    name: "lifeCycleSetStateDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        default: () => {},
        required: true
    }
})
console.log("props.currentRowData: ", props.currentRowData)

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const lifeCycleStateFormRef = ref<FormInstance>()
const lifeCycleStateForm = reactive({
    state: "" // 生命周期状态
})
const rules = reactive<FormRules>({
    state: [{ required: true, message: "必填项不能为空！", trigger: "change" }]
})

// 获取物料可跳跃的生命周期状态
const lifeCycleStateList = ref<SelectInterface[]>([])
const getLifeCycleStateData = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string
        } = {
            partOid: props.currentRowData.oid
        }
        const { data } = (await getLifeCycleTemplateNode(params)) as { data: any }
        lifeCycleStateList.value =
            data.map((item: { en: string; cn: string }) => {
                return {
                    id: item.en,
                    name: item.cn
                }
            }) || []
        Object.assign(lifeCycleStateForm, {
            state: props.currentRowData.enState
        })
        loading.value = false
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
getLifeCycleStateData()

// 处理保存按钮
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const params: {
                    partOid: string
                    en: string
                } = {
                    partOid: props.currentRowData.oid,
                    en: lifeCycleStateForm.state
                }
                const { message } = (await materieSetState(params)) as any
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                emits("confirm-success", "setState")
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        }
    })
}
</script>

<style lang="scss" scoped></style>
