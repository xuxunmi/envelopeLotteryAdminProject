<template>
    <div class="object" ref="objectRef">
        <el-scrollbar>
            <div class="point">
                <template v-if="data.type === 'WTPart'">
                    <el-button type="success" @click="pointClick('explainList')" link>{{
                        t("productDetailPage.expositorDocument")
                    }}</el-button>
                    <el-divider direction="vertical" />
                    <el-button type="success" @click="pointClick('refPartList')" link>{{
                        t("productDetailPage.referenceDocument")
                    }}</el-button>
                    <!-- <el-divider direction="vertical" />
          <el-button type="success" @click="pointClick('wholeList')" link>全局替换部件</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="pointClick('specificList')" link>特定替换部件</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="pointClick('technologyList')" link>工艺计划</el-button> -->
                </template>
                <template v-else-if="data.type === 'WTDocument'">
                    <el-button type="success" @click="pointClick('usageList')" link>{{
                        t("productDetailPage.usageSituation")
                    }}</el-button>
                    <el-divider direction="vertical" />
                    <el-button type="success" @click="pointClick('refDocList')" link>{{
                        t("productDetailPage.referenceDocument")
                    }}</el-button>
                    <el-divider direction="vertical" />
                    <el-button type="success" @click="pointClick('referDList')" link>{{
                        t("productDetailPage.referencedDocument")
                    }}</el-button>
                    <el-divider direction="vertical" />
                    <el-button type="success" @click="pointClick('explainPartList')" link>{{
                        t("productDetailPage.explainPart")
                    }}</el-button>
                </template>
            </div>
        </el-scrollbar>
        <el-scrollbar>
            <div class="list-wrapper">
                <template v-if="data.type === 'WTPart'">
                    <pt-collapse id="explainList" :title="t('productDetailPage.expositorDocument')">
                        <explain-list ref="ExplainListRef" />
                    </pt-collapse>
                    <pt-collapse id="refPartList" :title="t('productDetailPage.referenceDocument')">
                        <ref-part-list ref="RefPartListRef" />
                    </pt-collapse>
                    <!-- <pt-collapse id="wholeList" title="全局替换部件">
            <whole-list />
          </pt-collapse>
          <pt-collapse id="specificList" title="特定替换部件">
            <specific-list />
          </pt-collapse>
          <pt-collapse id="technologyList" title="工艺计划">
            <technology-list />
          </pt-collapse> -->
                </template>
                <template v-else-if="data.type === 'WTDocument'">
                    <pt-collapse id="usageList" :title="t('productDetailPage.usageSituation')">
                        <usage-list ref="UsageListRef" />
                    </pt-collapse>
                    <pt-collapse id="refDocList" :title="t('productDetailPage.referenceDocument')">
                        <ref-doc-list ref="RefDocListRef" />
                    </pt-collapse>
                    <pt-collapse id="referDList" :title="t('productDetailPage.referencedDocument')">
                        <refer-d-list ref="ReferDListRef" />
                    </pt-collapse>
                    <pt-collapse id="explainPartList" :title="t('productDetailPage.explainPart')">
                        <explain-part-list ref="ExplainPartListRef" />
                    </pt-collapse>
                </template>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue"
import PtCollapse from "@/components/ptCollapse/index.vue"
import ExplainList from "./components/explainList.vue"
import RefPartList from "./components/refPartList.vue"
import RefDocList from "./components/refDocList.vue"
import WholeList from "./components/wholeList.vue"
import SpecificList from "./components/specificList.vue"
import TechnologyList from "./components/technologyList.vue"
import ReferDList from "./components/referDList.vue"
import UsageList from "./components/usageList.vue"
import ExplainPartList from "./components/explainPartList.vue"
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
        list: [
            { title: "说明方文档", component: ExplainList, objType: "DesDOC" },
            { title: "参考文档", component: RefPartList, objType: "RefDoc" }
        ]
    },
    {
        type: "WTDocument",
        list: [
            { title: "使用情况", component: UsageList, objType: "DocUsedBy" },
            { title: "参考文档", component: RefDocList, objType: "RefDoc" },
            { title: "所参考文档", component: ReferDList, objType: "RefdDOC" },
            { title: "说明部件", component: ExplainPartList, objType: "DesPart" }
        ]
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
        ElMessage.error(t("productDetailPage.relatedObject") + "-" + t("productDetailPage.dataError"))
        return
    }
    if (props.data.type === "WTPart") {
        instance.refs.ExplainListRef.getList(oid)
        instance.refs.RefPartListRef.getList(oid)
    } else if (props.data.type === "WTDocument") {
        instance.refs.UsageListRef.getList(oid)
        instance.refs.RefDocListRef.getList(oid)
        instance.refs.ReferDListRef.getList(oid)
        instance.refs.ExplainPartListRef.getList(oid)
    }
}
</script>

<style lang="scss" scoped>
.object {
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
