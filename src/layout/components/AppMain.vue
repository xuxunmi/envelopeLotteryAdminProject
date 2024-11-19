<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"

const route = useRoute()
const tagsViewStore = useTagsViewStore()

const key = computed(() => {
    return route.path
})
</script>

<template>
    <section class="app-main">
        <router-view v-slot="{ Component }">
            <transition>
                <keep-alive :include="tagsViewStore.cachedViews" :exclude="[]">
                    <component :is="Component" :key="key" />
                </keep-alive>
            </transition>
        </router-view>
    </section>
</template>

<style lang="scss" scoped>
.app-main {
    min-height: calc(100vh - var(--v3-navigationbar-height));
    width: 100%;
    position: relative;
    overflow: hidden;
    background-color: var(--v3-body-bg-color);
    // 只显示AppMain
    &.hiddenNav {
        min-height: 100vh;
        --v3-container-height: calc(100vh - 10px);
    }
}

.fixed-header + .app-main {
    padding-top: var(--v3-navigationbar-height);
    height: 100vh;
    overflow: auto;
}

.hasTagsView {
    .app-main {
        min-height: calc(100vh - var(--v3-header-height));
    }
    .fixed-header + .app-main {
        padding-top: calc(var(--v3-navigationbar-height) + var(--v3-tagsview-height));
    }
}
</style>
