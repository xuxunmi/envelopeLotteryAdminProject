<template>
    <el-descriptions class="pt-descriptions" v-bind="$attrs">
        <template v-for="(item, index) in itemData" :key="index">
            <el-descriptions-item v-bind="item">
                <template v-if="item.prop">
                    <template
                        v-if="
                            descriptionsData[item.prop] ||
                            descriptionsData[item.prop] === false ||
                            descriptionsData[item.prop] === 0
                        "
                    >
                        <span>{{ descriptionsData[item.prop] }}</span>
                    </template>
                    <span v-else style="color: #83838370">{{ $t("dashboardPage.noData") }}</span>
                </template>
            </el-descriptions-item>
        </template>
    </el-descriptions>
</template>

<script lang="ts" setup>
import { ElDescriptions, ElDescriptionsItem } from "element-plus"
//#region 参数和方法
const props = defineProps({
    /**
     * 描述属性
     * @default []
     */
    itemData: {
        type: Array as PropType<(typeof ElDescriptionsItem)[]>,
        default: []
    },
    /**
     * 描述属性
     * @default {}
     */
    descriptionsData: {
        type: Object,
        default: {}
    }
})
//#endregion
</script>

<style lang="scss" scoped></style>
