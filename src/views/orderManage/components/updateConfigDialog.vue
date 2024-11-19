<template>
    <div
        :class="{
            'update-config-wrapper': true,
            fullscreen: fullscreen
        }"
        v-loading="loading"
        :element-loading-text="elementLoadingText"
    >
        <div class="mt-2 flex justify-between">
            <div>
                <el-button type="primary" size="small" icon="View" @click="handlePreviewBtn">预览</el-button>
                <!-- <el-button type="primary" size="small" @click="handleApolegamyPlanBtn">选配方案</el-button> -->
                <!-- <el-button type="primary" size="small" @click="handleInstantiationBtn">实例化</el-button> -->
            </div>
            <div>
                <el-button type="primary" icon="FullScreen" size="small" @click="changeFullScreen">
                    <span v-if="fullscreen">退出全屏</span>
                    <span v-else>全屏编辑</span>
                </el-button>
            </div>
        </div>
        <div style="flex: 1">
            <div class="optionalFormWrapper">
                <div class="mt-2">选配方案</div>
                <el-form
                    class="update-config-form"
                    ref="updateConfigRef"
                    :model="updateConfigForm"
                    :rules="rules"
                    size="small"
                    label-width="136px"
                    label-position="left"
                >
                    <div class="optionFrom">
                        <template v-for="option in optionList" :key="option.oid">
                            <el-form-item :label="option.name">
                                <template #label="{ label }">
                                    <div>{{ label }}</div>
                                </template>
                                <el-radio-group
                                    v-model="option.checkChoiceOid"
                                    @change="(val) => handleRadioChange(val, option)"
                                    :style="{
                                        'grid-template-columns': `repeat(${getColumnNum(option.choice.length)}, auto)`
                                    }"
                                >
                                    <template v-for="choice in option.choice" :key="choice.oid">
                                        <el-radio :value="choice.oid">{{ choice.name }}</el-radio>
                                    </template>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                    </div>
                    <div v-if="colorList.length" class="optionFrom">
                        <template v-for="part in colorList" :key="part.code">
                            <el-form-item :label="part.codeListNameC">
                                <template #label="{ label }">
                                    <div>{{ label }}</div>
                                </template>
                                <el-radio-group
                                  v-model="part.value"
                                  :style="{
                                      'grid-template-columns': `repeat(${getColumnNum(part.colors.length)}, auto)`
                                  }"
                                >
                                    <template v-for="color in part.colors" :key="color.oid">
                                        <el-radio :value="color.name">{{ color.name }}</el-radio>
                                    </template>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                    </div>
                </el-form>
            </div>
        </div>

        <!-- 预览BOM弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.previewBom" :footer="false" width="50%">
            <previewBomDialog
                v-if="dialogVisible.previewBom"
                v-model:visible="dialogVisible.previewBom"
                :objectRow="currentRowData"
                :optionList="optionList"
                @confirm-success="handleConfirmSuccess"
            />
        </dialogFrame>

        <!-- 新建配置方案弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.createConfigPlan" :footer="false" width="70%">
            <createConfigPlanDialog
                v-if="dialogVisible.createConfigPlan"
                v-model:visible="dialogVisible.createConfigPlan"
                type="order"
                :objectRow="currentRowData"
                :optionList="optionList"
                :orderType="orderType"
                :editType="type"
                :parentLoading="loading"
                @confirm-success="handleConfirmSuccess"
            />
        </dialogFrame>

        <!-- 新建零部件弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.part" :footer="false" width="90%">
            <creatPartDialog
                v-if="dialogVisible.part"
                v-model:visible="dialogVisible.part"
                :currentRowData="currentRowData"
                :dialogType="dialogType"
                :defaultPartType="defaultPartType"
                @confirm-success="handleConfirmSuccess_part"
            />
        </dialogFrame>

        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="submit">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import dialogFrame from "@/components/dialogFrame/index.vue"
import previewBomDialog from "@/views/configureManage/applicationConfiguration/components/previewBomDialog.vue"
import createConfigPlanDialog from "@/views/configureManage/applicationConfiguration/components/createConfigPlanDialog.vue"
import creatPartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import { getOptionListOfPartApply, getColorDetails } from "@/api/configureManage/applicationConfiguration"
import {
    createOrEditOrder,
    getSchemeByOid,
    editScheme,
    createGeneralOrder
} from "@/api/orderManage/standingStockOrder/index"
import type * as standingStockOrderTypes from "@/api/orderManage/standingStockOrder/types"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "updateConfigDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object as any,
        required: true
    },
    fullscreen: {
        type: Boolean,
        required: false
    },
    type: {
        type: String,
        default: ""
    },
    // 订单类型
    orderType: {
        type: String,
        default: ""
    }
})
const emits = defineEmits(["update:visible", "confirm-success", "changeFullScreen"])
const loading = ref(false)
const elementLoadingText = ref<string>("")
//#endregion

