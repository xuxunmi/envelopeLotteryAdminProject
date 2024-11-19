<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    width="400px"
  >
    <div class="addProductNew">
      <div class="fromWrapper">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="small"
          label-position="left"
          label-width="120px"
        >
          <el-form-item :label="t('productBomPage.type')" prop="type">
            <el-select v-model="formData.type" @change="handleTypeChange">
              <el-option label="部件" value="部件" />
              <el-option label="电子部件" value="电子部件" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('productBomPage.isEndItem')" prop="isEndItem">
            <el-select v-model="formData.isEndItem">
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
          <pt-collapse v-if="formData.type" id="explainList" title="说明方文档">
            <template v-if="false">
              <el-form-item :label="t('productBomPage.PartNumber')">
                <div class="fromWrapper_text">（{{ t('productBomPage.Generated') }}）</div>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item :label="t('productBomPage.PartNumber')" prop="number">
                <el-input v-model="formData.number" />
              </el-form-item>
            </template>
            <el-form-item :label="t('productBomPage.PartName')" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item :label="t('productBomPage.source')" prop="source">
              <el-select v-model="formData.source">
                <el-option label="" value="" />
                <el-option label="制造" value="制造" />
                <el-option label="购买" value="购买" />
                <el-option label="购买 - 单一供应源" value="购买 - 单一供应源" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('productBomPage.view')" prop="view">
              <el-select v-model="formData.view">
                <el-option label="" value="" />
                <el-option label="Design" value="Design" />
                <el-option label="Manufacturing" value="Manufacturing" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('productBomPage.defaultUnit')" prop="unit">
              <el-select v-model="formData.unit">
                <el-option label="" value="" />
                <el-option label="个" value="个" />
                <el-option label="根据需要" value="根据需要" />
                <el-option label="千克" value="千克" />
                <el-option label="米" value="米" />
                <el-option label="升" value="升" />
                <el-option label="平方米" value="平方米" />
                <el-option label="立方米" value="立方米" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('productBomPage.isPhantom')" prop="isPhantom">
              <el-select v-model="formData.isPhantom">
                <el-option label="" value="" />
                <el-option label="是" value="是" />
                <el-option label="否" value="否" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('productBomPage.folderLocation')" prop="pid">
              <el-tree-select
                v-model="formData.pid"
                :data="options"
                :render-after-expand="false"
                show-checkbox
                check-strictly
                check-on-click-node
              >
                <template #default="{ data: { name } }">{{ name }}</template>
              </el-tree-select>
            </el-form-item>
          </pt-collapse>
        </el-form>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="submit" size="small">保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import PtCollapse from '@/components/ptCollapse/index.vue'
import { bomInsertPart, createPart } from "@/api/bomManage/productBom/index";
import { productFolderFirstNode } from "@/api/productLibrary"
import { recursionArray } from "@/utils/index"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {}
    }
  },
})
const emits = defineEmits(["partRefresh"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  pid: "",
  type: "",
  isEndItem: "否",
  number: "",
  name: "",
  source: "",
  view: "",
  unit: "",
  isPhantom: "",
})
const rules = reactive<FormRules>({
  type: [{ required: true, message: t('productBomPage.tip_type'), trigger: "change" }],
  isEndItem: [{ required: true, message: t('productBomPage.tip_isEndItem'), trigger: "change" }],
  number: [{ required: true, message: t('productBomPage.tip_number'), trigger: "blur" }],
  name: [{ required: true, message: t('productBomPage.tip_name'), trigger: "blur" }],
  source: [{ required: true, message: t('productBomPage.tip_source'), trigger: "change" }],
  unit: [{ required: true, message: t('productBomPage.tip_unit'), trigger: "change" }],
  isPhantom: [{ required: true, message: t('productBomPage.tip_isPhantom'), trigger: "change" }],
  pid: [{ required: true, message: t('productBomPage.tip_folder'), trigger: "change" }],
})
// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      createPart(formData).then(data => {
        console.log(data);
        ElMessage.success(t('dashboardPage.addSuccess'))
        bomInsert(data.data)
      })
    }
  })
}
// 插入已有的
const bomInsert = (row: any) => {
  let params = {
    PartOid: row.oid,
    ParentPartOid: props.dialog.row.PartOid,
    findNumber: row.findNumber,
  }
  bomInsertPart(params).then(data => {
    ElMessage.success(t('productBomPage.insertSuccessful'))
    props.dialog.visible = false
    emits('partRefresh')
  })
}
// 类型改变回调
const handleTypeChange = (val: string) => {
  if (val === '部件') {
    formData.number = ''
    formData.source = '制造'
    formData.view = 'Design'
    formData.unit = '个'
    formData.isPhantom = '否'
  } else if (val === '电子部件') {
    formData.source = '制造'
    formData.view = 'Design'
    formData.unit = '个'
    formData.isPhantom = '否'
  }
}
// 获取下拉
const options = ref([])
const getSelect = () => {
  let params = {
    oid: props.dialog.row.ProductOid
  }
  productFolderFirstNode(params).then(data => {
    recursionArray(data.data, (item: any) => {
      item.value = item.oid
      item.label = item.name
    })
    options.value = data.data
  })
}
getSelect()
//#endregion

</script>
<style lang="scss" scoped>
</style>
