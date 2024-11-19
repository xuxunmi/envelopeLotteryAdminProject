<template>
  <pt-collapse id="convention" :title="t('traitDetailPage.routine')">
    <el-descriptions title="" :column="1">
      <template v-for="item in descriptionsData1">
        <el-descriptions-item :label="item.label + ':'">
          <template v-if="item.prop">
            <template v-if="objectData[item.prop]||objectData[item.prop]===false||objectData[item.prop]===0">
              <template v-if="
                item.prop==='visitable'||
                item.prop==='isKeyOption'||
                item.prop==='isOrderMate'||
                item.prop==='singleChoice'
              ">
                <span v-if="objectData[item.prop]===true">是</span>
                <span v-else-if="objectData[item.prop]===false">否</span>
              </template>
              <span v-else>{{ objectData[item.prop] }}</span>
            </template>
            <span v-else style="color: #909399;">{{ t('dashboardPage.noData') }}</span>
          </template>
        </el-descriptions-item>
      </template>
    </el-descriptions>
  </pt-collapse>
  <pt-collapse id="system" :title="t('traitDetailPage.system')">
    <el-descriptions title="" :column="2">
      <template v-for="item in descriptionsData2">
        <el-descriptions-item :label="item.label + ':'">
          <template v-if="item.prop">
            <span v-if="objectData[item.prop]">{{ objectData[item.prop] }}</span>
            <span v-else style="color: #909399;">{{ t('dashboardPage.noData') }}</span>
          </template>
        </el-descriptions-item>
      </template>
    </el-descriptions>
  </pt-collapse>
</template>
<script lang="ts" setup>
import PtCollapse from '@/components/ptCollapse/index.vue'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectData: {
    type: Object,
    default: {}
  },
})
const { t, locale } = useI18n()
//#endregion

//#region 描述列表
const descriptionsData1 = ref([
  {
    label: computed(() => t("traitDetailPage.name")) as any,
    prop: 'name'
  },
  {
    label: computed(() => t("traitDetailPage.explain")) as any,
    prop: 'desc'
  },
  {
    // label: computed(() => t("traitDetailPage.group")) as any,
    label: '组织',
    prop: 'orange'
  },
  // {
  //   label: computed(() => t("traitDetailPage.necessary")) as any,
  //   prop: 'absolutely'
  // },
  // {
  //   label: computed(() => t("traitDetailPage.singleChoice")) as any,
  //   prop: 'singleChoice'
  // },
  {
    label: computed(() => t("traitDetailPage.featureClassification")) as any,
    prop: 'optionType'
  },
  {
    label: computed(() => t("traitDetailPage.visible")) as any,
    prop: 'visitable'
  },
  {
    label: computed(() => t("traitDetailPage.keyFeature")) as any,
    prop: 'isKeyOption'
  },
  {
    label: computed(() => t("traitDetailPage.defaultValues")) as any,
    prop: 'defaultValue'
  },
  {
    label: '是否参与订单匹配',
    prop: 'isOrderMate'
  },
])
const descriptionsData2 = ref([
  {
    label: computed(() => t("traitDetailPage.context")) as any,
    prop: 'productName'
  },
  {
    label: computed(() => t("traitDetailPage.lastTime")) as any,
    prop: 'modifyTime'
  },
  {
    label: computed(() => t("traitDetailPage.creationTime")) as any,
    prop: 'createTime'
  },
])
//#endregion

</script>
<style scoped></style>
