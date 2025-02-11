<template>
    <div ref="DropRef" class="drop-container">
        <div v-show="showLeft" class="drop-left scrollbar">
            <div class="drop-left-container" :style="{ 'min-width': minContainerWidth[0] + 'px' }">
                <slot name="left" />
            </div>
        </div>
        <div v-show="showLeft" class="drop-line" v-dropLine="minDropWidth" />
        <div class="drop-right scrollbar">
            <div class="drop-right-container" :style="{ 'min-width': minContainerWidth[1] + 'px' }">
                <slot name="right" />
            </div>
            <el-icon class="drop-fold-left" @click="handleDropFoldLeft">
                <DArrowLeft v-if="showLeft" />
                <DArrowRight v-else />
            </el-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { type Directive, onMounted, ref } from "vue"
//#region 参数和方法
const props = defineProps({
    /**
     * 左侧初始化宽度
     * @default '200px'
     */
    leftWidth: {
        type: String,
        default: "200px"
    },
    /**
     * 左右拖拽最小宽度
     * @default [100, 100]
     */
    minDropWidth: {
        type: Array,
        default: [100, 100]
    },
    /**
     * 左右内容最小宽度
     * @default [100, 100]
     */
    minContainerWidth: {
        type: Array,
        default: [100, 100]
    }
})

const emits = defineEmits(["dropWidthChange"])

onMounted(() => {
    setLeftWidth(props.leftWidth)
})
//#endregion

const DropRef = ref<HTMLDivElement>()
const setLeftWidth = (width: string) => {
    const leftDom = DropRef.value?.querySelector(".drop-left") as HTMLDivElement
    if (leftDom) leftDom.style.width = width
}

const timer = ref()
// 拖拽指令
const vDropLine: Directive = {
    mounted(el, binding) {
        let starX: number, startWidth: number
        const preDom = el.previousElementSibling
        const [leftMinWidth, rightMinWidth] = binding.value || [300, 400]
        el.onmousedown = (e: any) => {
            e.preventDefault()
            starX = e.clientX
            startWidth = preDom.clientWidth
            document.onmousemove = (e: any) => {
                document.body.style.cursor = "col-resize"
                const parentWidth = el.parentNode.clientWidth
                const preWidth = startWidth + e.clientX - starX
                const nextWidth = parentWidth - preWidth
                if (preWidth >= leftMinWidth && nextWidth >= rightMinWidth) {
                    preDom.style.width = preWidth + "px"
                }
                // 延迟一秒触发
                // if (timer.value) clearTimeout(timer.value)
                // timer.value = setTimeout(() => {
                emits("dropWidthChange")
                // }, 50)
            }
            document.onmouseup = () => {
                document.onmousemove = null
                document.onmouseup = null
                document.body.style.cursor = "initial"
            }
        }
    }
}

// 左侧折叠
const showLeft = ref(true)
const handleDropFoldLeft = () => {
    showLeft.value = !showLeft.value
    // 延迟一秒触发
    if (timer.value) clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        emits("dropWidthChange")
    }, 50)
}
</script>

<style lang="scss" scoped>
.drop-container {
    display: flex;
    width: 100%;
    height: 100%;
    .drop-left {
        .drop-left-container {
            height: 100%;
        }
    }
    .drop-right {
        position: relative;
        flex: 1;
        .drop-right-container {
            height: 100%;
        }
        .drop-fold-left {
            position: absolute;
            top: 0;
            left: -2px;
            cursor: pointer;
            z-index: 999;
        }
    }
    .drop-line {
        width: 4px;
        height: 100%;
        margin: 0 1px;
        background-color: #ddd;
        cursor: col-resize;
        &:hover {
            box-shadow: 0 0 0 1px #03328d;
            background-color: #03328d;
        }
    }
}

.scrollbar {
    overflow: auto;
    &::-webkit-scrollbar {
        height: 10px;
        width: 10px;
        background-color: #fff;
    }
    // 轨道
    &::-webkit-scrollbar-track {
        background-color: #fff;
    }
    // 滑块
    &::-webkit-scrollbar-thumb {
        height: 100%;
        border-radius: 4px;
        background-color: #babac0;
    }
    &::-webkit-scrollbar-thumb:hover {
        background-color: #c1c1c1;
    }
}
</style>
