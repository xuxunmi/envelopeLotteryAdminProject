<template>
  <div class="variableTab">
    <span class="pt-table-title">定义特征</span>
    <div class="list">
      <OptionList
        v-if="refreshFlag_option"
        ref="OptionListRef"
        from="variableTab"
        :objectRow="objectRow"
        @getList="getList_option"
        @refresh="refresh_option"
        :onlyRead="onlyRead"
      />
    </div>
    <span class="pt-table-title">模块内特征约束</span>
    <div class="list">
      <ConstraintList
        v-if="refreshFlag_rule"
        ref="ConstraintListRef"
        :objectRow="objectRow"
        @getList="getList_rule"
        @refresh="refresh_rule"
        :onlyRead="onlyRead"
      />
    </div>
    <span class="pt-table-title">父子模块特征约束</span>
    <div class="list" style="height: 70px;flex: initial;">
      <ConstraintList
        ref="ConstraintListRef2"
        isChild
        :objectRow="objectRow"
        :onlyRead="onlyRead"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue"
import OptionList from "./optionList.vue";
import ConstraintList from "./constraintList.vue";
import { getOptionListOfPart, getRuleListOfPart } from "@/api/configureManage/productConfigure";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {
      oid: '', // 物料oid
      isTop: '', // 是否顶部系列
      PartOid: '', // 物料oid
      Number: '', // 物料编码
      Name: '', // 物料名称
      ProductName: '', // 组织名称
    }
  },
  /**
   * 是否只读
   */
  onlyRead: {
    type: Boolean,
    default: false
  },
})
const emits = defineEmits(["getLayerBomList"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

//#region 特征列表
const refreshFlag_option = ref(true)
// 刷新列表
const refresh_option = () => {
  refreshFlag_option.value = false
  nextTick(() => {
    refreshFlag_option.value = true
    getList_option()
  })
}
// 获取特征列表
// const getList_option = () => {
//   loading_option.value = true
//   const oid = props.objectRow.oid
//   getOptionListOfPart({ oid }).then(data => {
//     instance.refs.OptionListRef.getList(data.data || [])
//   })
//   .finally(() => loading_option.value = false)
// }

const getList_option = async (): Promise<any> => {
  nextTick(() => instance.refs.OptionListRef.loading = true)
  try {
    const params = {
      oid: props.objectRow.oid,
      topOid: props.objectRow.topObjectOid,
    }
    const data = await getOptionListOfPart(params).then(data => {
      instance.refs.OptionListRef.getList(data.data || [])
      return data;
    })
    .finally(() => instance.refs.OptionListRef.loading = false);
    // 这里返回数据而不是更新子组件
    return data || {};
  } catch (error) {
    console.error('Error fetching option list:', error);
    return []; // 返回空数组以防止出错
  } finally {
    instance.refs.OptionListRef.loading = false;
  }
};


//#endregion

//#region 约束列表
const refreshFlag_rule = ref(true)
// 刷新列表
const refresh_rule = () => {
  refreshFlag_rule.value = false
  nextTick(() => {
    refreshFlag_rule.value = true
    getList_rule()
  })
}
// 获取约束列表
// const getList_rule = () => {
//   loading_rule.value = true
//   const oid = props.objectRow.oid
//   getRuleListOfPart({ oid }).then(data => {
//     instance.refs.ConstraintListRef.getList(data.data || [])
//   })
//   .finally(() => loading_rule.value = false)
// }

const getList_rule = async (): Promise<any> => {
  nextTick(() => instance.refs.ConstraintListRef.loading = true)
  const oid = props.objectRow.oid
  try {
    const data = await getRuleListOfPart({ oid }).then(data => {
      instance.refs.ConstraintListRef.getList(data.data || [])
      return data || {};
    })
    .finally(() => instance.refs.ConstraintListRef.loading = false)
    // 这里返回数据而不是更新子组件
    return data;
  } catch (error) {
    console.error('Error fetching option list:', error);
    return []; // 返回空数组以防止出错
  } finally {
    instance.refs.ConstraintListRef.loading = false;
  }
}
//#endregion

// 获取特征和约束数据并返回
const getAllData = async () => {
  try {
    const [optionData, ruleData] = await Promise.all([
      getList_option(),
      getList_rule()
    ])
    return {
      optionData,
      ruleData
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      optionData: [],
      ruleData: []
    }
  }
}

// 获取详情
const getDetail = () => {
  getList_option()
  getList_rule()
}
getDetail()

// 暴露 getAllData 方法
defineExpose({
  getAllData
})

</script>

<style lang="scss" scoped>
.variableTab {
  height: 100%;
  display: flex;
  flex-direction: column;
  .list {
    flex: 1;
    height: 0;
  }
}
</style>
