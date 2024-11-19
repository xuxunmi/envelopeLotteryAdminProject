<template>
    <div class="document-part-detail" v-loading="loading">
        <div class="pt-container-main-right">
            <el-form
                ref="detailAttrsCollectionRef"
                :model="detailAttrsCollection"
                :rules="props.isCanEdit ? rules : {}"
                :inline="true"
                label-position="right"
                label-width="160px"
                size="small"
            >
                <el-row>
                    <el-col
                        :span="colSpan"
                        v-for="item in detailItemsData"
                        :key="item.label"
                        class="pt-container-main-right-col"
                    >
                        <el-form-item
                            :label="item.label + ':'"
                            :prop="item.prop"
                            :rules="props.isCanEdit ? item.rules : []"
                        >
                            <template v-if="item.type === 'select'">
                                <el-select
                                    style="width: 100%"
                                    v-model="detailAttrsCollection[item.prop]"
                                    :placeholder="item.placeholder"
                                    clearable
                                    filterable
                                    :disabled="item.disabled"
                                    @change="item.onChange"
                                >
                                    <el-option
                                        v-for="option in item.options"
                                        :key="option.id"
                                        :label="option.name"
                                        :value="option.id"
                                    />
                                </el-select>
                            </template>
                            <template v-else-if="item.type === 'input' || item.type === 'password'">
                                <!-- <div class="w-full" @click="goEdit_number(item.prop)"> -->
                                <el-input
                                    style="width: 100%"
                                    v-model="detailAttrsCollection[item.prop]"
                                    :show-password="item.type === 'password'"
                                    :placeholder="item.placeholder"
                                    :disabled="item.disabled"
                                >
                                    <template #suffix v-if="item.iconSearch">
                                        <el-button v-if="isCanEdit" type="primary" icon="Search" link />
                                    </template>
                                </el-input>
                                <!-- <div class="overlay" v-if="item.iconSearch" /> -->
                                <!-- </div> -->
                            </template>
                            <template v-else-if="item.type === 'textarea'">
                                <el-input
                                    style="width: 200%"
                                    v-model="detailAttrsCollection[item.prop]"
                                    :type="item.type"
                                    :autosize="{ minRows: 2 }"
                                    :placeholder="item.placeholder"
                                    :disabled="item.disabled"
                                />
                            </template>
                            <template v-else-if="item.type === 'inputNumber'">
                                <el-input-number
                                    style="width: 100%"
                                    v-model="detailAttrsCollection[item.prop]"
                                    :controls="false"
                                    :min="0"
                                    :precision="0"
                                    :disabled="item.disabled"
                                />
                            </template>
                            <template v-else-if="item.type === 'daterange'">
                                <el-date-picker
                                    style="width: 100%"
                                    v-model="detailAttrsCollection[item.prop]"
                                    type="date"
                                    :placeholder="item.placeholder"
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    :disabled="item.disabled"
                                />
                            </template>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24" class="last-col-child">
                        <el-form-item style="width: 100%" label="描述:">
                            <el-input
                                v-model="detailAttrsCollection.description"
                                style="width: 100%"
                                autosize
                                type="textarea"
                                :disabled="disabledDescriptionField"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <!-- <el-descriptions :column="4">
                    <template v-for="item in detailItemsData" :key="item.label">
                        <el-descriptions-item :label="item.label + ':'" label-align="right">
                            <span style="color: #303133">
                                <template v-if="item.prop">
                                    <template
                                        v-if="
                                            detailAttrsCollection[item.prop] || detailAttrsCollection[item.prop] === 0
                                        "
                                    >
                                        <el-text v-if="item.formatter">
                                            {{
                                                renderColumnText({
                                                    descriptionsItem: item,
                                                    text: detailAttrsCollection[item.prop]
                                                })
                                            }}
                                        </el-text>
                                        <el-text v-else>{{ detailAttrsCollection[item.prop] }}</el-text>
                                    </template>
                                    <el-text v-else style="color: #bfbfbf">{{ t("dashboardPage.noData") }}</el-text>
                                </template>
                            </span>
                        </el-descriptions-item>
                    </template>
                </el-descriptions> -->
        </div>

        <!-- 编号 - 编辑弹窗 -->
        <ConfigNumberDialog
            v-if="configNumberDialog.visible"
            :dialog="configNumberDialog"
            @handleEditSuccess="handleEditSuccess_number"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import ConfigNumberDialog from "@/views/bomManage/productLibrary/components/configNumberDialog.vue"
import ViewChart from "@/components/viewChart/index.vue"
import { getDocumentPartDetails, getEPMFile } from "@/api/productDetail"
import { downloadUploadFile } from "@/api/productLibrary"
import { downloadFile } from "@/utils/exportTemplate"
import {
    unitList,
    partTypeList,
    impodegreeList,
    processStatusList,
    drawingList,
    lifeCycleTemplateList,
    ownerGroupList,
    productPhaseList,
    zzjissueStockList,
    fjzzjissueStockList,
    projectMethodList,
    planningMethodList
} from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { createPart } from "@/api/productLibrary"
import { multiLevelDictionaryData } from "@/api/system/multiLevelDictionary"
import { recursionArray } from "@/utils"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    query: {
        type: Object,
        default: () => ({
            oid: "",
            type: "",
            materialType: ""
        })
    },
    materielTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionTrimList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionLineList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionChildLineList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionPrePlanTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    colSpan: {
        type: Number,
        default: 8
    },
    isCanEdit: {
        type: Boolean,
        default: false
    },
    currentRowData: {
        type: Object,
        default: () => ({})
    },
    // 显示规则类型名称
    viewName: {
        type: String,
        default: ""
    }
})

