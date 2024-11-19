<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="600px"
    draggable
    overflow
    align-center
  >
    <div class="batchAttributeSettingsDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        size="small"
      >
        <el-form-item label="属性项" prop="prop">
          <el-select
            v-model="formData.prop"
            placeholder="请选择"
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="formData.prop === 'isCropping'">
          <el-form-item label="值" prop="value">
            <el-checkbox
              v-model="formData.value"
              true-value="是"
              false-value="否"
              style="width: 100%;"
            />
          </el-form-item>
        </template>
        <template v-else-if="formData.prop === 'Amount'">
          <el-form-item label="值" prop="value">
            <el-input-number
              v-model="formData.value"
              :min="0"
              :precision="5"
              style="width: 260px;"
            />
          </el-form-item>
        </template>
        <template v-else-if="formData.prop === 'remark'">
          <el-form-item label="值">
            <el-input v-model="formData.value" placeholder="请输入" />
          </el-form-item>
        </template>
        <template v-else-if="formData.prop === 'location'">
          <el-form-item label="值" prop="value">
            <el-select v-model="formData.value" placeholder="请选择" >
              <el-option
                v-for="item in optionLocation"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="值" prop="value">
          </el-form-item>
        </template>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="submit(formRef)"
        size="small"
      >{{ t("dashboardPage.confirm")}}</el-button>
      <el-button
        type="primary"
        @click="dialog.visible=false"
        size="small"
      >{{ t("dashboardPage.cancel") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, type PropType } from "vue";
import { FormInstance, FormRules } from 'element-plus'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      rows: null,
    }
  },
  optionLocation: {
    type: Array as PropType<any[]>,
    default: []
  },
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
//#endregion

const submit = (formEl: FormInstance | undefined) => {
  let flag = checkEdit()
  if (!formEl || !flag) return
  formEl.validate((valid) => {
    if (valid) {
      emits('handleEditSuccess', formData)
    }
  })
}
// 校验能否编辑
const checkEdit = () => {
  let rows: any[] = []
  if (formData.prop === 'isCropping') {
    // 在BOM高级编辑，如果设置了不允许裁剪的物料的时候，特别是批量属性设置时，要弹框提示：（编码名称）设置了裁剪设置，请检查。
    props.dialog.rows?.forEach((ele: any) => {
      if (!ele.isCroppingCanEdit) rows.push(ele)
    });
  }
  if (rows.length) {
    let errors = rows.map(item => `(${item.Number}, ${item.Name})`)
    ElMessageBox.alert(`${errors.join('')}不允许设置裁剪，请检查!`, '提示', {
      confirmButtonText: '确认',
      type: 'error',
      center: true,
    })
    return false
  } else {
    return true
  }

}

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  prop: '', // 属性项
  value: '' as any, // 值
})
const rules = reactive<FormRules>({
  prop: [{ required: true, message: "请选择属性项！", trigger: "change" }],
  value: [{ required: true, message: "请选择值！", trigger: ["blur", "change"] }],
})
const options = [
  { label: '裁剪', value: 'isCropping' },
  { label: '数量', value: 'Amount' },
  { label: 'BOM备注', value: 'remark' },
  { label: '工位', value: 'location' },
]
const handleSelectChange = (val: string) => {
  switch (val) {
    case 'isCropping':
      formData.value = '是'
      break;
    case 'Amount':
      formData.value = 1
      break;
    case 'remark':
      formData.value = ''
      break;
    case 'location':
      formData.value = ''
      break;

    default:
      break;
  }
}
//#endregion

</script>
<style lang="scss" scoped>
.batchAttributeSettingsDialog {
  height: 200px;
}
</style>
