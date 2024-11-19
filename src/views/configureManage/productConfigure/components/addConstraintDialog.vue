<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    width="1000px"
    align-center
    @close="handleDialogClose"
  >
    <div v-loading="loading" :class="{
      'addConstraintDialog': true,
      'productNameRule': dialog.type === 'productNameRule'
    }">
      <template v-if="refresh_List">
        <span class="pt-table-title">条件</span>
        <div class="addConditionList">
          <AddConditionList
            ref="AddConditionRef"
            :loading_option="loading_option"
            :options="options_option"
            :dialog="dialog"
          />
        </div>
        <span class="pt-table-title">
          结果
          <span v-if="resultNameText">：{{ resultNameText }}</span>
        </span>
        <div class="addResultList">
          <AddResultList
            ref="AddResultListRef"
            :loading_option="loading_option"
            :options="options_option"
            :dialog="dialog"
            @save="save"
            @setResultNameText="setResultNameText"
          />
        </div>
      </template>
      <template v-if="dialog.type==='productNameRule'">
        <div class="editBtn">
            <el-button
              :loading="loading"
              type="primary"
              @click="save_name"
              size="small"
            >保存</el-button>
            <el-button
              :loading="loading"
              type="primary"
              @click="clearFromData"
              size="small"
            >取消</el-button>
        </div>
        <div class="productNameRuleList">
          <ProductNameRuleList
            ref="productNameRuleListRef"
            @editProductNameRule="editProductNameRule"
            @delProductNameRule="delProductNameRule"
          />
        </div>
      </template>
    </div>
    <template v-if="dialog.type!=='productNameRule'" #footer>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button @click="dialog.visible = false" size="small">{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus"
