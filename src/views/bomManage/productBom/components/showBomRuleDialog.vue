<template>
    <el-dialog
        v-model="dialog.visible"
        :title="dialog.title"
        draggable
        overflow
        width="500px"
        center
        :append-to-body="true"
        :close-on-click-modal="false"
    >
        <div v-loading="loading">
            <el-form
                ref="showRuleFormRef"
                :model="showRuleForm"
                :rules="rules"
                size="small"
                label-width="110px"
                label-position="right"
            >
                <el-form-item label="版本规则">
                    <el-select v-model="showRuleForm.versionRule" clearable :disabled="from === 'productConfigure'">
                        <el-option
                            v-for="item in optionVersionRuleList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="一级排序">
                    <div class="w-full flex justify-between">
                        <div>
                            <el-select style="width: 180px" v-model="showRuleForm.sortBy" filterable>
                                <el-option
                                    v-for="item in option_allAttribute"
                                    :key="item.prop"
                                    :label="item.label"
                                    :value="item.prop"
                                />
                            </el-select>
                        </div>
                        <div>
                            <el-radio-group v-model="showRuleForm.sorted">
                                <el-radio value="ASC">升序</el-radio>
                                <el-radio value="DESC">降序</el-radio>
                            </el-radio-group>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="类型名称" prop="typeName">
                    <el-select
                        v-model="showRuleForm.typeName"
                        clearable
                        :disabled="from === 'productConfigure' || from === 'productListConfigure'"
                    >
                        <el-option v-for="item in option_typeName" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <template v-if="from === 'bomDetail' || from === 'productConfigure' || from === 'headerSetting'">
                    <el-form-item label="显示属性间隔">
                        <el-input v-model="showRuleForm.attributeInterval" />
                    </el-form-item>
                    <el-form-item label="显示属性">
                        <div class="w-full flex justify-between">
                            <div>
                                <el-table
                                    ref="PtTableRef"
                                    style="width: 180px"
                                    :data="showRuleForm.showAttribute"
                                    border
                                    height="180px"
                                    highlight-current-row
                                    @selection-change="handleSelectionChange"
                                    @row-click="handleRowClick"
                                >
                                    <!-- <el-table-column type="selection" width="40" /> -->
                                    <el-table-column prop="label" label="属性" header-align="center" />
                                </el-table>
                            </div>
                            <div>
                                <el-select
                                    style="width: 150px"
                                    v-model="allAttributeValue"
                                    filterable
                                    placeholder="---添加---"
                                    value-key="prop"
                                    @change="handleAllAttributechange"
                                >
                                    <el-option
                                        v-for="item in option_allAttribute"
                                        :key="item.prop"
                                        :label="item.label"
                                        :value="item"
                                    />
                                </el-select>
                                <div class="flex justify-between mt-4">
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="goSetOrder('up')"
                                        :disabled="!chooseRow"
                                        >上移</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="goSetOrder('down')"
                                        :disabled="!chooseRow"
                                        >下移</el-button
                                    >
                                </div>
                                <div class="mt-4">
                                    <el-button
                                        style="width: 100%"
                                        type="primary"
                                        size="small"
                                        @click="handleRemoveBtn"
                                        :disabled="!chooseRow"
                                        >移除</el-button
                                    >
                                </div>
                                <div class="flex justify-center mt-4">
                                    <el-button
                                        style="width: 100%"
                                        type="primary"
                                        size="small"
                                        @click="handleClearBtn"
                                        :disabled="!showRuleForm.showAttribute.length"
                                        >清空</el-button
                                    >
                                </div>
                            </div>
                        </div>
                    </el-form-item>
                </template>
                <div class="flex justify-between">
                    <el-form-item label="显示类型图标">
                        <el-checkbox v-model="showRuleForm.showTypeIcon" size="small" />
                    </el-form-item>
                    <el-form-item label="显示生命周期图标">
                        <el-checkbox v-model="showRuleForm.showLifeCycleIcon" size="small" />
                    </el-form-item>
                </div>
                <div class="flex justify-between">
                    <el-form-item label="显示检出图标">
                        <el-checkbox v-model="showRuleForm.showCheckoutIcon" size="small" />
                    </el-form-item>
                    <el-form-item label="显示是否有附件">
                        <el-checkbox v-model="showRuleForm.showAttachment" size="small" />
                    </el-form-item>
                </div>
            </el-form>
        </div>
        <template #footer>
            <el-button type="primary" @click="handleConfirmBtn(showRuleFormRef)" size="small">保存</el-button>
            <el-button type="primary" @click="dialog.visible = false" size="small">取消</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import type { FormInstance, FormRules, ElTable } from "element-plus"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { removeItemsInTree, setArrayEleOrder } from "@/utils"
