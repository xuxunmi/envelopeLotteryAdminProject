<template>
  <div class="sf-container-main-content">
    <el-tabs v-model="activeName" type="card">
      <template v-if="objectRow.type==='OptionSet'">
        <el-tab-pane :label="t('enterpriseTraitLibraryPage.prop')" name="prop">
          <el-scrollbar class="tab-wrapper">
            <div v-loading="loading_info" style="padding: 12px;">
              <SetProp :objectData="objectData"/>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </template>
      <template v-if="objectRow.type==='Product'||objectRow.type==='Group'||objectRow.type==='OptionSet'">
        <el-tab-pane :label="t('enterpriseTraitLibraryPage.feature')" name="option">
          <div v-loading="loading_info" class="tab-wrapper">
            <OptionList
              ref="OptionListRef"
              :onlyRead="onlyRead"
              :objectRow="objectRow"
              :productTypeList="productTypeList"
            />
          </div>
        </el-tab-pane>
      </template>
      <template v-if="objectRow.type==='Option'">
        <el-tab-pane :label="t('enterpriseTraitLibraryPage.featureValue')" name="choose">
          <div v-loading="loading_info" class="tab-wrapper">
            <ChoiceList
              :list="objectData.choice"
              :optionRow="props.objectRow"
              :onlyRead="onlyRead"
              ref="ChoiceListRef"
              @resetList="getDetail"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane :label="t('enterpriseTraitLibraryPage.prop')" name="prop">
          <el-scrollbar class="tab-wrapper">
            <div v-loading="loading_info" style="padding: 12px;">
              <OptionProp :objectData="objectData"/>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </template>
      <template v-if="objectRow.type==='Choice'">
        <el-tab-pane :label="t('enterpriseTraitLibraryPage.detailInfo')" name="info">
          <el-scrollbar class="tab-wrapper">
            <div v-loading="loading_info" style="padding: 12px;">
              <ChoiceProp :objectData="objectData"/>
            </div>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane :label="t('enterpriseTraitLibraryPage.usage')" name="state">
          <el-scrollbar class="tab-wrapper">
            <div style="padding: 12px;">
              <pt-collapse id="allocationList" :title="t('enterpriseTraitLibraryPage.assignedObjects')">
                <AllocationList v-loading="loading_usage" :list="lists.allocationList" ref="AllocationListRef" />
              </pt-collapse>
              <!-- <pt-collapse id="optionSetList" :title="t('enterpriseTraitLibraryPage.usedFeatureSets')">
                <OptionSetList v-loading="loading_usage" :list="lists.usedByOptionSet" ref="OptionSetListRef" />
              </pt-collapse> -->
              <pt-collapse id="ruleList" :title="t('enterpriseTraitLibraryPage.usedSelectionRules')">
                <RuleList v-loading="loading_usage" :list="lists.ruleList" ref="RuleListRef" />
              </pt-collapse>
              <!-- <pt-collapse id="aliasList" :title="t('enterpriseTraitLibraryPage.useduFollowingAliases')">
                <AliasList v-loading="loading_usage" :list="lists.aliasList" ref="AliasListRef" />
              </pt-collapse> -->
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </template>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import OptionList from "./optionList.vue";
import PtCollapse from '@/components/ptCollapse/index.vue'
import OptionProp from '@/views/traitManage/traitDetail/components/optionDetail/components/optionProp.vue'
import ChoiceList from '@/views/traitManage/traitDetail/components/optionDetail/components/choiceList.vue'
import ChoiceProp from '@/views/traitManage/traitDetail/components/choiceDetail/components/choiceProp.vue'
import AllocationList from '@/views/traitManage/traitDetail/components/usage/components/allocationList.vue'
import OptionSetList from '@/views/traitManage/traitDetail/components/usage/components/optionSetList.vue'
import RuleList from '@/views/traitManage/traitDetail/components/usage/components/ruleList.vue'
import AliasList from '@/views/traitManage/traitDetail/components/usage/components/aliasList.vue'
import SetProp from '@/views/traitManage/traitDetail/components/optionDetail/components/setProp.vue'
import { SelectInterface } from "@/interface/common"
import { getChoiceUsage, getObjectInfo } from "@/api/traitManage/enterpriseTraitLibrary";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {
      type: ''
    }
  },
  topObject: {
    type: Object,
    default: {
      sOid: ''
    }
  },
  onlyRead: {
    type: Boolean,
    default: false
  },
  // 产品分类
  productTypeList: {
    type: Array as () => SelectInterface[],
    default: () => []
  }
})
const emits = defineEmits(["getLayerBomList"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

//#region 标签页
const activeName = ref('option')
// 获取详情
const getDetail = () => {
  console.log('getDetail', props.objectRow);
  nextTick(() => {
    if (props.objectRow.type === 'Product') {
      activeName.value = 'option'
      instance.refs.OptionListRef.getList()
    } else if (props.objectRow.type === 'Group') {
      activeName.value = 'option'
      instance.refs.OptionListRef.getList()
    } else if (props.objectRow.type === 'Option') {
      activeName.value = 'choose'
      getObjectData()
    } else if (props.objectRow.type === 'Choice') {
      activeName.value = 'info'
      getObjectData()
      getUseState()
    } else if (props.objectRow.type === 'OptionSet') {
      activeName.value = 'prop'
      getObjectData()
      instance.refs.OptionListRef.getList()
    }
  })
}
// 获取对象详情
const loading_info = ref(false)
const objectData = ref<any>({})
const getObjectData = () => {
  loading_info.value = true
  let params: any = {
    oid: props.objectRow.oid,
  }
  if (props.objectRow.type === "Option" && props.topObject.oid) params.pid = props.topObject.oid
  getObjectInfo(params).then(data => {
    if (props.objectRow.type === "Option") {
      data.data?.choice?.forEach((ele: any) => {
        if (ele.simpleName === '-') ele.simpleName = ''  // 简化名称'-'显示空
      })
    } else if (props.objectRow.type === "Choice") {
      if (data.data.simpleName === '-') data.data.simpleName = ''  // 简化名称'-'显示空
    }
    objectData.value = data.data
  })
  .finally(() => loading_info.value = false)
}
// 获取使用详情
const loading_usage = ref(false)
const lists = ref<any>({})
const getUseState = () => {
  loading_usage.value = true
  getChoiceUsage({ oid: props.objectRow.oid }).then(data => {
    lists.value = data.data
  })
  .finally(() => loading_usage.value = false)
}
//#endregion

defineExpose({
  getDetail
})
</script>

<style lang="scss" scoped>
.tab-wrapper {
  position: relative;
  top: -1px;
  height: calc(var(--v3-container-height) - 94px);
}
</style>