//#region 预览、选配方案、实例化、查
// 处理预览按钮
const handlePreviewBtn = () => {
    dialogTitle.value = "预览BOM"
    const dialogType = "previewBom"
    dialogVisible[dialogType] = true
}

// 处理选配方案按钮
const handleApolegamyPlanBtn = () => {
    ElMessageBox.confirm(
        "<div>如果界面变量与已有部分方案变量数量不一致时是否忽略该变量(点击取消则可能产生新方案)？</div>",
        "确认选配变量",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            confirmButtonClass: "confirmButton",
            cancelButtonClass: "cancelButton",
            type: "warning",
            center: true,
            dangerouslyUseHTMLString: true,
            buttonSize: "small"
        }
    ).then(() => {
        if (props.type === "edit") {
            dialogTitle.value = "编辑配置方案"
        } else {
            dialogTitle.value = "新建配置方案"
        }
        const dialogType = "createConfigPlan"
        dialogVisible[dialogType] = true
    })
}

// 处理实例化按钮
const handleInstantiationBtn = () => {
    ElMessageBox.confirm("<div>确定需要实例化吗？</div>", "确认实例化", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true,
        dangerouslyUseHTMLString: true,
        buttonSize: "small"
    })
        .then(() => {
            dialogTitle.value = "新建零部件"
            dialogType.value = "add"
            dialogVisible.part = true
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消操作"
            })
        })
}
//#endregion

//#region 表单
const updateConfigRef = ref<FormInstance>()
const updateConfigForm = reactive<any>({})
const rules = reactive<FormRules>({})

const submit = () => {
    // console.log('submit', optionList.value);
    // 1、校验选配项是否为空
    if (!optionList.value.length) {
        ElMessage.error("选配项为空！")
        return false
    }
    // 2、校验是否所有的选配项都选择了
    for (let i = 0; i < optionList.value.length; i++) {
        const ele = optionList.value[i]
        if (!ele.checkChoiceOid) {
            ElMessage.error("选配项需要全部选择！")
            return false
        }
    }
    handleApolegamyPlanBtn()
}

// 新增
const handleConfirm = async (info: createConfigPlanInfoType) => {
    console.log("handleConfirm", info)
    const params = {
        orderType: props.orderType as standingStockOrderTypes.orderType,
        orderConfigures: [
            {
                partNum: props.currentRowData.partNumber,
                partOid: props.currentRowData.partOid,
                partName: props.currentRowData.partName,
                // schemeOid: info.schemeOid,
                scheme: {
                    schemeCode: info.scheme?.schemeCode || "",
                    schemeName: info.scheme?.schemeName || "",
                    options: info.scheme?.options || []
                },
                productName: info.productName,
                productionOrganization: info.productionOrganization,
                exampleBom: info.scheme?.schemeCode || "" // 实例化BOM编号 = 配置选配方案编号
            }
        ]
    }
    if (props.orderType === "6") {
        // 新建通用产品库
        loading.value = true
        params.orderType = "1"
        createGeneralOrder(params)
            .then((data) => {
                ElMessage.success("新建成功！")
                dialogVisible.createConfigPlan = false
                emits("confirm-success", "updateConfig")
            })
            .finally(() => (loading.value = false))
    } else {
        // 新建订单
        // 添加颜色数据
        if (colorList.value?.length) {
            ;(params.orderConfigures[0] as any).colorItems = colorList.value.map((item) => {
                return {
                    optional: item.codeListNameC,
                    value: item.value
                }
            })
        }
        loading.value = true
        createOrEditOrder(params)
            .then((data) => {
                ElMessage.success("新建成功！")
                dialogVisible.createConfigPlan = false
                emits("confirm-success", "updateConfig")
            })
            .finally(() => (loading.value = false))
    }
}