import { get as getStorage, set as setStorage } from "@/utils/storage"
import { saveShowRule, showRuleDetail } from "@/api/bomManage/productBom"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: () => ({
            visible: false,
            title: "",
            type: ""
        })
    },
    /**
     * 引用页面 bomDetail：BOM详情；
     * productConfigure：维护配置；
     * bomHighEdit_left：BOM高级编辑左侧列表；
     * bomHighEdit_right：BOM高级编辑右侧列表；
     * headerSetting：头部设置；
     * productListConfigure：查看配置；
     */
    from: {
        type: String,
        default: ""
    },
    optionVersionRuleList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    topObjectShowRule: {
        type: Object,
        default: () => ({})
    }
})
const emits = defineEmits(["confirmSuceess"])
const { t, locale } = useI18n()
//#endregion

const loading = ref(false)
const showRuleFormRef = ref<FormInstance>()
// const showRuleCache = reactive(JSON.parse(getStorage("kbom-show-rule-cache", false)))
// console.log("showRuleCache: ", showRuleCache)
const initShowRuleForm = reactive({
    oid: "",
    versionRule: " ", // 版本规则
    sortBy: "", // 一级排序
    sorted: "DESC", // 升序/降序
    typeName: props.from === "productConfigure" || props.from === "productListConfigure" ? "Design" : "SH-P", // 类型名称
    attributeInterval: " ", // 显示属性间隔
    showAttribute: [
        {
            oid: "",
            ruleOid: "",
            prop: "hasCondition",
            label: "是否有条件",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Number",
            label: "编码",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Name",
            label: "名称",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Version",
            label: "版本",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "materialSymbol",
            label: "代号",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Amount",
            label: "数量",
            show: true
        }
    ], // 显示属性
    showTypeIcon: true, // 显示类型图标
    showLifeCycleIcon: true, // 显示生命周期图标
    showCheckoutIcon: true, // 显示检出图标
    showAttachment: true // 显示是否有附件
})
const showRuleForm = initShowRuleForm
const rules = reactive<FormRules>({
    typeName: [{ required: true, message: "必填项不能为空！", trigger: "blur" }]
})

//#region 下拉数据
const option_typeName = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "RELATION_IMPORT" })) as { data: any }
        option_typeName.value = data.RELATION_IMPORT.map((item: any) => {
            return { id: item.code, name: item.codeListNameC }
        })
    } catch (error: any) {
        console.log(error)
    } finally {
        getDetails()
    }
}
getSelectData()
//#endregion

// #region 处理显示属性操作
const PtTableRef = ref<InstanceType<typeof ElTable>>()
const allAttributeValue = ref<any>()
const multipleSelection = ref<any[]>([])
const option_allAttribute = ref([
    {
        oid: "",
        ruleOid: "",
        prop: "hasCondition",
        label: "是否有条件",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "isCropping",
        label: "裁剪",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "materialType",
        label: "类型",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "Number",
        label: "编码",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "materialSymbol",
        label: "代号",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "Name",
        label: "名称",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "material",
        label: "材料",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "processRoute",
        label: "工艺路线",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "partCategory",
        label: "零件类型",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "parentNumber",
        label: "父项编码",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "jgyyParentNumber",
        label: "精工液压父项编码",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "desc",
        label: "描述",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "machineModel",
        label: "机型号",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "State",
        label: "生命周期",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "ownerGroup",
        label: "版本所有者用户组",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "plmOwner",
        label: "所有者",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "updater",
        label: "修改者",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "updateTime",
        label: "修改时间",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "CheckOutUserName",
        label: "检出者",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "checkoutTime",
        label: "检出时间",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "typeNumber",
        label: "类型编码",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "Version",
        label: "版本",
        show: true
    },
    {
        oid: "",
        ruleOid: "",
        prop: "oid",
        label: "唯一标识",
        show: true
    }
])
const chooseRow = ref()

const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log("multipleSelection.value : ", multipleSelection.value)
}
const handleRowClick = (row: any) => {
    setCurrent(row)
}

const setCurrent = (row?: any) => {
    chooseRow.value = row
    PtTableRef.value!.setCurrentRow(row)
}

const handleAllAttributechange = (value: any) => {
    showRuleForm.showAttribute.push(value)
    // 过滤相同的prop和label
    showRuleForm.showAttribute = showRuleForm.showAttribute.filter(
        (obj: any, index: number) =>
            showRuleForm.showAttribute.findIndex((item: any) => item.prop === obj.prop && item.label === obj.label) ===
            index
    )
}

