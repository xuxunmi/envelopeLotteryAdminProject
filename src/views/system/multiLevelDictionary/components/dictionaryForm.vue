<template>
    <div class="sf-form-wrapper pt-2" v-loading="loading">
        <el-form
            ref="dictionaryFormRef"
            :model="dictionaryForm"
            :inline="true"
            :rules="rules"
            size="small"
            label-width="124px"
            label-position="right"
        >
            <el-form-item label="编码" prop="code">
                <el-input
                    style="width: 300px"
                    v-model="dictionaryForm.code"
                    placeholder="请输入"
                    :disabled="!isCanEdit"
                />
            </el-form-item>
            <el-form-item label="名称" prop="name">
                <el-input
                    style="width: 300px"
                    v-model="dictionaryForm.name"
                    placeholder="请输入"
                    :disabled="!isCanEdit"
                />
            </el-form-item>
            <el-form-item label="类型" prop="type">
                <el-select
                    style="width: 300px"
                    v-model="dictionaryForm.type"
                    filterable
                    clearable
                    :disabled="!isCanEdit"
                    @change="handleTypeChange"
                >
                    <el-option
                        v-for="item in multiLevelDictionaryList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="上级节点" :prop="dictionaryForm.type !== '01' ? 'pid' : 'empty'">
                <el-tree-select
                    style="width: 300px"
                    v-model="dictionaryForm.pid"
                    :data="higherLevelList"
                    :props="treeSelectProps"
                    :render-after-expand="false"
                    check-strictly
                    filterable
                    clearable
                    :disabled="!isCanEdit || dictionaryForm.type === '01'"
                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { useRouter } from "vue-router"
import { SelectInterface } from "@/interface/common"
import { creatDictionary, editDictionary, multiLevelDictionaryDetails } from "@/api/system/multiLevelDictionary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "dictionaryForm"
})

const { t } = useI18n()

interface Props {
    multiLevelDictionaryList: SelectInterface[]
    higherLevelList: any[]
    currentRowData: any
    isCanEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
    multiLevelDictionaryList: () => [],
    higherLevelList: () => [],
    currentRowData: () => ({}),
    isCanEdit: false
})

const emits = defineEmits(["confirm-success"])

const router = useRouter()
const loading = ref(false)

const treeSelectProps = {
    value: "oid",
    label: "name",
    children: "children"
}
const dictionaryFormRef = ref<FormInstance>()
const dictionaryForm = reactive({
    oid: "",
    code: "", // 编码
    name: "", // 名称
    type: "", // 类型
    pid: "", // 上级节点
    status: "1" // 状态
})
const rules = reactive<FormRules>({
    code: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "blur" }],
    name: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "blur" }],
    type: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }],
    pid: [{ required: true, message: t("staffManagePage.requiredFields"), trigger: "change" }]
})

// 处理类型选择
const handleTypeChange = (value: string) => {
    Object.assign(dictionaryForm, {
        ...dictionaryForm,
        type: value,
        pid: ""
    })
}

// 获取详情
const getDetail = async (currentRowData: any) => {
    if (!currentRowData.oid) return
    Object.assign(dictionaryForm, {
        ...currentRowData,
        oid: currentRowData.oid,
        code: currentRowData.code, // 编码
        name: currentRowData.name, // 名称
        type: currentRowData.type, // 类型
        pid: currentRowData.pid === "-1" ? "" : currentRowData.pid, // 上级节点
        status: currentRowData.status // 状态
    })
}

// 清除表单
const handleClear = () => {
    if (!dictionaryFormRef.value) return
    dictionaryFormRef.value!.resetFields()
    Object.assign(dictionaryForm, {
        ...dictionaryForm,
        oid: "",
        code: "", // 编码
        name: "", // 名称
        type: "", // 类型
        pid: "", // 上级节点
        status: "1" // 状态
    })
}

// 处理保存
const handleSaveBtn = async (leaveParams: any) => {
    if (!dictionaryFormRef.value) return
    await dictionaryFormRef.value!.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                let params: {
                    oid?: string
                    code: string
                    name: string
                    type: string
                    pid?: string
                    status: string
                } = {
                    code: dictionaryForm.code,
                    name: dictionaryForm.name,
                    type: dictionaryForm.type,
                    pid: dictionaryForm.pid,
                    status: dictionaryForm.status
                }
                if (dictionaryForm.oid) {
                    params = {
                        ...params,
                        ...dictionaryForm, // 编辑是传所有数据
                        oid: dictionaryForm.oid
                    }
                }
                if (dictionaryForm.oid) {
                    await editDictionary(params)
                } else {
                    await creatDictionary(params)
                }
                ElMessage({
                    type: "success",
                    message: dictionaryForm.oid ? "编辑成功" : "新建成功",
                    center: true
                })
                if (!dictionaryForm.oid) {
                    handleClear()
                }
                loading.value = false
                emits("confirm-success")
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        } else {
            if (leaveParams.isCanLeave) {
                ElMessage({
                    type: "warning",
                    message: "页面离开，数据未编辑成功！",
                    center: true
                })
                if (typeof leaveParams.fn === "function") {
                    leaveParams.fn()
                }
            }
        }
    })
}

defineExpose({
    getDetail,
    handleClear,
    handleSaveBtn
})
</script>

<style lang="scss" scoped>
.sf-form-wrapper {
    :deep(.el-form) {
        .el-form-item {
            margin-bottom: 32px;
        }
    }
    :deep(.el-date-editor) {
        .el-input__wrapper {
            width: 100%;
        }
    }
}
</style>
