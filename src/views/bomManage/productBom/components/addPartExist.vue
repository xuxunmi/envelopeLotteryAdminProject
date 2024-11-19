<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    width="660px"
  >
    <div class="addPartExist">
      <div class="fromWrapper">
        <el-form
          :model="formData"
          size="small"
          label-width="40px"
          inline
        >
          <!-- <el-form-item label="搜索">
            <el-select v-model="formData.value1">
              <el-option label="所有适用类型" value="所有适用类型" />
            </el-select>
          </el-form-item> -->
          <el-form-item :label="t('productBomPage.PartNumber')">
            <el-input
              v-model="formData.PartNumber"
              @keydown.enter="getList"
            />
          </el-form-item>
          <el-form-item :label="t('productBomPage.PartName')">
            <el-input
              v-model="formData.PartName"
              @keydown.enter="getList"
            />
          </el-form-item>
          <!-- <el-form-item label="成品">
            <el-select v-model="formData.value4">
              <el-option label="" value="" />
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
          <el-form-item label="可配置">
            <el-select v-model="formData.value5">
              <el-option label="" value="" />
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认追踪代码">
            <el-select v-model="formData.value6">
              <el-option label="" value="" />
              <el-option label="序列号" value="序列号" />
              <el-option label="批号" value="批号" />
              <el-option label="批号/序列号" value="批号/序列号" />
              <el-option label="未追踪" value="未追踪" />
            </el-select>
          </el-form-item> -->
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              @click="getList"
            >{{ t('dashboardPage.query') }}</el-button>
            <el-button
              size="small"
              @click="reset"
            >{{ t('dashboardPage.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="tableWrapper">
        <part-list ref="PartListRef" :formData="formData"/>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="submit" size="small">保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import PartList from "./partList.vue";
import { bomInsertPart } from "@/api/bomManage/productBom/index";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {}
    }
  },
})
const emits = defineEmits(["partRefresh"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

//#region 表单
const formData = ref({
  PartNumber: "",
  PartName: "",
  endItem: "是",
})
// 获取列表
const getList = () => {
  instance.refs.PartListRef.getList()
}
// 清除
const reset = () => {
  formData.value.PartName = ''
  formData.value.PartNumber = ''
}
// 确认
const submit = () => {
  const row = instance.refs.PartListRef.chooseRow
  console.log(row);
  if (row?.PartOid) {
    let params = {
      PartOid: row.PartOid,
      ParentPartOid: props.dialog.row.PartOid,
      findNumber: row.findNumber,
    }
    bomInsertPart(params).then(data => {
      ElMessage.success(t('productBomPage.insertSuccessful'))
      props.dialog.visible = false
      emits('partRefresh')
    })
  } else {
    ElMessage.warning(t('productBomPage.selectData'))
  }
}
//#endregion

</script>
<style lang="scss" scoped>
</style>
