<template>
    <div v-loading="loading" class="order-detail-dialog">
        <PtCollapse title="基本属性">
            <el-descriptions :column="4">
                <template v-for="item in descriptionsData">
                    <el-descriptions-item :label="item.label + ':'" width="25%">
                        <template v-if="item.prop">
                            <span v-if="objectData[item.prop] || objectData[item.prop] === 0">
                                <template v-if="item.type === 'select'">
                                    <span
                                        v-text="
                                            getNameById(item.options, objectData[item.prop] + '', {
                                                value: 'code',
                                                label: 'codeListNameC'
                                            })
                                        "
                                    />
                                </template>
                                <template v-else>{{ objectData[item.prop] }}</template>
                            </span>
                            <span v-else style="color: #909399">{{ t("dashboardPage.noData") }}</span>
                        </template>
                    </el-descriptions-item>
                </template>
            </el-descriptions>
        </PtCollapse>
        <el-divider />
        <drop-line left-width="50%" :minDropWidth="[400, 400]">
            <template #left>
                <el-card class="box-card">
                    <div class="w-fit px-2 py-1 border border-solid border-slate-400 mx-auto">初始下单信息</div>
                    <el-divider />
                    <el-descriptions :column="1">
                        <template v-for="item in objectData.originSchemeInfo.choiceList" :key="item.label">
                            <el-descriptions-item :label="item.optionName + ':'">{{
                                item.selectedChoices[0].choiceName
                            }}</el-descriptions-item>
                        </template>
                        <template v-for="item in objectData.colorItems">
                            <el-descriptions-item :label="item.optional + ':'">{{ item.value }}</el-descriptions-item>
                        </template>
                    </el-descriptions>
                </el-card>
            </template>
            <template #right>
                <el-card class="box-card">
                    <div class="w-fit px-2 py-1 border border-solid border-slate-400 mx-auto">配置信息</div>
                    <el-divider />
                    <el-descriptions :column="1">
                        <template v-for="item in objectData.schemeInfo.choiceList" :key="item.label">
                            <el-descriptions-item :label="item.optionName + ':'">{{
                                item.selectedChoices[0].choiceName
                            }}</el-descriptions-item>
                        </template>
                        <template v-for="item in objectData.colorItems">
                            <el-descriptions-item :label="item.optional + ':'">{{ item.value }}</el-descriptions-item>
                        </template>
                    </el-descriptions>
                    <!-- <el-form
                        class="mt-6"
                        ref="orderFormRef"
                        :model="orderForm"
                        :rules="rules"
                        label-width="auto"
                        label-position="left"
                        :size="small"
                    >
                        <el-form-item label="订单号">
                            <el-input v-model="orderForm.orderNumber" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="行号">
                            <el-input v-model="orderForm.lineNumber" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="系列配置号">
                            <el-input v-model="orderForm.seriesConfigNumber" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="系列名称">
                            <el-input v-model="orderForm.seriesName" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="料号">
                            <el-input v-model="orderForm.partNumber" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="方案状态">
                            <el-input v-model="orderForm.schemeStatus" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="实例BOM">
                            <el-input v-model="orderForm.instanceBom" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="数量">
                            <el-input v-model="orderForm.number" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="实例BOM状态">
                            <el-input v-model="orderForm.instanceBomStatus" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="订单类型">
                            <el-input v-model="orderForm.orderType" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="订单状态">
                            <el-input v-model="orderForm.orderStatus" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="创建时间">
                            <el-input v-model="orderForm.createTime" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="修改时间">
                            <el-input v-model="orderForm.updateTime" placeholder="请输入" />
                        </el-form-item>
                    </el-form> -->
                </el-card>
            </template>
        </drop-line>

        <div class="mt-6 text-center">
            <!-- <el-button size="small" type="primary" @click="emits('update:visible')">保存</el-button> -->
            <el-button size="small" type="primary" @click="emits('update:visible')">取消</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
