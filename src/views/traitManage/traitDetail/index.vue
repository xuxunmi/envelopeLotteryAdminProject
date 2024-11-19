<template>
  <div class="app-container">
      <div class="sf-container">
          <div class="title">
              <ObjectIcon :objectType="query.type" />
              <b>
                {{ detailAttrsCollectionForm.number }},
                {{ detailAttrsCollectionForm.name }}
              </b>
          </div>
          <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
              <el-tab-pane label="详细信息" name="detail">
                  <el-scrollbar class="tab-wrapper">
                      <OptionDetailTab
                        v-if="query.type==='Option'"
                        :data="query"
                        ref="DetailTabRef"
                        :info="detailAttrsCollectionForm"
                      />
                      <ChoiceDetailTab
                        v-else-if="query.type==='Choice'"
                        :data="query"
                        ref="ChoiceDetailTabRef"
                        :info="detailAttrsCollectionForm"
                      />
                  </el-scrollbar>
              </el-tab-pane>
              <template v-if="query.type==='Choice'">
                <el-tab-pane label="使用情况" name="state">
                  <el-scrollbar class="tab-wrapper">
                      <UsageTab
                        :data="query"
                        ref="UsageTabRef"
                        :info="detailAttrsCollectionForm"
                      />
                  </el-scrollbar>
                </el-tab-pane>
              </template>
          </el-tabs>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { TabsPaneContext } from "element-plus"
import { useRoute } from "vue-router"
import ObjectIcon from "../enterpriseTraitLibrary/components/objectIcon.vue"
import OptionDetailTab from "./components/optionDetail/index.vue"
import ChoiceDetailTab from "./components/choiceDetail/index.vue"
import UsageTab from "./components/usage/index.vue"
import { getObjectInfo } from "@/api/traitManage/enterpriseTraitLibrary";

//#region 参数和方法
defineOptions({
  name: "traitDetail"
})
const route = useRoute()
const query = ref<{
  oid: string
  parentOid: string
  /**
   * 页面类型
   */
  type: string
}>(route.query as any)
console.log("路由参数query：", query.value)
//#endregion

//#region 标签页
const activeName = ref("detail")
const detailAttrsCollectionForm = ref<any>(
  {}
  // {
  //   "oid": "w011", //
  //   "name": "名称",
  //   "number": "w011", //编号
  //   "absolutely": true, // 必须的
  //   "singleChoice": true, // 单项选择
  //   "desc": "选项说明", // 说明
  //   "creatorId": "创建人", // 创建人id
  //   "creator": "创建人名", // 创建人
  //   "creatoeTime": '', // 创建时间
  //   "modifyer": "修改人名", // 修改人名
  //   "modifyTime": '', // 修改时间
  //   "productName": "", // 上下文名称
  //   "productOid": "", // 上下文id
  //   "orange": "", // 组织
  //   "choice": [
  //     {
  //       "oid": "w011", //
  //       "name": "名称",
  //       "number": "w011", //编号
  //       "absolutely": true, // 必须的
  //       "singleChoice": true, // 单项选择
  //       "desc": "选项说明", // 说明
  //       "choiceType": "", // 选择类型
  //       "group": "", // 组
  //     },
  //     {
  //       "oid": "w011", //
  //       "name": "名称",
  //       "number": "w011", //编号
  //       "absolutely": true, // 必须的
  //       "singleChoice": true, // 单项选择
  //       "desc": "选项说明", // 说明
  //       "choiceType": "", // 选择类型
  //       "group": "", // 组
  //     },
  //   ], // 选择列表
  // }
)
const handleTabClick = (pane: TabsPaneContext) => {
  console.log(pane.paneName)
}
const getDetail = () => {
  if (!query.value.oid) {
    ElMessage.error('数据异常！')
    return false
  }
  let params = {
    oid: query.value.oid,
  }
  getObjectInfo(params).then(data => {
    detailAttrsCollectionForm.value = data.data
  })
}
getDetail()
//#endregion

</script>

<style lang="scss" scoped>
.app-container {
  .sf-container {
      .title {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px;
          font-size: 18px;
      }
      .tab-wrapper {
          height: calc(var(--v3-container-height) - 98px);
          padding-top: 0;
      }
  }
}
</style>
