<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref, watch } from "vue"
import { type RouteRecordRaw, RouterLink, useRoute, useRouter } from "vue-router"
import { type TagView, useTagsViewStore } from "@/store/modules/tags-view"
import ScrollPane from "./ScrollPane.vue"
import path from "path-browserify"
import { Close } from "@element-plus/icons-vue"
import { getRouterName, filterRouters } from "@/utils"
import { getDynamicsMenu } from "@/utils/cache/localStorage"
import { asyncRoutes } from "@/router"
import { routeTitle } from "@/lang"
import Sortable from "sortablejs"

const instance = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const tagsViewStore = useTagsViewStore()

const tagRefs = ref<InstanceType<typeof RouterLink>[]>([])

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<TagView>({})
let affixTags: TagView[] = []

const isActive = (tag: TagView) => {
    return tag.path === route.path
}

const isAffix = (tag: TagView) => {
    return tag.meta?.affix
}

const filterAffixTags = (routes: RouteRecordRaw[], basePath = "/") => {
    let tags: TagView[] = []
    routes.forEach((route) => {
        if (route.meta?.affix) {
            const tagPath = path.resolve(basePath, route.path)
            tags.push({
                fullPath: tagPath,
                path: tagPath,
                name: route.name,
                meta: { ...route.meta }
            })
        }
        if (route.children) {
            const childTags = filterAffixTags(route.children, route.path)
            if (childTags.length >= 1) {
                tags = tags.concat(childTags)
            }
        }
    })
    return tags
}

const initTags = () => {
    const dynamicRoutes = getDynamicsMenu()
    const routerNameArr = getRouterName(dynamicRoutes)
    const addRoutersList: RouteRecordRaw[] = filterRouters(asyncRoutes, routerNameArr)
    affixTags = filterAffixTags(addRoutersList)
    for (const tag of affixTags) {
        // 必须含有 name 属性
        if (tag.name) {
            tagsViewStore.addVisitedView(tag)
        }
    }
}

const addTags = () => {
    if (route.name) {
        tagsViewStore.addVisitedView(route)
        tagsViewStore.addCachedView(route)
    }
}

const refreshSelectedTag = (view: TagView) => {
    tagsViewStore.delCachedView(view)
    router.replace({ path: "/redirect" + view.path, query: view.query })
}

const closeSelectedTag = (view: TagView) => {
    tagsViewStore.delVisitedView(view)
    tagsViewStore.delCachedView(view)
    if (isActive(view)) {
        toLastView(tagsViewStore.visitedViews, view)
    }
}

const closeOthersTags = () => {
    if (selectedTag.value.fullPath !== route.path && selectedTag.value.fullPath !== undefined) {
        router.push(selectedTag.value.fullPath)
    }
    tagsViewStore.delOthersVisitedViews(selectedTag.value)
    tagsViewStore.delOthersCachedViews(selectedTag.value)
}

const closeAllTags = (view: TagView) => {
    tagsViewStore.delAllVisitedViews()
    tagsViewStore.delAllCachedViews()
    if (affixTags.some((tag) => tag.path === route.path)) {
        return
    }
    toLastView(tagsViewStore.visitedViews, view)
}

const toLastView = (visitedViews: TagView[], view: TagView) => {
    const latestView = visitedViews.slice(-1)[0]
    if (latestView !== undefined && latestView.fullPath !== undefined) {
        router.push(latestView.fullPath)
    } else {
        // 如果 TagsView 全部被关闭了，则默认重定向到主页
        if (view.name === "dashboard") {
            // 重新加载主页
            router.push({ path: "/redirect" + view.path, query: view.query })
        } else {
            router.push("/")
        }
    }
}

const openMenu = (tag: TagView, e: MouseEvent) => {
    const menuMinWidth = 105
    // container margin left
    const offsetLeft = instance!.proxy!.$el.getBoundingClientRect().left
    // container width
    const offsetWidth = instance!.proxy!.$el.offsetWidth
    // left boundary
    const maxLeft = offsetWidth - menuMinWidth
    // 15: margin right
    const left15 = e.clientX - offsetLeft + 15
    if (left15 > maxLeft) {
        left.value = maxLeft
    } else {
        left.value = left15
    }
    top.value = e.clientY
    visible.value = true
    selectedTag.value = tag
}

