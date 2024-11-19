<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    top="17vh"
    width="600px"
    draggable
    overflow
  >
    <div v-loading="loading" class="configNumberDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-position="left"
      >
        <el-form-item label="大类" prop="value1">
          <el-input v-model="formData.value1" disabled />
        </el-form-item>
        <el-form-item label="中类" prop="value2">
          <el-select v-model="formData.value2" @change="handleSelectChange">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="流水码" prop="value3">
          <el-input v-model="formData.value3" maxlength="4" />
        </el-form-item>
        <el-form-item label="编码值预览">
          <div v-if="number" class="numberBox">{{ number }}</div>
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
import { ref, reactive, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus"
import { getChoiceNextCode } from "@/api/traitManage/enterpriseTraitLibrary"
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
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

// 编号
const number = computed(() => formData.value1 + formData.value2 + formData.value3)

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  value1: 'V',
  value2: '',
  value3: '',
})
const rules = reactive<FormRules>({
  value1: [{ required: true, message: '请选择大类！', trigger: "change" }],
  value2: [{ required: true, message: '请选择中类！', trigger: "change" }],
  value3: [
    { required: true, message: '请输入流水码！', trigger: "blur" },
    { min: 4, max: 4, message: '请输入4位流水码！', trigger: 'blur' }
  ],
})
const options = ref([
  { value: '00', label: '平衡重叉车' },
  { value: '03', label: '滑移装载机' },
  { value: '05', label: '压路机' },
  { value: '06', label: '履带式挖掘机' },
  { value: '08', label: '轮式装载机' },
])
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      emits('handleEditSuccess', number.value)
    }
  })
}
const handleSelectChange = (val: any) => {
  if (formData.value2) {
    loading.value = true
    const prefix = formData.value1 + formData.value2
    getChoiceNextCode({ prefix }).then(data => {
      formData.value3 = data.data
    })
    .finally(() => loading.value = false)
  }
}
//#endregion

</script>
<style lang="scss" scoped>
.numberBox {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
