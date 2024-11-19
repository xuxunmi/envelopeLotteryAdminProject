<script lang="ts" setup>
import { useTheme } from "@/hooks/useTheme"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import enUk from "element-plus/es/locale/lang/en"
import { useI18n } from "vue-i18n"

const { initTheme } = useTheme()

const { locale } = useI18n()

/** 初始化主题 */
initTheme()

// 无感刷新页面
const isRefresh = ref(true)
const reload = (): void => {
    isRefresh.value = false
    nextTick(() => {
        isRefresh.value = true
    })
}

provide("reload", reload)
</script>

<template>
    <ElConfigProvider :locale="locale === 'zh_cn' ? zhCn : enUk">
        <router-view v-if="isRefresh" />
    </ElConfigProvider>
</template>
