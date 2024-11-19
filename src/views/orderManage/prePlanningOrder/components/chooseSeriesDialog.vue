<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    :close-on-click-modal="false"
    align-center
    width="90%"
    draggable
    overflow
  >
    <div v-loading="loading" class="chooseSeriesDialog">
      <PList
        ref="PListRef"
        class="p_list"
        type="choose"
        @handleProductClick="handleProductClick"
        @handleProductDblclick="handleProductDblclick"
      />
    </div>
    <template #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        size="small"
      >确定</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import PList from "@/views/bomManage/productBom/components/pList.vue"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

const submit = () => {
  if (!topObject.value.PartOid) {
    ElMessage.error('请选择一个系列！')
    return false
  }
  emits('handleEditSuccess', topObject.value)
}

//#region PList
const topObject = ref({
    PartOid: "",
    Number: ""
})
const handleProductClick = (row: any) => {
    topObject.value = {
      ...row,
      oid: row.PartOid
    }
}
const handleProductDblclick = (row: any) => {
  handleProductClick(row)
  emits('handleEditSuccess', topObject.value)
}
//#endregion

</script>
<style lang="scss" scoped>
.chooseSeriesDialog {
  :deep(.pt-table) {
    height: calc(100vh - 240px);
  }
  :deep(.p_list) {
    .el-select {
      width: 180px;
    }
  }
}
</style>