console.log("props.isCanEdit", props.isCanEdit)

const emits = defineEmits(["startLoading", "endLoading", "confirm-success", "handleEditStatusUpdate"])
const { t } = useI18n()
const loading = ref(false)

// 数据类型（old：旧数据；new：新数据）
const dataType = ref("old")
if (props.query.type === "WTPart") dataType.value = "new"

// 可视化数据
const visualizationModelData = reactive({
    // url: "sample-data/Fishing_Reel/fishing_reel.pvs"
    url: ""
})
//#endregion

//#region 多级字典获取产品类型
const multiLevelDictionaryProductTypeList = ref<any>([]) // 产品类型列表
const multiLevelDictionaryProductLineList = ref<any>([]) // 产品线列表
const multiLevelDictionaryProductSubLineList = ref<any>([]) // 产品子线列表
const getMultiLevelDictionaryTypeData = async (detailsData: any) => {
    try {
        loading.value = true
        const params = {
            status: 1
        }
        const { data } = (await multiLevelDictionaryData(params)) as any
        multiLevelDictionaryProductTypeList.value = data.map((item: any) => {
            return {
                ...item,
                id: item.code
            }
        })
        // 获取回显详情
        getDocumentPartDetailsData(detailsData)
        loading.value = false
    } catch (error: any) {
        loading.value = false
        console.log(error)
    }
}

// 处理产品类型选择获取产品线列表
const handleProductTypeChange = (val: string) => {
    detailAttrsCollection.productLineChild = ""
    detailAttrsCollection.productSubLine = ""
    multiLevelDictionaryProductLineList.value = []
    multiLevelDictionaryProductSubLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductLineList.value =
                item.children.map((item: any) => {
                    return {
                        ...item,
                        id: item.code
                    }
                }) || []
        }
    })
}

// 处理产品线选择获取产品子线列表
const handleProductLineChildChange = (val: string) => {
    detailAttrsCollection.productSubLine = ""
    multiLevelDictionaryProductSubLineList.value = []
    recursionArray(multiLevelDictionaryProductTypeList.value, (item: any) => {
        if (item.code === val) {
            // 拿到当前产品类型下的产品线
            multiLevelDictionaryProductSubLineList.value =
                item.children.map((item: any) => {
                    return {
                        ...item,
                        id: item.code
                    }
                }) || []
        }
    })
}
//#endregion

//#region 描述列表
interface ItemInterface {
    type: string
    label: string
    prop: string
    rules?: any[]
    placeholder?: string
    disabled?: boolean
    iconSearch?: boolean
    options?: SelectInterface[]
    onChange?: Function
    formatter?: Function
}

//#region 详情列源数据
const disabledDescriptionField = computed(() => {
    return props.query.materialType === "wt.part.WTPart"
        ? true
        : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomRawMaterial"
        ? true
        : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial"
        ? true
        : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomCompleteMachine"
        ? true
        : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomStandardParts"
        ? true
        : (computed(() => !props.isCanEdit) as any).value
})
// 公共字段
const publicItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "裁剪方式",
        prop: "trimMethod",
        placeholder: "请选择",
        options: props.optionTrimList,
        disabled:
            props.query.materialType === "wt.part.WTPart"
                ? true
                : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomRawMaterial"
                ? true
                : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial"
                ? true
                : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomCompleteMachine"
                ? true
                : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomStandardParts"
                ? true
                : (computed(() => !props.isCanEdit) as any)
    }
    // {
    //     type: "textarea",
    //     label: "描述",
    //     prop: "description",
    //     disabled:
    //         props.query.materialType === "wt.part.WTPart"
    //             ? true
    //             : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomRawMaterial"
    //             ? true
    //             : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial"
    //             ? true
    //             : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomCompleteMachine"
    //             ? true
    //             : props.query.materialType === "wt.part.WTPart|com.pdinfo.kbomStandardParts"
    //             ? true
    //             : (computed(() => !props.isCanEdit) as any),
    //     placeholder: "请输入"
    // }
])

