<template>
    <div class="optionList">
        <div class="options">
            <pt-table
                v-loading="loading"
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
                :row-class-name="tableRowClassName"
                @row-click="handleRowClick"
                @selection-change="handleSelectionChange"
            >
                <!-- 表格编辑插槽 -->
                <template #slot-edit>
                    <span v-if="!onlyRead && type !== 'insert'" class="table-edit">
                        <el-button type="primary" size="small" @click="goRemove(chooseRow)">移除</el-button>
                        <el-button type="primary" size="small" @click="goInsert_option">添加</el-button>
                        <el-button type="primary" size="small" @click="goEdit_option(chooseRow)"
                            >编辑</el-button
                        >
                        <el-button type="primary" size="small" @click="setFeatureOrder">设置特征顺序</el-button>
                        <el-button type="primary" size="small" @click="goExport">导出</el-button>
                    </span>
                </template>
                <!-- 自定义列模板插槽 -->
                <template #head-search="{ column }">
                    <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
                </template>
                <!-- 表格行选择 -->
                <template #head-choose="{ column }">
                    <el-checkbox
                        v-model="tableRowChecked_choose.isCheckAll"
                        size="small"
                        :indeterminate="tableRowChecked_choose.isIndeterminate"
                        :disabled="!tableData.length"
                        @change="(val: any) => handleCheckboxChange_choose(val, tableData)"
                    />
                    {{ column.label }}
                </template>
                <template #col-choose="{ row }">
                    <el-checkbox
                        v-if="showFlag"
                        :checked="row.checked"
                        size="small"
                        @change="(val: any) => handleCheckboxChange_choose(val, [row])"
                    />
                </template>
                <!-- 是否二次选配 -->
                <template #head-proConfig="{ column }">
                    <el-checkbox
                        v-if="!onlyRead"
                        v-model="tableRowChecked_proConfig.isCheckAll"
                        size="small"
                        :indeterminate="tableRowChecked_proConfig.isIndeterminate"
                        :disabled="!tableData.length"
                        @change="(val: any) => handleCheckboxChange_proConfig(val, tableData)"
                    />
                    {{ column.label }}
                </template>
                <template #col-proConfig="{ row }">
                    <template v-if="onlyRead">
                        <span v-if="row.productConfiguration === true">是</span>
                        <span v-else-if="row.productConfiguration === false">否</span>
                    </template>
                    <template v-else>
                        <el-checkbox
                            v-model="row.productConfiguration"
                            label=""
                            size="small"
                            @change="(val: any) => handleCheckboxChange_proConfig(val, [row])"
                            @click.stop
                        />
                    </template>
                </template>
                <!-- 界面可见性选择 -->
                <template #head-view="{ column }">
                    <el-checkbox
                        v-if="!onlyRead"
                        v-model="tableRowChecked_view.isCheckAll"
                        size="small"
                        :indeterminate="tableRowChecked_view.isIndeterminate"
                        :disabled="!tableData.length"
                        @change="(val: any) => handleCheckboxChange_view(val, tableData)"
                    />
                    {{ column.label }}
                </template>
                <template #col-view="{ row }">
                    <template v-if="onlyRead">
                        <span v-if="row.visitable === true">可见</span>
                        <span v-else-if="row.visitable === false">不可见</span>
                    </template>
                    <template v-else>
                        <el-checkbox
                            v-model="row.visitable"
                            label=""
                            size="small"
                            @change="(val: any) => handleCheckboxChange_view(val, [row])"
                            @click.stop
                        />
                    </template>
                </template>
                <template #col-optionType="{ row }">
                    <span
                        v-text="
                            getNameById(option_productType, row.optionType + '', {
                                value: 'code',
                                label: 'codeListNameC'
                            })
                        "
                    />
                </template>
            </pt-table>
        </div>
        <div v-if="type === 'insert'" class="choices">
            <el-table :key="onlyKey" :data="tableData_choice" border size="small" style="width: 100%" height="100%">
                <el-table-column>
                    <template #header>
                        <span>{{ chooseRow?.name }}</span>
                    </template>
                    <template #default="{ row }">
                        <el-checkbox
                            v-model="row.checked"
                            size="small"
                            :label="row.name"
                            @change="handleCheckboxChange_choice"
                        />
                    </template>
                </el-table-column>
                <el-table-column v-if="from === 'productNameSimplifyRules'" label="简化名称">
                    <template #default="{ row }">
                        <el-input
                            v-if="row.checked"
                            v-model="row.simplifyRules"
                            size="small"
                            placeholder="请输入简化名称"
                            clearable
                            style="width: 100%"
                        />
                    </template>
                </el-table-column>
                <el-table-column v-if="showDefaultColumn" label="默认值" align="center" width="65">
                    <template #default="{ row }">
                        <el-checkbox
                            v-model="row.isDefault"
                            size="small"
                            @change="(val) => handleCheckboxChange_default(val, row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>

    <!-- 设置特征顺序 - 弹窗 -->
    <SetFeatureOrderDialog
        v-if="setFeatureOrderDialog.visible"
        ref="SetFeatureOrderDialogRef"
        :dialog="setFeatureOrderDialog"
        @handleEditSuccess="handleEditSuccess_order"
    />
    <!-- 添加特征 - 弹窗 -->
    <InsetOptionDialog
        v-if="insetOptionDialog.visible"
        :dialog="insetOptionDialog"
        @handleEditSuccess="handleEditSuccess_insert"
    />
    <!-- 编辑特征 - 弹窗 -->
    <EditOptionValueDialog
        v-if="editOptionValueDialog.visible"
        :dialog="editOptionValueDialog"
        :objectRow="objectRow"
        @handleEditSuccess="handleEditSuccess_edit"
    />
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance, computed } from "vue"
import { type CheckboxValueType } from "element-plus"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import SetFeatureOrderDialog from "@/views/traitManage/vehicleModelTraitCollection/components/setFeatureOrderDialog.vue"
import InsetOptionDialog from "./insetOptionDialog.vue"
import EditOptionValueDialog from "./editOptionValueDialog.vue"
import { filterArray, resetFilterValue, formatDateTime, recursionArray } from "@/utils"
import { delOption, setConfigurationSeq, updateOption, addOption, exportOptionListOfPart, saveOption } from "@/api/configureManage/productConfigure";
import { getDictionarySelect } from "@/api/system/dataDictionary"
import emitter from "@/utils/mitt"
import { downloadFile } from "@/utils/exportTemplate"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    type: {
        type: String,
        default: ""
    },
    objectRow: {
        type: Object,
        default: {}
    },
    /**
     * 引用页面（productNameSimplifyRules：品名简化规则；variableTab：维护配置-配置特征）
     */
    from: {
        type: String,
        default: ""
    },
    /**
     * 是否只读
     */
    onlyRead: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(["getList", "refresh"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
const showDefaultColumn = computed(() => props.from === "variableTab" && props.objectRow?.isTop) // 特征值列表是否展示默认值列
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const chooseRow = ref()
const currentRowData = ref()

//#region 增、删、改、查
// 获取列表
const getList = (list: any[]) => {
    console.log("getList", list)
    // list[0].choice[0].isDefault = true
    chooseRow.value = null
    multipleSelection.value = []
    list.forEach((option: any) => resetDefault(option))
    sourceData.value = list
    resetFilterValue(filterValue)
    search()
}
// 移除
const goRemove = (row: any) => {
    if (!row) {
        ElMessage.warning("请选择一行数据！")
        return false
    }
    ElMessageBox.confirm("是否确认移除选择的特征？", t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        loading.value = true
        const params = {
            oid: props.objectRow.oid,
            optionOid: row.oid
        }
        delOption(params)
            .then((data) => {
                ElMessage.success(t("dashboardPage.deleteSuccess"))
                emits("getList")
            })
            .finally(() => (loading.value = false))
    })
}
// 添加特征
const insertOption = (list: any[]) => {
    // 格式化数据
    const choiceInfo: any[] = []
    for (let i = 0; i < list.length; i++) {
        const option = list[i]
        if (option.checked) {
            // 选中的特征
            const data: any = {
                optionOid: option.oid,
                choiceOids: [] as any[],
                defaultChoice: ""
            }
            data.defaultChoice = option.defaultChoice
            // 维护配置-配置特征：最顶层添加特征的时候必须要设置默认值，第二层、第三层等默认使用最顶层的默认值!
            if (showDefaultColumn.value) {
                // 校验（默认值必须勾选上）
                if (!option.defaultChoice) {
                    ElMessage.error(`第${i + 1}行特征：${option.name}未勾选默认值！`)
                    return false
                }
            }
            const choices = option.choice || []
            for (let j = 0; j < choices.length; j++) {
                const choice = choices[j]
                if (choice.checked) {
                    data.choiceOids.push(choice.oid)
                }
                if (showDefaultColumn.value) {
                    // 校验（默认值必须要有 并且 默认值对应的特征值必须勾选上）
                    if (choice.isDefault && !choice.checked) {
                        ElMessage.error(
                            `第${i + 1}行特征（${option.name}）默认值对应的特征值（${choice.name}）未勾选！`
                        )
                        return false
                    }
                }
            }
            choiceInfo.push(data)
        }
    }
    // console.log('submit', list, choiceInfo);
    // return false
    if (!choiceInfo.length) {
        ElMessage.error("请选择一个特征！")
        return false
    }
    const params = {
        oid: insetOptionDialog.row.oid,
        choiceInfo
    }
    insetOptionDialog.loading = true
    addOption(params)
        .then((res: any) => {
            if (res.resultCode == 200) {
                ElMessage.success("添加成功！")
                Object.assign(insetOptionDialog, {
                    visible: false,
                    title: "",
                    row: null
                })
                emits("getList")
            } else {
                ElMessageBox.alert(res.message || t("pdmServers.interfaceError"), '提示', {
                  confirmButtonText: '确认',
                  type: 'error',
                  center: true,
                })
            }
        })
        .finally(() => (insetOptionDialog.loading = false))
}
// 编辑特征
const editOption = (choseList: any[] = [], optionOid: string) => {
  const params = {
    oid: props.objectRow.oid,
    choiceInfo: [{
      optionOid,
      defaultChoice: '',
      choiceOids: [] as any[]
    }]
  }
  for (let i = 0; i < choseList.length; i++) {
    const choice = choseList[i];
    if (choice.checked) {
      params.choiceInfo[0].choiceOids.push(choice.oid)
    }
    // 校验（默认值对应的特征值必须勾选上）
    if (choice.isDefault) {
      if (choice.checked) {
        params.choiceInfo[0].defaultChoice = choice.oid
      } else {
        ElMessage.error(`默认值对应的特征值（${choice.name}）未勾选！`)
        return false
      }
    }
  }
  editOptionValueDialog.loading = true
  saveOption(params).then(data => {
    ElMessage.success('保存成功！')
    Object.assign(editOptionValueDialog, {
      visible: false,
      row: null,
    })
    emits('getList')
  })
  .finally(() => editOptionValueDialog.loading = false)
}
// 导出
const goExport = () => {
    // console.log('goExport', props.objectRow);
    const params = {
        topPartoid: props.objectRow.PartOid,
        topPartNumber: props.objectRow.Number,
        ProductName: props.objectRow.ProductName
    }
    exportOptionListOfPart(params).then((data) => {
        const filename = `${props.objectRow.Name}-特征-${formatDateTime(new Date(), "YYYYMMDD")}`
        downloadFile(data, filename)
    })
}

//#region 表格行选择
const showFlag = ref(false)
const tableRowChecked_choose = reactive({
    isCheckAll: false, // 是否全选
    isIndeterminate: false // 不确定状态
})
// 初始化全选框状态
const initCheckAllState_choose = () => {
    const list = tableData.value
    const checkedList = list.filter((ele) => ele.checked)
    const checkedCount = checkedList.length
    tableRowChecked_choose.isCheckAll = checkedCount === list.length
    tableRowChecked_choose.isIndeterminate = checkedCount > 0 && checkedCount < list.length
    console.log("tableRowChecked_choose", tableRowChecked_choose)
}
// 选择回调
const handleCheckboxChange_choose = (val: boolean, rows: any[]) => {
    console.log("handleCheckboxChange_choose", val, rows)
    rows.forEach((option) => {
        option.checked = val
        const choicesNameArr: any[] = []
        if (option.choice.length) {
            option.choice.forEach((choice: any) => {
                choice.checked = val
                if (val) choicesNameArr.push(choice.name)
            })
            option.choiceList = choicesNameArr.join("; ")
        }
    })
    resetCheckBox()
}
// 刷新复选框
const resetCheckBox = () => {
    showFlag.value = false
    nextTick(() => {
        showFlag.value = true
        initCheckAllState_choose()
    })
}
// 更新默认值
const resetChoicesName = (option: any, isChecked?: boolean) => {
    if (option.choice.length) {
        const choicesNameArr: any[] = []
        option.choice.forEach((choice: any) => {
            if (isChecked) {
                if (choice.checked) choicesNameArr.push(choice.name)
            } else {
                choicesNameArr.push(choice.name)
            }
        })
        option.choiceList = choicesNameArr.join("; ")
    }
}
//#endregion

//#region 是否二次选配修改
const tableRowChecked_proConfig = reactive({
    isCheckAll: false, // 是否全选
    isIndeterminate: false // 不确定状态
})
// 初始化全选框状态
const initCheckAllState_proConfig = (list: any[]) => {
    const checkedList = list.filter((ele) => ele.productConfiguration)
    const checkedCount = checkedList.length
    tableRowChecked_proConfig.isCheckAll = checkedCount === list.length
    tableRowChecked_proConfig.isIndeterminate = checkedCount > 0 && checkedCount < list.length
}
// 选择回调
const handleCheckboxChange_proConfig = (val: boolean, rows: any[]) => {
    console.log("handleCheckboxChange_proConfig", val, rows)
    loading.value = true
    const options = rows.map((item) => item.oid)
    const params = {
        oid: props.objectRow.oid, // 物料Oid
        optionOid: options.join(","), // 选项Oid
        productConfiguration: val // 界面可见性
    }
    updateOption(params)
        .then((data) => {
            ElMessage.success("修改成功！")
            emits("getList")
        })
        .finally(() => (loading.value = false))
}
//#endregion

//#region 界面可见性修改
const tableRowChecked_view = reactive({
    isCheckAll: false, // 是否全选
    isIndeterminate: false // 不确定状态
})
// 初始化全选框状态
const initCheckAllState_view = (list: any[]) => {
    const checkedList = list.filter((ele) => ele.visitable)
    const checkedCount = checkedList.length
    tableRowChecked_view.isCheckAll = checkedCount === list.length
    tableRowChecked_view.isIndeterminate = checkedCount > 0 && checkedCount < list.length
}
// 选择回调
const handleCheckboxChange_view = (val: boolean, rows: any[]) => {
    console.log("handleCheckboxChange_view", val, rows)
    loading.value = true
    const options = rows.map((item) => item.oid)
    const params = {
        oid: props.objectRow.oid, // 物料Oid
        optionOid: options.join(","), // 选项Oid
        visitable: val // 界面可见性
    }
    updateOption(params)
        .then((data) => {
            ElMessage.success("修改成功！")
            emits("getList")
        })
        .finally(() => (loading.value = false))
}
//#endregion

//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
}
// 事件
const setCurrent = (row?: any) => {
    chooseRow.value = row
    currentRowData.value = row
    PtTableRef.value!.setCurrentRow(row)
    tableData_choice.value = row.choice
    onlyKey.value++

    // 添加特征
    if (props.type === "insert") {
        if (row.checked) {
            row.checked = row.checked ? false : true
            handleCheckboxChange_choose(row.checked, [row])
        } else {
            handleCheckboxChange_choose(true, [row])
        }
    }
}
const tableRowClassName = ({ row }: { row: any; rowIndex: number }) => {
    // 如果当前行被勾选，返回一个自定义的类名
    if (row.checked) {
        return "front-checked"
    }
    if (props.type === "insert") {
        return "front-not-checked"
    }

    return ""
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false,
    fullScreen: !props.onlyRead,
    show: props.type !== "insert"
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "index",
        label: "序号",
        width: "55",
        headerAlign: "center",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        width: "34",
        headerAlign: "center",
        show: true,
        slot: "choose",
        disabled: props.type !== "insert"
    },
    {
        prop: "optionType",
        label: "产品分类",
        headerAlign: "center",
        width: "120",
        sortable: true,
        // showOverflowTooltip: true,
        show: true,
        slot: "optionType"
    },
    {
        prop: "number",
        label: "特征编码",
        headerAlign: "center",
        width: "160",
        slot: "search",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "name",
        label: "特征名称",
        headerAlign: "center",
        width: "180",
        slot: "search",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "defaultValue",
        label: "默认值",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "choiceList",
        label: "特征值",
        headerAlign: "center",
        minWidth: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
    },
    {
        label: "是否二次选配",
        width: "122",
        headerAlign: "center",
        fixed: "right",
        show: true,
        slot: "proConfig",
        disabled: props.type === "insert"
    },
    {
        label: "界面可见性",
        width: "120",
        headerAlign: "center",
        fixed: "right",
        show: true,
        slot: "view",
        disabled: props.type === "insert"
    },
    {
        prop: "desc",
        label: "描述",
        headerAlign: "center",
        width: "160",
        sortable: true,
        // showOverflowTooltip: true,
        show: true
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

//#region 特征值列表
const onlyKey = ref(1)
const tableData_choice = ref<any[]>([])
// 更新默认值
const resetDefault = (row: any) => {
    let defaultChoice = ""
    let defaultValue = ""
    row.choice.forEach((choice: any) => {
        if (choice.isDefault) {
            defaultChoice = choice.number
            defaultValue = choice.name
        }
    })
    row.defaultChoice = defaultChoice
    row.defaultValue = defaultValue
}
const handleCheckboxChange_choice = (val: CheckboxValueType) => {
    // 更新特征选中
    const choices = chooseRow.value.choice || []
    let checked = false
    choices.forEach((choice: any) => {
        if (choice.checked) checked = true
    })
    chooseRow.value.checked = checked
    resetCheckBox()
    resetChoicesName(chooseRow.value, true)
}
const handleCheckboxChange_default = (val: CheckboxValueType, choice: any) => {
    tableData_choice.value.forEach((ele) => (ele.isDefault = false))
    choice.isDefault = val
    resetDefault(chooseRow.value)
}
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value, { clone: false })
    initCheckAllState_view(tableData.value)
    initCheckAllState_proConfig(tableData.value)
    resetCheckBox()
    // 编辑后，高亮当前编辑行
    if (currentRowData.value) {
        recursionArray(tableData.value, (item: any) => {
            if (item.oid && item.oid === currentRowData.value.oid) {
                nextTick(() => {
                    setCurrent(item)
                })
            }
        })
    }
}
//#endregion

