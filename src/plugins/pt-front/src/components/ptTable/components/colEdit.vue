<template>
  <div
    ref="colEditRef"
    class="colEdit"
    @click.stop
  >
    <template v-if="type==='select'">
      <el-select
        class="colEdit-select"
        ref="selectRef"
        v-bind="controlPropConfig"
        v-model="value"
        :size="(size as any)"
        placeholder=""
        @change="input"
      >
        <el-option
          v-for="item in (options as any[])"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </template>
    <template v-else-if="type==='number'">
      <el-input-number
        class="colEdit-number"
        ref="numberRef"
        v-bind="controlPropConfig"
        v-model="value"
        :size="(size as any)"
        :controls="false"
        @change="input"
      />
    </template>
    <template v-else>
      <el-input
        class="colEdit-text"
        ref="InputRef"
        v-bind="controlPropConfig"
        v-model="value"
        placeholder=""
        :size="(size as any)"
        @input="input"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';

//#region 参数和方法
defineOptions({
  name: "colEdit",
  inheritAttrs: false
})
const props = defineProps({
  afterEditInline: {
    type: Function,
    default: () => {}
  },
  showEditInline: {
    type: Function,
    default: () => {}
  },
  type: {
    type: String,
    default: 'text'
  },
  options: {
    type: Array,
    default: []
  },
  row: {
    type: Object,
    default: {}
  },
  prop: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: ''
  },
  controlPropConfig: {
    type: Object,
    default: {}
  },
})
const emits = defineEmits(['update:modelValue'])
const instance: any = getCurrentInstance()
onBeforeMount(() => {
  if (props.showEditInline) {
    const options = {
      ...props,
      oldValue: modelValue
    }
    props.showEditInline(options)
  }
})
onMounted(() => {
  // console.log('props', props);
  if (instance.refs.InputRef) instance.refs.InputRef.focus()
  if (instance.refs.selectRef) instance.refs.selectRef.focus()
})
onBeforeUnmount(() => {
  if (props.afterEditInline) {
    const options = {
      ...props,
      oldValue: modelValue
    }
    props.afterEditInline(options)
  }
})
//#endregion

//#region 行内编辑
const modelValue = instance?.attrs.modelValue
const value = ref<any>(instance?.attrs.modelValue)
// const options = ref<any[]>([]) // 下拉选项
const input = (value: any) => {
  emits('update:modelValue', value)
}
//#endregion

// 向外暴露方法
defineExpose({
  row: props.row
})
</script>
<style lang='scss' scoped>
.colEdit {
  display: inline-flex;
  width: 100%;
}
</style>
  