// 物料为零部件类型
const partsItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "关重件特性",
        prop: "lgImpodegree",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: impodegreeList
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "工艺状态",
        prop: "processStatus",
        placeholder: "请选择",
        options: processStatusList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: computed(() => !props.isCanEdit) as any,
        iconSearch: false
    },
    {
        type: "inputNumber",
        label: "单件毛重",
        prop: "lgGrossWeight",
        disabled: computed(() => !props.isCanEdit) as any,
        iconSearch: false
    },
    {
        type: "input",
        label: "原材料编码",
        prop: "lgRawpartCode",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯外形尺寸",
        prop: "lgBlankSize",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯规格",
        prop: "lgBlankStandard",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯种类",
        prop: "lgBlankType",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "inputNumber",
        label: "毛坯件数",
        prop: "lgEachBlankNumber",
        disabled: computed(() => !props.isCanEdit) as any,
        iconSearch: false
    },
    {
        type: "input",
        label: "下料工段",
        prop: "lgFeedSection",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "input",
        label: "工艺路线",
        prop: "lgProRoute",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "预计划分类",
        prop: "preparePlanType",
        placeholder: "请选择",
        options: props.optionPrePlanTypeList,
        disabled: computed(() => !props.isCanEdit) as any
    }
])
// 物料为原材料类型
const rawMaterialItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "下料工段",
        prop: "lgFeedSection",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    }
])
// 物料为辅料类型
const accessoryItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: true
    }
])
// 物料为模块类型
const moduleTypeItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: true
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    }
])
// 物料为整机配置类型
const overallConfigurationItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: computed(() => !props.isCanEdit) as any,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: computed(() => !props.isCanEdit) as any,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "产品类型",
        prop: "productType",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductTypeList.value) as any,
        disabled: computed(() => !props.isCanEdit) as any,
        onChange: handleProductTypeChange
    },
    {
        type: "select",
        label: "产品线",
        prop: "productLineChild",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductLineList.value) as any,
        disabled: computed(() => !props.isCanEdit) as any,
        onChange: handleProductLineChildChange
        // formatter: (value: string) => {
        //     return getNameById(option_childLine.value, value, {
        //         value: "code",
        //         label: "codeListNameC"
        //     })
        // }
    },
    {
        type: "select",
        label: "产品子线",
        prop: "productSubLine",
        rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductSubLineList.value) as any,
        disabled: computed(() => !props.isCanEdit) as any
        // formatter: (value: string) => {
        //     return getNameById(option_childLine.value, value, {
        //         value: "code",
        //         label: "codeListNameC"
        //     })
        // }
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: computed(() => !props.isCanEdit) as any
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: computed(() => !props.isCanEdit) as any
    }
])
// 物料为整机类型
const completeMachineItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: "必填项不能为空！", trigger: "blur" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "产品类型",
        prop: "productType",
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductTypeList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "产品线",
        prop: "productLineChild",
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductLineList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "产品子线",
        prop: "productSubLine",
        placeholder: "请选择",
        options: computed(() => multiLevelDictionaryProductSubLineList.value) as any,
        disabled: true
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: true
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件毛重",
        prop: "lgGrossWeight",
        disabled: true
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: true
    },
    {
        type: "input",
        label: "系列号",
        prop: "seriesNumber",
        disabled: true
    },
    {
        type: "input",
        label: "设计机型号",
        prop: "designMachineNumber",
        disabled: true
    },
    {
        type: "input",
        label: "配置号",
        prop: "configNumber",
        disabled: true
    },
    {
        type: "input",
        label: "料品辅配",
        prop: "auxiliaryConfiguration",
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "工艺状态",
        prop: "processStatus",
        placeholder: "请选择",
        options: processStatusList,
        disabled: true
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    }
])
// 物料为标准件类型
const standardPartItemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "原材料编码",
        prop: "lgRawpartCode",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: true
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    }
])

