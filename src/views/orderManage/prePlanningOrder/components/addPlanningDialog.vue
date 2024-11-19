<template>
    <el-dialog v-model="dialog.visible" :title="dialog.title" top="50px" width="95%" draggable overflow>
        <div v-loading="loading" class="addPlanningDialog">
            <div class="fromWrapper">
                <el-form
                    ref="formRef"
                    :model="formData"
                    :rules="rules"
                    size="small"
                    label-position="right"
                    inline
                    :disabled="!canEdit"
                >
                    <el-form-item label="选配清单编码：" prop="value1">
                        <el-input v-model="formData.orderNo" />
                    </el-form-item>
                    <el-form-item label="选配清单名称：" prop="orderName">
                        <el-input v-model="formData.orderName" />
                    </el-form-item>
                    <el-form-item v-if="dialog.type !== 'detail'" label="默认到货日期：">
                        <el-date-picker
                            v-model="defaultTime"
                            type="date"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                        />
                    </el-form-item>
                    <el-form-item label="日期：" prop="createdAt">
                        <span>{{ formData.createdAt }}</span>
                    </el-form-item>
                    <el-form-item label="状态：" prop="status">
                        <span
                            v-loading="loading_select"
                            v-text="
                                getNameById(options_status, orderStatus + '', {
                                    value: 'code',
                                    label: 'codeListNameC'
                                })
                            "
                            style="min-width: 50px"
                        />
                    </el-form-item>
                    <el-form-item label="编制人：" prop="createdBy">
                        <span>{{ formData.createdBy }}</span>
                    </el-form-item>
                    <el-form-item v-if="dialog.type !== 'add'" label="审核人：" prop="process">
                        <span>{{ formData.process }}</span>
                    </el-form-item>
                </el-form>
            </div>
            <div v-loading="loading_table" class="tableWrapper">
                <PlanList ref="PlanListRef" :defaultTime="defaultTime" :type="dialog.type" />
            </div>
        </div>
        <template #footer>
            <el-button v-if="canEdit" :loading="loading || loading_table" type="primary" @click="submit" size="small"
                >保存</el-button
            >
            <el-button type="primary" @click="dialog.visible = false" size="small">{{
                t("dashboardPage.cancel")
            }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue"
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { useUserStore } from "@/store/modules/user"
import PlanList from "./planList.vue"
import { createOrEditOrder, getPlanOrder } from "@/api/orderManage/standingStockOrder/index"
import type * as standingStockOrderTypes from "@/api/orderManage/standingStockOrder/types"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { formatDateTime } from "@/utils/index"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: {
            visible: true,
            title: "",
            type: "", // 类型（add、detail、saveAs）
            row: null
        }
    }
})
const emits = defineEmits(["handleEditSuccess"])
const instance: any = getCurrentInstance()
const { t, locale } = useI18n()
const loading = ref(false)
const userStore = useUserStore()

const canEdit = computed(() => props.dialog.type === "add" || props.dialog.type === "saveAs")
//#endregion

