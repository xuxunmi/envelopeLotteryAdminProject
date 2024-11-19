<template>
    <div class="viewChart">
        <template v-if="data?.url">
            <div class="btnBox">
                <el-button icon="Refresh" text bg size="small" @click="refresh" />
                <el-button
                    v-if="showMax && (doctype === 'epm' || doctype === 'doc')"
                    icon="FullScreen"
                    text
                    bg
                    size="small"
                    @click="goEnlarge"
                />
            </div>
            <template v-if="doctype === 'img'">
                <el-image class="imgBox" :src="data?.url" :preview-src-list="[data?.url]" :z-index="3000" fit="contain">
                    <template #error>
                        <div class="image-slot">
                            <i class="el-icon-picture-outline" />
                        </div>
                    </template>
                </el-image>
            </template>
            <template v-else-if="doctype === 'epm'">
                <iframe
                    class="iframeBox"
                    :src="`/web-application-example/simple-example.html?url=${env.VITE_APP_PDM}${data?.url}`"
                    frameborder="0"
                />
            </template>
            <template v-else-if="doctype === 'doc'">
                <PdfBox :url="env.VITE_APP_PDM + data.url" :showMax="showMax" :type="type" @goEnlarge="goEnlarge" />
            </template>
        </template>
        <template v-else>
            <span class="noData">暂无数据</span>
        </template>

        <!-- 查看文档 - 弹窗 -->
        <ViewDocument v-if="dialogVisible.visible" :dialog="dialogVisible" :data="data" />
    </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import ViewDocument from "./components/viewDocument.vue"
import PdfBox from "./components/pdfBox.vue"
//#region 参数和方法
const props = defineProps({
    data: Object,
    showMax: {
        type: Boolean,
        default: true
    },
    control: Boolean,
    type: String
})
const emits = defineEmits(["enlarged"])
const env = import.meta.env
//#endregion
const doctype = ref("")
// 刷新
const refresh = () => {
    const chartType = doctype.value
    doctype.value = ""
    setTimeout(() => {
        doctype.value = chartType
    }, 1)
}
const dialogVisible = reactive({
    visible: false
})
// 放大
const goEnlarge = () => {
    dialogVisible.visible = true
    emits("enlarged")
}

watch(
    () => props.data?.url,
    (newValue) => {
        // 截取字符串后四位
        if (newValue) {
            const str = newValue.substr(-4)
            if (str === ".pvs" || str === ".pvz") {
                doctype.value = "epm"
            } else if (str === ".pdf") {
                doctype.value = "doc"
            }
        } else {
            doctype.value = ""
        }
    },
    {
        immediate: true // 初次监听即执行
    }
)
</script>
<style lang="scss" scoped>
.viewChart {
    position: relative;
    border: 1px solid #ccc;
    .imgBox {
        width: 100%;
        height: 100%;
    }
    .iframeBox {
        width: 100%;
        height: 100%;
    }
    .btnBox {
        position: absolute;
        right: 12%;
        top: 4px;
        z-index: 1;
        :deep(.el-button) {
            i[class^="el-icon"] {
                font-size: 16px;
            }
        }
    }
    .noData {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #909399;
        font-size: 12px;
    }
}
</style>