const itemsData = ref<ItemInterface[]>([
    {
        type: "select",
        label: "类型",
        prop: "materialType",
        // formatter: (value: string) => {
        //     return getNameById(props.materielTypeList, value)
        // },
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        options: computed(() => props.materielTypeList) as any,
        disabled: true
    },
    {
        type: "select",
        label: "零件类型",
        prop: "lgPartType",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "input",
        label: "编码",
        prop: "code",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        placeholder: "请输入",
        disabled: true
    },
    {
        type: "input",
        label: "名称",
        prop: "name",
        // rules: [{ required: true, message: t("productLibraryPage.requiredFields"), trigger: "change" }],
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "产品位置",
        prop: "selectProductName",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "文件夹位置",
        prop: "selectFolderName",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "代号",
        prop: "lgDrawingNo",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所属公司",
        prop: "belongCompany",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "材料",
        prop: "material",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "机型号",
        prop: "lgModel",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "关重件特性",
        prop: "lgImpodegree",
        placeholder: "请选择",
        disabled: true,
        options: impodegreeList
    },
    {
        type: "select",
        label: "生命周期",
        prop: "lifeCycle",
        placeholder: "请选择",
        options: lifeCycleTemplateList,
        disabled: true
    },
    {
        type: "select",
        label: "工艺状态",
        prop: "processStatus",
        placeholder: "请选择",
        options: processStatusList,
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件净重",
        prop: "weight",
        disabled: true
    },
    {
        type: "inputNumber",
        label: "单件毛重",
        prop: "lgGrossWeight",
        disabled: true
    },
    {
        type: "input",
        label: "原材料编码",
        prop: "lgRawpartCode",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯外形尺寸",
        prop: "lgBlankSize",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯规格",
        prop: "lgBlankStandard",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "毛坯种类",
        prop: "lgBlankType",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "inputNumber",
        label: "毛坯件数",
        prop: "lgEachBlankNumber",
        disabled: true,
        iconSearch: false
    },
    {
        type: "input",
        label: "下料工段",
        prop: "lgFeedSection",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "select",
        label: "单位",
        prop: "lgUnit",
        placeholder: "请选择",
        options: unitList,
        disabled: true
    },
    {
        type: "select",
        label: "图幅",
        prop: "lgDrawing",
        placeholder: "请选择",
        options: drawingList,
        disabled: true
    },
    {
        type: "select",
        label: "所属用户组",
        prop: "ownerGroup",
        placeholder: "请选择",
        options: ownerGroupList,
        disabled: true
    },
    {
        type: "select",
        label: "阶段标识",
        prop: "productPhase",
        placeholder: "请选择",
        options: productPhaseList,
        disabled: true
    },
    {
        type: "input",
        label: "工艺路线",
        prop: "lgProRoute",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "别名",
        prop: "lgAnotherName",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "select",
        label: "上海机械零件类型",
        prop: "type1",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海挖机零件类型",
        prop: "type2",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建机械零件类型",
        prop: "type3",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海路面零件类型",
        prop: "type4",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海叉车零件类型",
        prop: "type5",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海部件零件类型",
        prop: "type6",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "江西机械零件类型",
        prop: "type7",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "上海液压零件类型",
        prop: "type8",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建液压零件类型",
        prop: "type9",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建桥箱零件类型",
        prop: "type10",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建铸锻零件类型",
        prop: "type11",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "精工液压零件类型",
        prop: "type12",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建挖机零件类型",
        prop: "type13",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "福建配件零件类型",
        prop: "type14",
        placeholder: "请选择",
        disabled: true,
        options: partTypeList
    },
    {
        type: "select",
        label: "计划方法",
        prop: "projectMethod",
        placeholder: "请选择",
        options: projectMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "规划方法",
        prop: "planningMethod",
        placeholder: "请选择",
        options: planningMethodList,
        disabled: true
    },
    {
        type: "select",
        label: "装载机发料仓库",
        prop: "fjzzjissueStock2",
        placeholder: "请选择",
        options: zzjissueStockList,
        disabled: true
    },
    {
        type: "select",
        label: "福建装载机发料仓库",
        prop: "fjzzjissueStock",
        placeholder: "请选择",
        options: fjzzjissueStockList,
        disabled: true
    },
    {
        type: "input",
        label: "版本",
        prop: "version",
        disabled: true,
        placeholder: "请输入",
        iconSearch: false
    },
    {
        type: "input",
        label: "所有者",
        prop: "owner",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "input",
        label: "创建者",
        prop: "creator",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "创建时间",
        prop: "createTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "修改者",
        prop: "modifor",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "修改时间",
        prop: "modifyTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "input",
        label: "检出者",
        prop: "checkOuter",
        disabled: true,
        placeholder: "",
        iconSearch: false
    },
    {
        type: "daterange",
        label: "检出时间",
        prop: "checkTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "daterange",
        label: "发布时间",
        prop: "releasedTime",
        disabled: true,
        placeholder: ""
    },
    {
        type: "textarea",
        label: "描述",
        prop: "description",
        disabled: true,
        placeholder: "请输入"
    }
    // {
    //     label: "同步时间",
    //     prop: "syncTime"
    // }
    //#endregion
])
//#endregion

const detailItemsData = ref<any[]>([]) // 详情列
// 初始化详情列
const initDetailItem = (materialType: string) => {
    switch (materialType) {
        case "wt.part.WTPart" || "wt.part.WTPart|com.pdinfo.kbomMATERIAL":
            detailItemsData.value = itemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomPHANTOM": // 物料为零部件类型
            detailItemsData.value = partsItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomRawMaterial": // 物料为原材料类型
            detailItemsData.value = rawMaterialItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial": // 物料为辅料类型
            detailItemsData.value = accessoryItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomMODULE": // 物料为模块类型
            detailItemsData.value = moduleTypeItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomCAR": // 物料为整机配置类型
            detailItemsData.value = overallConfigurationItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomCompleteMachine": // 物料为整机类型
            detailItemsData.value = completeMachineItemsData.value
            break
        case "wt.part.WTPart|com.pdinfo.kbomStandardParts": // 物料为标准件类型
            detailItemsData.value = standardPartItemsData.value
            break

        default:
            detailItemsData.value = []
            break
    }
    publicItemsData.value.forEach((ele) => detailItemsData.value.push(ele))

    // console.log("detailItemsData.value： ", detailItemsData.value)
}
initDetailItem(props.query.materialType)

// 渲染 formatter 文本
const renderColumnText = (data: { descriptionsItem: any; text: string }) => {
    const { descriptionsItem, text } = data
    if (descriptionsItem.formatter) {
        return descriptionsItem.formatter(text)
    }
    return text
}
//#endregion

