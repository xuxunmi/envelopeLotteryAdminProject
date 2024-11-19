<template>
    <div class="sf-form-wrapper" v-loading="loading">
        <el-form
            ref="formModelRef"
            :model="formModel"
            :inline="true"
            :rules="rules"
            size="small"
            label-width="98px"
            label-position="right"
        >
            <el-form-item label="字典代码：" prop="code">
                <el-input
                    style="width: 180px"
                    v-model="formModel.code"
                    :disabled="!!currentRowData.oid || !isCanEdit"
                    clearable
                />
            </el-form-item>
            <el-form-item label="字典名称：" prop="name">
                <el-input style="width: 180px" v-model="formModel.name" clearable :disabled="!isCanEdit" />
            </el-form-item>
            <el-form-item label="字典状态：" prop="status">
                <el-select style="width: 180px" v-model="formModel.status" filterable clearable :disabled="!isCanEdit">
                    <el-option
                        v-for="item in dictionaryStatusList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="备注">
                <el-input
                    style="width: 180px"
                    type="textarea"
                    v-model="formModel.remark"
                    :autosize="{ minRows: 2 }"
                    clearable
                    :disabled="!isCanEdit"
                />
            </el-form-item>
        </el-form>
        <div class="table-container">
            <div class="dictionary-type-title w-full mt-4 px-2">
                <div>字典类型明细</div>
                <div>
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleAddBtn"
                        :disabled="!formModel.oid || !isCanEdit"
                        >新增</el-button
                    >
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleMoveUpBtn(chooseRow)"
                        :disabled="!!isCanEdit || !currentRowData.oid || !chooseRow.oid"
                        >上移</el-button
                    >
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleMoveDownBtn(chooseRow)"
                        :disabled="!!isCanEdit || !currentRowData.oid || !chooseRow.oid"
                        >下移</el-button
                    >
                    <el-button
                        size="small"
                        type="primary"
                        :disabled="!multipleSelection.length || !isCanEdit"
                        @click="handleDeleteBtn"
                        >移除</el-button
                    >
                </div>
            </div>
            <div class="mt-2">
                <el-table
                    ref="tableRef"
                    :data="tableData"
                    max-height="600"
                    size="small"
                    border
                    row-key="oid"
                    highlight-current-row
                    @select="handleSelect"
                    @selection-change="handleSelectionChange"
                    @row-click="handleRowclick"
                >
                    <el-table-column type="selection" reserve-selection width="55" />
                    <el-table-column prop="code" label="代码" header-align="center">
                        <template v-slot="scope">
                            <div v-if="!scope.row.isEdit">{{ scope.row.code }}</div>
                            <el-input size="small" v-model="scope.row.code" :disabled="!!scope.row.oid" v-else />
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="名称" header-align="center">
                        <template v-slot="scope">
                            <div v-if="!scope.row.isEdit">{{ scope.row.name }}</div>
                            <el-input size="small" v-model="scope.row.name" v-else />
                        </template>
                    </el-table-column>
                    <el-table-column prop="remark" label="备注" header-align="center">
                        <template v-slot="scope">
                            <div v-if="!scope.row.isEdit">{{ scope.row.remark }}</div>
                            <el-input
                                type="textarea"
                                :autosize="{ minRows: 2 }"
                                size="small"
                                v-model="scope.row.remark"
                                v-else
                            />
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" header-align="center">
                        <template v-slot="scope">
                            <div v-if="!scope.row.isEdit">
                                {{ getNameById(dictionaryStatusList, scope.row.status) }}
                            </div>
                            <template v-else>
                                <el-select size="small" v-model="scope.row.status">
                                    <el-option
                                        v-for="item in dictionaryStatusList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue"
import type { FormInstance, FormRules, ElTable } from "element-plus"
import { ElMessage } from "element-plus"
import { removeItemsInTree, findNextSiblingNodes, findPreviousSiblingNodes } from "@/utils"
import { dictionaryStatusList, getNameById } from "@/assets/common/select-list"
import { TableDataInterface } from "@/interface/system/dataDictionary"
import { dataDictionaryAddEdit, dataDictionaryDetail, detailTableMove } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "detailPage"
})

const { t } = useI18n()

const props = defineProps({
    currentRowData: {
        type: Object,
        default: () => {}
    },
    isCanEdit: {
        type: Boolean,
        default: false
    },
    dialogType: {
        type: String,
        default: "add"
    }
})

const emits = defineEmits(["save-success", "clear"])

const loading = ref(false)

