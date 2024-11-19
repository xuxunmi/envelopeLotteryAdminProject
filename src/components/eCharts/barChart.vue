<template>
    <div :id="id" :class="className" :style="{ height, width }" />
</template>

<script setup lang="ts">
import { onMounted, nextTick } from "vue"
import eCharts from "./mixins/index"
import type { EChartsOption } from "echarts"
//#region 参数和方法
const props = defineProps({
    className: {
        type: String,
        default: "chart"
    },
    id: {
        type: String,
        default: "barChartsComponents"
    },
    width: {
        type: String,
        default: "200px",
        required: true
    },
    height: {
        type: String,
        default: "200px",
        required: true
    },
    option: {
        type: Object,
        default: {} as EChartsOption,
        required: true
    }
})

//#endregion

//#region 图表
let barChart: any = null
const initChart = () => {
    const chartContainer = document.getElementById(props.id) as HTMLDivElement
    if (chartContainer) {
        barChart = eCharts.init(chartContainer)
        barChart.setOption(props.option)
        const resizeObserver = new ResizeObserver(() => barChart?.resize())
        resizeObserver.observe(chartContainer)
    }
}

const resizeChart = () => {
    barChart?.resize()
}

onMounted(() => {
    nextTick(() => {
        initChart()
    })
    window.addEventListener("resize", resizeChart)
})

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeChart)
})

defineExpose({
    initChart: () => initChart()
})
//#endregion
</script>

<style lang="scss" scoped></style>