//#region 详情集合
const rules = reactive<FormRules>({})
const detailAttrsCollectionRef = ref<FormInstance>()
const detailAttrsCollection = reactive<any>({
    oid: "",
    type: "", // 类型
    condition: "", // 状况
    mainContent: "", // 主要内容
    updater: "", // 修改者
    lastModifyTime: "", // 上次修改时间
    assembleType: "", // 装配模式
    finishProduct: "", // 成品
    source: "", // 源
    defaultUom: "", // 默认单位
    collectPart: "", // 收集部件
    defaultTrackCode: "", // 默认追踪代码
    virtualManufacturePart: "", // 虚拟制造部件
    status: "", // 状态
    formatName: "", // 格式名称
    context: "", // 上下文
    site: "", // 位置
    teamTemplate: "", // 团队模板
    ifCanCheck: true, // 检出状态
    ifCurrentCheckouter: true, // 是否当前检出人

    materialType: "", // 类型
    lgPartType: "", // 零件类型
    selectProductOid: "", // 选择产品oid
    selectProductName: "", // 选择产品name
    selectFolderOid: "", // 选择文件夹oid
    selectFolderName: "", // 选择文件夹name
    code: "", // 编号
    name: "", // 名称
    lgDrawingNo: "", // 代号
    material: "", // 材料
    lgModel: "", // 机型号
    lgImpodegree: "", // 关重件特性
    lifeCycle: "", // 生命周期name
    enState: "", // 生命周期id
    processStatus: "", // 工艺状态
    weight: undefined, // 单件净重
    lgGrossWeight: undefined, // 单件毛重
    lgRawpartCode: "", // 原材料编码
    lgBlankStandard: "", // 毛胚规格
    lgBlankSize: "", // 毛坯外形尺寸
    lgBlankType: "", // 毛胚种类
    lgEachBlankNumber: undefined, // 毛胚件数
    lgFeedSection: "", // 下料工段
    lgUnit: "", // 单位
    lgDrawing: "", // 图幅
    ownerGroup: "", // 所属用户组
    productPhase: "", // 阶段标识
    lgProRoute: "", // 工艺路线
    description: "", // 描述
    lgBelongCompany: "", // 所属公司
    lgAnotherName: "", // 别名
    planningMethod: "", // 规划方法
    seriesNumber: "", // 系列号
    auxiliaryConfiguration: "", // 料品辅配
    designMachineNumber: "", //设计机型号
    configNumber: "", //配置号
    projectMethod: "", // 计划方法
    fjzzjissueStock2: "", // 装载机发料仓库
    fjzzjissueStock: "", // 福建装载机发料仓库
    syncTime: "", // 同步时间
    type1: "", // 上海机械零件类型
    type2: "", // 上海挖机零件类型
    type3: "", // 福建机械零件类型
    type4: "", // 上海路面自制零件
    type5: "", // 上海叉车零件类型
    type6: "", // 上海部件零件类型
    type7: "", // 江西机械零件类型
    type8: "", // 上海液压零件类型
    type9: "", // 福建液压零件类型
    type10: "", // 福建桥箱零件类型
    type11: "", // 福建铸锻零件类型
    type12: "", // 精工液压零件类型
    type13: "", // 福建挖机零件类型
    type14: "", // 福建配件零件类型
    version: "", // 版本
    owner: "", // 所有者
    checkoutBy: "", // 检出者
    checkTime: "", // 检出时间
    modifor: "", // 修改者
    modifyTime: "", // 修改时间
    releasedTime: "", // 发布时间
    createTime: "", // 创建时间
    creator: "", // 创建者
    preparePlanType: "", // 预计划分类
    productType: "", // 产品类型
    productLineChild: "", // 产品线
    productSubLine: "", // 产品子线
    trimMethod: "", // 裁剪方式
    viewName: "" // 显示规则类型名称
})

