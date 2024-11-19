<template>
    <div :id="id" :class="className" :style="{ height, width }" />
</template>

<script setup lang="ts">
import { onMounted, nextTick } from "vue"
import eCharts from "./mixins/index"
import type { EChartsOption } from "echarts"

defineOptions({
    name: "PieChart"
})

interface Props {
    className?: string
    id?: string
    width?: string
    height?: string
    option: EChartsOption
}

const props = withDefaults(defineProps<Props>(), {
    className: "pie-chart",
    id: "pieChartsComponents",
    width: "200px",
    height: "200px",
    option: (): any => {}
})
//#endregion

//#region 图表
let pieChart: any = null
const initChart = () => {
    const chartContainer = document.getElementById(props.id) as HTMLDivElement
    // 解决控制台警告：There is a chart instance already initialized on the dom.
    if (pieChart != null && pieChart != "" && pieChart != undefined) {
        pieChart.dispose()
    }
    if (chartContainer) {
        pieChart = eCharts.init(chartContainer)
        pieChart.setOption(props.option)
        const resizeObserver = new ResizeObserver(() => pieChart?.resize())
        resizeObserver.observe(chartContainer)
    }
}

// 重新刷新渲染饼图
watch(
    () => props.option,
    () => {
        initChart()
    },
    {
        immediate: true,
        deep: true
    }
)

const resizeChart = () => {
    pieChart?.resize()
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