//#region 设置特征顺序 - 弹窗
const optionList = ref()
const setFeatureOrderDialog = reactive<any>({
    visible: false,
    title: "",
    loading: false
})
// 打开设置特征顺序弹窗
const setFeatureOrder = () => {
    console.log("setFeatureOrder")
    Object.assign(setFeatureOrderDialog, {
        visible: true,
        title: "设置特征顺序",
        tableData: JSON.parse(JSON.stringify(sourceData.value))
    })
}
// 保存顺序
const handleEditSuccess_order = (arr: any[]) => {
    console.log("handleEditSuccess_order", arr)
    setFeatureOrderDialog.loading = true
    const params = {
        oid: props.objectRow.oid,
        optionList: arr.map((item) => {
            return {
                oid: item.oid,
                configurationSeq: item.configurationSeq
            }
        })
    }
    setConfigurationSeq(params)
        .then((data) => {
            ElMessage.success("保存成功！")
            emits("getList")
            Object.assign(setFeatureOrderDialog, {
                visible: false,
                title: ""
            })
        })
        .finally(() => (setFeatureOrderDialog.loading = false))
}
//#endregion

//#region 添加特征 - 弹窗
const insetOptionDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    from: props.from,
    loading: false
})
// 添加特征
const goInsert_option = () => {
    Object.assign(insetOptionDialog, {
        visible: true,
        title: `添加特征：${props.objectRow.Number}, ${props.objectRow.topObjectName}`,
        row: props.objectRow,
        loading: false
    })
}
// 添加特征成功回调
const handleEditSuccess_insert = (list: any[]) => {
    console.log("handleEditSuccess_insert", list)
    insertOption(list)
}
//#endregion

