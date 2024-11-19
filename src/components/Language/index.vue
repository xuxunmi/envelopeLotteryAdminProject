<template>
    <div class="language-container">
        <el-dropdown @command="handleLanguageSetting">
            <span class="el-dropdown-link flex items-center justify-between">
                <svg-icon name="message-multi-language" />
                <span class="ml-0.5">{{ $t("dashboardPage.language") }}</span>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="item in languageList" :key="item.id" :command="item.id">{{
                        item.name
                    }}</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup lang="ts">
import { setLanguage } from "@/utils/cache/localStorage"
import { languageList } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "Language"
})

const { locale } = useI18n()

const handleLanguageSetting = (command: string) => {
    console.log("command: ", command)
    locale.value = command
    setLanguage(command)
}
</script>

<style lang="scss" scoped>
.language-container {
    .el-dropdown-link {
        color: #fff;
        font-size: 16px;
        .svg-icon {
            font-size: 20px;
        }
    }
    :deep(.el-tooltip__trigger:focus-visible) {
        outline: unset;
    }
}
</style>