//#region 表单
const formModelRef = ref<FormInstance>()
const formModel = reactive({
    oid: "",
    code: "", // 字典代码
    name: "", // 字典名称
    status: "1", // 字典状态
    remark: "" // 字典备注
})
const rules = reactive<FormRules>({
    code: [{ required: true, message: "请输入必填项！", trigger: "blur" }],
    name: [{ required: true, message: "请输入必填项！", trigger: "blur" }],
    status: [{ required: true, message: "请输入必填项！", trigger: "change" }]
})
//#endregion

//#region 字典类型表格
const tableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<any[]>([])
const tableData = ref<any>([]) // 字典类型明细列表
const chooseRow = ref({
    oid: ""
})

// 勾选指定行
const editRow = (row: TableDataInterface) => {
    nextTick(() => {
        if (tableRef.value) {
            tableRef!.value.toggleRowSelection(row, true)
        }
    })
}

// 处理行编辑
const handleRowclick = (row: TableDataInterface) => {
    chooseRow.value = row
    if (tableRef.value) {
        tableRef!.value.setCurrentRow(row)
    }
    if (!props.isCanEdit) return
    row.isEdit = true
    editRow(row)
}

const handleSelect = <T extends TableDataInterface>(selection: T[], row: T) => {
    row.isEdit = false
}

const handleSelectionChange = (val: TableDataInterface[]) => {
    multipleSelection.value = val
}
// 处理新增
const handleAddBtn = () => {
    const newRow = {
        oid: "",
        codeOidStr: "",
        code: "",
        name: "",
        status: "1",
        remark: "",
        sort: tableData.value.length + 1,
        isEdit: true
    }
    tableData.value.push(newRow)
    editRow(newRow)
}

// 处理上移
const handleMoveUpBtn = (row: any) => {
    console.log("row上: ", row)
    // 当前节点oid
    const currrentCodeOid = row.oid
    console.log("currrentCodeOid上:", currrentCodeOid)
    // 当前节点排序
    const currrentRowSort = row.sort
    console.log("currrentRowSort上:", currrentRowSort, tableData.value)
    const previousSiblingRow = findPreviousSiblingNodes(tableData.value, currrentCodeOid)
    console.log(" previousSiblingNodes上:", previousSiblingRow)
    if (previousSiblingRow.length) {
        // 上一兄弟节点oid
        const previousCodeOid = previousSiblingRow[0].oid
        // 上一兄弟节点排序
        const previousRowSort = previousSiblingRow[0].sort
        console.log("previousNodeOid:", previousCodeOid, previousRowSort)
        tablerowMoveHandler(currrentCodeOid, currrentRowSort, previousCodeOid, previousRowSort)
    } else {
        ElMessage({
            type: "warning",
            message: "当前行不可上移",
            center: true
        })
    }
}

// 处理上移
const handleMoveDownBtn = (row: any) => {
    console.log("row下: ", row)
    // 当前节点oid
    const currrentCodeOid = row.oid
    console.log("currrentCodeOid上:", currrentCodeOid)
    // 当前节点排序
    const currrentRowSort = row.sort
    console.log("currrentRowSort上:", currrentRowSort, tableData.value)
    const nextSiblingNodes = findNextSiblingNodes(tableData.value, currrentCodeOid)
    console.log(" nextSiblingNodes下:", nextSiblingNodes)
    if (nextSiblingNodes.length) {
        // 下一兄弟节点oid
        const nextCodeOid = nextSiblingNodes[0].oid
        // 下一兄弟节点排序
        const nextRowSort = nextSiblingNodes[0].sort
        console.log("nextCodeOid:", nextCodeOid, nextRowSort)
        tablerowMoveHandler(currrentCodeOid, currrentRowSort, nextCodeOid, nextRowSort)
    } else {
        ElMessage({
            type: "warning",
            message: "当前行不可下移",
            center: true
        })
    }
}

// 上移/下移操作
const tablerowMoveHandler = async (codeOid: string, codeSort: number, moveCodeOid: string, moveCodeSort: number) => {
    console.log("移动参数：", codeOid, codeSort, moveCodeOid, moveCodeSort)
    if (!moveCodeOid) return
    try {
        loading.value = true
        const params = {
            codeOid, // 当前选择行oid
            // 当前选择行排序
            codeSort,
            moveCodeOid, // 移动行oid
            moveCodeSort // 移动行排序
        }
        await detailTableMove(params)
        await getDetailsData(props.currentRowData.oid)
        // 移动成功后获取最新的chooseRow
        const newChooseRow = tableData.value.find((item: any) => item.oid === chooseRow.value.oid)
        // chooseRow重新赋值
        chooseRow.value = newChooseRow
        ElMessage({
            type: "success",
            message: "移动成功",
            center: true
        })
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 处理移除
const handleDeleteBtn = () => {
    ElMessageBox.confirm("确认移除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            removeItemsInTree(tableData.value, multipleSelection.value)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消操作！",
                center: true
            })
        })
}
//#endregion

