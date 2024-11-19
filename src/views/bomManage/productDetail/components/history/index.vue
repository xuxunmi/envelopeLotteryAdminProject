<template>
    <div class="history" ref="historyRef">
        <el-scrollbar>
            <div class="point">
                <el-button type="success" @click="pointClick('VersionList')" link>{{
                    t("productDetailPage.versionHistoricalRecord")
                }}</el-button>
                <!-- <el-divider direction="vertical" />
        <el-button type="success" @click="pointClick('ScheduleList')" link>时间表</el-button> -->
            </div>
        </el-scrollbar>
        <el-scrollbar>
            <div class="list-wrapper">
                <pt-collapse id="VersionList" :title="t('productDetailPage.versionHistoricalRecord')">
                    <version-list :data="data" ref="VersionListRef" />
                </pt-collapse>
                <!-- <pt-collapse id="ScheduleList" title="时间表">
          <schedule-list />
        </pt-collapse> -->
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue"
import PtCollapse from "@/components/ptCollapse/index.vue"
import VersionList from "./components/versionList.vue"
import ScheduleList from "./components/scheduleList.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

//#region 参数和方法
const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            oid: "",
            type: ""
        })
    }
})
const instance: any = getCurrentInstance()
onMounted(() => {
    getList()
})
//#endregion

// 锚点点击
const pointClick = (name: string) => {
    const el = instance.refs.historyRef.querySelector(`#${name}`) as HTMLDivElement
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

// 获取列表
const getList = () => {
    instance.refs.VersionListRef.getList()
}
</script>

<style lang="scss" scoped>
.history {
    .point {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: 0 12px 6px;
        background-color: #fff;
        z-index: 10;
    }
    .list-wrapper {
        padding: 6px 12px 12px;
    }
}
</style>
