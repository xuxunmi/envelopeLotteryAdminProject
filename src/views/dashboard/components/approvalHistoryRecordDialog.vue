<template>
    <div v-loading="loading">
        <el-table :data="approvalHistoryData" border highlight-current-row height="calc(90vh - 158px)">
            <el-table-column type="index" label="序号" width="60" header-align="center" />
            <el-table-column prop="taskName" label="流程节点" header-align="center" />
            <el-table-column prop="resultType" label="审批结果" header-align="center">
                <template #default="scope">
                    <div>{{ scope.row.resultType ? scope.row.resultType : "-" }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="comment" label="描述" header-align="center" />
            <el-table-column prop="assignee" label="执行人" header-align="center" />
            <el-table-column prop="endTime" label="时间" header-align="center" width="160" />
        </el-table>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { getApprovalHistory } from "@/api/dashboard"

defineOptions({
    name: "ApprovalHistoryRecordDialog"
})

const { t } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        required: true
    }
})

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
// 流程审批历史记录
const approvalHistoryData = ref([])

// 获取审批历史记录
const getApprovalHistoryList = async (processInstanceId: string) => {
    try {
        loading.value = true
        const params = {
            processInstanceId
        }
        const { data } = (await getApprovalHistory(params)) as { data: any }
        approvalHistoryData.value = data
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.error(error)
    }
}

watch(
    () => props.currentRowData.processInstanceId,
    (val) => {
        if (!val) return
        getApprovalHistoryList(val)
    },
    {
        immediate: true
    }
)
</script>

<style lang="scss" scoped></style>
