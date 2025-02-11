<template>
    <div class="modify-password-page" v-loading="loading">
        <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="rules"
            :hide-required-asterisk="true"
            label-width="82px"
            label-position="left"
            autocomplete="off"
            size="small"
        >
            <el-form-item label="原密码：" prop="oldPassword">
                <el-input
                    style="width: 100%"
                    type="password"
                    autocomplete="new-password"
                    v-model.trim="passwordForm.oldPassword"
                    placeholder="请输入原密码"
                />
            </el-form-item>
            <el-form-item label="新密码：" prop="newPassword">
                <el-input
                    style="width: 100%"
                    type="password"
                    v-model.trim="passwordForm.newPassword"
                    autocomplete="new-password"
                    show-password
                    placeholder="请输入新密码"
                />
            </el-form-item>
            <el-form-item label="确认密码：" prop="checkPassword">
                <el-input
                    style="width: 100%"
                    type="password"
                    v-model.trim="passwordForm.checkPassword"
                    autocomplete="new-password"
                    show-password
                    placeholder="请再次输入新密码"
                />
            </el-form-item>
        </el-form>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm(passwordFormRef)">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { useRouter } from "vue-router"
import { modifyPassword } from "@/api/system/staffManage"

defineOptions({
    name: "ModifyPassword"
})

interface Props {
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: false
})

// 定义路由
const router = useRouter()
const emits = defineEmits(["update:visible", "confirmSuccess"])

const loading = ref(false)

interface passwordFromInterface {
    oldPassword: string
    newPassword: string
    checkPassword: string
}
const passwordFormRef = ref<FormInstance>()
const passwordForm: { [key: string]: any } = reactive<passwordFromInterface>({
    oldPassword: "", // 原密码
    newPassword: "", // 新密码
    checkPassword: "" // 确认密码
})

const oldPassword = (rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error("原密码不能为空"))
    } else {
        callback()
    }
}
const validateNewPassword = (rule: any, value: any, callback: any) => {
    if (value === "") {
        callback(new Error("请输入新密码"))
    } else {
        if (passwordForm.checkPassword !== "") {
            if (!passwordFormRef.value) return
            passwordFormRef.value.validateField("checkPassword", () => null)
        }
        callback()
    }
}
const validateCheckPassword = (rule: any, value: any, callback: any) => {
    if (value === "") {
        callback(new Error("请再次输入新密码"))
    } else if (value !== passwordForm.newPassword) {
        callback(new Error("两次输入密码不一致"))
    } else {
        callback()
    }
}

const rules = reactive<FormRules>({
    oldPassword: [{ validator: oldPassword, required: true, trigger: "blur" }],
    newPassword: [
        { validator: validateNewPassword, required: true, trigger: "blur" },
        {
            pattern: "^(?![A-Za-z]+$)(?![A-Z\\d]+$)(?![A-Z\\W]+$)(?![a-z\\d]+$)(?![a-z\\W]+$)(?![\\d\\W]+$)\\S{6,20}$",
            message: "新密码为英文大小写、数字、特殊字符3种组合而成且长度不低于6位",
            trigger: "blur"
        }
    ],
    checkPassword: [{ validator: validateCheckPassword, required: true, trigger: "blur" }]
})

const handleConfirm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const params = {
                    oldPwd: passwordForm.oldPassword,
                    newPwd: passwordForm.newPassword
                }
                const { data } = (await modifyPassword(params)) as { data: any }
                ElMessage({
                    type: "success",
                    message: data,
                    center: true
                })
                router.push({ path: "/login" })
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
    })
}
</script>

<style lang="scss" scoped>
.modify-password-page {
    :deep(.el-form) {
        .el-form-item {
            margin-bottom: 34px;
        }
    }
}
</style>
