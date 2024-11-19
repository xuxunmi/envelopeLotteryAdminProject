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
                    <el-form ref="formRef" class="relationForm" :model="formData" :rules="rules" inline size="small">
                        <el-row>
                          <el-form-item label="字段名" prop="name">
                              <el-select
                                :loading="loading_select"
                                v-model="formData.name"
                              >
                                  <el-option
                                      v-for="item in option_attribute"
                                      :key="item.code"
                                      :label="item.codeListNameC"
                                      :value="item.code"
                                  />
                              </el-select>
                          </el-form-item>
                          <el-form-item label="等于" prop="value">
                              <el-input v-model="formData.value" />
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
                    </el-form>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <!-- <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template> -->
            <template #col-name="{ row }">
                <span v-text="getText_name(row.name)" />
            </template>
            <template #col-operate="{ index }">
                <el-button type="primary" link size="small" @click="goDel(index)">删除</el-button>
            </template>
        </pt-table>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import type { FormInstance, FormRules } from "element-plus"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    objectRow: {
        type: Object,
        default: {}
    },
    isModule: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(["goDel_option"])
const { t, locale } = useI18n()
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive({
    name: "", // 字段名
    value: "" // 字段值
})
const rules = ref<FormRules>()
if (!props.isModule) {
    rules.value = {
        // name: [{ required: true, message: '请选择字段名！', trigger: 'change' }],
        // value: [{ required: true, message: '请输入字段值！', trigger: 'blur' }],
    }
}
const options_field = ref<any[]>([
    { value: "发料方式", label: "发料方式" },
    { value: "供应方式", label: "供应方式" },
    { value: "数量", label: "数量" },
    { value: "总数量", label: "总数量" },
    { value: "单合毛重", label: "单合毛重" },
    { value: "是否委外", label: "是否委外" },
    { value: "工位", label: "工位" },
    { value: "描述", label: "描述" }
])
// 清空表单
const resetForm = () => {
  formRef.value?.resetFields()
}
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()

//#region 增、删、改、查
// 获取列表
const getList = (list: any[]) => {
    tableData.value = list || []
}
const goAdd = (type: 'add' | 'edit') => {
    formRef.value?.validate((valid) => {
        if (valid) {
          if (type === 'add') {
            const obj = JSON.parse(JSON.stringify(formData))
            tableData.value.push(obj)
            resetForm()
          } else if (type === 'edit') {
            Object.keys(chooseRow.value).forEach(ele => (chooseRow.value as any)[ele] = (formData as any)[ele])
            changeType('add')
          }
        }
    })
}
const save = () => {}
const goDel = (index: number) => {
    ElMessageBox.confirm("是否确认删除该属性设置？", t("dashboardPage.messageBoxTitle"), {
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
const getText_name = (name: string) => {
  const find = option_attribute.value.find(item => item.code === name)
  return find?.codeListNameC || ""
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
    colSetShow: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "index",
        label: "序号",
        width: "55",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "name",
        label: "字段名",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: 'name',
    },
    {
        prop: "value",
        label: "字段值",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        label: "操作",
        width: "55",
        fixed: "right",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "operate"
    }
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

//#region 字典数据
const loading_select = ref(false)
loading_select.value = true
const option_attribute = ref<any[]>([]) // 物料类型
getDictionarySelect({ codes: "ATTRIBUTE_SETTINGS" }).then((data) => {
    option_attribute.value = data.data.ATTRIBUTE_SETTINGS || []
})
.finally(() => loading_select.value = false)
//#endregion

defineExpose({
    getList,
    tableData
})
</script>

<style lang="scss" scoped>

.table-edit {
  width: 954px!important;
  :deep(.el-row) {
    position: relative;
    .edit-btn {
      position: absolute;
      right: 0;
    }
  }
}
</style>
