<template>
    <div class="detail-page">
        <div class="title">
            <el-button size="small" @click="handleSaveBtn">{{ t("systemLanguagePage.save") }}</el-button>
        </div>
        <div class="menu-name-container mt-4">
            <div>{{ t("systemLanguagePage.menuNameTranslation") }}</div>
            <el-table
                ref="menuNameTableRefs"
                :data="menuNameTableData"
                border
                header-align="center"
                highlight-current-row
                size="small"
                @row-click="handleMenuNameRowclick"
            >
                <el-table-column prop="menuCode" :label="t('systemLanguagePage.menuCode')" sortable />
                <el-table-column prop="menuNameZh" :label="t('systemLanguagePage.languageZh')" sortable>
                    <template #default="scope">
                        <div v-if="!scope.row.isEdit">{{ scope.row.menuNameZh }}</div>
                        <el-input size="small" v-model.trim="scope.row.menuNameZh" v-else />
                    </template>
                </el-table-column>
                <el-table-column prop="menuNameEn" :label="t('systemLanguagePage.languageEn')" sortable>
                    <template #default="scope">
                        <div v-if="!scope.row.isEdit">{{ scope.row.menuNameEn }}</div>
                        <el-input size="small" v-model.trim="scope.row.menuNameEn" v-else />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="interface-field-container mt-4">
            <div class="mb-4">{{ t("systemLanguagePage.interfaceFieldTranslation") }}</div>
            <div class="mb-4 flex justify-between">
                <div>
                    <el-button
                        class="mr-2"
                        size="small"
                        type="primary"
                        icon="Plus"
                        @click="handleAddBtn"
                        :disabled="!menuNameTableData.length"
                        >{{ t("systemLanguagePage.add") }}</el-button
                    >
                    <el-popconfirm
                        class="mr-2"
                        :title="t('systemLanguagePage.deleteSelectedData')"
                        :confirm-button-text="t('systemLanguagePage.confirm')"
                        :cancel-button-text="t('systemLanguagePage.cancel')"
                        width="310"
                        @confirm="handleDeleteBtn"
                    >
                        <template #reference>
                            <el-button
                                size="small"
                                type="primary"
                                icon="Delete"
                                :disabled="!multipleSelection.length"
                                >{{ t("systemLanguagePage.delete") }}</el-button
                            >
                        </template>
                    </el-popconfirm>
                </div>
                <el-pagination layout="total" :total="interfaceFieldTableData.length" />
            </div>
            <el-table
                ref="interfaceFieldTableRefs"
                :data="interfaceFieldTableData"
                border
                max-height="590"
                header-align="center"
                highlight-current-row
                size="small"
                @row-click="handleInterfaceFieldRowclick"
                @select="handleSelect"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="60" />
                <el-table-column prop="menuCode" :label="t('systemLanguagePage.menuCode')" />
                <el-table-column prop="fieldId" :label="t('systemLanguagePage.fieldName')" sortable>
                    <template #default="scope">
                        <div v-if="!scope.row.isEdit">{{ scope.row.fieldId }}</div>
                        <el-input size="small" :disabled="!!scope.row.oid" v-model.trim="scope.row.fieldId" v-else />
                    </template>
                </el-table-column>
                <el-table-column prop="fieldNameZh" :label="t('systemLanguagePage.languageZh')" sortable>
                    <template #default="scope">
                        <div v-if="!scope.row.isEdit">{{ scope.row.fieldNameZh }}</div>
                        <el-input size="small" v-model.trim="scope.row.fieldNameZh" v-else />
                    </template>
                </el-table-column>
                <el-table-column prop="fieldNameEn" :label="t('systemLanguagePage.languageEn')" sortable>
                    <template #default="scope">
                        <div v-if="!scope.row.isEdit">{{ scope.row.fieldNameEn }}</div>
                        <el-input size="small" v-model.trim="scope.row.fieldNameEn" v-else />
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue"
import type { ElTable } from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"
import { removeItemsInTree } from "@/utils"
import { MenuNameInterface, InterfaceFieldRefs } from "@/interface/system/systemLanguage"
import { getMenuTreeDetail, fieldTranslateBatchSave } from "@/api/system/systemLanguage"
import { useInternationalStoreHook } from "@/store/modules/international"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "detailPage"
})

const useInternationalStore = useInternationalStoreHook()
const { t } = useI18n()

