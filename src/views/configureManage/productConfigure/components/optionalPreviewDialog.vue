<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="90%"
    draggable
    overflow
    align-center
  >
    <div v-loading="loading" :element-loading-text="elementLoadingText" class="optionalPreviewDialog">
      <div class="header">
        <el-button type="primary" size="small" icon="View" @click="handlePreviewBtn">预览</el-button>
      </div>
      <div class="optionalFormWrapper">
        <OptionalForm
          ref="OptionalFormRef"
          :partOid="dialog.row.PartOid"
          showColor
          @startLoading="startLoading"
          @endLoading="endLoading"
          @optionListChange="handleOptionListChange"
        />
      </div>

      <!-- 预览BOM弹窗 -->
      <dialogFrame :title="previewBomDialog.title" v-model:visible="previewBomDialog.visible" :footer="false" width="50%">
        <PreviewBomDialog
          v-if="previewBomDialog.visible"
          v-model:visible="previewBomDialog.visible"
          :objectRow="previewBomDialog.row"
          :optionList="optionList"
          @confirm-success="handleConfirmSuccess"
        />
      </dialogFrame>
    </div>
    <!-- <template #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template> -->
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import OptionalForm from "@/views/orderManage/prePlanningOrder/components/optionalForm.vue";
import dialogFrame from "@/components/dialogFrame/index.vue"
import PreviewBomDialog from "@/views/configureManage/applicationConfiguration/components/previewBomDialog.vue"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: true,
      title: '',
      row: null
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

const submit = () => {}

//#region 选配
// 刷新选配列表
const optionalShow = ref(false)
const elementLoadingText = ref<string>("")
const refresh_optional = () => {
  optionalShow.value = false
  nextTick(() => optionalShow.value = true)
}
const startLoading = () => {
  loading.value = true
  elementLoadingText.value = "数据加载中..."
}
const endLoading = () => {
  loading.value = false
  elementLoadingText.value = ""
}
const optionList = ref<any[]>([])
const handleOptionListChange = (list: any[]) => {
  optionList.value = list
}
//#endregion

//#region 预览 - 弹窗
const previewBomDialog = reactive({
  visible: false,
  title: '预览BOM',
  row: {}
})
// 处理预览按钮
const handlePreviewBtn = () => {
  console.log('handlePreviewBtn', props.dialog.row);
  Object.assign(previewBomDialog, {
    visible: true,
    row: {
      partOid: props.dialog.row.PartOid
    },
  })
}
const handleConfirmSuccess = () => {
  previewBomDialog.visible = false
}
//#endregion

</script>
<style lang="scss" scoped>
.optionalPreviewDialog {
  height: calc(100vh - 168px);
  .header {
    margin-bottom: 12px;
  }
  .optionalFormWrapper {
    max-height: calc(100vh - 218px);
    overflow: auto;
  }
}
</style>
