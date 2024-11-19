<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="700px"
    center
    draggable
    overflow
  >
    <div v-loading="loading" class="editSimplifyRulesDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
      >
        <el-form-item label="特征：">
          <span class="fromWrapper_text">{{ formData.featureName }}</span>
        </el-form-item>
        <el-form-item label="特征值：">
          <el-descriptions
            :column="1"
            size="small"
            style="width: 100%;"
          >
            <template v-for="(choice, index) in formData.featureValues">
              <el-descriptions-item :label="choice.featureKey">
                <el-form-item
                  label="简化名称："
                  :rules="[{ required: true, message: '请输入简化名称！', trigger: 'blur' }]"
                  :prop="`featureValues[${index}].featureValue`"
                >
                  <el-input v-model="choice.featureValue" clearable />
                </el-form-item>
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit(formRef)"
        size="small"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { ElMessage, type FormInstance } from "element-plus"
import { productNameRuleDetail, productNameRuleCreateOrEdit } from "@/api/configureManage/productNameSimplifyRules"
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

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  featureOid: '',
  featureName: '',
  featureValues: [] as any[]
})
const rules = reactive({
  code: [ { required: true, message: '请选择颜色分组！', trigger: 'blur' },],
})

// 确认
const submit = (formEl: FormInstance | undefined) => {
  console.log('submit', formData);
  formEl?.validate((valid) => {
    if (valid) {
      loading.value = true
      productNameRuleCreateOrEdit([formData]).then(data => {
        ElMessage.success('编辑成功！')
        emits('handleEditSuccess')
      })
      .finally(() => loading.value = false)
    }
  })
}
// 获取数据
const getData = () => {
  loading.value = true
  const params = {
    featureOidStr: props.dialog.row.featureOid
  }
  productNameRuleDetail(params).then(data => {
    Object.assign(formData, {
      featureOid: data.data.featureOid,
      featureName: data.data.featureName,
      featureValues: data.data.featureValues.map((item: any) => {
        return {
          featureValueOid: item.featureValueOid,
          featureValue: item.featureValue,
          featureKey: item.featureKey,
          oidStr: item.oidStr,
        }
      })
    })
  })
  .finally(() => loading.value = false)
}
getData()
//#endregion

</script>
<style lang="scss" scoped></style>
