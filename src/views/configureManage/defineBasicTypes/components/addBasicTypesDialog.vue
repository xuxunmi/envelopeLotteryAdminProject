<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    :close-on-click-modal="false"
    align-center
    draggable
    overflow
    width="800px"
  >
    <div v-loading="loading" class="addBasicTypesDialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="small"
      >
        <el-form-item label="品名：" prop="productName">
          <el-input v-model="formData.productName" placeholder="" />
        </el-form-item>
        <el-form-item label="创建人：" prop="createdBy">
          <div>{{ userStore.userInfo.fullName }}</div>
        </el-form-item>
      </el-form>
      <el-table
        :data="optionList"
        size="small"
        border
        max-height="calc(100vh - 500px)"
      >
        <el-table-column prop="name" label="选配项" align="center" />
        <el-table-column prop="checkChoiceName" label="选配值" align="center" />
        <el-table-column prop="isKeyOption" label="是否关键配置" align="center" width="120">
          <template #default="{ row }">
            <span v-if="row.isKeyOption===true">是</span>
            <span v-else-if="row.isKeyOption===false">否</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="submit"
        size="small"
        :loading="loading"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { createOrEditBasicType, basicTypeDetail, getProductName, getSchemeCode } from '@/api/configureManage/defineBasicTypes'
import { useI18n } from "vue-i18n"
import { useUserStore } from "@/store/modules/user"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      type: 'add',
      optionList: [],
      part: {},
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
const userStore = useUserStore()
//#endregion

// 确认
const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      const choiceList: any[] = []
      const time = new Date().getTime()
      optionList.value?.forEach((option: any) => {
        if (option.checkChoiceOid) choiceList.push(option.checkChoiceOid)
      })
      const scheme = {
        schemeCode: `${time}`,
        schemeName: `${props.dialog.part.Name}-${time}`,
        choiceList
      }
      const params = {
        ...formData,
        schemes: [scheme]
      }
      loading.value = true
      createOrEditBasicType(params).then(data => {
        console.log(data);
        if (props.dialog.type === 'add') {
          ElMessage.success('新建成功！')
        } else if (props.dialog.type === 'edit') {
          ElMessage.success('编辑成功！')
        }
        emits('handleEditSuccess')
      })
      .finally(() => loading.value = false)
    }
  })
}

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  productName: "",  // 品名
  createdBy: "",  // 创建人
  partOid: '',  // 系列oid
  partNum: '',  // 系列编码
  partName: '', // 系列名称
})
const rules = reactive<FormRules>({
  productName: [{ required: true, message: "请输入品名！", trigger: "blur" }],
})
const optionList = ref<any[]>(props.dialog.optionList || [])
// 获取数据
const getData = () => {
  loading.value = true
  basicTypeDetail({
    oidStr: props.dialog.row.oidStr
  }).then(data => {
    console.log(data);
    Object.assign(formData, {
      oidStr: data.data.oidStr,
      productName: data.data.productName,
      createdBy: data.data.createdBy,
      partOid: data.data.PartOid,
      partNum: data.data.partNum,
      partName: data.data.partName,
    })
    if (data.data.schemeInfo.choiceList.length) {
      optionList.value = data.data.schemeInfo.choiceList.map((item: any) => {
        return {
          name: item.optionName,
          isKeyOption: item.isKeyOption,
          checkChoiceName: item.selectedChoices[0]?.choiceName || '',
          checkChoiceOid: item.selectedChoices[0]?.choiceOid || '',
        }
      })
    }
  })
  .finally(() => loading.value = false)
}
// 初始化品名
const initProductName = () => {
  console.log('initProductName', optionList.value, props.dialog);
  const params_name: any[] = []  // 初始化品名和方案名称参数
  const params_code = { // 初始化编码参数
    oid: props.dialog.part.oid,
    choiceInfos: [] as any
  }
  optionList.value.forEach((option: any) => {
    if (option.checkChoiceOid && option.checkChoiceName) {
      // 初始化品名和方案名称参数
      if (option.isKeyOption && option.checkChoiceOid) {
        params_name.push({
          featureOid: option.oid,
          featureKey: option.checkChoiceName,
          featureValueOid: option.checkChoiceOid,
        })
      }
      // 初始化编码参数
      params_code.choiceInfos.push({
        optionOid: option.oid,
        choiceOid: option.checkChoiceOid
      })
    }
  })
  const initName = getProductName(params_name)
  const initCode = getSchemeCode(params_code)
  loading.value = true
  Promise.all([initName, initCode]).then(data => {
    formData.productName = `${data[1].data.modelNumber}-${data[0].data}`
  })
  .finally(() => loading.value = false)
}

if (props.dialog.type === 'add') {
  initProductName()
  Object.assign(formData, {
    partOid: props.dialog.part.PartOid,
    partNum: props.dialog.part.Number,
    partName: props.dialog.part.Name,
  })
} else if (props.dialog.type === 'edit') {
  getData()
}
//#endregion

</script>
<style lang="scss" scoped></style>
