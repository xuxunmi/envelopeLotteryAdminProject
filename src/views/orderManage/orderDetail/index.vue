<template>
  <div class="app-container">
      <div class="sf-container">
          <div class="sf-container-main">
            <div class="sf-container-main-content">
              <PtCollapse title="基本属性">
                <el-descriptions :column="4">
                  <template v-for="item in descriptionsData">
                    <el-descriptions-item :label="item.label + ':'">
                      <template v-if="item.prop">
                        <span v-if="objectData[item.prop]">{{ objectData[item.prop] }}</span>
                        <span v-else style="color: #909399;">{{ t('dashboardPage.noData') }}</span>
                      </template>
                    </el-descriptions-item>
                  </template>
                </el-descriptions>
              </PtCollapse>
              <div class="detailContrast">

              </div>
            </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import { useRoute } from "vue-router"
import PtCollapse from "@/components/ptCollapse/index.vue";
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
  name: "bomDetail"
})
const instance: any = getCurrentInstance()
const route = useRoute()
// const query = ref<{
//   oid: string
//   number: string
//   type: string
// }>(route.query as any)
// console.log("路由参数query：", route, query.value)
const { t, locale } = useI18n()
//#endregion

//#region 详情
const descriptionsData = ref([
  {
    label: '订单号-行号',
    prop: 'value'
  },
  {
    label: '系列配置号',
    prop: 'value'
  },
  {
    label: '料号',
    prop: 'value'
  },
  {
    label: '品名',
    prop: 'value'
  },
  {
    label: '方案状态',
    prop: 'value'
  },
  {
    label: '实例BOM',
    prop: 'value'
  },
  {
    label: '实例BOM状态',
    prop: 'value'
  },
  {
    label: '数量',
    prop: 'value'
  },
  {
    label: '订单类型',
    prop: 'value'
  },
  {
    label: '生产订单状态',
    prop: 'value'
  },
  {
    label: '备注',
    prop: 'value'
  },
  {
    label: '创建时间',
    prop: 'value'
  },
  {
    label: '更新时间',
    prop: 'value'
  },
])
const objectData = ref<any>({})
const getData = () => {

}
//#endregion
</script>

<style lang="scss" scoped>
:deep(.ObjectDetail) {
  .sf-container {
      height: 100%;
  }
}
</style>
