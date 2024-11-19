<template>
    <div class="advanced-query-page">
        <div class="text-right">
            <el-button size="small" type="primary" @click="handleClearValueBtn" round>清空值</el-button>
        </div>
        <div class="advanced-query-container mt-4">
            <ul class="list">
                <li class="item mb-4" v-for="(queryValue, index) in queryValuesList" :key="index">
                    <el-input size="small" v-model="queryValue.label" style="width: 160px" disabled />
                    <el-select
                        size="small"
                        v-model="queryValue.selectValue"
                        style="width: 120px"
                        :disabled="queryValue.optionsDisabled"
                    >
                        <el-option
                            v-for="item in queryValue.options"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                    <template v-if="queryValue.type === 'input'">
                        <el-input size="small" v-model="queryValue.inputValue" style="width: calc(100% - 280px)">
                            <template #append v-if="queryValue.isIcon">
                                <el-button size="small" icon="Search" />
                            </template>
                        </el-input>
                    </template>
                    <template v-if="queryValue.type === 'select'">
                        <el-select
                            size="small"
                            v-model="queryValue.inputValue"
                            :multiple="queryValue.multiple"
                            style="width: calc(100% - 280px)"
                        >
                            <el-option
                                v-for="item in queryValue.selectOptions"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </template>
                    <template v-else-if="queryValue.type === 'datetime'">
                        <el-date-picker
                            style="width: calc(100% - 280px)"
                            size="small"
                            v-model="queryValue.inputValue"
                            type="datetime"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                        />
                    </template>
                </li>
            </ul>
        </div>
        <div class="mt-6 text-right">
            <el-button size="small" type="primary" @click="handleQueryBtn">查询</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { queryConditionList, queryConditionList2, queryConditionList_time, partTypeList } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "advancedQueryDialog"
})

const { t, locale } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        default: () => {}
    }
})

const emits = defineEmits(["update:visible", "confirm-success"])

//#region 下拉数据
const materielTypeList = ref<SelectInterface[]>([])
const option_trim = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "MATERIAL_TYPE,TRIM_METHOD" })) as { data: any }
        materielTypeList.value = (data.MATERIAL_TYPE || []).map((item: any) => {
            return { id: item.code, name: item.codeListNameC }
        })
        option_trim.value = (data.TRIM_METHOD || []).map((item: any) => {
            return { id: item.codeListNameC, name: item.codeListNameC }
        })
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion
const queryValuesList = ref<any[]>([
    {
        type: "select",
        prop: "type",
        label: "类型",
        selectValue: "等于",
        inputValue: "",
        optionsDisabled: true,
        options: queryConditionList2,
        isIcon: false,
        selectOptions: materielTypeList
    },
    {
        type: "input",
        prop: "number",
        label: "编码",
        selectValue: "等于",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "input",
        prop: "name",
        label: "名称",
        selectValue: "包含",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "input",
        prop: "materialSymbol",
        label: "代号",
        selectValue: "包含",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "input",
        prop: "material",
        label: "材料",
        selectValue: "包含",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "input",
        prop: "machineModel",
        label: "机型号",
        selectValue: "包含",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "input",
        prop: "plmOwner",
        label: "版本所有者",
        selectValue: "等于",
        inputValue: "",
        options: queryConditionList,
        isIcon: true
    },
    {
        type: "input",
        prop: "partCategory",
        label: "零件类型",
        selectValue: "等于",
        inputValue: "",
        options: queryConditionList,
        selectOptions: partTypeList,
        isIcon: false
    },
    {
        type: "input",
        prop: "state",
        label: "生命周期状态",
        selectValue: "等于",
        inputValue: "",
        options: queryConditionList,
        isIcon: true
    },
    {
        type: "input",
        prop: "importantDegree",
        label: "关重件特性",
        selectValue: "包含",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "input",
        prop: "rawPartCode",
        label: "原材料编码",
        selectValue: "包含",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "datetime",
        prop: "thePersistInfo.modifyStamp",
        label: "修改时间",
        selectValue: "大于",
        inputValue: "",
        options: queryConditionList_time,
        isIcon: false
    },
    {
        type: "input",
        prop: "blankSpecification",
        label: "规格",
        selectValue: "等于",
        inputValue: "",
        options: queryConditionList,
        isIcon: false
    },
    {
        type: "select",
        prop: "trimMethod",
        label: "裁剪方式",
        selectValue: "包含",
        inputValue: [],
        multiple: true,
        options: queryConditionList,
        isIcon: false,
        selectOptions: option_trim
    }
])

// 处理清空值按钮
const handleClearValueBtn = () => {
    console.log("清空值", queryValuesList.value)
    queryValuesList.value = queryValuesList.value.map((item) => {
        if (item.prop === "trimMethod") {
            return { ...item, inputValue: [] }
        }
        return { ...item, inputValue: "" }
    })
}

// 处理查询按钮
const handleQueryBtn = () => {
    console.log("查询")
    const valuesMap1 = queryValuesList.value.map((item) => {
        let inputValue = item.inputValue
        const selectValue = item.selectValue
        if (item.prop === "type") {
            // 类型如果没选的话，types就传wt.part.WTPart
            if (!item.inputValue) inputValue = "wt.part.WTPart"
        } else if (item.prop === "trimMethod") {
            if (inputValue.length) {
                inputValue = [...inputValue].join(";")
            } else {
                inputValue = ""
            }
        }
        return [item.prop, selectValue, inputValue]
    })
    console.log("valuesMap1: ", valuesMap1)
    emits("confirm-success", valuesMap1)
}
</script>

<style lang="scss" scoped>
.advanced-query-page {
    .advanced-query-container :deep(.el-date-editor) {
        .el-input__wrapper {
            width: 100%;
        }
    }
}
</style>
