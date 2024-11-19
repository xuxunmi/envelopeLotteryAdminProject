<template>
    <div v-loading="loading">
        <el-table :data="tcTableData" style="width: 100%" max-height="500" :show-header="false" border>
            <el-table-column label="fileUrl">
                <template #default="scope">
                    <el-link type="primary" :href="scope.row.fileUrl" target="_blank">{{ scope.row.fileName }}</el-link>
                </template>
            </el-table-column>
        </el-table>
        <div class="export-wrapper text-center mt-4 p-4">
            <el-button size="small" type="primary" @click="handleConfirm">保存</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TcTabelInterface } from "@/interface/common"

defineOptions({
    name: "TCDeliverable"
})

interface Props {
    visible: boolean
    loading: boolean
    tcTableData: TcTabelInterface[]
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    loading: false,
    tcTableData: () => []
})

const emits = defineEmits(["update:visible", "confirmSuccess"])

const handleConfirm = () => {
    emits("confirmSuccess", "tcDeliverable")
}
</script>

<style lang="scss" scoped></style>
