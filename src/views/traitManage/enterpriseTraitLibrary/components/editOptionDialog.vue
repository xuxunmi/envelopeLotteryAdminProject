<template>
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" draggable overflow>
        <div v-loading="loading" class="editOptionDialog">
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                size="small"
                label-width="110px"
                label-position="left"
            >
                <el-form-item :label="t('enterpriseTraitLibraryPage.number')" prop="number">
                    <div class="w-full" @click="goEdit_number">
                        <el-input v-model="formData.number" disabled>
                            <template #suffix>
                                <el-button
                                    v-if="dialog.type === 'add' || dialog.type === 'saveAs'"
                                    type="primary"
                                    icon="Search"
                                    link
                                />
                            </template>
                        </el-input>
                        <div class="overlay" />
                    </div>
                </el-form-item>
                <el-form-item :label="t('enterpriseTraitLibraryPage.name')" prop="name">
                    <el-input v-model="formData.name" />
                </el-form-item>
                <el-form-item label="产品分类">
                    <el-select v-model="formData.optionType" filterable clearable>
                        <el-option v-for="item in productTypeList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="是否界面可见">
                    <el-checkbox v-model="formData.visitable" label="" />
                </el-form-item>
                <el-form-item label="是否关键特征">
                    <el-checkbox v-model="formData.isKeyOption" label="" />
                </el-form-item>
                <el-form-item label="是否参与订单匹配">
                    <el-checkbox v-model="formData.isOrderMate" label="" />
                </el-form-item>
                <el-form-item :label="t('enterpriseTraitLibraryPage.explain')">
                    <el-input v-model="formData.desc" type="textarea" :rows="6" />
                </el-form-item>
            </el-form>

            <!-- 编号 - 编辑弹窗 -->
            <ConfigNumberDialog :dialog="configNumberDialog" @handleEditSuccess="handleEditSuccess_number" />
        </div>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="submit" size="small">保存</el-button>
            <el-button type="primary" @click="dialog.visible = false" size="small">{{ t("dashboardPage.cancel") }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import ConfigNumberDialog from "./configNumberDialog.vue"
import { SelectInterface } from "@/interface/common"
import { addOrUpdateOption } from "@/api/traitManage/enterpriseTraitLibrary"
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: () => ({
            visible: false,
            title: "",
            row: {},
            type: ""
        })
    },
    // 产品分类
    productTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    }
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
    oid: "", // 为空就是新增，存在就修改
    name: "",
    number: "", //编号
    // absolutely: false, // 必须的
    singleChoice: true, // 单项选择
    desc: "", // 说明
    pid: "", // 父id
    optionType: "", // 产品分类
    visitable: false, // 是否界面可见
    isOrderMate: true, // 是否参与订单匹配
    isKeyOption: false // 是否关键特征
})
const rules = reactive<FormRules>({
    name: [{ required: true, message: t("enterpriseTraitLibraryPage.enterName"), trigger: "blur" }],
    number: [{ required: true, message: t("enterpriseTraitLibraryPage.enterNumber"), trigger: "blur" }]
})
// 确认
const submit = () => {
    formRef.value?.validate((valid) => {
        if (valid) {
            loading.value = true
            addOrUpdateOption(formData)
                .then((data) => {
                    if (props.dialog.type === "add") {
                        ElMessage.success(t("enterpriseTraitLibraryPage.addSuccess"))
                    } else if (props.dialog.type === "edit") {
                        ElMessage.success(t("enterpriseTraitLibraryPage.editSuccess"))
                    } else if (props.dialog.type === "saveAs") {
                        ElMessage.success("另存为成功！")
                    }
                    emits("handleEditSuccess", formData)
                })
                .finally(() => (loading.value = false))
        }
    })
}
// 获取数据
const getData = () => {
    console.log("getData", props.dialog.row)
    const row = JSON.parse(JSON.stringify(props.dialog.row))
    if (props.dialog.type === "add") {
        formData.pid = row.oid
    } else if (props.dialog.type === "edit") {
        Object.assign(formData, {
            oid: props.dialog.row.oid, // 为空就是新增，存在就修改
            name: props.dialog.row.name,
            number: props.dialog.row.number, //编号
            singleChoice: props.dialog.row.singleChoice, // 单项选择
            desc: props.dialog.row.desc, // 说明
            pid: props.dialog.row.pid, // 父id
            optionType: props.dialog.row.optionType, // 产品分类
            visitable: props.dialog.row.visitable, // 是否界面可见
            isOrderMate: props.dialog.row.isOrderMate, // 是否参与订单匹配
            isKeyOption: props.dialog.row.isKeyOption // 是否关键特征
        })
    } else if (props.dialog.type === "saveAs") {
        Object.assign(formData, {
            oid: "", // 为空就是新增，存在就修改
            name: "",
            number: "", //编号
            singleChoice: props.dialog.row.singleChoice, // 单项选择
            desc: props.dialog.row.desc, // 说明
            pid: props.dialog.row.pid, // 父id
            optionType: props.dialog.row.optionType, // 产品分类
            visitable: props.dialog.row.visitable, // 是否界面可见
            isOrderMate: props.dialog.row.isOrderMate, // 是否参与订单匹配
            isKeyOption: props.dialog.row.isKeyOption // 是否关键特征
        })
    }
}
getData()
//#endregion

//#region 编号 - 编辑弹窗
const configNumberDialog = reactive<any>({
    visible: false,
    title: ""
})
// 编辑编号
const goEdit_number = () => {
    if (props.dialog.type === "add" || props.dialog.type === "saveAs") {
        Object.assign(configNumberDialog, {
            visible: true,
            title: "编号配置"
        })
    }
}
// 编号编辑成功回调
const handleEditSuccess_number = (number: string) => {
    console.log("handleEditSuccess_number", number)
    formData.number = number
    Object.assign(configNumberDialog, {
        visible: false,
        title: ""
    })
    if (number) formRef.value!.clearValidate("number")
}
//#endregion
</script>
<style lang="scss" scoped>
.w-full {
    position: relative;
}
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    cursor: pointer;
}
</style>
