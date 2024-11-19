<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="600px"
    draggable
    overflow
  >
    <div class="editRuleDialog fromWrapper">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-position="left"
      >
        <el-form-item label="时间维度" prop="timeDimension">
          <el-select v-model="formData.timeDimension">
              <el-option
                v-for="item in timeDimension"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
          </el-select>
        </el-form-item>
        <template v-if="formData.timeDimension===1">
          <el-form-item label="起始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="截止时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </template>
        <el-form-item label="达到数量" prop="standardNumber">
          <el-input-number
            v-model="formData.standardNumber"
            :min="0"
            :max="999999999999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <span>说明：整机配置方案在时间段内达{{ formData.standardNumber }}台则标记为通用产品</span>
    </div>
    <template #footer>
      <el-button
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
import { getGeneralRule, editGeneralRule } from '@/api/orderManage/generalProductLibrary'
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
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  oidStr: '',
  timeDimension: '',  // 时间维度
  startTime: '',  // 起始时间
  endTime: '',  // 截止时间
  standardNumber: 0,  // 达到数量
})
const rules = reactive<FormRules>({
  timeDimension: [{ required: true, message: '请选择时间维度！', trigger: "change" }],
  startTime: [{ required: true, message: '请选择起始时间！', trigger: ["change", "blur"] }],
  endTime: [{ required: true, message: '请选择截止时间！', trigger: ["change", "blur"] }],
  standardNumber: [{ required: true, message: '请输入达到数量！', trigger: "blur" }],
})
// 时间维度
const timeDimension = ref([
  { value: 1, label: '时间段' },
  { value: 2, label: '上一年' },
  { value: 3, label: '上一季度' },
  { value: 4, label: '上一月' },
  { value: 5, label: '上一日' },
])
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      editGeneralRule(formData).then(data => {
        ElMessage.success('修改成功！')
        emits('handleEditSuccess')
      })
    }
  })
}
// 获取数据
const getData = () => {
  getGeneralRule().then(data => {
    console.log('getGeneralRule', data);
    Object.assign(formData, {
      oidStr: data.data.oidStr,
      timeDimension: data.data.timeDimension,  // 时间维度
      startTime: data.data.startTime,  // 起始时间
      endTime: data.data.endTime,  // 截止时间
      standardNumber: data.data.standardNumber || 0,  // 达到数量
    })
  })
}
getData()
//#endregion

</script>
<style lang="scss" scoped>
.editRuleDialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
