<template>
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="60%"
      draggable
      overflow
      align-center
    >
        <div class="changeOwnerDialog" v-loading="loading">
            <el-form ref="formRef" :model="formData" :rules="rules" size="small" label-position="left">
                <el-form-item label="用户组织">
                    <el-select v-model="formData.organizationOid" filterable @change="handleOrganizationOidChange_user">
                        <el-option
                            v-for="item in options_userGroup"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="所属者" prop="plmOwner">
                    <el-select v-model="formData.plmOwner" value-key="id" filterable>
                        <el-option v-for="item in systemUserList" :key="item.id" :label="item.name" :value="item" />
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="submit(formRef)" size="small">保存</el-button>
            <el-button @click="dialog.visible = false" size="small" type="primary">{{ t("dashboardPage.cancel") }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { SelectInterface } from "@/interface/common"
import { userList } from "@/api/system/staffManage/index"
import { materieUpdatebBelongsOwner } from "@/api/productMange/materiel"
import { getOrganizationManageData } from "@/api/system/organizationManage"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "changeOwnerDialog"
})

const props = defineProps({
    dialog: {
        type: Object,
        default: () => ({
            visible: false,
            title: "",
            row: null,
            type: ""
        })
    }
})

const emits = defineEmits(["handleEditSuccess"])

const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
    organizationOid: "", // 用户组织
    plmOwner: "" // 所属者
})
const rules = reactive<FormRules>({
    plmOwner: [{ required: true, message: "必填项不能为空！", trigger: "change" }]
})
// 确认
const submit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const partOids = props.dialog.row.map((item: any) => item.oid).join()
                const params: {
                    partOid: string
                    code: string
                    // userOid: string
                    topOid: string
                } = {
                    partOid: partOids,
                    code: formData.plmOwner.name,
                    // userOid: formData.plmOwner.userOid,
                    topOid: formData.plmOwner.topOid
                }
                const { message } = (await materieUpdatebBelongsOwner(params)) as any
                ElMessage({
                    type: "success",
                    message,
                    center: true
                })
                emits("handleEditSuccess")
            } catch (err: any) {
                loading.value = false
                console.log(err)
            }
        }
    })
}

// 用户列表
const systemUserList = ref<SelectInterface[]>([])
const options_userGroup = ref<SelectInterface[]>([]) // 用户组织列表

// 获取用户组织列表
const getOrganizationList_user = async () => {
    const params = {
        page: "1",
        limit: "99999"
    }
    loading.value = true
    getOrganizationManageData(params)
        .then((data) => {
            options_userGroup.value = (data.data || []).map((item: any) => {
                return {
                    id: item.groupOid,
                    name: item.name
                }
            })
        })
        .finally(() => (loading.value = false))
}
getOrganizationList_user()

// 根据组织获取人
const handleOrganizationOidChange_user = (val: string) => {
    systemUserList.value = []
    formData.plmOwner = ""
    if (!val) return
    getSystemUserList(val)
}

// 获取用户列表
const getSystemUserList = async (userOrganizationOid: string) => {
    try {
        loading.value = true
        const params = {
            status: "已启用",
            topOid: userOrganizationOid,
            page: "1",
            limit: "99999"
        }
        const { data } = await userList(params)
        systemUserList.value =
            data.map((item: any) => {
                return {
                    id: item.code,
                    name: item.name,
                    userOid: item.userOid,
                    topOid: item.topOid
                }
            }) || []
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}
//#endregion
</script>
<style lang="scss" scoped>
.changeOwnerDialog {
  height: calc(100vh - 268px);
}

</style>
