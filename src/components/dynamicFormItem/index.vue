<template>
    <el-form-item
        v-for="(item, index) in formItems"
        :key="index"
        :label="item.label + '：'"
        :prop="item.field"
        :rules="item.rules"
    >
        <template v-if="item.type === 'select'">
            <el-select
                :style="{ width: item?.width }"
                v-model="formData[item.field]"
                :placeholder="item.placeholder"
                clearable
                filterable
                :disabled="onlyRead"
            >
                <el-option v-for="option in item.options" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
        </template>
        <template v-else-if="item.type === 'input' || item.type === 'password'">
            <el-input
                :style="{ width: item?.width }"
                v-model="formData[item.field]"
                :show-password="item.type === 'password'"
                :placeholder="item.placeholder"
                :disabled="onlyRead"
            />
        </template>
        <template v-else-if="item.type === 'textarea'">
            <el-input
                :style="{ width: item?.width }"
                v-model="formData[item.field]"
                :type="item.type"
                :autosize="{ minRows: 2 }"
                :placeholder="item.placeholder"
                :disabled="onlyRead"
            />
        </template>
        <template v-else-if="item.type === 'daterange'">
            <el-date-picker
                :style="{ width: item?.width }"
                v-model="formData[item.field]"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :placeholder="item.placeholder"
                value-format="YYYY-MM-DD"
                :disabled="onlyRead"
            />
        </template>
    </el-form-item>
</template>

<script setup lang="ts">
import { FormItem } from "./types"

const props = defineProps({
    // 双向绑定
    modelValue: {
        type: Object,
        required: true
    },
    // form-item配置项
    formItems: {
        type: Array as PropType<FormItem[]>,
        default: () => []
    },
    onlyRead: {
        type: Boolean,
        default: false
    }
})

const emits = defineEmits(["update:modelValue"])

const formData = ref({ ...props.modelValue })
console.log("formData: ", props.formItems)

watch(
    () => props.modelValue,
    (value) => {
        formData.value = value
    },
    {
        immediate: true,
        deep: true
    }
)

watch(
    () => formData.value,
    (newValue) => {
        emits("update:modelValue", newValue)
    },
    {
        immediate: true,
        deep: true
    }
)
</script>

<style lang="scss" scoped></style>
