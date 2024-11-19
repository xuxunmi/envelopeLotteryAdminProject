<template>
  <el-dialog
    v-model="dialog.visible"
    :title="t('forwardTypePage.historyList_title')"
    draggable
    overflow
    width="90%"
  >
    <div v-loading="loading">
      <el-button
        type="primary"
        size="small"
        @click="goCompare"
        style="margin-bottom: 12px;"
      >{{ t('forwardTypePage.historyList_compare') }}</el-button>
      <el-table
        ref="tableRef"
        :data="tableData"
        size="small"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="40"
        />
        <el-table-column
          prop="Number"
          :label="t('forwardTypePage.historyList_number')"
          width="130"
        />
        <el-table-column
          prop="Name"
          :label="t('forwardTypePage.historyList_name')"
          width="220"
        />
        <el-table-column
          prop="Version"
          :label="t('forwardTypePage.historyList_version')"
          width="110"
        />
        <el-table-column
          prop="ContactForm"
          :label="t('forwardTypePage.historyList_ContactForm')"
        />
        <el-table-column
          prop="DevelopmentMaturity"
          :label="t('forwardTypePage.historyList_DevelopmentMaturity')"
          width="100"
        />
        <el-table-column
          prop="Edition"
          :label="t('forwardTypePage.historyList_Edition')"
        />
        <el-table-column
          prop="State"
          :label="t('forwardTypePage.historyList_state')"
        />
        <el-table-column
          prop="Modifier"
          :label="t('forwardTypePage.historyList_Modifier')"
        />
        <el-table-column
          prop="LatestUpdateTime"
          :label="t('forwardTypePage.historyList_LatestUpdateTime')"
          width="155"
        />
      </el-table>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, getCurrentInstance, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus"
import { getMaterialHistory } from '@/api/bomList'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: ''
    }
  },
})
const emits = defineEmits(["goChoose"])
const loading = ref(false)
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
onMounted(() => {
  init()
})
//#endregion

const tableData = ref([])
const multipleSelection = ref([])
// 初始化
const init = () => {
  getList()
}
// 获取列表
const getList = () => {
  console.log(props.dialog.row);
  loading.value = true
  let params = {
    materialNumber: props.dialog.row.materialNumber,
    partOid: props.dialog.row.partOid
  }
  getMaterialHistory(params).then((data: any) => {
    console.log(data);
    tableData.value = data.historyList
    loading.value = false
  }).catch(err => {
    loading.value = false
    tableData.value = []
  })
}
const handleSelectionChange = (val: any) => {
  if (val.length <= 2) {
    multipleSelection.value = val;
  } else {
    const rows = val.shift()
    instance.refs.tableRef.toggleRowSelection(rows)
    // ElMessage.error('最多可以选择两条数据！')
  }
}
// 版本比较
const goCompare = () => {
  if (multipleSelection.value.length === 2) {
    emits('goChoose', multipleSelection.value)
    props.dialog.visible = false
  } else {
    ElMessage.error(t('forwardTypePage.tip_compare'))
  }
}
</script>
<style lang="scss" scoped>
:deep(.el-table__header-wrapper .el-checkbox) {
  display: none;
}
</style>
