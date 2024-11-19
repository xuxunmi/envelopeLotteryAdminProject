<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    width="400px"
  >
    <div class="addBaselineDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
      >
        <el-form-item label="名称：" prop="name">
          <el-input v-model="formData.name" placeholder="" />
        </el-form-item>
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
      >取消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus"
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
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  name: "",
})
const rules = reactive<FormRules>({
  name: [{ required: true, message: "请输入名称！", trigger: "blur" }],
})
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      // createPart(formData).then(data => {
      //   console.log(data);
      //   ElMessage.success('新建成功！')
      //   emits('handleEditSuccess')
      // })
    }
  })
}
//#endregion

</script>
<style lang="scss" scoped>
.baselineManageDialog {
  height: calc(86vh - 168px);
}
</style>
