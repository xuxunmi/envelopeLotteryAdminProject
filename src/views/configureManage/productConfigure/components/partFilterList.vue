<template>
  <div class="partFilterList">
    <div class="relation">
      <el-form
        class="relationForm"
        :model="formData"
        :rules="rules"
        inline
        size="small"
      >
        <el-form-item label="筛选物料" prop="number">
          <el-input v-model="formData.number" disabled style="width: 842px;" />
        </el-form-item>
        <el-button
          type="primary"
          size="small"
          @click="goInsert_part"
        >选择</el-button>
      </el-form>
    </div>
    <div class="partBox">
      筛选物料:
      <span v-if="formData.name">选用:{{ formData.name }}</span>
      <span v-if="formData.number">({{ formData.number }})</span>
    </div>

    <!-- 选择物料 - 弹窗 -->
    <ChoosePartDialog
      v-if="choosePartDialog.visible"
      :dialog="choosePartDialog"
      :objectRow="objectRow"
      @handleEditSuccess="handleEditSuccess_part"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormRules } from "element-plus"
import ChoosePartDialog from './choosePartDialog.vue'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {}
  },
})
const emits = defineEmits(["goDel_option"])
const { t, locale } = useI18n()
//#endregion

//#region 表单
const formData = ref<any>({
  oid: '',
  number: '',
  name: '',
})
const rules = ref<FormRules>({
  number: [{ required: true, message: '请选择筛选物料！', trigger: 'change' }],
})
const options = ref<any[]>([])
const getData = (data : any) => {
  formData.value = data || formData.value
}
//#endregion

//#region 添加物料 - 弹窗
const choosePartDialog = reactive<any>({
  visible: false,
  title: '选择物料'
})
// 添加物料
const goInsert_part = () => {
  console.log("添加物料")
  choosePartDialog.visible = true
}
// 添加物料回调
const handleEditSuccess_part = (row: any) => {
  console.log('handleEditSuccess_part', row);
  formData.value = row
  choosePartDialog.visible = false
}
//#endregion

defineExpose({
  formData,
  getData
})
</script>

<style lang="scss" scoped>
.relation {
  border: 1px solid #ebeef5;
  padding: 6px;
  border-bottom: none;
}
.partBox {
  flex: 1;
  padding: 6px;
  border: 1px solid #ebeef5;
}
</style>