// 设置顺序
const setOrder = (type: string, index: number, list: any[]) => {
    setArrayEleOrder(type, index, list)
}
// 处理上移/下移
const goSetOrder = (type: string) => {
    for (let i = 0; i < showRuleForm.showAttribute.length; i++) {
        const ele = showRuleForm.showAttribute[i]
        if (ele === chooseRow.value) {
            setOrder(type, i, showRuleForm.showAttribute)
            return true
        }
    }
}

// 移除
const handleRemoveBtn = () => {
    // removeItemsInTree(showRuleForm.showAttribute, multipleSelection.value)
    removeItemsInTree(showRuleForm.showAttribute, [chooseRow.value])
    chooseRow.value = null
}

// 清空
const handleClearBtn = () => {
    Object.assign(showRuleForm, {
        ...showRuleForm,
        showAttribute: []
    })
}

//#endregion

const getDetails = async () => {
    try {
        loading.value = true
        const { data } = (await showRuleDetail({})) as { data: any }
        if (!Object.keys(data).length) return
        console.log("显示规则接口返回是否data: ", data, Object.keys(data).length)
        Object.assign(showRuleForm, {
            oid: data.oid,
            versionRule: data.versionRule,
            sortBy: data.sortBy,
            sorted: data.sorted,
            typeName: data.typeName,
            attributeInterval: data.attributeInterval,
            showTypeIcon: data.showTypeIcon === "1" ? true : false,
            showLifeCycleIcon: data.showLifeCycleIcon === "1" ? true : false,
            showCheckoutIcon: data.showCheckoutIcon === "1" ? true : false,
            showAttachment: data.showAttachment === "1" ? true : false,
            creator: data.creator,
            showAttribute: data.columnList.map((item: any) => {
                return {
                    oid: item.oid,
                    ruleOid: item.ruleOid,
                    prop: item.prop,
                    label: item.label,
                    show: item.show === "1" ? true : false
                }
            })
        })
        // 如果是维护配置，则类型名称写死为配置BOM(Design)
        if (props.from === "productConfigure" || props.from === "productListConfigure") {
            showRuleForm.typeName = "Design"
        }

        // 判断props.topObjectShowRule不能为空对象
        if (Object.keys(props.topObjectShowRule).length) {
            Object.assign(showRuleForm, {
                ...showRuleForm,
                typeName: props.topObjectShowRule.viewName
            })
            const viewOptionList = props.topObjectShowRule.viewOption.split(",")
            option_typeName.value = option_typeName.value.filter((option) => viewOptionList.includes(option.id))
        }
        loading.value = false
    } catch (err: any) {
        console.log(err)
    } finally {
        loading.value = false
    }
}

// 处理保存按钮
const handleConfirmBtn = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            switch (props.from) {
                case "headerSetting":
                    try {
                        loading.value = true
                        const params = {
                            oid: showRuleForm.oid,
                            versionRule: showRuleForm.versionRule,
                            sortBy: showRuleForm.sortBy,
                            sorted: showRuleForm.sorted,
                            typeName: showRuleForm.typeName,
                            attributeInterval: showRuleForm.attributeInterval,
                            showTypeIcon: showRuleForm.showTypeIcon ? 1 : 0,
                            showLifeCycleIcon: showRuleForm.showLifeCycleIcon ? 1 : 0,
                            showCheckoutIcon: showRuleForm.showCheckoutIcon ? 1 : 0,
                            showAttachment: showRuleForm.showAttachment ? 1 : 0,
                            creator: "",
                            columnList: showRuleForm.showAttribute.map((item: any) => {
                                return {
                                    oid: item.oid,
                                    ruleOid: item.ruleOid,
                                    prop: item.prop,
                                    label: item.label,
                                    show: item.show ? 1 : 0
                                }
                            })
                        }
                        const { message } = (await saveShowRule(params)) as any
                        ElMessage({
                            type: "success",
                            message,
                            center: true
                        })
                        emitter.emit("kbom_showRule_interfaceRefresh", showRuleForm)
                    } catch (error) {
                        console.log(error)
                        loading.value = false
                    }
                    break
                default:
                    setStorage("kbom-show-rule-cache", JSON.stringify(showRuleForm), false)
                    emits("confirmSuceess", showRuleForm)
            }
            props.dialog.visible = false
        }
    })
}

// watch(
//     () => props.from,
//     (val) => {
//         console.log("val: ", val)
//         // 如果来自头部设置
//         if (val === "headerSetting") {
//             console.log("如果来自头部设置")
//             getDetails()
//         } else {
//             showRuleForm = showRuleCache || initShowRuleForm
//         }
//     },
//     {
//         immediate: true
//     }
// )
</script>
<style lang="scss" scoped></style>