// 获取文档部件详情
const getDocumentPartDetailsData = async (data: any) => {
    console.log("data", data)
    // 回显数据
    // 根据产品类型回显产品线
    if (data.productType) {
        handleProductTypeChange(data.productType)
    }
    // 根据产品线回显产品子线
    if (data.productLineChild) {
        handleProductLineChildChange(data.productLineChild)
    }

    Object.assign(detailAttrsCollection, {
        oid: data.oid,
        condition: data.condition,
        mainContent: data.mainContent,
        updater: data.updater,
        lastModifyTime: data.updateTime,
        assembleType: data.assembleType,
        finishProduct: data.isEndItem ? "是" : "否",
        source: data.source,
        defaultUom: data.unit,
        collectPart: data.collectPart ? "是" : "否",
        defaultTrackCode: data.defaultTrackCode,
        virtualManufacturePart: data.isPhantom ? "是" : "否",
        status: data.state,
        formatName: data.format,
        context: data.context,
        site: data.location,
        teamTemplate: data.teamTemplateName,
        ifCanCheck: data.ifCanCheck, // 检出状态
        ifCurrentCheckouter: data.ifCurrentCheckouter, // 是否当前检出人

        materialType: data.materialType, // 类型
        lgPartType: data.partCategory, // 零件类型
        selectProductOid: data.productOid, // 选择产品oid
        selectProductName: data.productName, // 选择产品name
        selectFolderOid: data.folderOid, // 选择文件夹oid
        selectFolderName: data.folderName, // 选择文件夹name
        code: data.number, // 编号
        name: data.name, // 名称
        lgDrawingNo: data.materialSymbol, // 代号
        material: data.material, // 材料
        lgModel: data.machineModel, // 机型号
        lgImpodegree: data.importantDegree, // 关重件特性
        lifeCycle: data.cnState, // 生命周期name
        enState: data.enState, // 生命周期id
        processStatus: data.processState, // 工艺状态
        weight: data.netWeight ? +data.netWeight : undefined, // 单件净重
        lgGrossWeight: data.grossWeight ? +data.grossWeight : undefined, // 单件毛重
        lgRawpartCode: data.rawPartCode, // 原材料编码
        lgBlankStandard: data.blankSpecification, // 毛胚规格
        lgBlankSize: data.blankSize, // 毛坯外形尺寸
        lgBlankType: data.blankType, // 毛胚种类
        lgEachBlankNumber: data.blankNumber ? +data.blankNumber : undefined, // 毛胚件数
        lgFeedSection: data.feedSection, // 下料工段
        lgUnit: data.unit, // 单位
        lgDrawing: data.drawing, // 图幅
        ownerGroup: data.ownerGroup, // 所属用户组
        productPhase: data.productPhase, // 阶段标识
        lgProRoute: data.processRoute, // 工艺路线
        description: data.desc, // 描述
        lgBelongCompany: data.belongCompany, // 所属公司
        lgAnotherName: data.anotherName, // 别名
        planningMethod: data.layout, // 规划方法
        seriesNumber: data.seriesNumber, // 系列号
        designMachineNumber: data.designMachineNumber, // 设计机型号
        configNumber: data.configNumber, // 配置号
        auxiliaryConfiguration: data.auxiliaryConfiguration, // 料品辅配
        projectMethod: data.planMethod, // 计划方法
        fjzzjissueStock2: data.loaderIssuingStock, // 装载机发料仓库
        fjzzjissueStock: data.fujianLoaderIssuingStock, // 福建装载机发料仓库
        syncTime: data.synchronizationTime, // 同步时间
        type1: data.shanghaiMechanicalPartType, // 上海机械零件类型
        type2: data.shanghaiExcavatorPartsType, // 上海挖机零件类型
        type3: data.fujianMechanicalPartType, // 福建机械零件类型
        type4: data.shanghaiRoadbedPartType, // 上海路面自制零件
        type5: data.shanghaiForkliftPartType, // 上海叉车零件类型
        type6: data.shanghaiComponentPartType, // 上海部件零件类型
        type7: data.jiangxiMechanicalPartType, // 江西机械零件类型
        type8: data.shanghaiHydraulicPartType, // 上海液压零件类型
        type9: data.fujianHydraulicPartType, // 福建液压零件类型
        type10: data.fujianBridgeBoxPartType, // 福建桥箱零件类型
        type11: data.fujianCastPartType, // 福建铸锻零件类型
        type12: data.precisionHydraulicPartType, // 精工液压零件类型
        type13: data.fujianExcavatorPartType, // 福建挖机零件类型
        type14: data.fujianSparePartsType, // 福建配件零件类型
        version: data.version, // 版本
        owner: data.owner, // 所有者
        checkOuter: data.checkOuter, // 检出者
        checkTime: data.checkTime, // 检出时间
        modifor: data.updater, // 修改者
        modifyTime: data.updateTime, // 修改时间
        releasedTime: data.releasedTime, // 发布时间
        createTime: data.createTime, // 创建时间
        creator: data.creator, // 创建者
        preparePlanType: data.preparePlanType, // 预计划分类
        productType: data.productType, // 产品类型
        productLineChild: data.productLineChild, // 产品线
        productSubLine: data.productSubLine, // 产品子线
        trimMethod: data.trimMethod, // 裁剪方式
        viewName: data.view // 显示规则类型名称
    })
    Object.assign(visualizationModelData, {
        ...visualizationModelData,
        name: data.name,
        number: data.number,
        state: data.state,
        modifyer: data.updater,
        modifyTime: data.updateTime
    })
    console.log("详情数据getDocumentPartDetailsData: ", detailAttrsCollection)
    emitter.emit("detailAttrsCollectionForm", detailAttrsCollection)
}