// 修改
const goSave = (info: createConfigPlanInfoType) => {
    // 获取订单配置
    const params_scheme = {
        oid: props.currentRowData.partOid,
        schemeOid: props.currentRowData.schemeOid
    }
    loading.value = true
    getSchemeByOid(params_scheme)
        .then((scheme) => {
            const choiceList: any[] = []
            const options: any[] = []
            optionList.value.forEach((option) => {
                if (option.checkChoiceOid) {
                    choiceList.push(option.checkChoiceOid)
                    options.push({
                        optionOid: option.oid,
                        optionName: option.name,
                        optionNumber: option.number,
                        isOrderMate: option.isOrderMate === true ? true : false,
                        choiceOid: option.checkChoiceOid,
                        choiceName: option.checkChoiceName,
                        choiceNumber: option.checkChoiceNumber
                    })
                }
            })
            const params = {
                orderConfigureOidStr: props.currentRowData.oidStr, // 当前行oid
                oid: props.currentRowData.partOid, //整机物料oid
                schemeOid: props.currentRowData.schemeOid, //选配方案oid
                schemeCode: scheme.data.schemeCode, //方案编码
                schemeName: info.productName, //方案名称
                productOrganization: info.productionOrganization, //生成组织
                choiceList,
                options
            }
            // 添加颜色数据
            if (colorList.value?.length) {
                ;(params as any).colorItems = colorList.value.map((item) => {
                    return {
                        optional: item.codeListNameC,
                        value: item.value
                    }
                })
            }
            editScheme(params)
                .then((data) => {
                    ElMessage.success("保存成功！")
                    dialogVisible.createConfigPlan = false
                    emits("confirm-success", "updateConfig")
                })
                .finally(() => (loading.value = false))
        })
        .catch(() => (loading.value = false))
}

// 获取数据
const optionList = ref<any[]>([])
const rulesSessionId = ref("")
// 获取基本配置
// actionName - init: 新增初始化; edit: 编辑初始化; choiceselect: 特征值选择
const getData = (actionName: "init" | "choiceselect" | "edit", choiceOid?: string, option?: any) => {
    const params = {
        oid: props.currentRowData.partOid,
        actionName
    }
    if (actionName === "choiceselect") {
        Object.assign(params, {
            rulesSessionId: rulesSessionId.value,
            choiceOid,
            selected: true
        })
    } else if (actionName === "edit") {
        Object.assign(params, {
            schemeOid: props.currentRowData.schemeOid
        })
    }
    // optionList.value = []
    // if (actionName !== 'choiceselect') loading.value = true
    loading.value = true
    elementLoadingText.value = "数据加载中..."
    getOptionListOfPartApply(params)
        .then((data) => {
            const list = data.data.choices || []
            list.forEach((option: any) => {
                option.checkChoiceOid = ""
                option.checkChoiceName = ""
                const showChoice: any[] = []
                option.choice?.forEach((choice: any) => {
                    if (choice.enable === "true") {
                        // 显示特征值
                        showChoice.push(choice)
                        if (choice.checked === "true") {
                            option.checkChoiceOid = choice.oid
                            option.checkChoiceName = choice.name
                            option.checkChoiceNumber = choice.number
                            option.oldCheckChoiceOid = choice.oid
                        }
                    }
                })
                option.choice = showChoice
            })
            optionList.value = list
            rulesSessionId.value = data.data.rulesSessionId || ""
        })
        .catch((err) => {
            // console.log('getOptionListOfPartApply', err, option);
            option.checkChoiceOid = option.oldCheckChoiceOid
        })
        .finally(() => {
            loading.value = false
            elementLoadingText.value = ""
        })
}
// 计算项目列数
const maxColumnNum = 6
const getColumnNum = (length: number) => {
    if (length > maxColumnNum) {
        if (length / 2 > maxColumnNum) {
            return length % 2 ? Math.ceil(length / 2) : length / 2
        }
        return maxColumnNum
    }
    return length
}
// 获取颜色数据
const colorList = ref<any[]>([])
const loading_color = ref(false)
const getData_color = () => {
    loading_color.value = true
    const params = {
        partOid: props.currentRowData.partOid
    }
    if (props.type === "edit") (params as any).orderConfigureOid = props.currentRowData.oidStr
    getColorDetails(params)
        .then((data) => {
            colorList.value = data.data || []
            colorList.value.forEach((ele) => {
                ele.colors?.forEach((color: any) => {
                    if (props.type === "edit") {
                        if (color.isCheck) ele.value = color.name
                    } else {
                        if (color.isDefault) ele.value = color.name
                    }
                })
            })
        })
        .finally(() => (loading_color.value = false))
}
// 获取订单配置
const schemeData = reactive({
    oid: "",
    schemeOid: "",
    schemeCode: "",
    schemeName: "",
    choiceList: []
})
const getScheme = () => {
    // 获取特征列表
    const params_optionList = {
        oid: props.currentRowData.partOid,
        actionName: "edit",
        schemeOid: props.currentRowData.schemeOid
    }
    // 获取订单配置
    const params_scheme = {
        oid: props.currentRowData.partOid,
        schemeOid: props.currentRowData.schemeOid
    }
    loading.value = true
    Promise.all([getOptionListOfPartApply(params_optionList), getSchemeByOid(params_scheme)])
        .then((arr) => {
            console.log("getScheme", arr)
            const list = arr[0].data.choices || []
            const schemeInfo = arr[1].data
            const schemeList = schemeInfo.choiceList
            Object.assign(schemeData, {
                oid: props.currentRowData.partOid,
                schemeOid: props.currentRowData.schemeOid,
                schemeCode: schemeInfo.schemeCode,
                schemeName: schemeInfo.schemeName
            })
            list.forEach((option: any) => {
                const find = schemeList.find((scheme: any) => scheme.optionOid === option.oid)
                option.checkChoiceOid = ""
                option.checkChoiceName = ""
                if (find) {
                    // 有匹配
                    option.checkChoiceOid = find.selectedChoices[0].choiceOid
                    option.checkChoiceName = find.selectedChoices[0].choiceName
                }
            })
            optionList.value = list
            rulesSessionId.value = arr[0].data.rulesSessionId || ""
        })
        .finally(() => (loading.value = false))
}
if (props.type === "add") {
    getData("init")
    getData_color()
} else if (props.type === "edit") {
    // getScheme()
    getData("edit")
    getData_color()
} else if (props.type === "saveAs") {
    getData("edit")
    getData_color()
}
// 特征值选择回调
const handleRadioChange = (val: any, option: any) => {
    console.log("handleRadioChange", val, option)
    getData("choiceselect", val, option)
}
//#endregion

