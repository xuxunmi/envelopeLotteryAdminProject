<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    top="50px"
    width="1000px"
    append-to-body
  >
    <div class="choosePartDialog">
      <PartList
        ref="PartListRef"
        type="choose"
        :objectRow="objectRow"
        @startLoading="startLoading"
        @endLoading="endLoading"
      />
    </div>
    <template #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import PartList from './partList.vue'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: ''
    }
  },
  objectRow: {
    type: Object,
    default: {}
  },
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)

// 确认
const submit = () => {
  const row = instance.refs.PartListRef.chooseRow
  console.log('submit', instance.refs.PartListRef.chooseRow);
  if (!row) {
    ElMessage.warning('请选择一个物料！')
    return false
  }
  emits('handleEditSuccess', row)
}
//#endregion

//#region 物料列表
const startLoading = () => loading.value = true
const endLoading = () => loading.value = false
//#endregion

</script>
<style lang="scss" scoped>
.choosePartDialog {
  height: calc(100vh - 268px);
}
</style>