const closeMenu = () => {
    visible.value = false
}

// 初始化拖拽排序 - 标签
const tagListRef = ref<HTMLDivElement>()
const customSortable = ref<Sortable | null>(null)
const initSortable_tag = () => {
    if (tagListRef.value) {
        customSortable.value = new Sortable(tagListRef.value, {
            draggable: ".tags-view-item",
            onEnd: ({ oldIndex, newIndex, from, to, item }) => {
                if (typeof oldIndex === "number" && typeof newIndex === "number") {
                    to.removeChild(item)
                    from.insertBefore(item, from.children[oldIndex])
                    tagsViewStore.changeViewsOrder(oldIndex, newIndex)
                }
            }
        })
    }
}

watch(
    route,
    () => {
        addTags()
    },
    {
        deep: true
    }
)

watch(visible, (value) => {
    if (value) {
        document.body.addEventListener("click", closeMenu)
    } else {
        document.body.removeEventListener("click", closeMenu)
    }
})

onMounted(() => {
    initTags()
    setTimeout(() => initSortable_tag(), 1)
})
</script>

<template>
    <div ref="tagsViewContainerRef" class="tags-view-container">
        <ScrollPane class="tags-view-wrapper" :tag-refs="tagRefs">
            <div ref="tagListRef">
                <router-link
                    ref="tagRefs"
                    v-for="tag in tagsViewStore.visitedViews"
                    :key="tag.path"
                    :class="isActive(tag) ? 'active' : ''"
                    :to="{ path: tag.path, query: tag.query }"
                    class="tags-view-item"
                    @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
                    @contextmenu.prevent="openMenu(tag, $event)"
                >
                    <span class="tagTitle">{{ routeTitle(tag.meta?.title) }}</span>
                    <el-icon v-if="!isAffix(tag)" :size="12" @click.prevent.stop="closeSelectedTag(tag)">
                        <Close />
                    </el-icon>
                </router-link>
            </div>
        </ScrollPane>
        <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
            <li @click="refreshSelectedTag(selectedTag)">{{ $t("dashboardPage.refresh") }}</li>
            <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">{{ $t("dashboardPage.close") }}</li>
            <li @click="closeOthersTags">{{ $t("dashboardPage.closeOther") }}</li>
            <li @click="closeAllTags(selectedTag)">{{ $t("dashboardPage.closeAll") }}</li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.tags-view-container {
    height: var(--v3-tagsview-height);
    width: 100%;
    background-color: #f2f3f5 !important;
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 #00000010, 0 0 3px 0 #00000010;
    .tags-view-wrapper {
        .tags-view-item {
            display: inline-flex;
            align-items: center;
            position: relative;
            cursor: pointer;
            max-width: 250px;
            height: 26px;
            line-height: 26px;
            border: 0;
            border-radius: var(--v3-tagsview-tag-border-radius);
            color: var(--v3-tagsview-tag-text-color);
            background-color: var(--v3-tagsview-tag-bg-color);
            padding: 0 8px;
            font-size: 12px;
            margin-left: 5px;
            margin-top: 4px;
            &:first-of-type {
                margin-left: 5px;
            }
            &:last-of-type {
                margin-right: 5px;
            }
            &.active {
                background-color: var(--v3-tagsview-tag-active-bg-color);
                color: var(--v3-tagsview-tag-active-text-color);
                border-color: var(--v3-tagsview-tag-active-border-color);
                &::before {
                    content: "";
                    background-color: var(--v3-tagsview-tag-active-before-color);
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    position: relative;
                    margin-right: 2px;
                }
            }
            .tagTitle {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .el-icon {
                position: relative;
                top: -1px;
                margin: 0 2px;
                vertical-align: middle;
                border-radius: 50%;
                &:hover {
                    background-color: var(--v3-tagsview-tag-icon-hover-bg-color);
                    color: var(--v3-tagsview-tag-icon-hover-color);
                }
            }
        }
    }
    .contextmenu {
        margin: 0;
        background-color: #fff;
        z-index: 3000;
        position: absolute;
        list-style-type: none;
        padding: 5px 0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #333;
        box-shadow: 2px 2px 3px 0 #00000030;
        li {
            margin: 0;
            padding: 7px 16px;
            cursor: pointer;
            &:hover {
                background-color: #eee;
            }
        }
    }
}
</style>
