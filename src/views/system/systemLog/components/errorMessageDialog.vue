<template>
    <div>
        <div v-html="errorMessage" />
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("systemLogPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

defineOptions({
    name: "errorMessageDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    errorMessage: {
        type: String
    }
})

const emits = defineEmits(["update:visible"])
</script>

<style lang="scss" scoped></style>
