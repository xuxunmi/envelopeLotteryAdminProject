<template>
    <div class="login-container">
        <!-- <header>
            <div class="logo">
                <img src="@/assets/layout/cropped-logo-half-new.png" />
                <span>项目计划管理平台</span>
            </div>
        </header> -->
        <ThemeSwitch v-if="showThemeSwitch" class="theme-switch" />
        <div class="login card">
            <div class="title">{{ projectName }}</div>
            <div class="content">
                <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" @keyup.enter="handleLogin">
                    <el-form-item prop="username">
                        <el-input
                            v-model.trim="loginForm.username"
                            placeholder="用户名"
                            type="text"
                            tabindex="1"
                            :prefix-icon="User"
                            size="large"
                        />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            v-model.trim="loginForm.password"
                            placeholder="密码"
                            type="password"
                            tabindex="2"
                            :prefix-icon="Lock"
                            size="large"
                            show-password
                        />
                    </el-form-item>
                    <!-- <el-form-item prop="code">
            <el-input
              v-model.trim="loginForm.code"
              placeholder="验证码"
              type="text"
              tabindex="3"
              :prefix-icon="Key"
              maxlength="7"
              size="large"
            >
              <template #append>
                <canvas id="code" @click="createCode" />
              </template>
            </el-input>
          </el-form-item> -->
                    <div class="login-field">
                        <div class="left" />
                        <div class="right">
                            <el-checkbox v-model="checked" label="记住我" />
                        </div>
                    </div>
                    <el-button
                        class="logoBtn"
                        :loading="loading"
                        type="primary"
                        size="large"
                        @click.prevent="handleLogin"
                    >
                        登 录
                    </el-button>
                </el-form>
            </div>
        </div>
        <div class="bg-image">
            <img src="@/assets/layout/bg-image.png" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from "vue"
import { useUserStore } from "@/store/modules/user"
import { User, Lock } from "@element-plus/icons-vue"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import { useSettingsStore } from "@/store/modules/settings"
import { type FormInstance, FormRules } from "element-plus"
import { ElMessage } from "element-plus"
// import { type LoginRequestData } from "@/api/login/types/login"
import { usePermissionStoreHook } from "@/store/modules/permission"
import { useInternationalStoreHook } from "@/store/modules/international"
import { setLanguage } from "@/utils/cache/localStorage"
import { useI18n } from "vue-i18n"

import router from "@/router"

const loginFormRef = ref<FormInstance | null>(null)
const settingsStore = useSettingsStore()

const showThemeSwitch = computed(() => {
    return settingsStore.showThemeSwitch
})
const projectName = computed(() => {
    return settingsStore.projectName
})

const useInternationalStore = useInternationalStoreHook()
const permissionStore = usePermissionStoreHook()
const { locale, mergeLocaleMessage } = useI18n()

