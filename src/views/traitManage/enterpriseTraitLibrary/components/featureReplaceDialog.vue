<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="500px"
    draggable
    overflow
  >
    <div v-loading="loading" class="editGroupDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-position="left"
      >
        <el-form-item label="替换前" prop="value1">
          <el-input v-model="formData.value1" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="替换后" prop="value2">
          <el-input v-model="formData.value2" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button
        type="primary"
        @click="dialog.visible=false"
        size="small"
      >{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus"
import { getFeatureTree } from "@/api/traitManage/enterpriseTraitLibrary";
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
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  value1: '',
  value2: '',
})
const rules = reactive<FormRules>({
  value1: [{ required: true, message: "请输入替换前", trigger: "blur" }],
  value2: [{ required: true, message: "请输入替换后", trigger: "blur" }],
})
const valueList = ref([])
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      // loading.value = true
      // addOptionChoiceGroup(formData).then(data => {
      //   ElMessage.success('替换成功')
      //   emits('handleEditSuccess')
      // })
      // .finally(() => loading.value = false)
    }
  })
}
const getData = () => {
  console.log('row', props.dialog.row);
  loading.value = true
  getFeatureTree({ oid: props.dialog.row.oid }).then((data: any) => {
    valueList.value = data.data || []
    let list: any[] = []
    valueList.value.forEach((ele: any) => list.push(ele.name))
    formData.value1 = list.join('\n')
  })
  .finally(() => loading.value = false)
}
getData()
//#endregion

</script>
<style lang="scss" scoped>
</style>
