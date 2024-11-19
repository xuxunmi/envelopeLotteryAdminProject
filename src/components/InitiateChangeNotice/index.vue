<template>
    <div>
        <el-button style="background: #fff" size="small" @click="handleInitiateChangeNoticeBtn">发起变更通知</el-button>

        <!-- 发起变更通知弹窗 -->
        <dialogFrame
            :title="dialogTitle"
            v-model:visible="dialogVisible.initiateChangeNotice"
            :footer="false"
            width="40%"
        >
            <InitiateChangeNoticeDialog
                v-if="dialogVisible.initiateChangeNotice"
                v-model:visible="dialogVisible.initiateChangeNotice"
                @confirm-success="handleChangeNoticeConfirmSuccess_initiateChangeNotice"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import { useRouter } from "vue-router"
import dialogFrame from "@/components/dialogFrame/index.vue"
import InitiateChangeNoticeDialog from "@/components/InitiateChangeNoticeDialog/index.vue"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "InitiateChangeNotice"
})

const router = useRouter()

const { t } = useI18n()

const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    initiateChangeNotice: false // 发起变更通知对话框
})

// 处理发起变更通知按钮
const handleInitiateChangeNoticeBtn = () => {
    dialogTitle.value = "发起变更通知"
    const dialogType = "initiateChangeNotice"
    dialogVisible[dialogType] = true
}

// 关闭发起变更通知弹窗
const handleChangeNoticeConfirmSuccess_initiateChangeNotice = (dialogType: string) => {
    dialogVisible[dialogType] = false
    router.push({
        path: "/change/initiateChangeNotice",
        query: {
            t: new Date().getTime()
        }
    })
}
</script>

<style lang="scss" scoped></style>
