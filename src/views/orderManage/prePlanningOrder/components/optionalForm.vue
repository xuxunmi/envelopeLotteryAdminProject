<template>
    <el-form
        ref="formRef"
        class="optionalForm"
        :model="formData"
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
                        :style="{ 'grid-template-columns': `repeat(${getColumnNum(option.choice.length)}, auto)` }"
                    >
                        <template v-for="choice in option.choice" :key="choice.oid">
                            <el-radio :value="choice.oid">{{ choice.name }}</el-radio>
                        </template>
                    </el-radio-group>
                </el-form-item>
            </template>
        </div>
        <div v-if="showColor&&colorList.length" v-loading="loading_color" class="optionFrom">
            <template v-for="part in colorList" :key="part.code">
                <el-form-item :label="part.codeListNameC">
                    <template #label="{ label }">
                        <div>{{ label }}</div>
                    </template>
                    <el-radio-group
                      v-model="part.value"
                      :style="{ 'grid-template-columns': `repeat(${getColumnNum(part.colors.length)}, auto)` }"
                    >
                        <template v-for="color in part.colors" :key="color.oid">
                            <el-radio :value="color.name">{{ color.name }}</el-radio>
                        </template>
                    </el-radio-group>
                </el-form-item>
            </template>
        </div>
    </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import { getOptionListOfPartApply, getColorDetails } from "@/api/configureManage/applicationConfiguration"

//#region 参数和方法
const props = defineProps({
    // 状态
    type: {
        type: String,
        default: "add"
    },
    // 物料oid（获取配置必须参数）
    partOid: {
        type: String,
        default: ""
    },
    // 配置oid（编辑配置必须参数）
    schemeOid: {
        type: String,
        default: ""
    },
    // 是否展示颜色选配
    showColor: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(["choiceSelect", "startLoading", "endLoading", "optionListChange"])
//#endregion

//#region 配置
const formData = reactive({})

// 获取基本配置
const optionList = ref<any[]>([])
const rulesSessionId = ref("")
// actionName - init: 新增初始化; edit: 编辑初始化; choiceselect: 特征值选择
const getData = (actionName: "init" | "choiceselect" | "edit", choiceOid?: string, option?: any) => {
    const params = {
        oid: props.partOid,
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
            schemeOid: props.schemeOid
        })
    }
    // optionList.value = []
    // if (actionName !== 'choiceselect') emits('startLoading')
    emits("startLoading")
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
            emits("optionListChange", optionList.value)
            rulesSessionId.value = data.data.rulesSessionId || ""
        })
        .catch((err) => {
            // console.log('getOptionListOfPartApply', err, option);
            option.checkChoiceOid = option.oldCheckChoiceOid
        })
        .finally(() => emits("endLoading"))
}
// 计算项目列数
const maxColumnNum = 6
const getColumnNum = (length: number) => {
    if (length > maxColumnNum) {
        if (length / 2 > maxColumnNum) return length % 2 ? Math.ceil(length / 2) : length / 2
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
        partOid: props.partOid
    }
    getColorDetails(params)
        .then((data) => {
            colorList.value = data.data || []
            colorList.value.forEach((ele) => {
                ele.colors?.forEach((color: any) => {
                    if (color.isDefault) ele.value = color.name
                })
            })
        })
        .finally(() => (loading_color.value = false))
}
if (props.type === "add") {
    getData("init")
    if (props.showColor) getData_color()
} else {
    getData("edit")
    if (props.showColor) getData_color()
}

// 特征值选择回调
const handleRadioChange = (val: any, option: any) => {
    console.log("handleRadioChange", val, option)
    getData("choiceselect", val, option)
}
//#endregion

// 向外暴露方法
defineExpose({
    optionList,
    colorList
})
</script>

<style lang="scss" scoped>
.optionalForm {
    .optionFrom {
        border: 1px solid #bfcbd9;
        min-width: 100%;
        width: fit-content;
        :deep(.el-form-item) {
            width: 100%;
            height: 36px;
            margin-bottom: 0;
            & + .el-form-item {
                border-top: 1px solid #bfcbd9;
            }
            .el-form-item__label {
                height: auto;
                padding: 0 10px;
                border-right: 1px solid #bfcbd9;
                align-items: center;
                div {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .el-form-item__content {
                padding: 0 10px;
                max-height: 50px;
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
                padding-left: 10px;
            }
            .el-form-item__content {
                padding: 0 16px;
            }
        }
    }
}
</style>