//#region 编辑特征 - 弹窗
const editOptionValueDialog = reactive<any>({
    visible: false,
    title: "编辑特征",
    row: null,
    loading: false
})
// 添加特征
const goEdit_option = (row: any) => {
  console.log('goEdit_option', row);
  if (!row) {
      ElMessage.warning("请选择一行数据！")
      return false
  }
  Object.assign(editOptionValueDialog, {
    visible: true,
    row,
  })
}
// 添加特征成功回调
const handleEditSuccess_edit = (list: any[]) => {
    console.log("handleEditSuccess_edit", list)
    editOption(list, editOptionValueDialog.row.oid)
}
//#endregion

//#region 字典数据
const option_productType = ref<any[]>([]) // 产品分类
getDictionarySelect({ codes: "PRODUCT_TYPE" }).then((data) => {
    option_productType.value = data.data.PRODUCT_TYPE || []
})
//#endregion

defineExpose({
    loading,
    getList,
    sourceData,
    chooseRow,
    multipleSelection
})
</script>

<style lang="scss" scoped>
.optionList {
    height: 100%;
    display: flex;
    gap: 8px;
    .options {
        flex: 1;
        width: 0;
        :deep(.pt-table) {
            .front-checked {
                td.el-table__cell {
                    background-color: #f9e2d0 !important;
                }
            }
            .front-not-checked {
                td.el-table__cell {
                    background-color: #fff !important;
                }
                td.el-table-fixed-column--left {
                    background-color: #fff !important;
                }
            }
        }
    }
    .choices {
        width: 400px;
        height: 100%;
    }
    .choiceTree {
        :deep(.el-tree-node__content) {
            display: inline-flex;
            min-width: 100%;
        }
    }
}
</style>
