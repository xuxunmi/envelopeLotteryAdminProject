<template>
    <div class="material-page" v-loading="loading">
        <div class="fromWrapper">
            <el-form :model="formData" size="small" label-width="86px" inline>
                <el-form-item label="组织">
                    <el-select v-model="formData.organizationOid" filterable @change="getList">
                        <el-option
                            v-for="item in organizationList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户名称">
                    <el-input v-model="formData.name" @keydown.enter="getList" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="small" @click="getList">{{ $t("materielPage.query") }}</el-button>
                    <el-button size="small" type="primary" @click="handleResetBtn">{{
                        $t("materielPage.reset")
                    }}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="tableWrapper">
            <pt-table
                ref="PtTableRef"
                :tableColumns="tableColumns"
                :tableEditConfig="tableEditConfig"
                :paginationConfig="pageData"
                :menuConfig="menuConfig"
                :data="tableData"
                :locale="locale"
                border
                highlight-current-row
                size="small"
                max-height="calc(70vh - 212px)"
                @row-click="handleRowClick"
                @selection-change="handleSelectionChange"
                @page-current-change="handleCurrentChange"
                @page-size-change="handleSizeChange"
            />
        </div>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm">保存</el-button>
            <el-button size="small" @click="emits('update:visible')">{{ $t("materielPage.cancel") }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { PtTableComponent, PtTableEditConfigType, PtTableColumnsType, PtMenuConfigType } from "@/plugins/pt-front"
// import { getNameById, workStatusList } from "@/assets/common/select-list"
import { usePagination } from "@/hooks/usePagination"
import { SelectInterface } from "@/interface/common"
import { StaffTableInterface } from "@/interface/system/staffManage"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import { userList } from "@/api/system/staffManage/index"
import { roleAddUser } from "@/api/system/roleManage"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "addUserDialog"
})

const { t, locale } = useI18n()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentTreeNodeData: {
        type: Object,
        default: () => {}
    }
})

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const formData = reactive<any>({
    name: "", // 用户名称
    organizationOid: "" // 组织
})

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<StaffTableInterface[]>([])
const multipleSelection = ref<StaffTableInterface[]>([])

// 方法
const handleRowClick = (row: StaffTableInterface) => {
    PtTableRef.value!.toggleRowSelection(row)
}
const handleSelectionChange = (val: StaffTableInterface[]) => {
    multipleSelection.value = val
    // console.log("multipleSelection.value:", multipleSelection.value)
}

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
    },
    {
        prop: "code",
        label: computed(() => t("staffManagePage.staffAccount")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true
    },
    {
        prop: "name",
        label: computed(() => t("staffManagePage.staffName")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true
    },
    {
        prop: "status",
        label: computed(() => t("staffManagePage.status")) as any,
        // showOverflowTooltip: true,
        headerAlign: "center",
        show: true
    }
])
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
//#endregion

// 获取列表
const getList = async () => {
    try {
        loading.value = true
        const params = {
            codeName: formData.name,
            topOid: formData.organizationOid,
            status: "已启用",
            page: String(pageData.currentPage),
            limit: String(pageData.pageSize)
        }
        const { data, total } = (await userList(params)) as any
        tableData.value = data
        pageData.total = total
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

// 获取组织列表
const organizationList = ref<SelectInterface[]>([]) // 组织列表
const getOrganizationList = async () => {
    try {
        loading.value = true
        const params = {
            page: "1",
            limit: "99999"
        }
        const { data } = await getOrganizationManageData(params)
        organizationList.value =
            data.map((item: { groupOid: string; name: string }) => {
                return {
                    id: item.groupOid,
                    name: item.name
                }
            }) || []
        formData.organizationOid = organizationList.value[0].id
        getList()
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

getOrganizationList()

// 重置
const handleResetBtn = () => {
    formData.name = ""
    getList()
}

// 处理确认按钮
const handleConfirm = async () => {
    if (!multipleSelection.value.length) {
        ElMessage({
            type: "warning",
            message: t("materielPage.selectedDataMsg"),
            center: true
        })
        return
    }
    try {
        loading.value = true
        const userOids = multipleSelection.value.map((item) => item.userOid).join()
        const params: {
            groupOid: string //角色oid
            userOid: string //用户oid
        } = {
            groupOid: props.currentTreeNodeData.roleOid,
            userOid: userOids
        }
        const { message } = (await roleAddUser(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        emits("confirm-success", "addUser")
    } catch (err: any) {
        loading.value = false
        if (err.msg)
            ElMessage({
                type: "error",
                message: err.msg,
                center: true
            })
        return
    }
}

//#region 分页
const { pageData, handleCurrentChange, handleSizeChange } = usePagination()

/** 监听分页参数的变化 */
watch([() => pageData.currentPage, () => pageData.pageSize], getList)
//#endregion
</script>

<style lang="scss" scoped></style>
