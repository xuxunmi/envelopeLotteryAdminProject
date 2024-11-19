<template>
  <div class="selectTab">
    <PartList
      ref="PartListRef"
      :objectRow="objectRow"
      :onlyRead="onlyRead"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue"
import PartList from "./partList.vue";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {
      type: ''
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
//#endregion


</script>

<style lang="scss" scoped>
.selectTab {
  height: 100%;
}
</style>
