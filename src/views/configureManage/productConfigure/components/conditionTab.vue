<template>
  <div class="conditionTab">
    <div class="list conditionList">
      <ConditionList
        ref="ConditionListRef"
        :onlyRead="onlyRead"
        :objectRow="objectRow"
        @handleRowClick="handleRowClick_condition"
      />
    </div>
    <div v-show="list_expressions.length" class="list expressionEditList">
      <ExpressionEditList
        ref="ExpressionEditListRef"
        :objectRow="objectRow"
        onlyRead
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from "vue"
import ConditionList from "./conditionList.vue";
import ExpressionEditList from "./expressionEditList.vue"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {
      oid: '',  // 当前物料oid
      parentOid: '',  // 当前物料父级oid
      topObjectOid: '',  // 当前物料顶层系列oid
      Number: '',  // 编号
      ProductName: '',  // 组织名称
      Name: '',  // 名称
      materialType: '', // 物料类型
    }
  },
  onlyRead: {
      type: Boolean,
      default: false
  },
})
const emits = defineEmits(["getLayerBomList"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()

onMounted(() => {
  instance.refs.ConditionListRef.getList()
})
//#endregion

const list_expressions = ref<any[]>([])
const handleRowClick_condition = (row: any) => {
  try {
    list_expressions.value = JSON.parse(JSON.stringify(row.expressions || []))
    list_expressions.value.forEach((ele) => {
        ele.option = {
            oid: ele.optionOid,
            name: ele.optionName
        }
        ele.choice = []
        ele.choiceList?.forEach((choice: any) => {
            ele.choice.push({
                oid: choice.oid,
                name: choice.name
            })
        })
    })
    nextTick(() => instance.refs.ExpressionEditListRef.getList(list_expressions.value))
  } catch (error) {
    ElMessage.error('数据异常！')
  }
}
</script>

<style lang="scss" scoped>
.conditionTab {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  .list {
    height: 0;
    &.conditionList {
      flex: 3;
    }
    &.expressionEditList {
      flex: 2;
    }
  }
}
</style>
