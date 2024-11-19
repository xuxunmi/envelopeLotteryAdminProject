<template>
    <span @click.stop>
        <el-dropdown ref="dropdown" trigger="click" placement="bottom" style="vertical-align: middle">
            <el-link :underline="false">
                <div :class="{ content: true, active: inputValue }">
                    <span>{{ name }}</span>
                    <svg
                        v-if="inputValue"
                        t="1698818037367"
                        class="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="1643"
                    >
                        <path
                            d="M544.064 472a32 32 0 0 1 8.096-21.248L696.8 288H327.36l144.64 162.752a32 32 0 0 1 8.096 21.248V704l64-48v-184z m64 200a32 32 0 0 1-12.8 25.6l-128 96a32 32 0 0 1-51.2-25.6v-283.84L232.16 277.248C213.76 256.64 228.448 224 256.064 224h512c27.616 0 42.24 32.64 23.904 53.248l-183.904 206.912V672z"
                            p-id="1644"
                        />
                    </svg>
                    <svg
                        v-else
                        t="1698818037367"
                        class="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="1643"
                    >
                        <path
                            d="M544.064 472a32 32 0 0 1 8.096-21.248L696.8 288H327.36l144.64 162.752a32 32 0 0 1 8.096 21.248V704l64-48v-184z m64 200a32 32 0 0 1-12.8 25.6l-128 96a32 32 0 0 1-51.2-25.6v-283.84L232.16 277.248C213.76 256.64 228.448 224 256.064 224h512c27.616 0 42.24 32.64 23.904 53.248l-183.904 206.912V672z"
                            p-id="1644"
                        />
                    </svg>
                </div>
            </el-link>
            <template #dropdown>
                <el-dropdown-menu>
                    <div class="dropdown-menu-box">
                        <el-input v-model="inputValue" size="small" clearable style="width: 160px" @input="input" />
                        <!-- <div class="dropdown-menu-box-btn">
            <el-button
              type="primary"
              size="mini"
              @click="submit"
            >保存</el-button>
          </div> -->
                    </div>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </span>
</template>

<script setup>
import { ref, watch } from "vue"

//#region 参数和方法
const props = defineProps({
    name: {
        type: String,
        default: ""
    },
    modelValue: {
        type: String,
        default: ""
    }
})
const emits = defineEmits(["update:modelValue", "search"])
//#endregion

const inputValue = ref(props.modelValue)
const searchTime = ref(null)
const input = (value) => {
    // console.log(value);
    emits("update:modelValue", value)
    // 防抖（o.5s后查询）
    if (searchTime.value) clearTimeout(searchTime.value)
    searchTime.value = setTimeout(() => {
        emits("search")
        clearTimeout(searchTime.value)
    }, 500)
}
// const submit = () => {
//     emits("search")
// }
watch(
    () => props.modelValue,
    (newValue) => (inputValue.value = newValue)
)
</script>
<style lang="scss" scoped>
.content {
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    font-size: 12px;
    span {
        color: #909399;
        font-weight: bold;
    }
    svg {
        fill: #909399;
    }
    &.active {
        span {
            color: #409eff;
        }
        svg {
            fill: #409eff;
        }
    }
}
svg {
    width: 18px;
}
</style>
