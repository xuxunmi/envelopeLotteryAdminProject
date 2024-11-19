<template>
  <div class="detail" ref="detailRef">
    <el-scrollbar>
      <div class="point">
        <el-button type="success" @click="pointClick('convention')" link>{{ t('traitDetailPage.routine') }}</el-button>
        <el-button type="success" @click="pointClick('system')" link>{{ t('traitDetailPage.system') }}</el-button>
        <el-button type="success" @click="pointClick('choiceList')" link>{{ t('enterpriseTraitLibraryPage.featureValue') }}</el-button>
      </div>
    </el-scrollbar>
    <el-scrollbar height="calc(var(--v3-container-height) - 124px)">
      <div class="list-wrapper">
        <OptionProp :objectData="info"/>
        <pt-collapse id="choiceList" :title="t('enterpriseTraitLibraryPage.featureValue')">
          <ChoiceList :list="info.choice" onlyRead ref="ChoiceListRef" />
        </pt-collapse>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue"
import { ElMessage } from "element-plus"
import PtCollapse from '@/components/ptCollapse/index.vue'
import ChoiceList from './components/choiceList.vue'
import OptionProp from './components/optionProp.vue'
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
    info: {
        type: Object,
        default: {}
    },
})
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

// 锚点点击
const pointClick = (name: string) => {
    const el = instance.refs.detailRef.querySelector(`#${name}`) as HTMLDivElement
    console.log('pointClick', el);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
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
