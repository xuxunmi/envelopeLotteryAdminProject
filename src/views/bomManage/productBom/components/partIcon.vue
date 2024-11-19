<template>
    <span class="partIcon">
        <el-icon style="top: 3px" size="16px">
            <!-- 模块 -->
            <img
                v-if="type === 'wt.part.WTPart|com.pdinfo.kbomMODULE'"
                class="userIcon w-full h-full"
                src="@/assets/images/format.gif"
            />
            <!-- 部件(包含其余类型) -->
            <Tools v-else />
        </el-icon>
        <template v-if="isCheckOut">
            <img v-if="isCheckUser" class="userIcon" width="8" src="@/assets/images/checkout.jpg" />
            <img
                v-else
                class="userIcon"
                width="8"
                src="@/assets/images/userCheck.jpg"
                :title="`${t('productBomPage.Detected')}：${CheckOutUser}`"
            />
        </template>
    </span>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    // 类型图标
    type: {
        type: String,
        default: ""
    },
    // 是否检出
    isCheckOut: {
        type: Boolean,
        default: false
    },
    // 是否当前检出用户
    isCheckUser: {
        type: Boolean,
        default: false
    },
    // 检出用户名称
    CheckOutUser: {
        type: String,
        default: ""
    }
})
const { t, locale } = useI18n()
//#endregion
</script>

<style lang="scss" scoped>
.partIcon {
    position: relative;
    margin-right: 4px;
    .userIcon {
        position: absolute;
        right: 0;
        bottom: 0;
    }
}
</style>
