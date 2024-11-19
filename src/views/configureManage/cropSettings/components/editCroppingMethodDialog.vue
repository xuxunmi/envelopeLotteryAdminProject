<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    align-center
    draggable
    overflow
    width="600px"
  >
    <div v-loading="loading || dialog.loading" class="editCroppingMethodDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
      >
        <el-form-item label="裁剪方式：" prop="trimMethod">
          <el-select
            :loading="loading_select"
            v-model="formData.trimMethod"
            filterable
          >
            <el-option
              v-for="item in option_trim"
              :key="item.codeListNameC"
              :label="item.codeListNameC"
              :value="item.codeListNameC"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="submit"
        size="small"
        :loading="loading"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { editTrimMethodPart } from "@/api/configureManage/cropSettings"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      type: '',
      row: null,
      loading: false
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      if (props.dialog.type === 'add') {
        emits('handleEditSuccess', formData)
      } else if (props.dialog.type === 'edit') {
        loading.value = true
        editTrimMethodPart(formData).then(data => {
          // console.log('editTrimMethodPart', data);
          ElMessage.success('编辑成功！')
          emits('handleEditSuccess')
        })
        .finally(() => loading.value = false)
      }
    }
  })
}

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  number: props.dialog.row?.number || '',  // 物料编号
  trimMethod: props.dialog.row?.trimMethod || '',  // 裁剪方式
})
const rules = reactive<FormRules>({
  trimMethod: [{ required: true, message: "请选择裁剪方式！", trigger: "change" }],
})
//#endregion

//#region 字典数据
const loading_select = ref(false)
const option_trim = ref<any[]>([])  // 裁剪方式
loading_select.value = true
getDictionarySelect({ codes: "TRIM_METHOD" }).then(data => {
  option_trim.value = data.data.TRIM_METHOD || []
})
.finally(() => loading_select.value = false)
//#endregion

</script>
<style lang="scss" scoped></style>
