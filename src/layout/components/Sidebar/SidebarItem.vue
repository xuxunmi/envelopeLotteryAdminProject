<script lang="ts" setup>
import { computed } from "vue"
import SidebarItemLink from "./SidebarItemLink.vue"
import { isExternal } from "@/utils/validate"
import path from "path-browserify"
import { routeTitle } from "@/lang"

const props = defineProps({
    item: {
        type: Object as any,
        required: true
    },
    isCollapse: {
        type: Boolean,
        default: false
    },
    isFirstLevel: {
        type: Boolean,
        default: true
    },
    basePath: {
        type: String,
        default: ""
    }
})

const alwaysShowRootMenu = computed(() => {
    return props.item.meta && props.item.meta.alwaysShow
})

const showingChildNumber = computed(() => {
    let length = 0
    if (props.item.children) {
        const showingChildren = props.item.children.filter((item: any) => {
            return !(item.meta && item.meta.hidden)
        })
        // 如果菜单存在多个子集时，showingChildNumber长度+1，避免权限授权时多个子集只给一个权限菜单时导致父级菜单不显示问题
        length = showingChildren.reduce((count: number, element: any) => {
            if (element.meta && element.meta.isChild) {
                return count + 1
            } else {
                return count
            }
        }, 1)
        return length
    }
    return 0
})

const theOnlyOneChild = computed(() => {
    if (showingChildNumber.value > 1) {
        return null
    }
    if (props.item.children) {
        for (const child of props.item.children) {
            if (!child.meta || !child.meta.hidden) {
                return child
            }
        }
    }
    // If there is no children, return itself with path removed,
    // because this.basePath already contains item's path information
    return { ...props.item, path: "" }
})

const resolvePath = (routePath: string) => {
    if (isExternal(routePath)) {
        return routePath
    }
    if (isExternal(props.basePath)) {
        return props.basePath
    }
    return path.resolve(props.basePath, routePath)
}
</script>

<template>
    <div
        v-if="!props.item.meta?.hidden"
        :class="{ 'simple-mode': props.isCollapse, 'first-level': props.isFirstLevel }"
    >
        <template v-if="!alwaysShowRootMenu && theOnlyOneChild && !theOnlyOneChild.children">
            <SidebarItemLink v-if="theOnlyOneChild.meta" :to="resolvePath(theOnlyOneChild.path)">
                <el-menu-item :index="resolvePath(theOnlyOneChild.path)">
                    <svg-icon v-if="theOnlyOneChild.meta.svgIcon" :name="theOnlyOneChild.meta.svgIcon" />
                    <component
                        v-else-if="theOnlyOneChild.meta.elIcon"
                        :is="theOnlyOneChild.meta.elIcon"
                        class="el-icon"
                    />
                    <template v-if="theOnlyOneChild.meta.title" #title>
                        {{ routeTitle(theOnlyOneChild.meta.title) }}
                    </template>
                </el-menu-item>
            </SidebarItemLink>
        </template>
        <el-sub-menu v-else :index="resolvePath(props.item.path)" teleported>
            <template #title>
                <svg-icon v-if="props.item.meta && props.item.meta.svgIcon" :name="props.item.meta.svgIcon" />
                <component
                    v-else-if="props.item.meta && props.item.meta.elIcon"
                    :is="props.item.meta.elIcon"
                    class="el-icon"
                />
                <span v-if="props.item.meta && props.item.meta.title">{{ routeTitle(props.item.meta.title) }}</span>
            </template>
            <template v-if="props.item.children">
                <sidebar-item
                    v-for="child in props.item.children"
                    :key="child.path"
                    :item="child"
                    :is-collapse="props.isCollapse"
                    :is-first-level="false"
                    :base-path="resolvePath(child.path)"
                />
            </template>
        </el-sub-menu>
    </div>
</template>

<style lang="scss" scoped>
.svg-icon {
    min-width: 1em;
    margin-right: 12px;
    font-size: 18px;
    color: #000;
}

.el-icon {
    width: 0.9em;
    margin-right: 12px;
    font-size: 16px;
}

.simple-mode {
    &.first-level {
        :deep(.el-sub-menu) {
            .el-sub-menu__icon-arrow {
                display: none;
            }
            span {
                visibility: hidden;
            }
        }
    }
}
</style>