// import type { FormInstance, FormRules } from "element-plus"
import DropLine from "@/components/dropLine/index.vue"
import PtCollapse from "@/components/ptCollapse/index.vue"
import { getOrderScheme } from "@/api/orderManage/standingStockOrder/index"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "orderDetailDialog"
})
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    currentRowData: {
        type: Object,
        required: true
    }
})
const emits = defineEmits(["update:visible", "confirm-success"])

const { t } = useI18n()
const loading = ref(false)
//#endregion

//#region 字典数据
const options_plan = ref<any[]>([]) // 方案状态
const options_order = ref<any[]>([]) // 订单类型
const options_exampleBomStatus = ref<any[]>([]) // 实例BOM状态
const options_produceOrderType = ref<any[]>([]) // 生产订单状态
const options_group = ref<any[]>([]) // 生产组织下拉
getDictionarySelect({
    codes: "PLAN_STATUS,ORDER_TYPE,EXAMPLE_BOM_STATUS,PRODUCE_ORDER_TYPE,PRODUCTION_ORGANIZATION"
}).then((data) => {
    options_plan.value = data.data.PLAN_STATUS || []
    options_order.value = data.data.ORDER_TYPE || []
    options_exampleBomStatus.value = data.data.EXAMPLE_BOM_STATUS || []
    options_produceOrderType.value = data.data.PRODUCE_ORDER_TYPE || []
    options_group.value = data.data.PRODUCTION_ORGANIZATION || []
})
//#endregion

//#region 详情
const objectData = ref<any>({
    originSchemeInfo: {
        // 客户下单信息
        choiceList: []
    },
    schemeInfo: {
        // 配置信息
        choiceList: []
    }
})
const descriptionsData = ref([
    {
        label: "订单号-行号",
        prop: "orderNo"
    },
    {
        label: "系列配置号",
        prop: "partNum"
    },
    {
        label: "料号",
        prop: "itemNumber"
    },
    {
        label: "品名",
        prop: "productName"
    },
    {
        label: "方案状态",
        prop: "planStatus",
        type: "select",
        options: options_plan
    },
    {
        label: "实例BOM",
        prop: "exampleBom"
    },
    {
        label: "实例BOM状态",
        prop: "exampleBomStatus",
        type: "select",
        options: options_exampleBomStatus
    },
    {
        label: "数量",
        prop: "num"
    },
    {
        label: "订单类型",
        prop: "orderType",
        type: "select",
        options: options_order
    },
    {
        label: "生产订单状态",
        prop: "produceOrderType",
        type: "select",
        options: options_produceOrderType
    },
    {
        label: "生产组织",
        prop: "productOrganization",
        type: "select",
        options: options_group
    },
    {
        prop: "agent",
        label: "代理商名称"
    },
    {
        prop: "receiveAddress",
        label: "收货地址"
    },
    {
        prop: "oaFlowld",
        label: "OA流水单号"
    },
    {
        prop: "marketRemark",
        label: "销售备注"
    },
    {
        label: "技术备注",
        prop: "remark"
    },
    {
        label: "创建时间",
        prop: "createdAt"
    },
    {
        label: "更新时间",
        prop: "updatedAt"
    }
])
const getData = () => {
    console.log("getData", props.currentRowData)
    loading.value = true
    const params = {
        oidStr: props.currentRowData.oidStr
    }
    getOrderScheme(params)
        .then((data) => {
            console.log("getOrderScheme", data)
            objectData.value = data.data
        })
        .finally(() => (loading.value = false))
}
getData()
//#endregion
</script>

<style lang="scss" scoped>
.order-detail-dialog {
    :deep(.drop-line) {
        height: auto;
    }
    :deep(.el-descriptions) {
        .el-descriptions__cell {
            padding-bottom: 0;
        }
    }
    :deep(.el-divider) {
        margin: 12px 0;
    }
    :deep(.el-card__body) {
        padding: 12px;
    }
}
</style>
