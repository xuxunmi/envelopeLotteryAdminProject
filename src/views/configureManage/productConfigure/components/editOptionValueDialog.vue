<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    align-center
    width="600px"
  >
    <div v-loading="loading||dialog.loading" class="editOptionValueDialog">
      <el-table
        :data="tableData"
        border
        size="small"
        style="width: 100%"
        height="100%"
      >
        <el-table-column>
          <template #header>
            <span>{{ dialog.row?.name }}</span>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.checked"
              size="small"
              :label="row.name"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="默认值"
          align="center"
          width="65"
          >
          <template #default="{ row }">
            <el-checkbox
              v-model="row.isDefault"
              size="small"
              @change="(val) => handleCheckboxChange_default(val, row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button
        :loading="loading||dialog.loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue"
import { ElMessage } from "element-plus"
import { getOption } from "@/api/configureManage/productConfigure";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      loading: false
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
//#endregion

// 确认
const submit = () => {
    emits("handleEditSuccess", tableData.value || [])
}

//#region 特征值列表
const tableData = ref<any[]>([])
const getData = () => {
  console.log('getData', props.dialog.row, props.objectRow);
  const params = {
    oid: props.objectRow.PartOid,
    optionOid: props.dialog.row.oid,
    topOid: props.objectRow.topObjectOid,
  }
  loading.value = true
  getOption(params).then(data => {
    data.data.forEach((ele: any) => {
      if (ele.oid === params.optionOid) {
        tableData.value = ele.choice
      }
    })
  })
  .finally(() => loading.value = false)
}
getData()
const handleCheckboxChange_default = (val: any, choice: any) => {
  if (val) {
    tableData.value.forEach(ele => ele.isDefault = false)
    choice.isDefault = val
  }
}
//#endregion
</script>
<style lang="scss" scoped>
.tableWrapper {
    height: calc(100vh - 310px);
}
</style>
