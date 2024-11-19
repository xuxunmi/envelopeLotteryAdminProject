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
        <el-form-item :label="t('enterpriseTraitLibraryPage.name')" prop="names">
          <el-input v-model="formData.names" type="textarea" :rows="6" placeholder="多个特征值请用换行分隔" />
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
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { addBatchChoice } from "@/api/traitManage/enterpriseTraitLibrary";
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
const formData = ref<any>({
  pid: props.dialog.row.oid,  // 父id
  oid: "", // 为空就是新增
  names: [],
  desc: "", // 说明
  isDefault: false, // 是否默认值
})
const rules = reactive<FormRules>({
  names: [{ required: true, message: t('enterpriseTraitLibraryPage.enterName'), trigger: "blur" }],
})
// 确认
const submit = () => {
  // console.log('submit', formData.value);
  formRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      const names = formData.value.names.split('\n')
      const params = {
        ...formData.value,
        names
      }
      addBatchChoice(params).then(data => {
        ElMessage.success('新建成功！')
        emits('handleEditSuccess')
      })
      .finally(() => loading.value = false)
    }
  })
}
//#endregion

</script>
<style lang="scss" scoped>
</style>
