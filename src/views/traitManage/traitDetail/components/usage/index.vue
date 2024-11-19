<template>
  <div class="detail" ref="detailRef">
    <el-scrollbar>
      <div class="point">
        <el-button type="success" @click="pointClick('allocationList')" link>{{ t('traitDetailPage.allocationSituation') }}</el-button>
        <!-- <el-button type="success" @click="pointClick('optionSetList')" link>{{ t('traitDetailPage.featureSet') }}</el-button> -->
        <el-button type="success" @click="pointClick('ruleList')" link>{{ t('traitDetailPage.selectionRules') }}</el-button>
        <!-- <el-button type="success" @click="pointClick('aliasList')" link>{{ t('traitDetailPage.alias') }}</el-button> -->
      </div>
    </el-scrollbar>
    <el-scrollbar height="calc(var(--v3-container-height) - 124px)">
      <div class="list-wrapper">
        <pt-collapse id="allocationList" :title="t('enterpriseTraitLibraryPage.assignedObjects')">
          <AllocationList :list="lists.allocationList" ref="AllocationListRef" />
        </pt-collapse>
        <!-- <pt-collapse id="optionSetList" :title="t('enterpriseTraitLibraryPage.usedFeatureSets')">
          <OptionSetList :list="lists.usedByOptionSet" ref="OptionSetListRef" />
        </pt-collapse> -->
        <pt-collapse id="ruleList" :title="t('enterpriseTraitLibraryPage.usedSelectionRules')">
          <RuleList :list="lists.ruleList" ref="RuleListRef" />
        </pt-collapse>
        <!-- <pt-collapse id="aliasList" :title="t('enterpriseTraitLibraryPage.useduFollowingAliases')">
          <AliasList :list="lists.aliasList" ref="AliasListRef" />
        </pt-collapse> -->
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted, reactive } from "vue"
import { ElMessage } from "element-plus"
import PtCollapse from '@/components/ptCollapse/index.vue'
import AllocationList from './components/allocationList.vue'
import OptionSetList from './components/optionSetList.vue'
import RuleList from './components/ruleList.vue'
import AliasList from './components/aliasList.vue'
import { getChoiceUsage } from "@/api/traitManage/enterpriseTraitLibrary";
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
    data: {
        type: Object,
        default: {
          oid: '',
          type: ''
        }
    },
})
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
onMounted(() => {
  getList(props.data.oid)
})
//#endregion

// 锚点点击
const pointClick = (name: string) => {
    const el = instance.refs.detailRef.querySelector(`#${name}`) as HTMLDivElement
    console.log('pointClick', el);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

// 获取列表
const lists = ref<any>({})
const getList = (oid: string) => {
  getChoiceUsage({ oid }).then(data => {
    lists.value = data.data
  })
}


</script>

<style lang="scss" scoped>
.detail {
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
