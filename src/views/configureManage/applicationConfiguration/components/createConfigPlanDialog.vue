<template>
    <div v-loading="loading || parentLoading">
        <div class="fromWrapper">
            <el-form ref="ruleFormRef" :model="formData" :rules="rules" :inline="true" size="small" label-width="86px">
                <el-form-item label="方案编码" prop="schemeCode">
                    <el-input style="width: 180px" v-model="formData.schemeCode" disabled>
                        <!-- <template #suffix>
                            <el-button
                                type="primary"
                                icon="Edit"
                                link
                                @click="handleEditCode"
                            />
                        </template> -->
                    </el-input>
                </el-form-item>
                <el-form-item label="方案名称" prop="schemeName">
                    <el-input style="width: 180px" v-model="formData.schemeName" />
                </el-form-item>
                <el-form-item label="生产组织" prop="productionOrganization">
                    <el-select :loading="loading_group" v-model="formData.productionOrganization" size="small">
                        <el-option
                            v-for="item in options_group"
                            :key="item.code"
                            :label="item.codeListNameC"
                            :value="item.code"
                        />
                    </el-select>
                </el-form-item>
                <!-- <el-form-item label="整机型号" prop="model">
                    <el-input style="width: 180px" v-model="formData.model" />
                </el-form-item> -->
            </el-form>
        </div>
        <div class="mt-2">
            <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
                <el-tab-pane label="配置变量及变量值" name="configVariable">
                    <pt-table
                        ref="PtTableRef"
                        :tableColumns="tableColumns"
                        :tableEditConfig="tableEditConfig"
                        :paginationConfig="paginationConfig"
                        :menuConfig="menuConfig"
                        :data="tableData"
                        :locale="locale"
                        border
                        highlight-current-row
                        size="small"
                        height="calc(100vh - 300px)"
                    />
                </el-tab-pane>
                <el-tab-pane label="方案描述" name="planDesc">
                    <el-scrollbar height="calc(100vh - 300px)">
                        <el-card v-if="tableData.length">
                            <el-descriptions :column="1">
                                <template v-for="item in tableData" :key="item.oid">
                                    <el-descriptions-item :label="item.name + ':'">{{
                                        item.checkChoiceName
                                    }}</el-descriptions-item>
                                </template>
                            </el-descriptions>
                        </el-card>
                    </el-scrollbar>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(ruleFormRef)">完成</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')"> 取消</el-button>
        </div>

        <!-- 配置BOM-实例化编码弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.configNumber" :footer="false" width="35%">
            <configNumberDialog
                v-if="dialogVisible.configNumber"
                v-model:visible="dialogVisible.configNumber"
                :objectRow="objectRow"
                :codeObj="codeObj"
                @edit-success="handleEditSuccess_number"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules, TabsPaneContext } from "element-plus"
import dialogFrame from "@/components/dialogFrame/index.vue"
import configNumberDialog from "./configNumberDialog.vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { saveScheme } from "@/api/configureManage/applicationConfiguration"
import { getSchemeCode, getShortNameList } from "@/api/configureManage/defineBasicTypes"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { formatDateTime } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "createConfigPlanDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    objectRow: {
        type: Object,
        default: () => ({})
    },
    optionList: {
        type: Array,
        default: []
    },
    // order: 新建订单;
    type: {
        type: String,
        default: ""
    },
    // 订单类型
    orderType: {
        type: String,
        default: ""
    },
    editType: {
        type: String,
        default: ""
    },
    parentLoading: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(["update:visible", "confirm-success"])

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

// #region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    configNumber: false // 配置BOM-实例化编码对话框
})
//#endregion

// #region 表单
const ruleFormRef = ref<FormInstance>()
const formData = reactive({
    schemeCode: "", // 方案编码
    schemeName: "", // 方案名称(根据规则自动生成；前11位整机编号-年份（2024）月份（06）-5位流水码   示例：10300000001-202406-00001)
    // model: "" // 整机型号
    productionOrganization: "" // 生产组织
})
const rules = reactive<FormRules>({
    schemeCode: [
        { required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" },
        { min: 24, max: 24, message: "请输入完整方案编码！", trigger: "change" }
    ],
    schemeName: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }],
    productionOrganization: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "blur" }]
})

// 处理编辑方案编码
const handleEditCode = () => {
    dialogTitle.value = "方案编码"
    const dialogType = "configNumber"
    dialogVisible[dialogType] = true
}
//#endregion

// #region 关闭弹窗
const handleEditSuccess_number = (number: string) => {
    dialogVisible.configNumber = false
    Object.assign(formData, {
        ...formData,
        schemeCode: number
    })
}
//#endregion

//#region 标签页
const activeName = ref<string | number | undefined>("configVariable")
const handleTabClick = (tab: TabsPaneContext) => {
    activeName.value = tab.paneName
}
//#endregion

