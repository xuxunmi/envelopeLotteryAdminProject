<template>
    <el-form
        ref="authFormRef"
        :model="authForm"
        size="small"
        label-width="98px"
        label-position="right"
        v-loading="loading"
    >
        <el-form-item label="角色名称：">
            <el-input style="width: 280px" v-model="authForm.name" disabled />
        </el-form-item>
        <el-form-item label="权限设置：">
            <el-scrollbar style="width: 100%" height="calc(100vh - 400px)">
                <el-tree
                    v-if="authTreeData"
                    ref="authTreeRef"
                    :data="authTreeData"
                    show-checkbox
                    node-key="idStr"
                    highlight-current
                    check-on-click-node
                    :props="defaultProps"
                    @check-change="handleCheckChange"
                />
            </el-scrollbar>
        </el-form-item>
    </el-form>
    <div class="mt-6 text-center">
        <el-button size="small" type="primary" @click="handleConfirm">保存</el-button>
        <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { ElTree } from "element-plus"
import { recursionArray } from "@/utils"
import { menuAuthTreeByRole, roleAuthTreeSave } from "@/api/system/roleManage"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "authDialog"
})

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

const { t } = useI18n()

const emits = defineEmits(["update:visible", "confirm-success"])

const loading = ref(false)
const defaultProps = {
    label: "menuName",
    children: "children"
}

type AuthTreeInterface = {
    idStr: number
    menuName: string
    isChecked: boolean
    childrenList: AuthTreeInterface[]
}
const authTreeRef = ref<InstanceType<typeof ElTree>>()
const authTreeData = ref<AuthTreeInterface[]>([]) // 权限树
const authTreeSelectionOids = ref<string[]>([]) // 树选中的节点ids
const authForm = reactive({
    oid: undefined,
    name: undefined // 角色名称
})

// 根据角色oid获取菜单
const getList_authByRoleOid = (requestParams: any) => {
    loading.value = true
    const roleOidStr = requestParams.roleOid.split(":").pop()
    const params: {
        roleIdStr: string //角色oid
    } = {
        roleIdStr: roleOidStr
    }
    menuAuthTreeByRole(params)
        .then((data: any) => {
            authTreeData.value = data.data || []
            // 递归菜单查找选中项
            recursionArray(authTreeData.value, (item: any) => {
                nextTick(() => {
                    item.isChecked ? authTreeRef.value?.setChecked(item, true, false) : ""
                })
            })
            loading.value = false
        })
        .catch((err: any) => {
            console.log(err)
            loading.value = false
        })
}

getList_authByRoleOid(props.currentTreeNodeData)

const handleCheckChange = () => {
    const treeSelectionList = [
        ...(authTreeRef.value?.getHalfCheckedNodes() || []),
        ...(authTreeRef.value?.getCheckedNodes() || [])
    ]
    authTreeSelectionOids.value = treeSelectionList.map((val) => val.idStr)
    // console.log("authTreeSelectionOids.value：", authTreeSelectionOids.value)
}

const handleConfirm = async () => {
    loading.value = true
    try {
        const roleIdStr = props.currentTreeNodeData.roleOid.split(":").pop()
        const params: {
            roleIdStr: string //角色oid
            menuIds: string[] //权限id
        } = {
            roleIdStr,
            menuIds: authTreeSelectionOids.value
        }
        await roleAuthTreeSave(params)
        ElMessage({
            type: "success",
            message: "保存成功",
            center: true
        })
        emits("confirm-success", "auth")
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

watch(
    () => props.currentTreeNodeData,
    (val) => {
        Object.assign(authForm, {
            ...val
        })
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped></style>
