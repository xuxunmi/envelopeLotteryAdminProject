<template>
    <el-dialog
        :append-to-body="true"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :destroy-on-close="true"
        v-model="dialogVisible"
        :title="title"
        :width="width"
        center
        align-center
        draggable
        overflow
        :fullscreen="fullscreen"
        @close="closeDialog"
    >
        <slot />
        <template v-if="footer" #footer>
            <span class="dialog-footer">
                <el-button size="small" type="primary" @click="dialogVisible = false">保存</el-button>
                <el-button size="small" type="primary" @click="dialogVisible = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

defineOptions({
    name: "dialogFrame"
})

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "标题"
    },
    width: {
        type: String,
        default: "30%"
    },
    footer: {
        type: Boolean,
        default: true
    },
    // 是否显示关闭按钮
    showClose: {
        type: Boolean,
        default: true
    },
    fullscreen: {
        type: Boolean,
        default: false
    }
})

const dialogVisible = ref<boolean>(props.visible)

const emits = defineEmits(["update:visible", "close"])

// 关闭对话框
const closeDialog = () => {
    dialogVisible.value = false
    emits("close")
}

watch(
    () => props.visible,
    (val: boolean) => {
        dialogVisible.value = val
    }
)

watch(
    () => dialogVisible.value,
    (val: boolean) => {
        emits("update:visible", val)
    }
)
</script>

<style lang="scss" scoped></style>
