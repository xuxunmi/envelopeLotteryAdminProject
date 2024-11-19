<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    top="17vh"
    width="600px"
    align-center
    append-to-body
    draggable
    overflow
  >
      <div v-loading="loading" class="configNumberDialog">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            size="small"
            label-width="80"
          >
              <el-form-item label="大类" prop="bigNumber">
                  <el-input v-model="formData.bigNumber" disabled />
              </el-form-item>
              <el-form-item label="中类" prop="middleNumber">
                  <el-select
                    v-model="formData.middleNumber"
                    @change="handleSelectChange_middleNumber"
                    clearable
                  >
                      <el-option
                        v-for="item in options_middle"
                        :key="item.value"
                        :label="`${item.value} ${item.label}`"
                        :value="item.value"
                      />
                  </el-select>
              </el-form-item>
              <el-form-item label="流水码" prop="code">
                  <el-input v-model="formData.code" maxlength="5" :disabled="hasCode" />
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
          <el-button type="primary" @click="dialog.visible = false" size="small">{{ t("dashboardPage.cancel") }}</el-button>
      </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { getDocumentCode } from '@/api/bomManage/productBom'
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
  dialog: {
      type: Object,
      default: () => ({
          visible: false,
          title: "",
      })
  },
  advancedSearchPartParams: {
      type: Object,
      default: {}
  }
})
const emits = defineEmits(["handleEditSuccess"])
const { t } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const number = computed(() => formData.bigNumber + formData.middleNumber + formData.code) // 编号
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  bigNumber: "D", // 大类
  middleNumber: "", // 中类
  code: ""  // 流水码
})
const rules = reactive<FormRules>({
  bigNumber: [{ required: true, message: "必填项不能为空！", trigger: ["change", 'blur'] }],
  middleNumber: [{ required: true, message: "必填项不能为空！", trigger: "change" }],
  code: [
      { required: true, message: "必填项不能为空！", trigger: ["blur", "change"] },
      { min: 5, max: 5, message: "请输入5位流水码！", trigger: ["blur", "change"] }
  ]
})
const options_middle = ref([
  { value: "00", label: "平衡重叉车" },
  { value: "03", label: "滑移装载机" },
  { value: "05", label: "压路机" },
  { value: "06", label: "履带式挖掘机" },
  { value: "08", label: "轮式装载机" },
  { value: "15", label: "挖掘装载机" },
  { value: "20", label: "仓储式叉车" },
  { value: "30", label: "其他类叉车" }
])
// 确认
const submit = () => {
  formRef.value?.validate((valid) => {
      if (valid) {
          emits("handleEditSuccess", number.value)
      }
  })
}
// 生成流水码
const hasCode = ref(false)
const initSerialNumber = () => {
  formData.code = ''
  if (formData.middleNumber) {
    loading.value = true
    const params = {
      code: formData.bigNumber + formData.middleNumber
    }
    getDocumentCode(params).then(data => {
      if (data.data && data.data !== 'null') {
        formData.code = data.data
        hasCode.value = true
      } else {
        hasCode.value = false
      }
    })
    .finally(() => loading.value = false)
  }
}
// 中类选择回调
const handleSelectChange_middleNumber = (val: string) => {
  initSerialNumber()
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
