<template>
    <div class="action" ref="objectRef">
        <el-scrollbar>
            <div class="point">
                <el-button type="success" @click="pointClick('actionList')" link>{{
                    t("productDetailPage.dynamicDocument")
                }}</el-button>
            </div>
        </el-scrollbar>
        <el-scrollbar>
            <div class="list-wrapper">
                <pt-collapse id="actionList" :title="t('productDetailPage.dynamicDocument')">
                    <action-list ref="ActionListRef" />
                </pt-collapse>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue"
import { ElMessage } from "element-plus"
import ActionList from "./components/actionList.vue"
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
    getList(props.data.oid)
})
const list = [
    {
        type: "WTPart",
        list: [{ title: "CAD/动态文档", component: ActionList, objType: "EPM" }]
    }
]
//#endregion

// 锚点点击
const pointClick = (name: string) => {
    const el = instance.refs.objectRef.querySelector(`#${name}`) as HTMLDivElement
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

// 获取列表
const getList = (oid: string) => {
    if (!oid) {
        ElMessage.error(t("productDetailPage.dynamicDocument") + "-" + t("productDetailPage.dataError"))
        return
    }
    instance.refs.ActionListRef.getList(oid)
}
</script>

<style lang="scss" scoped>
.action {
    .point {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: 0 12px 6px;
        z-index: 10;
    }
    .list-wrapper {
        padding: 6px 12px 12px;
    }
}
</style>
