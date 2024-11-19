<template>
  <div class="relation">
    <pt-table
      ref="PtTableRef"
      :locale="locale"
      :tableColumns="tableColumns"
      :tableEditConfig="tableEditConfig"
      :paginationConfig="paginationConfig"
      :menuConfig="menuConfig"
      :data="tableData"
      border
      highlight-current-row
      size="small"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblclick"
    >
      <!-- 表格编辑插槽 -->
      <template #slot-edit>
        <span class="table-edit">
          <el-form
            ref="formRef"
            class="relationForm"
            :model="formData"
            :rules="rules"
            inline
            size="small"
            label-width="60px"
          >
            <el-row>
              <el-form-item label="特征" prop="option">
                <el-select
                  :loading="loading_option"
                  v-model="formData.option"
                  value-key="oid"
                  filterable
                  @change="handleSelectChange_option"
                  style="width: 270px;"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.oid"
                    :label="item.name"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item v-if="dialog.type!=='productNameRule'" label="运算符" prop="operator">
                <el-select
                  v-model="formData.operator"
                  @change="handleSelectChange_operator"
                  style="width: 80px;"
                >
                  <el-option
                    v-for="item in options_operation"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="逻辑符" prop="logicalSymbol">
                <el-select v-model="formData.logicalSymbol" style="width: 80px;">
                  <el-option
                    v-for="item in options_logic"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item class="edit-btn">
                <el-button type="primary" size="small" @click="goSetOrder('up')">上移</el-button>
                <el-button type="primary" size="small" @click="goSetOrder('down')">下移</el-button>
                <el-button
                  v-if="editType==='add'"
                  type="primary"
                  size="small"
                  @click="goAdd('add')"
                >增加</el-button>
                <el-button
                  v-else-if="editType==='edit'"
                  type="success"
                  size="small"
                  @click="goAdd('edit')"
                >保存</el-button>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="特征值" prop="choiceList" style="height: 50px;">
                <template v-if="formData.operator==='包含'||formData.operator==='不包含'">
                  <div
                    v-if="options_choice.length"
                    class="choiceCheckbox"
                  >
                    <el-checkbox-group v-model="formData.choiceList">
                      <template v-for="item in options_choice" :key="item.oid">
                        <el-checkbox :value="item">{{ item.name }}</el-checkbox>
                      </template>
                    </el-checkbox-group>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-if="options_choice.length"
                    class="choiceCheckbox"
                  >
                    <el-radio-group v-model="radio" @change="handleRadioChange">
                      <template v-for="item in options_choice" :key="item.oid">
                        <el-radio :value="item.oid">{{ item.name }}</el-radio>
                      </template>
                    </el-radio-group>
                  </div>
                </template>
              </el-form-item>
            </el-row>
          </el-form>
        </span>
      </template>
      <!-- 自定义列模板插槽 -->
      <!-- <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template> -->
      <template #col-option="{ row }">
        <span>{{ row.option?.name }}</span>
      </template>
      <template #col-value="{ row }">
        <span v-text="getText(row.choiceList)"></span>
      </template>
      <template #col-operate="{ index }">
        <el-button
          type="primary"
          link
          size="small"
          @click="goDel(index)"
        >删除</el-button>
      </template>
    </pt-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, type PropType } from "vue"
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType
} from "@/plugins/pt-front"
import type { FormInstance, FormRules } from "element-plus"
import { setArrayEleOrder } from '@/utils'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {}
  },
  options: {
    type: Array as PropType<any[]>,
    default: []
  },
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: ''  // 类型（add: 编辑约束；edit: 编辑约束；productNameRule：设置品名规则）
    }
  },
  loading_option: {
    type: Boolean,
    default: false
  },
})
const emits = defineEmits(["goDel_option"])
const { t, locale } = useI18n()
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  frontEndID: '',
  logicalSymbol: 'AND',  // 逻辑符
  option: '' as any, // 特征
  operator: '包含', // 运算符
  choiceList: [] as any[], // 特征值
})
const rules = reactive<FormRules>({
  option: [{ required: true, message: '请选择特征！', trigger: 'change' }],
  operator: [{ required: true, message: '请选择运算符！', trigger: 'change' }],
  choiceList: [{ type: 'array', required: true, message: '请选择特征值！', trigger: 'change' }],
  logicalSymbol: [{ required: true, message: '请选择逻辑符！', trigger: 'change' }],
})
// 逻辑符
const options_logic = ref<any[]>([
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
])
// 运算符
const options_operation = ref<any[]>([
  { value: '=', label: '=' },
  { value: '≠', label: '≠' },
  { value: '包含', label: '包含' },
  { value: '不包含', label: '不包含' },
])
// 运算符选择回调
const handleSelectChange_operator = (val: any) => {
  formData.choiceList = []
  radio.value = ''
}
// 特征值
const options_choice = ref<any[]>([])
// 特征选择回调
const handleSelectChange_option = (item: any) => {
  formData.choiceList = []
  radio.value = ''
  options_choice.value = item.choice || []
}
// 清空表单
const resetForm = () => {
  formRef.value?.resetFields()
  options_choice.value = []
  radio.value = ''
}
// 单选框选择回调
const radio = ref<any>()
const handleRadioChange = (val: any) => {
  const find = options_choice.value?.find(item => item.oid === val)
  if (find) {
    formData.choiceList = [find]
  } else {
    radio.value = ''
    formData.choiceList = []
  }
  formRef.value?.validateField('choiceList')
}
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const frontEndID = ref(1)