/** Loading */
const loading = ref(false)
/** 登录表单数据 */
const loginForm = reactive({
    username: "",
    password: ""
    // code: ""
})
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }]
    // code: [{ required: true, message: "请输入验证码", trigger: "blur" }]
}
/** 登录逻辑 */
/** 登录逻辑 */
const handleLogin = () => {
    loginFormRef.value?.validate((valid: boolean) => {
        if (valid) {
            // 验证码校验
            // if (loginForm.code !== code) {
            //   return false
            // }
            loading.value = true
            useUserStore()
                .login({
                    username: loginForm.username,
                    password: loginForm.password
                })
                .then(async () => {
                    rememberMe()
                    // 获取动态中英文国际化
                    const { zh, en } = await useInternationalStore.getInternationalFields(false)
                    mergeLocaleMessage("zh_cn", zh)
                    mergeLocaleMessage("en", en)
                    locale.value = "zh_cn"
                    // 默认语言
                    setLanguage("zh_cn")
                    // 获取按钮权限
                    // permissionStore.getPermissionsBtn()
                    // 获取动态路由
                    await permissionStore.getDynamicRoutes()
                    loading.value = false
                })
                .catch((err) => {
                    console.log("handleLogin", err)
                    // createCode()
                    loading.value = false
                    loginForm.password = ""
                    if (err.msg) ElMessage({ message: "错误：" + err.msg, type: "error" })
                })
        }
    })
}
/** 创建验证码 */
const code = ""
const createCode = () => {
    // 先清空验证码的输入
    // loginForm.code = ""
    // 获取验证码
    const canvas = document.querySelector("#code")
    // 获取随机颜色
    function getColor() {
        return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 256)},${Math.floor(
            Math.random() * 256
        )})`
    }
    // 获取随机数
    function getRandom(a: any, b = 0) {
        let max = a
        let min = b
        if (a < b) {
            max = b
            min = a
        }
        return Math.floor(Math.random() * (max - min)) + min
    }
    // 设置验证码 - 参数为canvas标签的节点对象
    // function getCode(ele: any, num = 4) {
    //     // 定义工具箱
    //     const ctx = ele.getContext("2d")
    //     // 获取画布大小
    //     const width = ctx.canvas.width
    //     const height = ctx.canvas.height
    //     // 将画布中内容清空
    //     ctx.clearRect(0, 0, width, height)
    //     // 随机点
    //     // 设置线段宽度
    //     ctx.lineWidth = 2
    //     // 循环创建点
    //     for (let i = 0; i < 1000; i++) {
    //         // 开启路径
    //         ctx.beginPath()
    //         // 设置随机点的开始位置
    //         const x = getRandom(width - 2)
    //         const y = getRandom(height - 2)
    //         // 画点 - 将画笔放到开始位置
    //         ctx.moveTo(x, y)
    //         // 将画笔移动到1px后
    //         ctx.lineTo(x + 1, y + 1)
    //         // 填充颜色
    //         ctx.strokeStyle = getColor()
    //         ctx.stroke()
    //     }
    //     // 随机线
    //     for (let i = 0; i < 20; i++) {
    //         // 开启路径
    //         ctx.beginPath()
    //         // 设置随机的开始位置
    //         const x = getRandom(width - 2)
    //         const y = getRandom(height - 2)
    //         // 设置随机的宽和高
    //         const w = getRandom(width - x)
    //         const h = getRandom(height - y)
    //         // 将画笔放到开始位置
    //         ctx.moveTo(x, y)
    //         // 将画笔移动到 开始位置+随机宽
    //         ctx.lineTo(x + w, y + h)
    //         // 填充随机颜色
    //         ctx.strokeStyle = getColor()
    //         ctx.stroke()
    //     }
    //     // 随机字符
    //     // 字符容器
    //     const strContainer = "abcdefghijkmnpqrstuvwxyz2345678ABCDEFGHJKLMNPQRSTUVWXYZ"
    //     // 设置文字大小
    //     ctx.font = width / 5 + "px 微软雅黑"
    //     // 设置文字垂直对齐方式
    //     ctx.textBaseline = "middle"
    //     // 验证码字符串
    //     let str = ""
    //     // 遍历生成字符放在画布中
    //     for (let i = 0; i < num; i++) {
    //         // 开启路径
    //         ctx.beginPath()
    //         // 描边文字颜色
    //         ctx.fillStyle = "#f00"
    //         // 随机字符
    //         const word = strContainer[getRandom(strContainer.length)]
    //         // 设置每个文字所处的区域大小
    //         const w = width / num
    //         // 定义文字left和top
    //         const left = getRandom(i * w, (i + 1) * w - width / 5)
    //         const top = getRandom(height / 2 - 10, height / 2 + 10)
    //         // 写文字
    //         ctx.fillText(word, left, top)
    //         // 将所有字符存起来
    //         str += word
    //     }
    //     code = str
    //     // loginForm.code = str
    // }
    // getCode(canvas)
}
//#region 记住密码
/** 记住我 */
const checked = ref(true)
// 缓存账号密码
const rememberMe = () => {
    if (checked.value) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("username", loginForm.username)
        localStorage.setItem("password", loginForm.password)
    } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("username")
        localStorage.removeItem("password")
    }
}
// 初始化账号密码
const initMe = () => {
    const check = localStorage.getItem("rememberMe")
    if (check === "true") {
        checked.value = true
        Object.assign(loginForm, {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password")
        })
    } else {
        checked.value = false
    }
}
//#endregion

onMounted(() => {
    /** 初始化验证码 */
    // createCode()
    initMe()
})
</script>

<style lang="scss" scoped>
$header-height: 60px;
$text-color: #000;

.login-container {
    position: relative;
    min-height: 100%;
    background-color: #1f4e79;
    // padding-top: $header-height;
    .theme-switch {
        position: fixed;
        top: 5%;
        right: 5%;
        cursor: pointer;
    }
    header {
        position: fixed;
        top: 0;
        padding: 0 40px;
        background-color: #5674c7;
        color: #ffffff;
        width: 100%;
        line-height: $header-height;
        z-index: 10;
        .logo {
            width: auto;
            height: auto;
            display: flex;
            align-items: center;
            gap: 8px;
            img {
                width: auto;
                height: 50px;
            }
        }
    }
    .card {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 15%;
        width: 480px;
        border-radius: 20px;
        box-shadow: 0 0 10px #dcdfe6;
        background-color: #fff;
        overflow: hidden;
        z-index: 100;
        .title {
            font-size: 30px;
            font-weight: bold;
            padding: 50px 50px 0;
            text-align: center;
        }
        .content {
            padding: 50px;
            :deep(.el-input-group__append) {
                padding: 0;
                overflow: hidden;
                #code {
                    width: 100px;
                    height: 40px;
                    border-left: 0px;
                    user-select: none;
                    cursor: pointer;
                    text-align: center;
                }
            }
            .logoBtn {
                width: 100%;
                margin-top: 10px;
            }
            .login-field {
                display: flex;
                justify-content: space-between;
                .left {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                }
                .right {
                    :deep(.el-checkbox) {
                        .el-checkbox__label {
                            color: $text-color;
                        }
                    }
                }
            }
        }
    }
    .bg-image {
        position: absolute;
        // top: $header-height;
        top: 0;
        right: 0;
        // height: calc(100% - $header-height);
        height: 100%;
        font-size: 0;
        &::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 150%;
            height: 100%;
            background: url("@/assets/layout/bg-back.png") no-repeat;
            background-size: cover;
        }
        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
