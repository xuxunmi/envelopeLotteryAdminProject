<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="400px"
    draggable
    overflow
  >
    <div v-loading="loading" class="allocationOption">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
        label-position="left"
      >
        <el-form-item label="组" prop="groupOid">
          <el-select v-model="formData.groupOid" placeholder="">
            <el-option
              v-for="item in options"
              :key="item.oid"
              :label="item.name"
              :value="item.oid"
            />
          </el-select>
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
import { getOptionChoiceGroupList, allocationOptionToGroup } from "@/api/traitManage/enterpriseTraitLibrary";
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
  groupOid: '',
})
const rules = reactive<FormRules>({
  groupOid: [{ required: true, message: "必填项不能为空！", trigger: "change" }],
})
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      formData.oid = props.dialog.row.oid
      allocationOptionToGroup(formData).then(data => {
        ElMessage.success(t('enterpriseTraitLibraryPage.allocationSuccess'))
        emits('handleEditSuccess')
      })
      .finally(() => loading.value = false)
    }
  })
}
// 获取下拉
const options = ref<any[]>([
  // {
  //   "oid": "111",
  //   "name": "1111111",
  // },
  // {
  //   "oid": "222",
  //   "name": "2222222",
  // },
])
const getSelect = () => {
  const oid = props.topObject.oid
  getOptionChoiceGroupList({ oid }).then(data => {
    options.value = data.data
  })
}
getSelect()
// 获取数据
const getData = () => {
  const row = JSON.parse(JSON.stringify(props.dialog.row))
  Object.assign(formData, {
    oid: row.oid,
  })
}
getData()
//#endregion

</script>
<style lang="scss" scoped>
</style>
