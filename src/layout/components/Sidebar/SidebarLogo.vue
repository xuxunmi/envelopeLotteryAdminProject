<script lang="ts" setup>
import { useSettingsStore } from "@/store/modules/settings"
const props = defineProps({
    collapse: {
        type: Boolean,
        default: true
    }
})
const settingsStore = useSettingsStore()

const projectName = computed(() => {
  return settingsStore.projectName
})
</script>

<template>
    <div class="sidebar-logo-container" :class="{ collapse: props.collapse }">
        <transition name="sidebar-logo-fade">
            <!-- 毕迪 -->
            <!-- <router-link v-if="props.collapse" key="collapse" to="/">
                <img src="@/assets/layout/logo-box-new-160x160.png" class="sidebar-logo" />
            </router-link>
            <router-link v-else key="expand" to="/">
                <div class="sidebar-logo-text">
                    <img src="@/assets/layout/logo-box-new-160x160.png" />
                    <span>{{ projectName }}</span>
                </div>
            </router-link> -->
            <!-- 龙工 -->
            <router-link v-if="props.collapse" key="collapse" to="/">
            </router-link>
            <router-link v-else key="expand" to="/dashboard">
                <div class="sidebar-logo-img">
                  <img src="@/assets/layout/logo-kbom3.png" />
                </div>
            </router-link>
        </transition>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
    position: relative;
    width: 100%;
    height: var(--v3-header-height);
    line-height: var(--v3-header-height);
    background-color: var(--v3-sidebarlogo-bg-color);
    text-align: center;
    overflow: hidden;
    .sidebar-logo {
        display: none;
    }
    .sidebar-logo-text {
        width: 100%;
        height: 100%;
        vertical-align: middle;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        font-style: italic;
        img {
            width: 32px;
            height: 32px;
        }
    }
    .sidebar-logo-img {
      position: relative;
      height: 50px;
      img {
        height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
}

.collapse {
    .sidebar-logo {
        width: 32px;
        height: 32px;
        vertical-align: middle;
        display: inline-block;
    }
    .sidebar-logo-text {
        display: none;
    }
}
</style>
