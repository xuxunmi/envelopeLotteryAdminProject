<template>
    <div>
        <div class="header-setting" @click="handleHeaderSetting">
            <el-icon><Setting /></el-icon>
            <span class="ml-2">设置</span>
        </div>

        <!-- 显示规则弹窗 -->
        <ShowBomRuleDialog
            v-if="showRuleDialog.visible"
            :dialog="showRuleDialog"
            from="headerSetting"
            :optionVersionRuleList="optionVersionRuleList"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import ShowBomRuleDialog from "@/views/bomManage/productBom/components/showBomRuleDialog.vue"
import { optionVersionRuleList } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "HeadSetting"
})

const router = useRouter()

const { t } = useI18n()

const showRuleDialog = reactive<any>({
    visible: false,
    title: "显示规则设置",
    type: ""
})

// 处理设置按钮
const handleHeaderSetting = () => {
    showRuleDialog.visible = true
}
</script>

<style lang="scss" scoped>
:deeep(.el-button) {
    background-color: #fff !important;
}
.header-setting {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 16px;
}
</style>
