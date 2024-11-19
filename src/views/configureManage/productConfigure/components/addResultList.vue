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
        <span v-if="dialog.type!=='productNameRule'" class="table-edit">
          <el-form
            ref="formRef"
            class="relationForm"
            :model="formData"
            :rules="rules"
            size="small"
            label-width="60px"
            inline
          >
            <!-- <el-form-item label="设定">
              <el-select v-model="formData.operator">
                <el-option
                  v-for="item in options_set"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item> -->
              <el-row>
                <el-form-item
                  label="特征"
                  prop="option"
                  style="flex: none;width: 220px;"
                >
                  <el-select
                    :loading="loading_option"
                    v-model="formData.option"
                    value-key="oid"
                    filterable
                    @change="handleSelectChange"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.oid"
                      :label="item.name"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item style="flex: none;">
                  <el-radio-group
                    v-model="formData.radio1"
                    style="margin: 0 12px;"
                    @change="handleRadioChange"
                  >
                    <el-radio value="all">全选</el-radio>
                    <el-radio value="invert">反选</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item class="edit-btn">
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
        <span>{{ row.option.name }}</span>
      </template>
      <template #col-choiceList="{ row }">
        <span v-text="getText(row.choiceList)"></span>
      </template>
      <template #col-simpleName="{ row }">
        <span v-text="getText_simpleName(row.choiceList)"></span>
      </template>
      <template #col-isDisplayed="{ row }">
        <el-radio-group v-model="row.isDisplayed" size="small">
          <el-radio :value="1">显示</el-radio>
          <el-radio :value="0">不显示</el-radio>
        </el-radio-group>
      </template>
      <template #col-shortName="{ row }">
        <el-input v-model="row.shortName" size="small" />
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
import { ref, reactive, type PropType, onMounted } from "vue"
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType
} from "@/plugins/pt-front"
import type { FormInstance, FormRules } from "element-plus"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: ''  // 类型（add: 编辑约束；edit: 编辑约束；productNameRule：设置品名规则）
    }
  },
  objectRow: {
    type: Object,
    default: {}
  },
  options: {
    type: Array as PropType<any[]>,
    default: []
  },
  loading_option: {
    type: Boolean,
    default: false
  },
})
const { t, locale } = useI18n()
const emits = defineEmits(["save", "setResultNameText"])
//#endregion

