<template>
    <div v-loading="loading">
        <el-form
            ref="sumbitWorkflowFormRef"
            :model="sumbitWorkflowForm"
            :rules="rules"
            size="small"
            label-width="92px"
            label-position="right"
        >
            <el-form-item label="流程模板：" prop="template">
                <el-select
                    style="width: 100%"
                    v-model="sumbitWorkflowForm.template"
                    value-key="id"
                    placeholder="请选择"
                    @change="handleTemplateChange"
                >
                    <el-option v-for="item in processTemplateList" :key="item.id" :label="item.label" :value="item" />
                </el-select>
            </el-form-item>
            <div class="ml-2 mb-6">指派审批人</div>
            <el-form-item
                v-for="(field, index) in dynamicsFormFields"
                :key="index"
                :label="field.label"
                :prop="field.name"
                :rules="field.rules"
            >
                <el-select-v2
                    style="width: 100%"
                    v-model="sumbitWorkflowForm[field.name]"
                    filterable
                    :multiple="!field.uniqueTarget"
                    :collapse-tags="!field.uniqueTarget"
                    :collapse-tags-tooltip="!field.uniqueTarget"
                    :options="field.options"
                    :max-collapse-tags="5"
                    placeholder="请选择"
                    @change="handleSelectChange"
                />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(sumbitWorkflowFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { UserSelectInterface, DynamicsFormInterface } from "@/interface/common"
import { ProcessSubmitInterface } from "@/interface/orderManage"
// import { get as getStorage, set as setStorage } from "@/utils/storage"
import { getFlowathTemplate, processNodeList, processSubmit } from "@/api/processManage/processDefine"
import { userList } from "@/api/system/staffManage/index"

defineOptions({
    name: "SubmitWorkflowExamine"
})

interface Props {
    visible: boolean
    dialogType: string
    processSubmitDataList: ProcessSubmitInterface[]
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dialogType: "",
    processSubmitDataList: () => []
})

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)

// 用户列表
const systemUserList = ref<UserSelectInterface[]>([])

// 获取用户列表
const getSystemUserList = async () => {
    try {
        const params = {
            status: "已启用",
            page: "1",
            limit: "99999"
        }
        const { data } = await userList(params)
        systemUserList.value =
            data.map((item: any) => {
                return {
                    value: item.userOid,
                    label: `${item.name}(${item.superName})`
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    }
}

getSystemUserList()

//#region
const sumbitWorkflowFormRef = ref<FormInstance>()
const sumbitWorkflowForm: { [key: string]: any } = reactive<any>({
    template: {}, // 流程模板
    approver: "", // 审核
    reviewer: "", // 批准
    financeOfficer: "", // 运营复核
    financeSecondOfficer: "" // 财务复审
})

const rules = reactive<FormRules>({
    template: [{ required: true, message: "请选择模板！", trigger: "change" }]
})
//#endregion

// 流程模板列表
interface processTemplateInterface {
    id: string
    key: string
    label: string
    processDefinitionId: string
}
const processTemplateList = ref<processTemplateInterface[]>([])
// 获取时间模板列表
const getProcessTemplateList = async () => {
    loading.value = true
    try {
        const processKey =
            props.dialogType === "常备库存选配"
                ? "submission_and_approval_of_inventory_selection_for_regular_stock"
                : props.dialogType === "预计划选配"
                ? "planned_selection_approval_process"
                : ""
        const params = {
            processKey
        }
        const { data } = (await getFlowathTemplate(params)) as { data: any }
        processTemplateList.value =
            data.map((item: any) => {
                return {
                    id: item.key,
                    processDefinitionId: item.id,
                    label: item.name
                }
            }) || []
        if (processTemplateList.value.length) {
            const [processObj] = processTemplateList.value
            Object.assign(sumbitWorkflowForm, {
                template: {
                    id: processObj.id,
                    label: processObj.label,
                    processDefinitionId: processObj.processDefinitionId
                }
            })
        }
    } finally {
        loading.value = false
    }
}

// 流程节点动态表单
const dynamicsFormFields = ref<DynamicsFormInterface[]>([])

// 处理流程模板选择
const handleTemplateChange = (value: processTemplateInterface) => {
    getProcessNodeList(value.processDefinitionId)
}
// 根据流程模板获取流程节点列表
const getProcessNodeList = async (key: string) => {
    try {
        loading.value = true
        const params = {
            processDefinitionId: key
        }
        const { data } = (await processNodeList(params)) as { data: any }
        dynamicsFormFields.value = data.map((item: any) => {
            return {
                label: item.name,
                name: item.code,
                type: "select",
                uniqueTarget: item.uniqueTarget, // true 为单选，false为多选
                options: systemUserList,
                rules: [{ required: true, message: "请选择", trigger: "change" }]
            }
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

// 处理审批人选择
const handleSelectChange = () => {
    const assingeeMap: { [key: string]: any } = {}
    for (const item of dynamicsFormFields.value) {
        const key = item.name
        assingeeMap[key] = sumbitWorkflowForm[key]
    }
    Object.assign(sumbitWorkflowForm, { ...assingeeMap })
    // // 审核
    // setStorage("approverUserOid", sumbitWorkflowForm.approver, false)
    // // 批准
    // setStorage("reviewerUserOid", sumbitWorkflowForm.reviewer, false)
    // // 运营复核
    // setStorage("financeOfficerUserOid", sumbitWorkflowForm.financeOfficer, false)
    // // 财务复审
    // setStorage("financeSecondOfficerUserOid", sumbitWorkflowForm.financeSecondOfficer, false)
}

// 处理保存按钮
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                // 受理人集合
                const assingeeMap: { [key: string]: any } = {}
                for (const item of dynamicsFormFields.value) {
                    const key = item.name
                    assingeeMap[key] = sumbitWorkflowForm[key]
                }
                const submitVOList = props.processSubmitDataList.map((item) => {
                    return {
                        ...item,
                        processDefinitionKey: sumbitWorkflowForm.template.id,
                        assingeeMap
                    }
                })
                await processSubmit(submitVOList)
                ElMessage({
                    type: "success",
                    message: "提交成功",
                    center: true
                })
                emits("confirm-success", "workflow")
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
    () => sumbitWorkflowForm.template,
    (value) => {
        if (!value.processDefinitionId) return
        getProcessNodeList(value.processDefinitionId)
    },
    {
        immediate: true,
        deep: true
    }
)

onMounted(() => {
    getProcessTemplateList()
})
</script>

<style lang="scss" scoped></style>
