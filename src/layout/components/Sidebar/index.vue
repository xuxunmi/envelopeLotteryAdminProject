<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { storeToRefs } from "pinia"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import SidebarItem from "./SidebarItem.vue"
import SidebarLogo from "./SidebarLogo.vue"
import { getCssVariableValue, getRouterName, filterRouters } from "@/utils"
import { getDynamicsMenu } from "@/utils/cache/localStorage"
import { asyncRoutes } from "@/router"
import { type RouteRecordRaw } from "vue-router"
import { constantRoutes } from "@/router"

const v3SidebarMenuBgColor = getCssVariableValue("--v3-sidebar-menu-bg-color")

const v3SidebarMenuTextColor = getCssVariableValue("--v3-sidebar-menu-text-color")
const v3SidebarMenuActiveTextColor = getCssVariableValue("--v3-sidebar-menu-active-text-color")

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const { showSidebarLogo } = storeToRefs(settingsStore)

const activeMenu = computed(() => {
    const { meta, path } = route
    if (meta?.activeMenu) {
        return meta.activeMenu
    }
    return path
})

const isCollapse = computed(() => {
    return !appStore.sidebar.opened
})

// 动态菜单列表
const routesMenuList = computed(() => {
    const dynamicRoutes = getDynamicsMenu()
    const routerNameArr = getRouterName(dynamicRoutes)
    const addRoutersList: RouteRecordRaw[] = filterRouters(asyncRoutes, routerNameArr)
    // 菜单没有子集的不显示
    const routersList = addRoutersList.filter((item) => {
        if (item.children && item.children.length) {
            let flag = false
            item.children.forEach((child) => {
                if (!child.meta?.alwaysChecked) flag = true
            })
            return flag
        } else {
            return true
        }
    })
    return [...routersList, ...constantRoutes]
})
</script>

<template>
    <div :class="{ 'has-logo': showSidebarLogo }">
        <SidebarLogo v-if="showSidebarLogo" :collapse="isCollapse" />
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                :background-color="v3SidebarMenuBgColor"
                :text-color="v3SidebarMenuTextColor"
                :active-text-color="v3SidebarMenuActiveTextColor"
                :unique-opened="false"
                :collapse-transition="false"
                mode="vertical"
            >
                <SidebarItem
                    v-for="route in routesMenuList"
                    :key="route.path"
                    :item="route"
                    :base-path="route.path"
                    :is-collapse="isCollapse"
                />
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<style lang="scss" scoped>
@mixin tip-line {
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 2px;
        height: 100%;
        background-color: var(--v3-sidebar-menu-tip-line-bg-color);
    }
}

.has-logo {
    .el-scrollbar {
        height: calc(100% - var(--v3-header-height));
    }
}

.el-scrollbar {
    height: 100%;
    :deep(.scrollbar-wrapper) {
        // 限制水平宽度
        overflow-x: hidden !important;
        .el-scrollbar__view {
            height: 100%;
        }
    }
    // 滚动条
    :deep(.el-scrollbar__bar) {
        &.is-horizontal {
            // 隐藏水平滚动条
            display: none;
        }
    }
}

.el-menu {
    border: none;
    min-height: 100%;
    width: 100% !important;
    // background-color: #03328d;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title),
:deep(.el-sub-menu .el-menu-item) {
    height: var(--v3-sidebar-menu-item-height);
    line-height: var(--v3-sidebar-menu-item-height);
    // background-color: #03328d;
    &.is-active,
    &:hover {
        background-color: var(--v3-sidebar-menu-hover-bg-color);
    }
    display: block;
    * {
        vertical-align: middle;
    }
}

:deep(.el-menu-item) {
    &.is-active {
        @include tip-line;
    }
}

.el-menu--collapse {
    :deep(.el-sub-menu) {
        &.is-active {
            .el-sub-menu__title {
                color: var(--v3-sidebar-menu-active-text-color) !important;
                @include tip-line;
            }
        }
    }
}
</style>
