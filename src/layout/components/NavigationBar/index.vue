<script lang="ts" setup>
import { computed } from "vue"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { useUserStore } from "@/store/modules/user"
import { UserFilled } from "@element-plus/icons-vue"
// import Breadcrumb from "../Breadcrumb/index.vue"
import Hamburger from "../Hamburger/index.vue"
// import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
// import Screenfull from "@/components/Screenfull/index.vue"
// import Notify from "@/components/Notify/index.vue"
import Language from "@/components/Language/index.vue"
import HeadQuery from "@/components/HeadQuery/index.vue"
import HeadSetting from "@/components/HeadSetting/index.vue"
import InitiateChangeNotice from "@/components/InitiateChangeNotice/index.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import SwitchRole from "@/components/switchRole/index.vue"
import ModifyPassword from "@/components/modifyPassword/index.vue"
// import { useRouter } from "vue-router"
import { ElLoading } from "element-plus"

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
// const router = useRouter()

const reload = inject("reload") as () => void

const sidebar = computed(() => {
    return appStore.sidebar
})
// const showNotify = computed(() => {
//     return settingsStore.showNotify
// })
// const showThemeSwitch = computed(() => {
//     return settingsStore.showThemeSwitch
// })
// const showScreenfull = computed(() => {
//     return settingsStore.showScreenfull
// })
const projectName = computed(() => {
    return settingsStore.projectName
})
const projectName2 = computed(() => {
    return settingsStore.projectName2
})
const showLanguage = computed(() => {
    return settingsStore.showLanguage
})
const showHeadQuery = computed(() => {
    return settingsStore.showHeadQuery
})
const showInitiateChangeNotice = computed(() => {
    return settingsStore.showInitiateChangeNotice
})
const showHeadSetting = computed(() => {
    return settingsStore.showHeadSetting
})

const toggleSidebar = () => {
    appStore.toggleSidebar(false)
}

// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    switchRole: false, // 切换角色对话框
    password: false // 修改密码对话框
})
const logout = () => {
    userStore.logout()
}

// 切换角色按钮
// const handleSwitchRoleBtn = () => {
//     const dialogType = "switchRole"
//     dialogVisible[dialogType] = true
// }

// 关闭对话弹窗
const handleConfirmSuccess = (bool: boolean) => {
    dialogVisible.switchRole = bool
    const loading = ElLoading.service({
        lock: true,
        text: "正在切换角色，请稍等...",
        background: "rgba(255, 255, 255, 0.7)"
    })
    setTimeout(() => {
        loading.close()
        // 无感刷新页面
        reload()
    }, 2000)
}

// 修改密码按钮
const handleModifyPasswordBtn = () => {
    const dialogType = "password"
    dialogVisible[dialogType] = true
}
</script>

<template>
    <div class="navigation-bar">
        <Hamburger :is-active="sidebar.opened" class="hamburger" @toggle-click="toggleSidebar" />
        <!-- <Breadcrumb class="breadcrumb" /> -->
        <div class="right-menu">
            <div class="title right-menu-item">{{ projectName + projectName2 }}</div>
            <!-- <Screenfull v-if="showScreenfull" class="right-menu-item" />
            <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" /> -->
            <!-- <Notify v-if="showNotify" class="right-menu-item" /> -->
            <HeadQuery v-if="showHeadQuery" class="right-menu-item" />
            <InitiateChangeNotice v-if="showInitiateChangeNotice" class="right-menu-item" />
            <Language v-if="showLanguage" class="right-menu-item" />
            <HeadSetting v-if="showHeadSetting" class="right-menu-item" />
            <el-dropdown class="right-menu-item">
                <div class="right-menu-avatar">
                    <el-avatar :icon="UserFilled" :size="30" />
                    <span style="color: #fff">{{ userStore.userInfo.fullName }}</span>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <!-- <el-dropdown-item @click="handleSwitchRoleBtn">切换角色</el-dropdown-item> -->
                        <el-dropdown-item @click="handleModifyPasswordBtn">修改密码</el-dropdown-item>
                        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>

    <!-- 切换角色对话框 -->
    <dialogFrame :title="'切换角色'" v-model:visible="dialogVisible.switchRole" :footer="false" width="420px">
        <SwitchRole v-model:visible="dialogVisible.switchRole" @confirmSuccess="handleConfirmSuccess" />
    </dialogFrame>

    <!-- 修改密码对话框 -->
    <dialogFrame :title="'修改密码'" v-model:visible="dialogVisible.password" :footer="false" width="420px">
        <ModifyPassword v-model:visible="dialogVisible.password" />
    </dialogFrame>
</template>

<style lang="scss" scoped>
.navigation-bar {
    position: relative;
    height: var(--v3-navigationbar-height);
    overflow: hidden;
    background: #03328d;
    color: #fff;
    .hamburger {
        display: flex;
        align-items: center;
        height: 100%;
        float: left;
        padding: 0 15px;
        cursor: pointer;
    }
    .breadcrumb {
        float: left;
        // 参考 Bootstrap 的响应式设计 WIDTH = 576
        @media screen and (max-width: 576px) {
            display: none;
        }
    }
    .right-menu {
        width: calc(100% - 50px);
        float: right;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: #606266;
        .right-menu-item {
            padding: 0 10px;
            cursor: pointer;
            .right-menu-avatar {
                display: flex;
                align-items: center;
                .el-avatar {
                    margin-right: 10px;
                }
                span {
                    font-size: 16px;
                }
            }
        }
    }
    .title {
        flex: 1;
        text-align: center;
        color: #fff;
        font-size: 20px;
        font-weight: bold;
    }
}
</style>