// #region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
const defaultPartType = ref<string>("整机配置") // 页面类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    previewBom: false, // 预览BOM对话框
    createConfigPlan: false, // 新建配置方案对话框
    part: false // 新建零部件对话框
})
// 设置全屏
const changeFullScreen = () => {
    emits("changeFullScreen", !props.fullscreen)
}
//#endregion

// #region 关闭弹窗
type createConfigPlanInfoType = {
    schemeOid?: string
    productName: string
    productionOrganization: string
    scheme?: standingStockOrderTypes.schemeType
}
const handleConfirmSuccess = (info: createConfigPlanInfoType) => {
    if (props.type === "add") {
        // 新建配置方案弹窗
        handleConfirm(info)
    } else if (props.type === "edit") {
        goSave(info)
    }
}

// 关闭实例化弹窗
const handleConfirmSuccess_part = (oid: string) => {
    ElMessage({
        type: "success",
        message: "<div>实例化完成，执行附件拷贝！</div><div>实例化编码：10010189712-0001</div>",
        center: true,
        dangerouslyUseHTMLString: true
    })
    dialogVisible.part = false
}

//#endregion
</script>

<style lang="scss" scoped>
$gap10: 10px;
$border-color: #bfcbd9;

.update-config-wrapper {
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    background-color: #fff;
    height: calc(100vh - 170px);
    &.fullscreen {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 100px);
        .optionalFormWrapper {
            max-height: calc(100vh - 170px);
        }
    }
    .optionalFormWrapper {
        max-height: calc(100vh - 240px);
        overflow: auto;
        .update-config-form {
            margin-top: $gap10;
            .optionFrom {
                min-width: 100%;
                width: fit-content;
                border: 1px solid $border-color;
                border-bottom: none;
                :deep(.el-form-item) {
                    width: 100%;
                    height: 36px;
                    margin-bottom: 0;
                    border-bottom: 1px solid $border-color;
                    .el-form-item__label {
                        height: auto;
                        padding-left: $gap10;
                        align-items: center;
                        div {
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }
                    .el-form-item__content {
                        padding: 0 $gap10;
                        border-left: 1px solid $border-color;
                        .el-radio-group {
                            height: 100%;
                            display: grid;
                            grid-gap: 4px;
                            padding: 4px;
                            .el-radio {
                                height: auto;
                                line-height: 1;
                                margin-right: 4px;
                            }
                        }
                    }
                }
                &+.optionFrom {
                  border-top: none;
                }
            }
            .colorFrom {
                :deep(.el-form-item) {
                    margin-bottom: 0;
                    .el-form-item__label {
                        padding-left: $gap10;
                    }
                    .el-form-item__content {
                        padding: 0 16px;
                    }
                }
            }
        }
    }
}
</style>