//#region 增、删、改、查
// 获取列表
const getList = (list: any[]) => {
  frontEndID.value = 1
  tableData.value = list  || []
  tableData.value.forEach(ele => ele.frontEndID = frontEndID.value++)
}
const goAdd = (type: 'add' | 'edit') => {
  formRef.value?.validate(valid => {
    if (valid) {
      const flag = checkFromData()
      if (flag) {
          resetChoiceList()
          if (type === 'add') {
            const obj = JSON.parse(JSON.stringify(formData))
            obj.frontEndID = frontEndID.value++
            tableData.value.push(obj)
            resetForm()
          } else if (type === 'edit') {
            Object.keys(chooseRow.value).forEach(ele => (chooseRow.value as any)[ele] = (formData as any)[ele])
            changeType('add')
          }
      }
    }
  })
}
// 重置特征值顺序
const resetChoiceList = () => {
  let choiceList: any[] = []
  options_choice.value?.forEach(ele => {
    for (let i = 0; i < formData.choiceList.length; i++) {
      const choice = formData.choiceList[i];
      if (ele.oid === choice.oid) {
        choiceList.push(ele)
        return true
      }
    }
  });
  formData.choiceList = choiceList
}
const goDel = (index: number) => {
  ElMessageBox.confirm('是否确认删除该条件？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t("dashboardPage.confirm"),
    cancelButtonText: t("dashboardPage.cancel"),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    tableData.value.splice(index, 1)
  })
}
// 获取显示内容
const getText = (list: any[] = []) => {
  const arr: any[] = []
  if (list.length) {
    list.forEach(ele => {
      arr.push(ele.name)
    })
  }
  return arr.join(',')
}
// 校验表单
const checkFromData = () => {
  for (let i = 0; i < tableData.value.length; i++) {
    const ele = tableData.value[i];
    if (ele.option.oid === formData.option.oid && !(editType.value === 'edit' && ele.frontEndID === formData.frontEndID)) {
      ElMessage.error('不能添加重复的特征！')
      return false
    }
  }
  return true
}
// 改变模式
const editType = ref('add')
const changeType = (type: 'add' | 'edit', row?: any) => {
  editType.value = type
  if (type === 'add') {
    resetForm()
  } else if (type === 'edit') {
    chooseRow.value = row
    Object.assign(formData, JSON.parse(JSON.stringify(row)))
    radio.value = formData.choiceList[0].oid
    // 重置特征值列表
    for (let i = 0; i < props.options.length; i++) {
      const option = props.options[i];
      if (option.oid === formData.option.oid) {
        options_choice.value = option.choice || []
      }
    }
    // 重置选中特征值
    if (options_choice.value.length && formData.choiceList.length) {
      let choiceList: any[] = []
      options_choice.value.forEach(ele => {
        for (let i = 0; i < formData.choiceList.length; i++) {
          const choice = formData.choiceList[i];
          if (choice.oid === ele.oid) {
            choiceList.push(ele)
            return true
          }
        }
      });
      formData.choiceList = choiceList
    }
  }
}
// 设置顺序
const setOrder = (type: string, index: number, list: any[]) => {
  setArrayEleOrder(type, index, list)
}
// 设置顺序
const goSetOrder = (type: string) => {
  // console.log('goSetOrder', chooseRow.value);
  for (let i = 0; i < tableData.value.length; i++) {
    const ele = tableData.value[i];
    if (ele === chooseRow.value) {
      setOrder(type, i, tableData.value)
      return true
    }
  }
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log("row-click", row)
  setCurrent(row)
}
const handleRowDblclick = (row: any, column: any, event: any) => {
  console.log("handleRowDblclick", row)
  changeType('edit', row)
}
// 事件
const setCurrent = (row?: any) => {
  chooseRow.value = row
  PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  size: "small",
  colSetShow: false,
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
    prop: "logicalSymbol",
    label: '逻辑符',
    width: '60',
    align: 'center',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "option",
    label: '特征',
    width: '240',
    slot: 'option',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "operator",
    label: '运算符',
    width: '60',
    align: 'center',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "choiceList",
    label: '特征值',
    slot: 'value',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    label: '操作',
    width: '55',
    fixed: 'right',
    headerAlign: "center",
    // showOverflowTooltip: true,
    show: true,
    slot: 'operate'
  },
])
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
  show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: true
})
//#endregion

//#endregion

defineExpose({
  getList,
  tableData,
  formData,
})
</script>

<style lang="scss" scoped>
.relationForm {
  flex-direction: column;
}
.table-edit {
  width: 934px!important;
  :deep(.el-row) {
    position: relative;
    .edit-btn {
      position: absolute;
      right: 0;
      .el-form-item__content {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