//#region pt-table
const PtTableRef = ref<PtTableComponent>()
const tableEditConfig = reactive<PtTableEditConfigType>({
    show: false
})
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
const tableColumns = ref<PtTableColumnsType>([
    {
        prop: "number",
        label: "变量编码",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "name",
        label: "变量名称",
        slot: "name",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "checkChoiceName",
        label: "变量值",
        // showOverflowTooltip: true,
        show: true
    }
])
const tableData = ref<any[]>([])

// 初始化列表
const codeObj = reactive({
    // 编码对象
    serialNumber: "", //  整机编号
    date: formatDateTime(new Date(), "YYYYMM"), // 年份月份
    streamNumber: "" // 5位流水码
})
const initList = () => {
    console.log("initList", props.optionList, props.objectRow)
    const params_name = {
        // 初始化品名和方案名称参数
        sfinpartId: props.objectRow.number,
        optionalItem: [] as any[]
    }
    // const params_code = {
    //     // 初始化编码参数
    //     oid: props.objectRow.oid,
    //     orderType: props.orderType || "",
    //     choiceInfos: [] as any
    // }
    tableData.value = props.optionList
    props.optionList.forEach((option: any) => {
        if (option.checkChoiceOid && option.checkChoiceName) {
            // 初始化品名和方案名称参数
            //if (option.isKeyOption && option.checkChoiceOid) {
            params_name.optionalItem.push({
                optional: option.name,
                value: option.checkChoiceName
            })
            //}
            // 初始化编码参数
            // params_code.choiceInfos.push({
            //     optionOid: option.oid,
            //     choiceOid: option.checkChoiceOid
            // })
        }
    })
    const initName = getShortNameList(params_name)
    const initCode = getSchemeCode({
      ...params_name,
      orderType: props.orderType || "",
    })
    loading.value = true
    Promise.all([initName, initCode])
        .then((data) => {
            console.log("initName, initCode", data)
            formData.schemeName = data[0].data
            Object.assign(codeObj, {
                serialNumber: data[1].data.serialNumber, //  整机编号
                date: data[1].data.date, // 年份月份
                streamNumber: data[1].data.streamNumber // 5位流水码
            })
            formData.schemeCode = `${codeObj.serialNumber}-${codeObj.date}-${codeObj.streamNumber}`
        })
        .finally(() => (loading.value = false))
}
const getData = () => {
    console.log("initList", props.optionList, props.objectRow)
    const params_name = {
        // 初始化品名和方案名称参数
        sfinpartId: props.objectRow.partNum,
        optionalItem: [] as any[]
    }
    tableData.value = props.optionList
    props.optionList.forEach((option: any) => {
        if (option.checkChoiceOid && option.checkChoiceName) {
            // 初始化品名和方案名称参数
            params_name.optionalItem.push({
                optional: option.name,
                value: option.checkChoiceName
            })
        }
    })
    loading.value = true
    getShortNameList(params_name)
        .then((data) => {
            console.log("getShortNameList", data)
            formData.schemeName = data.data
            formData.schemeCode = props.objectRow.schemeCode
            formData.productionOrganization = props.objectRow.productOrganization
        })
        .finally(() => (loading.value = false))
}
if (props.editType === "edit") {
    getData()
} else {
    initList()
}
// 提交
const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            const params = {
                oid: props.objectRow.partOid,
                schemeCode: formData.schemeCode,
                schemeName: formData.schemeName,
                options: tableData.value.map((item) => {
                    return {
                        optionOid: item.oid,
                        optionName: item.name,
                        optionNumber: item.number,
                        isOrderMate: item.isOrderMate === true ? true : false,
                        choiceOid: item.checkChoiceOid,
                        choiceName: item.checkChoiceName,
                        choiceNumber: item.checkChoiceNumber
                    }
                })
            }
            const info: {
                scheme?: any
                schemeOid?: string
                productName: string
                productionOrganization: string
            } = {
                productName: formData.schemeName, // 方案名称 == 品名
                productionOrganization: formData.productionOrganization // 生产组织
            }
            if (props.type === "order") {
                info.scheme = params
                emits("confirm-success", info)
            } else {
                loading.value = true
                saveScheme(params)
                    .then((data) => {
                        ElMessage.success("方案保存成功")
                        info.schemeOid = data.data.schemeOid
                        emits("confirm-success", "createConfigPlan", info)
                    })
                    .finally(() => (loading.value = false))
            }
        }
    })
}
//#endregion

//#region 字典数据
const loading_group = ref(false)
const options_group = ref<any[]>([]) // 生产组织下拉
if (props.type !== "insert") {
    // 生产组织
    loading_group.value = true
    getDictionarySelect({ codes: "PRODUCTION_ORGANIZATION" })
        .then((data) => {
            options_group.value = data.data.PRODUCTION_ORGANIZATION || []
        })
        .finally(() => (loading_group.value = false))
}
//#endregion
</script>

<style lang="scss" scoped></style>
