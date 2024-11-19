<template>
    <div class="sf-container-main-content">
        <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
            <el-tab-pane label="标准配置方案" name="allocation">
                <div class="tab-wrapper">
                    <configurationPlanTab v-if="tabShow.allocation" :objectRow="objectRow" />
                </div>
            </el-tab-pane>
            <el-tab-pane label="选配界面" name="apolegamy">
                <div class="tab-wrapper">
                    <apolegamyInterfaceTab v-if="tabShow.apolegamy" :objectRow="objectRow" />
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import type { TabsPaneContext } from "element-plus"
import configurationPlanTab from "./configurationPlanTab.vue"
import apolegamyInterfaceTab from "./apolegamyInterfaceTab.vue"

defineOptions({
    name: "applicationDetail"
})

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: () => ({
            type: ""
        })
    }
})
const emits = defineEmits(["getLayerBomList"])

const instance: any = getCurrentInstance()
//#endregion

//#region 标签页
const activeName = ref<string | number | undefined>("allocation")
// 标签对应组件显示隐藏
const tabShow = reactive({
    allocation: false, // 标准配置方案
    apolegamy: false, // 选配界面
})
const handleTabClick = (pane: TabsPaneContext) => {
    const name = pane.paneName as any
    (tabShow as any)[name] = true
}
// 获取详情
const getDetail = () => {
    console.log("getDetail", props.objectRow)
    Object.keys(tabShow).forEach(key => (tabShow as any)[key] = false)
    setTimeout(() => {
      activeName.value = 'allocation'
      tabShow.allocation = true
    }, 1);
}
//#endregion

defineExpose({
    getDetail
})
</script>

<style lang="scss" scoped>
.tab-wrapper {
  height: calc(var(--v3-container-height) - 50px);
}
</style>
