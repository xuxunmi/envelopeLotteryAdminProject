<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    width="700px"
  >
    <div v-loading="loading" class="addColorDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
      >
        <el-form-item label="颜色分组" prop="code">
          <el-select
            v-model="formData.code"
            :loading="loading_code"
            @change="handleSelectChange_group"
          >
            <el-option
              v-for="item in options_group"
              :key="item.code"
              :label="item.codeListNameC"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可选颜色" prop="optionalColor">
          <el-select
            v-model="formData.optionalColor"
            value-key="oid"
            multiple
            @change="handleSelectChange_colors"
          >
            <el-option
              v-for="item in options_color"
              :key="item.oid"
              :label="item.name"
              :value="item"
            >
              <div class="flex items-center">
                <el-tag :color="item.color" style="margin-right: 8px;aspect-ratio: 1;" size="small" />
                <span>{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="默认颜色" prop="defaultColorStr">
          <el-select v-model="formData.defaultColorStr">
            <el-option
              v-for="item in formData.optionalColor"
              :key="item.oid"
              :label="item.name"
              :value="item.oid"
            >
              <div class="flex items-center">
                <el-tag :color="item.color" style="margin-right: 8px;aspect-ratio: 1;" size="small" />
                <span>{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
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
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getColorProfileAllList } from "@/api/colorManage/colorProfile"
import { createColorSetting } from '@/api/configureManage/productConfigure'
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
  partOid: props.objectRow.oid, // 物料oid
  code: '', // 颜色分组
  optionalColor: [] as any, // 可选颜色
  defaultColorStr: '', // 默认颜色
})
const rules = reactive({
  code: [ { required: true, message: '请选择颜色分组！', trigger: 'change' },],
  optionalColor: [ { required: true, message: '请选择可选颜色！', trigger: 'change' },],
  defaultColorStr: [ { required: true, message: '请选择默认颜色！', trigger: 'change' },],
})
// 清除
const reset = () => {
  Object.keys(formData).forEach(ele => (formData as any)[ele] = '')
}
// 颜色分组
const options_group = ref<any[]>([])
// 可选颜色
const options_color = ref<any[]>([])
// 获取下拉
const getSelect = () => {
  // 获取颜色分组
  getDictionarySelect({ codes: "COLOR_GROUP" }).then(data => {
    options_group.value = data.data.COLOR_GROUP || []
  })
}
getSelect()

// 确认
const submit = (formEl: FormInstance | undefined) => {
  console.log('submit', formData);
  formEl?.validate((valid) => {
    if (valid) {
      loading.value = true
      const params = {
        ...formData,
        optionalColor: formData.optionalColor.map((item: any) => item.oid).join(',')
      }
      createColorSetting(params).then(data => {
        ElMessage.success('添加成功！')
        emits('handleEditSuccess')
      })
      .finally(() => loading.value = false)
    }
  })
}
// 颜色分组选择回调
const handleSelectChange_group = (val: any) => {
  getOption_colors(val)
}
// 可选颜色选择回调
const handleSelectChange_colors = (val: any) => {
  formData.defaultColorStr = ''
}
// 获取可选颜色
const loading_code = ref(false)
const getOption_colors = (code: string) => {
  formData.optionalColor = []
  formData.defaultColorStr = ''
  if (code) {
    loading_code.value = true
    getColorProfileAllList({ code }).then(data => {
      options_color.value = data.data.map((item: any) => {
        const color = {
          oid: item.oidStr,
          name: item.name,
          color: item.colorCode || '#000000',
        }
        formData.optionalColor.push(color) // 默认全选
        return color
      })
    })
    .finally(() => loading_code.value = false)
  }
}
//#endregion

</script>
<style lang="scss" scoped>
.addColorDialog {
  height: 200px;
}
</style>