const props = defineProps({
    menuCode: {
        type: [String, Number],
        required: true
    }
})

//#region 菜单名称表格
const menuNameTableRefs = ref<InstanceType<typeof ElTable>>()
const menuNameTableData = ref<MenuNameInterface[]>([])

// 处理菜单行编辑
const handleMenuNameRowclick = (row: MenuNameInterface) => {
    row.isEdit = true
}
//#endregion

//#region 界面字段表格
const interfaceFieldTableRefs = ref<InstanceType<typeof ElTable>>()
const interfaceFieldTableData = ref<InterfaceFieldRefs[]>([])
const multipleSelection = ref<InterfaceFieldRefs[]>([])

// 勾选指定行
const editRow = (row: InterfaceFieldRefs) => {
    nextTick(() => {
        if (interfaceFieldTableRefs.value) {
            interfaceFieldTableRefs!.value.toggleRowSelection(row, true)
        }
    })
}

// 处理行编辑
const handleInterfaceFieldRowclick = (row: InterfaceFieldRefs) => {
    row.isEdit = true
    editRow(row)
}

const handleSelect = <T extends InterfaceFieldRefs>(selection: T[], row: T) => {
    row.isEdit = false
}

const handleSelectionChange = (val: InterfaceFieldRefs[]) => {
    multipleSelection.value = val
}
// 处理新增
const handleAddBtn = () => {
    const newRow = {
        oid: "",
        menuCode: menuNameTableData.value[0]?.menuCode,
        fieldId: "",
        fieldNameZh: "",
        fieldNameEn: "",
        status: "",
        isEdit: true
    }
    interfaceFieldTableData.value.unshift(newRow)
    editRow(newRow)
}
// 处理删除
const handleDeleteBtn = () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: t("messageBox.selectRecordMsg"),
            center: true
        })
        return
    }
    removeItemsInTree(interfaceFieldTableData.value, multipleSelection.value)
}
//#endregion

// 获取右侧详情
const getDetailsData = async (menuCode: string | number) => {
    try {
        const params = {
            menuCode
        }
        const { data } = await getMenuTreeDetail(params)
        const { menu, field } = data
        menuNameTableData.value = [
            {
                oid: menu.id,
                menuCode: menu.menuCode,
                menuNameZh: menu.menuName,
                menuNameEn: menu.menuSname,
                isEdit: false
            }
        ]

        interfaceFieldTableData.value = field.map((item: any) => {
            return {
                oid: item.id,
                menuCode: item.menuCode,
                fieldId: item.columnId,
                fieldNameZh: item.columnNameC,
                fieldNameEn: item.columnNameE,
                isEdit: false
            }
        })
    } catch (err: any) {
        if (err.msg)
            ElMessage({
                type: "error",
                message: err.msg,
                center: true
            })
        return
    }
}

// 处理保存按钮
const handleSaveBtn = () => {
    ElMessageBox.confirm(t("systemLanguagePage.saveMsg"), {
        confirmButtonText: t("systemLanguagePage.confirm"),
        cancelButtonText: t("systemLanguagePage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        center: true
    })
        .then(async () => {
            const newMenuNameTableData = menuNameTableData.value.map((item) => {
                return {
                    id: item.oid,
                    menuCode: item.menuCode,
                    menuName: item.menuNameZh,
                    menuSname: item.menuNameEn
                }
            })
            const data = {
                menu: newMenuNameTableData[0],
                field: interfaceFieldTableData.value.map((item) => {
                    return {
                        id: item.oid,
                        menuCode: item.menuCode,
                        columnId: item.fieldId,
                        columnNameC: item.fieldNameZh,
                        columnNameE: item.fieldNameEn
                    }
                })
            }
            await fieldTranslateBatchSave(data)
            getDetailsData(props.menuCode)
            useInternationalStore.getInternationalFields(true)
            // 重新设置中英文
            // this.setInternationalFields(true)
            ElMessage({
                type: "success",
                message: t("messageBox.saveSuccessMsg"),
                center: true
            })
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t("messageBox.cancelSaveMsg"),
                center: true
            })
        })
}

watch(
    () => props.menuCode,
    (val) => {
        if (!val) return
        getDetailsData(val)
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.detail-page {
    .title {
        height: 31px;
        line-height: 31px;
        background: #409eff;
        color: #fff;
        font-weight: bold;
        padding-left: 5px;
    }
}
</style>