// 获取可视化图纸
const getEPMFileData = async (query: any) => {
    try {
        loading.value = true
        const params: {
            oid: string
        } = {
            oid: query.oid
        }
        console.log(params)
        const { data } = await getEPMFile(params)
        Object.assign(visualizationModelData, {
            ...visualizationModelData,
            url: data
        })
        loading.value = false
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
//#endregion

//#region 编号 - 编辑弹窗
const configNumberDialog = reactive<any>({
    visible: false,
    title: "",
    partType: ""
})
// 编辑编号
const goEdit_number = (type: string) => {
    console.log("编号弹窗type: ", type, detailAttrsCollection)
    if (!props.isCanEdit) return
    // 只有为编号时才行
    if (type === "code") {
        Object.assign(configNumberDialog, {
            visible: true,
            title: "编号配置",
            partType: detailAttrsCollection.materialType
        })
    }
}
// 编号编辑成功回调
const handleEditSuccess_number = (number: string) => {
    detailAttrsCollection.code = number
    Object.assign(configNumberDialog, {
        visible: false,
        title: "",
        partType: ""
    })
    // 清空编码检验
    if (number) detailAttrsCollectionRef.value!.clearValidate("code")
}
//#endregion

// 处理编辑保存按钮
const handleEditConfirm = async () => {
    if (!detailAttrsCollectionRef.value) return
    await detailAttrsCollectionRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const params: {
                    oid: string
                    materialType: string // 类型
                    partCategory: string // 零件类型
                    productOid: string // 选择产品
                    pid: string // 选择文件夹
                    number: string // 编号
                    name: string // 名称
                    materialSymbol?: string // 代号
                    material?: string // 材料
                    machineModel?: string // 机型号
                    importantDegree?: string // 关重件特性
                    lifeCycle?: string // 生命周期
                    processState?: string // 工艺状态
                    netWeight?: number // 单件净重
                    grossWeight?: number // 单件毛重
                    rawPartCode?: string // 原材料编码
                    blankSpecification?: string // 毛胚规格
                    blankSize?: string // 毛坯外形尺寸
                    blankType?: string // 毛胚种类
                    blankNumber?: number // 毛胚件数
                    feedSection?: string // 下料工段
                    unit?: string // 单位
                    drawing?: string // 图幅
                    ownerGroup?: string // 所属用户组
                    productPhase?: string // 阶段标识
                    processRoute?: string // 工艺路线
                    desc?: string // 描述
                    // version: "" // 版本
                    owner?: string // 所有者
                    // checkOuter: "" // 检出者
                    // checkTime: "" // 检出时间
                    // updater: "" // 修改者
                    // updateTime: "" // 修改时间
                    // releasedTime: "" // 发布时间
                    // createTime: "" // 创建时间
                    // creator: "" // 创建者
                    belongCompany?: string // 所属公司
                    anotherName?: string // 别名
                    layout?: string // 规划方法
                    seriesNumber?: string // 系列号
                    designMachineNumber?: string // 设计机型号
                    configNumber?: string // 配置号
                    auxiliaryConfiguration?: string // 料品辅配
                    planMethod?: string // 计划方法
                    loaderIssuingStock?: string // 装载机发料仓库
                    fujianLoaderIssuingStock?: string // 福建装载机发料仓库
                    synchronizationTime?: string // 同步时间
                    shanghaiMechanicalPartType?: string // 上海机械零件类型
                    shanghaiExcavatorPartsType?: string // 上海挖机零件类型
                    fujianMechanicalPartType?: string // 福建机械零件类型
                    shanghaiRoadbedPartType?: string // 上海路面零件类型自制零件
                    shanghaiForkliftPartType?: string // 上海叉车零件类型
                    shanghaiComponentPartType?: string // 上海部件零件类型
                    jiangxiMechanicalPartType?: string // 江西机械零件类型
                    shanghaiHydraulicPartType?: string // 上海液压零件类型
                    fujianHydraulicPartType?: string // 福建液压零件类型
                    fujianBridgeBoxPartType?: string // 福建桥箱零件类型
                    fujianCastPartType?: string // 福建铸锻零件类型
                    precisionHydraulicPartType?: string // 精工液压零件类型
                    fujianExcavatorPartType?: string // 福建挖机零件类型
                    fujianSparePartsType?: string // 福建配件零件类型
                    preparePlanType: string // 预计划分类
                    productType: string // 产品类型
                    productLineChild: string // 产品线
                    productSubLine: string // 产品子线
                    trimMethod: string // 裁剪方式
                    viewName: string // 显示规则类型名称
                } = {
                    oid: props.currentRowData.oid,
                    materialType: detailAttrsCollection.materialType, // 类型
                    partCategory: detailAttrsCollection.lgPartType, // 零件类型
                    productOid: detailAttrsCollection.selectProductOid, // 选择产品
                    pid: detailAttrsCollection.selectFolderOid, // 选择文件夹
                    number: detailAttrsCollection.code, // 编号
                    name: detailAttrsCollection.name, // 名称
                    materialSymbol: detailAttrsCollection.lgDrawingNo, // 代号
                    material: detailAttrsCollection.material, // 材料
                    machineModel: detailAttrsCollection.lgModel, // 机型号
                    importantDegree: detailAttrsCollection.lgImpodegree, // 关重件特性
                    lifeCycle: detailAttrsCollection.lifeCycleTemplate, // 生命周期
                    processState: detailAttrsCollection.processStatus, // 工艺状态
                    netWeight: detailAttrsCollection.weight, // 单件净重
                    grossWeight: detailAttrsCollection.lgGrossWeight, // 单件毛重
                    rawPartCode: detailAttrsCollection.lgRawpartCode, // 原材料编码
                    blankSpecification: detailAttrsCollection.lgBlankStandard, // 毛胚规格
                    blankSize: detailAttrsCollection.lgBlankSize, // 毛坯外形尺寸
                    blankType: detailAttrsCollection.lgBlankType, // 毛胚种类
                    blankNumber: detailAttrsCollection.lgEachBlankNumber, // 毛胚件数
                    feedSection: detailAttrsCollection.lgFeedSection, // 下料工段
                    unit: detailAttrsCollection.lgUnit, // 单位
                    drawing: detailAttrsCollection.lgDrawing, // 图幅
                    ownerGroup: detailAttrsCollection.ownerGroup, // 所属用户组
                    productPhase: detailAttrsCollection.productPhase, // 阶段标识
                    processRoute: detailAttrsCollection.lgProRoute, // 工艺路线
                    desc: detailAttrsCollection.description, // 描述
                    // version: "" // 版本
                    owner: detailAttrsCollection.owner, // 所有者
                    // checkoutBy: "" // 检出者
                    // checkoutTime: "" // 检出时间
                    // modifor: "" // 修改者
                    // modifyTime: "" // 修改时间
                    // papproveTime: "" // 发布时间
                    // createTime: "" // 创建时间
                    // creator: "" // 创建者
                    belongCompany: detailAttrsCollection.lgBelongCompany, // 所属公司
                    anotherName: detailAttrsCollection.lgAnotherName, // 别名
                    layout: detailAttrsCollection.planningMethod, // 规划方法
                    seriesNumber: detailAttrsCollection.seriesNumber, // 系列号
                    designMachineNumber: detailAttrsCollection.designMachineNumber, // 设计机型号
                    configNumber: detailAttrsCollection.configNumber, // 配置号
                    auxiliaryConfiguration: detailAttrsCollection.auxiliaryConfiguration, // 料品辅配
                    planMethod: detailAttrsCollection.projectMethod, // 计划方法
                    loaderIssuingStock: detailAttrsCollection.fjzzjissueStock2, // 装载机发料仓库
                    fujianLoaderIssuingStock: detailAttrsCollection.fjzzjissueStock, // 福建装载机发料仓库
                    synchronizationTime: detailAttrsCollection.syncTime, // 同步时间
                    shanghaiMechanicalPartType: detailAttrsCollection.type1, // 上海机械零件类型
                    shanghaiExcavatorPartsType: detailAttrsCollection.type2, // 上海挖机零件类型
                    fujianMechanicalPartType: detailAttrsCollection.type3, // 福建机械零件类型
                    shanghaiRoadbedPartType: detailAttrsCollection.type4, // 上海路面零件类型自制零件
                    shanghaiForkliftPartType: detailAttrsCollection.type5, // 上海叉车零件类型
                    shanghaiComponentPartType: detailAttrsCollection.type6, // 上海部件零件类型
                    jiangxiMechanicalPartType: detailAttrsCollection.type7, // 江西机械零件类型
                    shanghaiHydraulicPartType: detailAttrsCollection.type8, // 上海液压零件类型
                    fujianHydraulicPartType: detailAttrsCollection.type9, // 福建液压零件类型
                    fujianBridgeBoxPartType: detailAttrsCollection.type10, // 福建桥箱零件类型
                    fujianCastPartType: detailAttrsCollection.type11, // 福建铸锻零件类型
                    precisionHydraulicPartType: detailAttrsCollection.type12, // 精工液压零件类型
                    fujianExcavatorPartType: detailAttrsCollection.type13, // 福建挖机零件类型
                    fujianSparePartsType: detailAttrsCollection.type14, // 福建配件零件类型
                    preparePlanType: detailAttrsCollection.preparePlanType, // 预计划分类
                    productType: detailAttrsCollection.productType, // 产品类型
                    productLineChild: detailAttrsCollection.productLineChild, // 产品线
                    productSubLine: detailAttrsCollection.productSubLine, // 产品子线
                    trimMethod: detailAttrsCollection.trimMethod, // 裁剪方式
                    viewName: props.viewName // 显示规则类型名称
                }
                // 整机配置类型预计划分类默认为整车
                if (detailAttrsCollection.materialType === "wt.part.WTPart|com.pdinfo.kbomCAR") {
                    params.preparePlanType = "1"
                }
                emits("startLoading")
                const { data } = (await createPart(params)) as any
                emits("confirm-success", data.oid)
                ElMessage({
                    type: "success",
                    message: "编辑成功！",
                    center: true
                })
            } catch (err: any) {
                emits("endLoading")
                console.log(err)
            }
        } else {
            emits("handleEditStatusUpdate", true)
        }
    })
}