// 获取右侧详情
const getDetailsData = async (oid: string) => {
    try {
        loading.value = true
        const params: {
            oidStr: string
        } = {
            oidStr: oid
        }
        const { data } = await dataDictionaryDetail(params)
        Object.assign(formModel, {
            oid: data.oidStr,
            code: data.code,
            name: data.codeNameC,
            status: String(data.status),
            remark: data.remark
        })
        tableData.value = data.codeProfiles.map((item: any) => {
            return {
                oid: item.oidStr,
                codeOidStr: item.codeOidStr,
                code: item.code,
                name: item.codeListNameC,
                status: String(item.status),
                remark: item.remark,
                sort: item.sort,
                isEdit: false
            }
        })
        loading.value = false
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

// 清除表单
const handleClear = () => {
    formModelRef.value!.resetFields()
    Object.assign(formModel, {
        ...formModel,
        oid: "",
        codeOidStr: "",
        code: "",
        name: "",
        status: "1",
        remark: ""
    })
    tableData.value = []
    if (tableRef.value) {
        tableRef!.value.clearSelection()
    }
    emits("clear")
}

const handleEditClear = () => {
    tableData.value = tableData.value.map((item: any) => {
        return {
            ...item,
            isEdit: false
        }
    })
    if (tableRef.value) {
        tableRef!.value.clearSelection()
    }
    chooseRow.value = {
        oid: ""
    }
}

// 检验
const validateCodeRepeat = async (arr: any) => {
    const codeSet = new Set()
    for (const item of arr) {
        if (codeSet.has(item.code)) {
            return true
        } else {
            codeSet.add(item.code)
        }
    }
    return false
}

// 处理保存按钮
const handleSaveBtn = async (leaveParams: any) => {
    if (!formModelRef.value) return
    await formModelRef.value.validate(async (valid) => {
        if (valid) {
            try {
                for (let index = 0; index < tableData.value.length; index++) {
                    const element = tableData.value[index]
                    if (!element.code || !element.name || !element.status) {
                        ElMessage({
                            type: "warning",
                            message: "字典类型明细代码、名称和状态必填！",
                            center: true
                        })
                        return
                    }
                }
                const hasDuplicate = await validateCodeRepeat(tableData.value)
                console.log("hasDuplicate: ", hasDuplicate)
                if (hasDuplicate) {
                    ElMessage({
                        type: "warning",
                        message: "字典类型明细代码重复！",
                        center: true
                    })
                    return
                }
                loading.value = true
                let i = 0
                const codeProfiles = tableData.value.map((item: any) => {
                    return {
                        oidStr: item.oid,
                        codeOidStr: item.codeOidStr,
                        code: item.code,
                        codeListNameC: item.name,
                        status: item.status,
                        remark: item.remark,
                        sort: i++
                    }
                })
                const params: {
                    oidStr?: string
                    code: string
                    codeNameC: string
                    status: string
                    remark?: string
                    codeProfiles: []
                } = {
                    oidStr: formModel.oid,
                    code: formModel.code,
                    codeNameC: formModel.name,
                    status: formModel.status,
                    remark: formModel.remark,
                    codeProfiles
                }
                const { data } = (await dataDictionaryAddEdit(params)) as { data: string }
                ElMessage({
                    type: "success",
                    message: formModel.oid ? "编辑成功" : "新建成功",
                    center: true
                })
                if (leaveParams.isCanLeave) {
                    formModelRef.value!.resetFields()
                    if (typeof leaveParams.fn === "function") {
                        leaveParams.fn()
                    }
                }
                tableRef.value!.clearSelection()
                loading.value = false
                emits("save-success", data)
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        } else {
            if (leaveParams.isCanLeave) {
                ElMessage({
                    type: "warning",
                    message: "页面已离开，数据未保存成功！",
                    center: true
                })
                if (typeof leaveParams.fn === "function") {
                    leaveParams.fn()
                }
            }
        }
    })
}

defineExpose({
    getDetailsData,
    handleClear,
    handleEditClear,
    handleSaveBtn
})
</script>

<style lang="scss" scoped>
.sf-form-wrapper {
    padding: 5px;
    :deep(.el-form) {
        .el-form-item {
            margin-bottom: 22px !important;
        }
    }
    .table-container {
        .dictionary-type-title {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            line-height: 30px;
            background-color: #efefef;
        }
    }
}
</style>
