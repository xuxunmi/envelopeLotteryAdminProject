<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    :close-on-click-modal="false"
    align-center
    draggable
    overflow
    width="90%"
  >
    <div v-loading="loading" :element-loading-text="elementLoadingText" class="optionalDialog">
      <div class="optionalFormWrapper">
        <OptionalForm
          ref="OptionalFormRef"
          :partOid="dialog.row.PartOid"
          @startLoading="startLoading"
          @endLoading="endLoading"
        />
      </div>
    </div>
    <template #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        size="small">保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import OptionalForm from "@/views/orderManage/prePlanningOrder/components/optionalForm.vue";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: null
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

const submit = () => {
  const optionList = instance.refs.OptionalFormRef.optionList || []
  if (!optionList.length) {
    ElMessage.error('没有任何特征值，请确认！')
    return false
  }
  emits('handleEditSuccess', optionList)
}

//#region 配置表单
const elementLoadingText = ref<string>("")
  const startLoading = () => {
  loading.value = true
  elementLoadingText.value = "数据加载中..."
}
const endLoading = () => {
  loading.value = false
  elementLoadingText.value = ""
}
//#endregion

</script>
<style lang="scss" scoped>
.optionalDialog {
  min-height: 400px;
  .optionalFormWrapper {
    overflow: auto;
    max-height: calc(100vh - 200px);
  }
}
</style>