//#region 表单
const formData = reactive({
  frontEndID: '',
  operator: 'IF', // 设定
  option: '' as any, // 特征
  choiceList: [] as any[], // 特征值
  radio1: '', // 全选/反选
})
const formRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  option: [{ required: true, message: '请选择特征！', trigger: 'change' }],
  choiceList: [{ type: 'array', required: true, message: '请选择特征值！', trigger: 'change' }],
})
// 设定
const options_set = ref<any[]>([
  { value: 'IF', label: 'IF' }
])
// 特征
const handleSelectChange = (item: any) => {
  console.log('handleSelectChange', item);
  formData.choiceList = []
  options_choice.value = item.choice || []
  setTimeout(() => formRef.value?.clearValidate('choiceList'), 1)
}
// 特征值
const options_choice = ref<any[]>([])
const handleRadioChange = (val: any) => {
  // console.log('handleRadioChange', val);
  const currentChoiceList = JSON.parse(JSON.stringify(formData.choiceList))
  formData.choiceList = []
  options_choice.value.forEach(ele => {
    if (val === 'all') {
      // 全选
      formData.choiceList.push(ele)
    } else if (val === 'invert') {
      // 反选
      let flag = true
      for (let i = 0; i < currentChoiceList.length; i++) {
        const choice = currentChoiceList[i];
        if (choice.oid === ele.oid) flag = false
      }
      if (flag) formData.choiceList.push(ele)
    }
  });
}
// 清空表单
const resetForm = () => {
  formRef.value?.resetFields()
  options_choice.value = []
}
// 设置品名规则 - 列表中默认显示当前特征值
const setChoiceList = () => {
  // console.log('setChoiceList', props.options, props.dialog.row);
  const find = props.options.find(item => item.oid === props.dialog.row.optionOid)
    if (find) {
      console.log('find', find);
      tableData.value = []
      find.choice?.forEach((ele: any) => {
        let obj = {
          operator: 'IF', // 设定
          option: find, // 特征
          choiceList: [ele], // 特征值
          radio1: '', // 全选/反选
          isDisplayed: 1
        }
        tableData.value.push(obj)
      })
      emits('setResultNameText', find.name)
    }
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
// 编辑列表
const editList = (list: any[]) => {
  const find = props.options.find(item => item.oid === props.dialog.row.optionOid)
  if (find) {
    console.log('editList', find.choice, list);
    tableData.value = []
    find.choice?.forEach((ele: any) => {
      let obj = {
        operator: 'IF', // 设定
        option: find, // 特征
        choiceList: [ele], // 特征值
        radio1: '', // 全选/反选
        isDisplayed: 1
      }
      const find2 = list.find(item => item.choiceList[0].oid === ele.oid)
      if (find2) {
        Object.assign(obj, {
          isDisplayed: find2.isDisplayed,
          shortName: find2.shortName,
        })
      }
      tableData.value.push(obj)
    })
  }
}
const goAdd = (type: 'add' | 'edit') => {
  // console.log('goAdd', formData);
  formRef.value?.validate(valid => {
    if (valid) {
        const flag = checkFromData()
        if (flag) {
          resetChoiceList()
          if (type === 'add') {
            const obj = JSON.parse(JSON.stringify(formData))
            obj.frontEndID = frontEndID.value++
            if (props.dialog.type === 'productNameRule') obj.isDisplayed = 1
            tableData.value.push(obj)
            resetForm()
          } else if (type === 'edit') {
            Object.keys(chooseRow.value).forEach(ele => (chooseRow.value as any)[ele] = (formData as any)[ele])
            changeType('add')
          }
          if (props.dialog.type === 'edit') emits('save', 'result')
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
  ElMessageBox.confirm('是否确认删除该结果？', t("dashboardPage.messageBoxTitle"), {
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
const getText = (list: any[]) => {
  const arr: any[] = []
  if (list.length) {
    list.forEach(ele => {
      arr.push(ele.name)
    })
  }
  return arr.join(' || ')
}
const getText_simpleName = (list: any[]) => {
  return list[0].simpleName
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
// 校验表单
const checkFromData = () => {
  console.log('checkFromData', tableData.value, formData);
  for (let i = 0; i < tableData.value.length; i++) {
    const ele = tableData.value[i];
    if (ele.option.oid === formData.option.oid && !(editType.value === 'edit' && ele.frontEndID === formData.frontEndID)) {
      ElMessage.error('不能添加重复的特征！')
      return false
    }
  }
  return true
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log("row-click", row)
  changeType('add')
  setCurrent(row)
}
const handleRowDblclick = (row: any, column: any, event: any) => {
  console.log("handleRowDblclick", row)
  if (props.dialog.type !== 'productNameRule') changeType('edit', row)
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
    prop: "optionOid",
    label: '特征',
    width: 230,
    // showOverflowTooltip: true,
    show: true,
    slot: 'option',
    headerAlign: "center",
    disabled:   props.dialog.type === 'productNameRule'
  },
  {
    prop: "choiceList",
    label: '特征值',
    // showOverflowTooltip: true,
    show: true,
    slot: 'choiceList',
    headerAlign: "center"
  },
  {
    prop: "simpleName",
    label: '简化显示',
    width: 230,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
    slot: 'simpleName',
    disabled:   props.dialog.type !== 'productNameRule'
  },
  {
    prop: "isDisplayed",
    label: '是否显示',
    // showOverflowTooltip: true,
    show: true,
    slot: 'isDisplayed',
    disabled: props.dialog.type !== 'productNameRule',
    headerAlign: "center"
  },
  {
    prop: "shortName",
    label: '简化名称',
    // showOverflowTooltip: true,
    show: true,
    slot: 'shortName',
    disabled: props.dialog.type !== 'productNameRule',
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
  editList,
  setChoiceList,
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
    }
  }
}
</style>
