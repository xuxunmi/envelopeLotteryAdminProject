<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="600px"
    draggable
    overflow
  >
    <div
      v-loading="loading"
      class="editGroupDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-position="left"
      >
        <el-form-item :label="t('enterpriseTraitLibraryPage.name')" prop="name">
          <el-input v-model="formData.name" />
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
import { addOptionChoiceGroup } from "@/api/traitManage/enterpriseTraitLibrary";
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
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  oid: '',
  name: '',
  pid: ''
})
const rules = reactive<FormRules>({
  name: [{ required: true, message: t("enterpriseTraitLibraryPage.enterName"), trigger: "blur" }],
})
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      addOptionChoiceGroup(formData).then(data => {
        if (props.dialog.type === 'add') {
          ElMessage.success(t("enterpriseTraitLibraryPage.addSuccess"))
        } else if (props.dialog.type === 'edit') {
          ElMessage.success(t("enterpriseTraitLibraryPage.editSuccess"))
        }
        emits('handleEditSuccess')
      })
      .finally(() => loading.value = false)
    }
  })
}
// 获取数据
const getData = () => {
  const row = JSON.parse(JSON.stringify(props.dialog.row))
  if (props.dialog.type === 'add') {
    Object.assign(formData, {
      pid: row.oid,
    })
  } else if (props.dialog.type === 'edit') {
    Object.assign(formData, {
      oid: row.oid,
      name: row.name,
      pid: row.pid,
    })
  }
}
getData()
//#endregion

</script>
<style lang="scss" scoped>
</style>