onMounted(() => {
    // 如果为部件则查模型
    if (props.query.type === "WTPart") {
        if (dataType.value === "old") getEPMFileData(props.query)
    }
    // 检入/检出时重新获取状态
    // emitter.on("isRefreshWTPartDocumentDetailData", (data: boolean) => {
    //     if (data) {
    //         getDocumentPartDetailsData(props.query)
    //     }
    // })
})

// 页面关闭卸载掉emitter订阅
// onBeforeUnmount(() => {
//     emitter.off("isRefreshWTPartDocumentDetailData")
// })

// 向外暴露方法
defineExpose({
    getDocumentPartDetailsData,
    handleEditConfirm,
    getMultiLevelDictionaryTypeData
})
</script>

<style lang="scss" scoped>
.w-full {
    position: relative;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    // background-color: red;
    cursor: pointer;
}

.document-part-detail {
    display: flex;
    flex: 1;
    overflow: hidden;
    .pt-container-main-left {
        width: 50%;
        height: inherit;
        overflow: hidden;
        border: 1px solid #dcdfe6;
    }
    .pt-container-main-right {
        flex: 1;
        margin-left: 5px;
        .attributes-wrapper,
        .convention-wrapper,
        .system-wrapper {
            margin-bottom: 5px;
            .box-card {
                :deep(.el-card__header) {
                    padding: 10px 20px;
                }
            }
        }
        // :deep(.el-descriptions) {
        //     .el-descriptions__cell {
        //         padding-bottom: 2px;
        //         .el-descriptions__content {
        //             .el-text {
        //                 border: 1px solid var(--el-border-color);
        //                 padding: 1px 5px;
        //             }
        //         }
        //     }
        // }
        :deep(.el-form) {
            .el-form-item {
                width: 100%;
                margin-bottom: 16px;
            }
            .el-row:last-child {
                .el-col:last-child {
                    .el-form-item {
                        width: 200%;
                    }
                }
            }
        }
    }
}
</style>