import AddConditionList from "./addConditionList.vue";
import AddResultList from "./addResultList.vue";
import ProductNameRuleList from "./productNameRuleList.vue";
import { addRule, editRule } from "@/api/configureManage/productConfigure";
import { saveProNameRule, getSettingList, delSettingDetail, getOptionListOfPart } from "@/api/configureManage/productConfigure"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: '',  // 类型（add: 编辑约束；edit: 编辑约束；productNameRule：设置品名规则）
      hasEdit: false
    }
  },
  objectRow: {
    type: Object,
    default: {}
  },
})
const emits = defineEmits(["handleEditSuccess", "close"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 提交
// 结果后面显示名称
const resultNameText = ref('')
const setResultNameText = (text: string) => {
  console.log('setResultNameText', text);
  resultNameText.value = text
}
// 确认
const submit = () => {
  const expressionsForm = instance.refs.AddConditionRef.formData || {}
  const resultForm = instance.refs.AddResultListRef.formData || {}
  if (expressionsForm.option || resultForm.option) {
    ElMessageBox.confirm('条件或结果输入框中有内容，是否确认只保存明细行的内容?', '提示', {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      confirmButtonClass: "confirmButton",
      cancelButtonClass: "cancelButton",
      type: "warning",
      center: true
    }).then(() => save())
  } else {
    save()
  }
}
// 保存约束
const save = (type?: string) => {
  const expressions = instance.refs.AddConditionRef.tableData || []
  const result = instance.refs.AddResultListRef.tableData || []
  // 校验
  // 1. 列表必填
  if (!expressions.length) {
    ElMessage.error('请添加条件！')
    return false
  }
  if (!result.length) {
    ElMessage.error('请添加结果！')
    return false
  }
  // 2. 一个约束只能选一种逻辑符，不可以出现既有AND又有OR的情况，如果用户新建的约束中既有AND又有OR，在点击确定保存时弹窗提示
  const first = expressions[0].logicalSymbol
  const isSameLogics = expressions.map((item: any) => item.logicalSymbol).every((item: any) => item === first)
  if (!isSameLogics) {
    ElMessage.error('一个约束只能选一种逻辑符，不可以既有AND又有OR！')
    return false
  }
  // 3. 结果不能重复特征
  const resultOptionsOid = result.map((item: any) => item.option.oid)
  const isRepeat = resultOptionsOid.length !== new Set(resultOptionsOid).size
  if (isRepeat) {
    ElMessage.error('结果的特征不能重复！')
    return false
  }
  // 格式化数据
  if (props.dialog.type === 'add' || props.dialog.type === 'copy') {
    // 新增约束
    const constraintData = formatData_save({ expressions, result })
    const params = {
      oid: props.objectRow.oid,
      rule: constraintData
    }
    loading.value = true
    addRule(params).then(data => {
      ElMessage.success('新建成功！')
      emits('handleEditSuccess')
    })
    .finally(() => loading.value = false)
  } else if (props.dialog.type === 'edit') {
    // 编辑约束
    const constraintData = formatData_save({ expressions, result })
    const params = {
      ruleOid: props.dialog.row.oid,
      oid: props.objectRow.oid,
      ...constraintData
    }
    loading.value = true
    editRule(params).then(data => {
      ElMessage.success('编辑成功！')
      if (type === 'result') {
        props.dialog.row.oid = data.data.ruleOid || ''
      } else {
        emits('handleEditSuccess')
      }
    })
    .finally(() => loading.value = false)
  }
}
// 保存品名规则
const save_name = () => {
  const expressions = instance.refs.AddConditionRef.tableData || []
  const result = instance.refs.AddResultListRef.tableData || []
  // 校验
  // 1. 列表必填
  if (!expressions.length) {
    ElMessage.error('请添加条件！')
    return false
  }
  if (!result.length) {
    ElMessage.error('请添加结果！')
    return false
  }
  // 2. 一个约束只能选一种逻辑符，不可以出现既有AND又有OR的情况，如果用户新建的约束中既有AND又有OR，在点击确定保存时弹窗提示
  const first = expressions[0].logicalSymbol
  const isSameLogics = expressions.map((item: any) => item.logicalSymbol).every((item: any) => item === first)
  if (!isSameLogics) {
    ElMessage.error('一个条件只能选一种逻辑符，不可以既有AND又有OR！')
    return false
  }
  // 设置品名规则
  const constraintData = formatData_save_nameRule({ expressions, result })
  const params = {
    oid: props.dialog.row.optionOid,
    settingOid: props.dialog.row.oid,
    partOid: props.objectRow.oid,
    optionNumber: props.dialog.row.optionNumber,
    ...constraintData
  }
  if (editRow.value.oid) params.settingOid = editRow.value.oid
  loading.value = true
  saveProNameRule(params).then(data => {
    if (editRow.value.oid) {
      ElMessage.success('保存成功！')
      editRow.value = {}
    } else {
      ElMessage.success('新增成功！')
    }
    clearFromData()
    getData_productName(true)
  })
  .finally(() => loading.value = false)
}
//#endregion

//#region 品名规则列表
// 编辑品名规则
const editRow = ref<any>({})
const editProductNameRule = (row: any) => {
  const data = formatData_show_nameRule(row)
  editRow.value = {
    oid: row.oid,
    optionOid: row.optionOid,
    optionNumber: row.optionNumber,
    expressionList: data.expressions,
    resultList: data.result,
  }
  instance.refs.AddConditionRef.getList(editRow.value.expressionList)
  instance.refs.AddResultListRef.editList(editRow.value.resultList)
}
// 删除品名规则
const delProductNameRule = (row: any) => {
  loading.value = true
  delSettingDetail({ settingOid: row.oid }).then(data => {
    ElMessage.success('删除成功！')
    getData_productName(true)
  }).finally(() => loading.value = false)
}
// 刷新列表
const refresh_List= ref(true)
const clearFromData = () => {
  refresh_List.value = false
  nextTick(() => refresh_List.value = true)
}
//#endregion

//#region 约束(格式化数据)
// 格式化数据 - 保存
const formatData_save = ({ expressions, result }: { expressions: any[], result: any[]}) => {
  // 格式化条件
  const list_expressions: any[] = []
  expressions.forEach(ele => {
    const obj = {
      operator: ele.operator,
      logicalSymbol: ele.logicalSymbol,
      optionOid: ele.option.oid,
      choiceList: [] as any[],
    }
    ele.choiceList.forEach((choice: any) => obj.choiceList.push(choice.oid));
    list_expressions.push(obj)
  })
  // 格式化结果
  const list_results: any[] = []
  result.forEach(ele => {
    const obj = {
      operator: ele.operator,
      optionOid: ele.option.oid,
      choiceList: [] as any[]
    }
    ele.choiceList.forEach((choice: any) => obj.choiceList.push(choice.oid));
    list_results.push(obj)
  })

  return {
    expressions: list_expressions,
    result: list_results
  }
}
// 格式化数据 - 回显
const formatData_show = ({ expressions, result }: { expressions: any[], result: any[]}) => {
  // 格式化条件
  const list_expressions: any[] = JSON.parse(JSON.stringify(expressions || []))
  list_expressions.forEach(ele => {
    ele.option = {
      oid: ele.optionOid,
      name: ele.optionName,
    }
  })
  // 格式化结果
  const list_results: any[] = JSON.parse(JSON.stringify(result || []))
  list_results.forEach(ele => {
    ele.option = {
      oid: ele.optionOid,
      name: ele.optionName,
    }
  })
  return {
    expressions: list_expressions,
    result: list_results
  }
}
//#endregion

//#region 品名规则设置(格式化数据)
// 格式化数据 - 保存
const formatData_save_nameRule = ({ expressions, result }: { expressions: any[], result: any[]}) => {
  // 格式化条件
  const list_expressions: any[] = []
  expressions.forEach(ele => {
    const obj = {
      operator: '包含', // 品名规则设置运算符用包含
      logicalSymbol:  ele.logicalSymbol,
      optionOid: ele.option.oid,
      optionName: ele.option.name,
      choiceList: [] as any[],
    }
    ele.choiceList.forEach((choice: any) => obj.choiceList.push({
      oid: choice.oid,
      name: choice.name,
    }));
    list_expressions.push(obj)
  })
  // 格式化结果
  const list_results: any[] = []
  result.forEach(ele => {
    // 显示但简化名称为空的不添加
    if (ele.isDisplayed === 1 && !ele.shortName) return false
    const obj = {
      operator: ele.operator,
      optionOid: ele.option.oid,
      optionName: ele.option.name,
      choiceList: [] as any[],
      isDisplayed: ele.isDisplayed,
      shortName: ele.shortName,
    }
    ele.choiceList.forEach((choice: any) => obj.choiceList.push({
      oid: choice.oid,
      name: choice.name,
    }));
    list_results.push(obj)
  })

  return {
    expressions: list_expressions,
    result: list_results
  }
}
// 格式化数据 - 回显
const formatData_show_nameRule = ({ expressionList, resultList }: { expressionList: any[], resultList: any[]}) => {
  // 格式化条件
  const list_expressions: any[] = JSON.parse(JSON.stringify(expressionList || []))
  list_expressions.forEach(ele => {
    ele.option = {
      oid: ele.optionOid,
      name: ele.optionName,
    }
  })
  // 格式化结果
  const list_results: any[] = JSON.parse(JSON.stringify(resultList || []))
  list_results.forEach(ele => {
    ele.option = {
      oid: ele.resultOptionOid,
      name: ele.resultOptionName,
    }
    ele.choiceList = ele.resultChoiceList
  })
  return {
    expressions: list_expressions,
    result: list_results
  }
}
//#endregion

//#region 获取数据
// 获取数据
const getData = () => {
  if (props.dialog.type === 'productNameRule') {
    getData_productName(false)
  } else {
    getData_constraint()
  }
}
// 获取约束
const getData_constraint = () => {
  let data = {
    expressions: [] as any[],  // 条件
    result: [] as any[]  // 结果
  }
  data = formatData_show(props.dialog.row)
  console.log('getData', data);
  setTimeout(() => {
    instance.refs.AddConditionRef.getList(data.expressions)
    instance.refs.AddResultListRef.getList(data.result)
  }, 1)
}
// 获取品名规则
const getData_productName = (hasEdit: boolean) => {
  let params = {
    optionOid: props.dialog.row.optionOid,
    partOid: props.objectRow.oid,
  }
  props.dialog.hasEdit = hasEdit
  loading.value = true
  getSettingList(params).then(data => {
    instance.refs.productNameRuleListRef.getList(data.data)
  })
  .finally(() => loading.value = false)
}
if (
  props.dialog.type === 'edit'
   || props.dialog.type === 'copy'
   || props.dialog.type === 'productNameRule'
) getData()
//#endregion

// 获取特征列表
const loading_option = ref(false)
const options_option = ref<any[]>([])
const getList_option = () => {
  // console.log('getList_option', props.objectRow);
  loading_option.value = true
  const params = {
    oid: props.objectRow.isTop?props.objectRow.PartOid:props.objectRow.parentOid,
    topOid: props.objectRow.topObjectOid,
  }
  // 品名规则设置用当前物料特征列表
  if (props.dialog.type === 'productNameRule') params.oid = props.objectRow.PartOid
  getOptionListOfPart(params).then(data => {
    options_option.value = data.data || []
    options_option.value.forEach(ele => {
      ele.choice?.forEach((choice: any) => {
        if (choice.simpleName === '-') choice.simpleName = ''  // 简化名称'-'显示空
      })
    })
    if (props.dialog.type === 'productNameRule') {
      // 设置品名规则 - 列表中默认显示当前特征值
      nextTick(() => instance.refs.AddResultListRef.setChoiceList())
    }
  })
  .finally(() => loading_option.value = false)
}
getList_option()

// 监听弹窗关闭
const handleDialogClose = () => {
  console.log('handleDialogClose');
  emits('close')
}
</script>
<style lang="scss" scoped>
.addConstraintDialog {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  overflow: auto;
  padding-right: 10px;
  :deep(.relation) {
    height: 100%;
    .table-edit {
      width: 100%;
      .relationForm {
        width: 100%;
        display: flex;
        .el-form-item {
          margin-right: 0;
          margin-bottom: 10px;
          align-items: flex-start;
          .el-form-item__label {
            padding-right: 4px;
          }
          .el-select {
            width: 180px;
          }
        }
        .el-row {
          gap: 4px;
          width: 100%;
        }
        .choiceCheckbox {
          overflow: auto;
          border: 1px solid #dcdfe6;
          padding: 0 4px;
          border-radius: var(--el-border-radius-base);
          max-width: 876px;
          .el-checkbox-group {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-content: flex-start;
            gap: 8px;
            padding: 4px;
            max-height: 50px;
            min-width: 866px;
            .el-checkbox {
              margin-right: 6px;
              width: max-content;
              height: auto;
            }
          }
          .el-radio-group {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-content: flex-start;
            align-items: flex-start;
            gap: 8px;
            padding: 4px;
            max-height: 50px;
            min-width: 866px;
            .el-radio {
              margin-right: 6px;
              width: max-content;
              height: auto;
              line-height: 1;
            }
          }
        }
      }
    }
  }
  .editBtn {
    padding: 8px;
    text-align: center;
  }
  .addConditionList,
  .addResultList {
    flex: 1;
    min-height: 260px
  }
  &.productNameRule {
    .addConditionList {
      height: 230px;
      min-height: 230px;
      flex: initial;
    }
    .addResultList {
      height: 140px;
      min-height: 140px;
      flex: initial;
    }
  }
}
</style>
