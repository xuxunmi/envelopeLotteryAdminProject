<template>
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      draggable
      overflow
      width="1000px"
      align-center
    >
        <div v-loading="loading" class="editConditionDialog">
            <span class="pt-table-title">条件表达式</span>
            <div class="list">
                <ExpressionEditList ref="ExpressionEditListRef" :objectRow="objectRow" />
            </div>
            <template v-if="isModule">
                <span class="pt-table-title">物料筛选</span>
                <div>
                    <PartFilterList ref="PartFilterListRef" :objectRow="objectRow" />
                </div>
            </template>
            <span class="pt-table-title">属性设置</span>
            <div class="list">
                <AttributeEditList ref="AttributeEditListRef" :isModule="isModule" />
            </div>
        </div>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="submit" size="small">保存</el-button>
            <el-button @click="dialog.visible = false" size="small">{{ t("dashboardPage.cancel") }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance, computed } from "vue"
import { ElMessage } from "element-plus"
import ExpressionEditList from "./expressionEditList.vue"
import PartFilterList from "./partFilterList.vue"
import AttributeEditList from "./attributeEditList.vue"
import { addCondition, editCondition } from "@/api/configureManage/productConfigure"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: {
            visible: false,
            title: "",
            row: {},
            type: "",
            layout: ""
        }
    },
    objectRow: {
        type: Object,
        default: {}
    },
    isModule: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

const layout = computed(() => props.dialog.layout.split(",").map((item: string) => item.trim()))
const formData = reactive({
    expression: [],
    partFilter: [],
    attribute: []
})

// 确认
const submit = () => {
    let expressions = [],
        part: any = {},
        properties = []
    if (instance.refs.ExpressionEditListRef) expressions = instance.refs.ExpressionEditListRef.tableData || []
    if (instance.refs.PartFilterListRef) part = instance.refs.PartFilterListRef.formData || {}
    if (instance.refs.AttributeEditListRef) properties = instance.refs.AttributeEditListRef.tableData || []
    // 校验数据
    if (!expressions.length) {
        ElMessage.error("请添加条件表达式！")
        return false
    }
    if (props.isModule && !part.oid) {
        ElMessage.error("请选择筛选物料！")
        return false
    }
    // if (!properties.length && !props.isModule) {
    //   ElMessage.error('请添加属性设置！')
    //   return false
    // }
    const conditionData = formatData_submit({ expressions, part, properties })
    console.log("submit", props, conditionData)
    loading.value = true
    const params: any = {
        oid: "",
        parentPartOid: "",
        ...conditionData
    }
    // 当选择的是模块时：oid是左侧选择的物料的父项oid；partOid是筛选物料oid；parentPartOid是左侧选择的物料的oid
    // 当选择的是非模块时：oid是左侧选择的物料的父项oid；partOid是左侧选择的物料的oid；parentPartOid是左侧选择的物料的父项oid
    if (props.isModule) {
        params.oid = props.objectRow.parentOid
        params.parentPartOid = props.objectRow.oid
        // 编辑筛选物料时，需要传旧的partOid
        if (props.dialog.type === 'edit' && props.dialog?.row) params.oldPartOid = props.dialog.row.partOid
    } else {
        params.oid = props.objectRow.parentOid
        params.partOid = props.objectRow.oid
        params.parentPartOid = props.objectRow.parentOid
    }
    if (props.dialog.type === "add" || props.dialog.type === "copy") {
        // 新增
        addCondition(params)
            .then((data) => {
                ElMessage.success("新建成功！")
                emits("handleEditSuccess")
            })
            .finally(() => (loading.value = false))
    } else if (props.dialog.type === "edit") {
        // 编辑
        //if (!props.isModule) {
        params.useOid = props.dialog.row.useOid // 非模块加一个useOid的字段 这个字段在查询的时候回返回到前端
        //}
        console.log('editCondition', params);
        editCondition(params)
            .then((data) => {
                ElMessage.success("编辑成功！")
                emits("handleEditSuccess")
            })
            .finally(() => (loading.value = false))
    }
}
// 格式化数据 - 保存
const formatData_submit = ({ expressions, part, properties }: { expressions: any[]; part: any; properties: any[] }) => {
    // 格式化条件表达式
    const list_expressions: any[] = []
    expressions.forEach((ele) => {
        const obj = {
            operator: ele.operator,
            logicalSymbol: ele.logicalSymbol,
            optionOid: ele.option.oid,
            choiceList: [] as any[]
        }
        ele.choiceList.forEach((choice: any) => obj.choiceList.push(choice.oid))
        list_expressions.push(obj)
    })
    // 格式化物料筛选
    const partOid = part.oid || ""
    // 格式化属性设置
    const list_attribute = properties.map((item) => {
        return {
            name: item.name,
            value: item.value
        }
    })

    return {
        expressions: list_expressions,
        partOid,
        properties: list_attribute
    }
}
// 格式化数据 - 回显
const formatData_show = (row: any) => {
    // 格式化条件表达式
    const list_expressions: any[] = JSON.parse(JSON.stringify(row.expressions || []))
    list_expressions.forEach((ele) => {
        ele.option = {
            oid: ele.optionOid,
            name: ele.optionName
        }
    })
    // 格式化筛选物料
    const list_part = {
        oid: row.partOid || "",
        number: row.partNumber || "",
        name: row.partName || ""
    }
    // 格式化属性设置
    const list_properties: any[] = JSON.parse(JSON.stringify(row.properties || []))

    return {
        expressions: list_expressions,
        part: list_part,
        properties: list_properties
    }
}

// 获取数据
const getData = () => {
    const data = formatData_show(props.dialog.row)
    setTimeout(() => {
        instance.refs.ExpressionEditListRef?.getList(data.expressions)
        instance.refs.PartFilterListRef?.getData(data.part)
        instance.refs.AttributeEditListRef?.getList(data.properties)
    }, 1)
}
if (props.dialog.type === "edit" || props.dialog.type === "copy") getData()
</script>
<style lang="scss" scoped>
.editConditionDialog {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  .list {
    flex: 1;
    height: 0;
  }
  :deep(.relation) {
      height: 100%;
      display: flex;
      flex-direction: column;
      .table-edit {
        width: 100%;
      }
      .relationForm {
        width: 100%;
        display: flex;
        gap: 4px;
        .el-form-item {
          margin: 0;
          margin-bottom: 10px;
          align-items: center;
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
          max-width: 886px;
          .el-checkbox-group {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-content: flex-start;
            gap: 8px;
            padding: 4px;
            max-height: 50px;
            min-width: 876px;
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
            min-width: 876px;
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
</style>
