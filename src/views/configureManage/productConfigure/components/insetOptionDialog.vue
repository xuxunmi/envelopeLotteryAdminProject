<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    top="50px"
    width="80%"
  >
    <div v-loading="loading||dialog.loading" class="insetOptionDialog">
      <div v-if="dialog?.row?.isTop" class="fromWrapper">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="small"
          inline
        >
          <el-form-item label="编码">
            <el-input
              v-model="formData.number"
              @keydown.enter="getList"
            />
          </el-form-item>
          <el-form-item label="名称">
            <el-input
              v-model="formData.name"
              @keydown.enter="getList"
            />
          </el-form-item>
          <el-form-item label="版本所有者用户组" prop="groupOid">
            <el-select v-model="formData.groupOid">
              <el-option
                v-for="item in options_group"
                :key="item.oid"
                :label="item.name"
                :value="item.oid"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              @click="getList"
            >{{ t('dashboardPage.query') }}</el-button>
            <el-button
              size="small"
              @click="reset"
            >{{ t('dashboardPage.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="tableWrapper">
        <OptionList
          ref="OptionListRef"
          type="insert"
          :objectRow="dialog.row"
          :from="dialog.from"
          @getList="getList"
        />
      </div>
    </div>
    <template #footer>
      <el-button
        :loading="loading||dialog.loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button type="primary" @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import OptionList from "./optionList.vue";
import { getOptionListOfPart, getAllOptionList } from "@/api/configureManage/productConfigure";
import { productList } from "@/api/productLibrary"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      loading: false,
      row: {},
      /**
       * 引用页面（productNameSimplifyRules：品名简化规则；variableTab：维护配置-配置特征）
       */
      from: ''
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const formData = reactive({
  // oid: props.dialog.row.oid,
  number: '',
  name: '',
  groupOid: '',
})
const rules = reactive({
  groupOid: [ { required: true, message: '请选择版本所有者用户组', trigger: 'change' },],
})
// 清除
const reset = () => {
  Object.keys(formData).forEach(ele => (formData as any)[ele] = '')
}
// 版本所有者用户组
const options_group = ref<any[]>([])
const getGroupList = () => {
  loading.value = true
  productList().then((data) => {
    console.log(data)
    options_group.value = data.data || []
    if (options_group.value.length) {
      // 默认选中第一个
      nextTick(() => {
        formData.groupOid = options_group.value[0].oid
        getList()
      })
    }
  })
  .catch(() => loading.value = false)
}
// 确认
const submit = () => {
  const list = instance.refs.OptionListRef.sourceData || []
  emits('handleEditSuccess', list)
}
//#endregion

//#region 列表
// 获取特征列表
const getList = () => {
  instance.refs.formRef.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      getAllOptionList(formData).then(data => {
        instance.refs.OptionListRef.getList(data.data || [])
      })
      .finally(() => loading.value = false)
    } else {
      loading.value = false
    }
  });
}
// 获取顶层BOM所有特征列表
const getList_top = () => {
  const params = {
    oid: props.dialog.row.topObjectOid,
    topOid: props.dialog.row.topObjectOid,
  }
  getOptionListOfPart(params).then(data => {
    instance.refs.OptionListRef.getList(data.data || [])
  })
}
if (props.dialog.row.isTop) {
  // 顶层BOM（获取所有特征列表）
  getGroupList()
} else {
  // 非顶层BOM（获取顶层BOM所有特征列表）
  getList_top()
}
//#endregion

</script>
<style lang="scss" scoped>
.tableWrapper {
  height: calc(100vh - 310px);
}
</style>
