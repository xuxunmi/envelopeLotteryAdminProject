<template>
    <div v-loading="loading">
        <el-form
            ref="switchRoleRef"
            :model="switchRoleForm"
            :rules="rules"
            :hide-required-asterisk="true"
            label-width="56px"
            label-position="left"
            size="small"
        >
            <el-form-item label="组：" prop="groupId">
                <el-select
                    style="width: 100%"
                    v-model="switchRoleForm.groupId"
                    value-key="value"
                    placeholder="请选择"
                    @change="handleGroupIdChange"
                >
                    <el-option v-for="item in groupList" :key="item.value" :label="item.label" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="角色：" prop="roleId">
                <el-select style="width: 100%" v-model="switchRoleForm.roleId" value-key="value" placeholder="请选择">
                    <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(switchRoleRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { UserSelectInterface } from "@/interface/common"
import { getSwitchRoleGroupList } from "@/api/switchRole"
import { setCurrentGroupId, setCurrentRoleId } from "@/utils/cache/localStorage"
import { usePermissionStoreHook } from "@/store/modules/permission"
import { useUserStoreHook } from "@/store/modules/user"

defineOptions({
    name: "SwitchRole"
})

interface Props {
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: false
})

const emits = defineEmits(["update:visible", "confirmSuccess"])

const permissionStore = usePermissionStoreHook()
const userStore = useUserStoreHook()

const loading = ref(false)

interface switchRoleFormInterface {
    groupId: string
    roleId: string
}
const switchRoleRef = ref<FormInstance>()
const switchRoleForm: { [key: string]: any } = reactive<switchRoleFormInterface>({
    groupId: "", // 组
    roleId: "" // 角色
})

const rules = reactive<FormRules>({
    groupId: [{ required: true, message: "请选择组", trigger: "change" }],
    roleId: [{ required: true, message: "请选择角色", trigger: "change" }]
})

// 组列表
const groupList = ref<any[]>([])

// 获取组列表数据
const getSwitchRoleGroupData = async () => {
    try {
        loading.value = true
        const { data } = (await getSwitchRoleGroupList()) as { data: any[] }
        groupList.value = data
        loading.value = false
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

// 角色列表
const roleList = ref<UserSelectInterface[]>([])

// 处理组选择
const handleGroupIdChange = (value: any) => {
    roleList.value = value.children
    switchRoleForm.roleId = ""
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                setCurrentGroupId(switchRoleForm.groupId.value)
                setCurrentRoleId(switchRoleForm.roleId)
                // 重新获取路由
                const data = await permissionStore.getDynamicRoutes()
                await permissionStore.setRoutes(data)
                // 重新获取按钮权限
                await permissionStore.getPermissionsBtn()
                userStore.resetTagsView()
                loading.value = false
                emits("confirmSuccess", false)
            } catch (error: any) {
                loading.value = false
            }
        }
    })
}

onMounted(() => {
    getSwitchRoleGroupData()
})
</script>

<style lang="scss" scoped></style>