//#region 表单
const loading_table = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
    orderNo: "", // 选配清单编码
    orderName: "", // 选配清单名称
    createdAt: formatDateTime(new Date(), "YYYY-MM-DD"), // 日期
    status: "1", // 状态（1待实例化 2实例化汇总 3实例化完成 4待同步 5同步完成）
    createdBy: "", // 编制人
    process: "" // 审核人
})
const rules = reactive<FormRules>({
    orderName: [{ required: true, message: "请输入选配清单名称！", trigger: "blur" }]
})
const defaultTime = ref("")
// 确认
const submit = () => {
    // console.log('submit', formData, instance.refs.PlanListRef.tableData);
    formRef.value?.validate((valid) => {
        if (valid) {
            const tableData: any[] = instance.refs.PlanListRef.tableData || []
            // 校验预计划分类字段是否有值
            let noPreparePlanType = {
                flag: false,
                index: -1
            }
            tableData.forEach((ele, i) => {
                if (!ele.preparePlanType)
                    noPreparePlanType = {
                        flag: true,
                        index: i
                    }
            })
            if (noPreparePlanType.flag) {
                ElMessage.error(`第 ${noPreparePlanType.index + 1} 行方案未配置预计划分类属性`)
            } else {
                // 格式化参数
                const orderConfigures = formData_config(tableData)
                const params = {
                    ...formData,
                    orderType: "5" as standingStockOrderTypes.orderType,
                    orderConfigures
                }
                loading.value = true
                createOrEditOrder(params)
                    .then((data) => {
                        ElMessage.success("新建成功！")
                        emits("handleEditSuccess")
                    })
                    .finally(() => (loading.value = false))
            }
        }
    })
}
// 格式化配置列表
const formData_config = (list: any[] = []) => {
    const arr: any[] = []
    if (list.length) {
        list.forEach((ele: any, i: number) => {
            let scheme
            if (ele.isExist) {
                // 已有配置
                scheme = {
                    schemeOid: ele.schemeOid,
                    schemeInfo: ele.schemeInfoDB || "",
                    originSchemeInfo: ele.originSchemeInfoDB || "",
                    schemeCode: ele.schemeCode, // 方案编号
                    schemeName: ele.schemeName // 方案名称
                }
            } else {
                // 新的配置
                const options: any[] = []
                ele?.optionList?.forEach((option: any) => {
                    if (option.checkChoiceOid)
                        options.push({
                            optionOid: option.oid,
                            optionName: option.name,
                            optionNumber: option.number,
                            isOrderMate: option.isOrderMate === true ? true : false,
                            choiceOid: option.checkChoiceOid,
                            choiceName: option.checkChoiceName,
                            choiceNumber: option.checkChoiceNumber
                        })
                })
                scheme = {
                    schemeCode: ele.schemeCode, // 方案编号
                    schemeName: ele.schemeName, // 方案名称
                    options
                }
            }
            const obj = {
                partNum: ele.partNum, // 系列编号
                partOid: ele.partOid, // 系列oid
                partName: ele.partName, // 系列名称
                materialName: ele.materialName, // 物料名称
                materialOid: ele.materialOid, // 物料oid
                materialNum: ele.materialNum, // 物料编号
                num: ele.num, // 数量
                planReachDate: ele.planReachDate, // 计划到货日期
                productionOrganization: ele.productionOrganization, // 生产组织
                exampleBom: ele.schemeCode, // 实例化BOM编码 == 预计划方案编码
                productName: ele.schemeName, // 品名 == 预计划方案名称
                preparePlanType: ele.preparePlanType, // 预计划分类
                scheme,
                colorItems: ele.colorItems,  // 颜色选配项
            }
            arr.push(obj)
        })
    }
    return arr
}
// 获取数据
const getData = () => {
    const params = {
        orderOidStr: props.dialog.row.orderOidStr
    }
    loading_table.value = true
    getPlanOrder(params)
        .then((data) => {
            // console.log('getOrderScheme', data);
            if (props.dialog.type === "detail") {
                Object.assign(formData, {
                    orderNo: data.data.orderNo,
                    orderName: data.data.orderName,
                    createdAt: data.data.createdAt
                })
                orderStatus.value = data.data.status
            } else if (props.dialog.type === "saveAs") {
                Object.assign(formData, {
                    createdBy: userStore.userInfo.name
                })
                data.data.orderConfigures.forEach((ele: any) => (ele.isExist = true))
            }
            instance.refs.PlanListRef.initList(data.data.orderConfigures)
        })
        .finally(() => (loading_table.value = false))
}
if (props.dialog.type === "saveAs" || props.dialog.type === "detail") {
    getData()
} else if (props.dialog.type === "add") {
    formData.createdBy = userStore.userInfo.name
}
//#endregion

//#region 字典数据
const loading_select = ref(false)
const orderStatus = ref("1")
const options_status = ref<any[]>([]) // 订单状态
loading_select.value = true
getDictionarySelect({ codes: "SALE_ORDER_TYPE" })
    .then((data) => {
        options_status.value = data.data.SALE_ORDER_TYPE || []
    })
    .finally(() => (loading_select.value = false))
//#endregion
</script>
<style lang="scss" scoped>
.addPlanningDialog {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 268px);
    .tableWrapper {
        flex: 1;
    }
}
</style>
