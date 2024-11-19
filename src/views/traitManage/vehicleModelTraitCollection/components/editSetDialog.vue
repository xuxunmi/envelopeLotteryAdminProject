<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="600px"
    draggable
    overflow
  >
    <div class="editGroupDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-width="200"
        label-position="left"
      >
        <!-- <el-form-item v-if="dialog.type==='saveAs'" :label="t('vehicleModelTraitCollectionPage.pid')" prop="pid">
          <el-select v-model="formData.pid">
            <el-option
              v-for="item in options_name"
              :key="item.oid"
              :label="item.name"
              :value="item.oid"
            />
          </el-select>
        </el-form-item> -->
        <!-- <pt-collapse :title="t('vehicleModelTraitCollectionPage.attribute')"> -->
          <el-form-item :label="t('vehicleModelTraitCollectionPage.name')" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item :label="t('vehicleModelTraitCollectionPage.desc')" prop="desc">
            <el-input v-model="formData.desc" />
          </el-form-item>
          <el-form-item :label="t('vehicleModelTraitCollectionPage.supportExclusionOptionChoices')" prop="supportExclusionOptionChoices">
            <el-radio-group v-model="formData.supportExclusionOptionChoices">
              <el-radio :label="true">{{ t('vehicleModelTraitCollectionPage.yes') }}</el-radio>
              <el-radio :label="false">{{ t('vehicleModelTraitCollectionPage.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('vehicleModelTraitCollectionPage.supportItemChoiceFiltering')" prop="supportItemChoiceFiltering">
            <el-radio-group v-model="formData.supportItemChoiceFiltering">
              <el-radio :label="true">{{ t('vehicleModelTraitCollectionPage.yes') }}</el-radio>
              <el-radio :label="false">{{ t('vehicleModelTraitCollectionPage.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('vehicleModelTraitCollectionPage.supportEffectivityOnOptionChoices')" prop="supportEffectivityOnOptionChoices">
            <el-radio-group v-model="formData.supportEffectivityOnOptionChoices">
              <el-radio :label="true">{{ t('vehicleModelTraitCollectionPage.yes') }}</el-radio>
              <el-radio :label="false">{{ t('vehicleModelTraitCollectionPage.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('vehicleModelTraitCollectionPage.useExplicitChoiceRuleMembership')" prop="useExplicitChoiceRuleMembership">
            <el-radio-group v-model="formData.useExplicitChoiceRuleMembership">
              <el-radio :label="true">{{ t('vehicleModelTraitCollectionPage.yes') }}</el-radio>
              <el-radio :label="false">{{ t('vehicleModelTraitCollectionPage.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('vehicleModelTraitCollectionPage.manageLocalRuleChangesIndependently')" prop="manageLocalRuleChangesIndependently">
            <template v-if="dialog.type === 'add'||dialog.type === 'saveAs'">
              <el-radio-group v-model="formData.manageLocalRuleChangesIndependently">
                <el-radio :label="true">{{ t('vehicleModelTraitCollectionPage.yes') }}</el-radio>
                <el-radio :label="false">{{ t('vehicleModelTraitCollectionPage.no') }}</el-radio>
              </el-radio-group>
            </template>
            <template v-else>
              <span v-if="formData.manageLocalRuleChangesIndependently===true">{{ t('vehicleModelTraitCollectionPage.yes') }}</span>
              <span v-else-if="formData.manageLocalRuleChangesIndependently===false">{{ t('vehicleModelTraitCollectionPage.no') }}</span>
            </template>
          </el-form-item>
        <!-- </pt-collapse> -->
      </el-form>
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
import { addOrUpdateOptionSet, SaveAsOptionSet } from "@/api/traitManage/vehicleModelTraitCollection";
import { productList } from "@/api/productLibrary"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: ''
    }
  },
  topObject: {
    type: Object,
    default: {}
  }
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  // pid: '',
  oid: "",
  name: "",
  desc: "",
  supportExclusionOptionChoices: false, // 允许分配排除选择
  supportItemChoiceFiltering: false, // 允许将表达式分配给不可配置项
  supportEffectivityOnOptionChoices: false, // 允许选择的日期有效性
  useExplicitChoiceRuleMembership: false, // 自动参考选项汇聚规则
  manageLocalRuleChangesIndependently: false, // 独立于特征集管理局部规则更改
})
const rules = reactive<FormRules>({
  // pid: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_pid'), trigger: "change" }],
  supportExclusionOptionChoices: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_supportExclusionOptionChoices'), trigger: "change" }],
  supportItemChoiceFiltering: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_supportItemChoiceFiltering'), trigger: "change" }],
  supportEffectivityOnOptionChoices: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_supportEffectivityOnOptionChoices'), trigger: "change" }],
  useExplicitChoiceRuleMembership: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_useExplicitChoiceRuleMembership'), trigger: "change" }],
  manageLocalRuleChangesIndependently: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_manageLocalRuleChangesIndependently'), trigger: "change" }],
  name: [{ required: true, message: t('vehicleModelTraitCollectionPage.tip_name'), trigger: "blur" }],
})
// 获取下拉列表
const options_name = ref<any>([])
const getSelect = () => {
  productList().then(data => {
    console.log(data);
    options_name.value = data.data || []
  })
}
getSelect()
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      if (props.dialog.type === 'add' || props.dialog.type === 'edit') {
        addOrUpdateOptionSet(formData).then(data => {
          if (props.dialog.type === 'add') {
            ElMessage.success(t('vehicleModelTraitCollectionPage.addSuccess'))
          } else if (props.dialog.type === 'edit') {
            ElMessage.success(t('vehicleModelTraitCollectionPage.editSuccess'))
          }
          emits('handleEditSuccess', data.data)
        })
      } else {
        SaveAsOptionSet(formData).then(data => {
          ElMessage.success(t('vehicleModelTraitCollectionPage.saveAseditSuccess'))
          emits('handleEditSuccess', data.data)
        })
      }
    }
  })
}
// 获取数据
const getData = () => {
  const row = JSON.parse(JSON.stringify(props.dialog.row))
  if (props.dialog.type === 'edit') {
    Object.assign(formData, {
      oid: row.oid,
      name: row.name,
      // pid: row.productOid,
      desc: row.desc,
      supportExclusionOptionChoices: row.supportExclusionOptionChoices, // 允许分配排除选择
      supportItemChoiceFiltering: row.supportItemChoiceFiltering, // 允许将表达式分配给不可配置项
      supportEffectivityOnOptionChoices: row.supportEffectivityOnOptionChoices, // 允许选择的日期有效性
      useExplicitChoiceRuleMembership: row.useExplicitChoiceRuleMembership, // 自动参考选项汇聚规则
      manageLocalRuleChangesIndependently: row.manageLocalRuleChangesIndependently, // 独立于特征集管理局部规则更改
    })
  } else if (props.dialog.type === 'saveAs') {
    Object.assign(formData, {
      oid: '',
      soid: row.oid,
      name: '',
      // pid: row.productOid,
      desc: row.desc,
      supportExclusionOptionChoices: row.supportExclusionOptionChoices, // 允许分配排除选择
      supportItemChoiceFiltering: row.supportItemChoiceFiltering, // 允许将表达式分配给不可配置项
      supportEffectivityOnOptionChoices: row.supportEffectivityOnOptionChoices, // 允许选择的日期有效性
      useExplicitChoiceRuleMembership: row.useExplicitChoiceRuleMembership, // 自动参考选项汇聚规则
      manageLocalRuleChangesIndependently: row.manageLocalRuleChangesIndependently, // 独立于特征集管理局部规则更改
    })
  }
}
getData()
//#endregion

</script>
<style lang="scss" scoped>
</style>
