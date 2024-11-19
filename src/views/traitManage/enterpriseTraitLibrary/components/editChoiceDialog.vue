<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="800px"
    draggable
    overflow
  >
    <div v-loading="loading" class="editChoiceDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-width="60px"
        label-position="left"
      >
        <el-form-item :label="t('enterpriseTraitLibraryPage.name')" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item :label="t('enterpriseTraitLibraryPage.explain')">
          <el-input v-model="formData.desc" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="简化名称">
          <el-input v-model="formData.simpleName" />
        </el-form-item>
        <el-form-item label="默认值">
          <el-checkbox v-model="formData.isDefault" label="" />
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
import { ElMessage, type Action } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { addOrUpdateChoice } from "@/api/traitManage/enterpriseTraitLibrary";
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
const value1 = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<any>({
  pid: "",  // 父id
  oid: "", // 为空就是新增，存在就修改
  name: "",
  desc: "", // 说明
  isDefault: false, // 是否默认值
  simpleName: '', // 简化名称
})
const rules = reactive<FormRules>({
  name: [{ required: true, message: t('enterpriseTraitLibraryPage.enterName'), trigger: "blur" }],
})
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      const params = { ...formData.value }
      // 简化名称如果为空则传'-'
      if (!params.simpleName) params.simpleName = '-'
      addOrUpdateChoice(params).then((res: any) => {
        if (res.resultCode == 200) {
            if (props.dialog.type === 'add') {
                ElMessage.success(t("enterpriseTraitLibraryPage.addSuccess"))
            } else if (props.dialog.type === 'edit') {
                ElMessage.success(t("enterpriseTraitLibraryPage.editSuccess"))
            }
            emits('handleEditSuccess', formData.value)
        } else {
            ElMessageBox.alert(res.message || t("pdmServers.interfaceError"), '提示', {
              confirmButtonText: '确认',
              type: 'error',
              center: true,
            })
        }
      })
      .finally(() => loading.value = false)
    }
  })
}
// 获取数据
const getData = () => {
  const row = JSON.parse(JSON.stringify(props.dialog.row))
  if (props.dialog.type === 'add') {
    formData.value.pid = row.oid
  } else if (props.dialog.type === 'edit') {
    formData.value = {
      pid: row.pid,
      oid: row.oid,
      name: row.name,
      desc: row.desc,
      isDefault: row.isDefault,
      simpleName: row.simpleName,
    }
  }
}
getData()
//#endregion

</script>
<style lang="scss" scoped>
</style>
