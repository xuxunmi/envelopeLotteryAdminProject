<template>
    <div>
        <div v-loading="loading" :element-loading-text="elementLoadingText" class="py-2 h-full overflow-hidden">
            <!-- <el-scrollbar style="flex: 1"> -->
            <div class="detailWrapper">
                <el-scrollbar :style="{ height: defaultContentHeight }">
                    <Detail
                        ref="DetailRef"
                        :query="query"
                        :materielTypeList="materielTypeList"
                        :typeList="typeList"
                        :optionTrimList="optionTrimList"
                        :optionLineList="optionLineList"
                        :optionChildLineList="optionChildLineList"
                        :optionPrePlanTypeList="optionPrePlanTypeList"
                        :colSpan="colSpan"
                        :isCanEdit="isCanEdit"
                        :currentRowData="currentRowData"
                        :viewName="viewName"
                        @startLoading="startLoading"
                        @endLoading="endLoading"
                        @confirm-success="handleConfirmSuccess"
                        @handleEditStatusUpdate="handleEditStatusUpdate"
                    />
                </el-scrollbar>
                <div v-drag class="dragLine" />
                <div class="tabsWrapper">
                    <el-tabs class="tabs" v-model="activeName" type="border-card" @tab-click="handleTabClick">
                        <!-- 物料为部件/物料类型 -->
                        <template
                            v-if="
                                query.materialType === 'wt.part.WTPart' ||
                                query.materialType === 'wt.part.WTPart|com.pdinfo.kbomMATERIAL'
                            "
                        >
                            <el-tab-pane label="PBOM裁剪" name="PBOM裁剪">
                                <PbomCropping />
                            </el-tab-pane>
                            <el-tab-pane label="实例化方案" name="实例化方案">
                                <InstancePlan />
                            </el-tab-pane>
                            <el-tab-pane :label="t('productDetailPage.relatedObject')" name="object">
                                <ObjectTab v-if="tabShow.object" :data="query" />
                            </el-tab-pane>
                            <el-tab-pane :label="t('productDetailPage.historicalRecord')" name="history">
                                <HistoryTab v-if="tabShow.history" :data="query" />
                            </el-tab-pane>
                            <!-- <el-tab-pane label="附件" name="附件">
                                <Attachment />
                            </el-tab-pane> -->
                            <el-tab-pane label="相关变更" name="相关变更">
                                <!-- <RelevanceChange /> -->
                            </el-tab-pane>
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="库存信息" name="stock">
                                <InventoryInfo v-if="tabShow.stock" :objectRow="query" />
                            </el-tab-pane>
                            <el-tab-pane label="配置特征" name="variable">
                                <VariableTab v-if="tabShow.variable" ref="VariableTabRef" :objectRow="query" onlyRead />
                            </el-tab-pane>
                            <el-tab-pane v-if="query?.parentOid" label="配置条件" name="conditionTab">
                                <ConditionTab
                                    v-if="tabShow.conditionTab"
                                    ref="ConditionTabRef"
                                    onlyRead
                                    :objectRow="query"
                                />
                            </el-tab-pane>
                            <template v-if="query.type === 'WTPart'">
                                <!-- <el-tab-pane :label="t('productDetailPage.dynamicDocument')" name="action">
                                    <ActionTab v-if="tabShow.action" :data="query" />
                                </el-tab-pane> -->
                            </template>
                        </template>
                        <!-- 物料为零部件类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomPHANTOM'">
                            <!-- <el-tab-pane label="附件" name="附件">
                                    <Attachment />
                                </el-tab-pane> -->
                            <el-tab-pane label="上海整机PBOM" name="SHMachinePBom">
                                <CompleteMachinePBom v-if="tabShow.SHMachinePBom" :objectRow="query" />
                            </el-tab-pane>
                            <!-- <el-tab-pane label="其他各组织PBOM" name="其他各组织PBOM">
                                其他各组织PBOM
                            </el-tab-pane> -->
                            <el-tab-pane label="上海整机MBOM" name="SHMachineMBOM">
                                <CompleteMachineMBom
                                    v-if="tabShow.SHMachineMBOM"
                                    :data="{ viewName: 'SH-M', PartOid: query.PartOid }"
                                />
                            </el-tab-pane>
                            <!-- <el-tab-pane label="其他各组织MBOM" name="其他各组织MBOM">
                            其他各组织MBOM
                        </el-tab-pane> -->
                            <!-- <el-tab-pane label="工作流信息" name="工作流信息">
                            其他各组织PBOM
                        </el-tab-pane> -->
                            <el-tab-pane label="相关变更" name="相关变更">
                                <!-- <RelevanceChange /> -->
                            </el-tab-pane>
                            <el-tab-pane label="版本历史" name="versionList">
                                <VersionHistory v-if="tabShow.versionList" :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="库存信息" name="stock">
                                <InventoryInfo v-if="tabShow.stock" :objectRow="query" />
                            </el-tab-pane>
                        </template>
                        <!-- 物料为原材料类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomRawMaterial'">
                            <!-- <el-tab-pane label="附件" name="附件">
                                <Attachment />
                        </el-tab-pane> -->
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                        </template>
                        <!-- 物料为辅料类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial'">
                            <!-- <el-tab-pane label="附件" name="附件">
                                    <Attachment />
                            </el-tab-pane> -->
                            <el-tab-pane label="上海整机PBOM" name="SHMachinePBom">
                                <CompleteMachinePBom v-if="tabShow.SHMachinePBom" :objectRow="query" />
                            </el-tab-pane>
                            <el-tab-pane label="版本历史" name="versionList">
                                <VersionHistory v-if="tabShow.versionList" :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="库存信息" name="stock">
                                <InventoryInfo v-if="tabShow.stock" :objectRow="query" />
                            </el-tab-pane>
                        </template>
                        <!-- 物料为模块类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomMODULE'">
                            <!-- <el-tab-pane label="附件" name="附件">
                                <Attachment />
                        </el-tab-pane> -->
                            <el-tab-pane label="版本历史" name="versionList">
                                <VersionHistory v-if="tabShow.versionList" :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="相关变更" name="相关变更">
                                <!-- <RelevanceChange /> -->
                            </el-tab-pane>
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="配置特征" name="variable">
                                <VariableTab v-if="tabShow.variable" ref="VariableTabRef" :objectRow="query" onlyRead />
                            </el-tab-pane>
                            <el-tab-pane v-if="query?.parentOid" label="配置条件" name="conditionTab">
                                <ConditionTab
                                    v-if="tabShow.conditionTab"
                                    ref="ConditionTabRef"
                                    onlyRead
                                    :objectRow="query"
                                />
                            </el-tab-pane>
                            <el-tab-pane label="配置待选项" name="select">
                                <SelectTab v-if="tabShow.select" ref="SelectTabRef" :objectRow="query" onlyRead />
                            </el-tab-pane>
                        </template>
                        <!-- 物料为整机配置类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomCAR'">
                            <el-tab-pane label="PBOM裁剪" name="PBOM裁剪">
                                <PbomCropping />
                            </el-tab-pane>
                            <el-tab-pane label="实例化方案" name="实例化方案">
                                <InstancePlan />
                            </el-tab-pane>
                            <el-tab-pane label="版本历史" name="versionList">
                                <VersionHistory v-if="tabShow.versionList" :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <!-- <el-tab-pane label="附件" name="附件">
                                <Attachment />
                            </el-tab-pane> -->
                            <el-tab-pane label="配置特征" name="variable">
                                <VariableTab v-if="tabShow.variable" ref="VariableTabRef" :objectRow="query" onlyRead />
                            </el-tab-pane>
                            <el-tab-pane v-if="query?.parentOid" label="配置条件" name="conditionTab">
                                <ConditionTab
                                    v-if="tabShow.conditionTab"
                                    ref="ConditionTabRef"
                                    onlyRead
                                    :objectRow="query"
                                />
                            </el-tab-pane>
                        </template>
                        <!-- 物料为整机类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomCompleteMachine'">
                            <el-tab-pane label="版本历史" name="versionList">
                                <VersionHistory v-if="tabShow.versionList" :data="query" />
                            </el-tab-pane>
                            <!-- <el-tab-pane label="附件" name="附件">
                                <Attachment />
                            </el-tab-pane> -->
                            <el-tab-pane label="相关变更" name="相关变更">
                                <!-- <RelevanceChange /> -->
                            </el-tab-pane>
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="库存信息" name="stock">
                                <InventoryInfo v-if="tabShow.stock" :objectRow="query" />
                            </el-tab-pane>
                            <el-tab-pane label="上海整机PBOM" name="SHMachinePBom">
                                <CompleteMachinePBom v-if="tabShow.SHMachinePBom" :objectRow="query" />
                            </el-tab-pane>
                            <el-tab-pane label="上海整机MBOM" name="SHMachineMBOM">
                                <CompleteMachineMBom
                                    v-if="tabShow.SHMachineMBOM"
                                    :data="{ viewName: 'SH-M', PartOid: query.PartOid }"
                                />
                            </el-tab-pane>
                            <el-tab-pane label="江西整机MBOM" name="JXMachineMBOM">
                                <CompleteMachineMBom
                                    v-if="tabShow.JXMachineMBOM"
                                    :data="{ viewName: 'JX-M', PartOid: query.PartOid }"
                                />
                            </el-tab-pane>
                        </template>
                        <!-- 物料为标准件类型 -->
                        <template v-else-if="query.materialType === 'wt.part.WTPart|com.pdinfo.kbomStandardParts'">
                            <el-tab-pane label="版本历史" name="versionList">
                                <VersionHistory v-if="tabShow.versionList" :data="query" />
                            </el-tab-pane>
                            <!-- <el-tab-pane label="附件" name="附件">
                                <Attachment />
                            </el-tab-pane> -->
                            <el-tab-pane label="何处使用" name="何处使用">
                                <WhereUse :data="query" />
                            </el-tab-pane>
                            <el-tab-pane label="库存信息" name="stock">
                                <InventoryInfo v-if="tabShow.stock" :objectRow="query" />
                            </el-tab-pane>
                        </template>
                    </el-tabs>
                </div>
            </div>
        </div>

        <!-- 编辑文档弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.document" :footer="false" width="40%">
            <creatDocumentDialog
                v-if="dialogVisible.document"
                v-model:visible="dialogVisible.document"
                :currentRowData="currentRowData"
                :parentNodeData="parentRowData"
                :dialogType="dialogType"
                @confirm-success="handleWTDocumentConfirmSuccess"
            />
        </dialogFrame>

        <!-- 添加到文件夹弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.addToFolder" :footer="false" width="40%">
            <addToFolderDialog
                v-if="dialogVisible.addToFolder"
                v-model:visible="dialogVisible.addToFolder"
                :multipleTableSelection="multipleSelection"
                @confirm-success="handleConfirmSuccess_addToFolder"
            />
        </dialogFrame>

        <!-- 变更所属者 - 弹窗 -->
        <ChangeOwnerDialog
            v-if="changeOwnerDialog.visible"
            :dialog="changeOwnerDialog"
            @handleEditSuccess="handleEditSuccess_owner"
        />

        <!-- 跃迁生命周期状态弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.setState" :footer="false" width="40%">
            <lifeCycleSetStateDialog
                v-if="dialogVisible.setState"
                v-model:visible="dialogVisible.setState"
                :currentRowData="currentRowData"
                @confirm-success="handleConfirmSuccess_setState"
            />
        </dialogFrame>

        <!-- BOM比较设置 - 弹窗 -->
        <BomCompareSetDialog
            v-if="bomCompareSetDialog.visible"
            :dialog="bomCompareSetDialog"
            @handleEditSuccess="handleEditSuccess_compareSet"
        />

        <!-- 批量修改所属父件弹窗 -->
        <dialogFrame
            :title="dialogTitle"
            v-model:visible="dialogVisible.bomBatchEdit"
            :footer="false"
            width="40%"
            @close="handleConfirmSuccess_bomBatchEdit('bomBatchEdit')"
        >
            <bomBatchUpdateParentDialog
                v-if="dialogVisible.bomBatchEdit"
                v-model:visible="dialogVisible.bomBatchEdit"
                :currentRowData="currentRowData"
                :dialogType="dialogType"
                @confirm-success="handleConfirmSuccess_bomBatchEdit"
            />
        </dialogFrame>

        <!-- 导出U9弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.exportU9" :footer="false" width="40%">
            <ExportU9Dialog
                v-if="dialogVisible.exportU9"
                v-model:visible="dialogVisible.exportU9"
                :dialogType="dialogType"
                :topObject="detailAttrsCollectionForm"
                @confirm-success="handleConfirmSuccess_exportU9"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance, Directive } from "vue"
import type { TabsPaneContext } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import PtCollapse from "@/components/ptCollapse/index.vue"
import Detail from "./components/detail/index.vue"
import ObjectTab from "./components/object/index.vue"
import HistoryTab from "./components/history/index.vue"
import ActionTab from "./components/action/index.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import creatDocumentDialog from "../productLibrary/components/creatDocumentDialog.vue"
import addToFolderDialog from "@/views/productMange/materiel/components/addToFolderDialog.vue"
import lifeCycleSetStateDialog from "@/views/bomManage/bomDetail/components/lifeCycleSetStateDialog.vue"
import bomBatchUpdateParentDialog from "@/views/bomManage/bomDetail/components/bomBatchUpdateParentDialog.vue"
import ChangeOwnerDialog from "@/views/bomManage/components/changeOwnerDialog/index.vue"
import BomCompareSetDialog from "@/views/bomManage/bomCompare/components/bomCompareSetDialog.vue"
import ExportU9Dialog from "@/views/bomManage/bomDetail/components/exportU9Dialog.vue"

import PartIcon from "../productBom/components/partIcon.vue"
// 零部件模块组件
import CompleteMachinePBom from "./components/partsTabs/completeMachinePBom.vue"
import CompleteMachineMBom from "./components/partsTabs/completeMachineMBom.vue"
import RelevanceChange from "./components/partsTabs/relevanceChange.vue"
// 模块组件
import ConfigurePendingOption from "./components/moduleTabs/configurePendingOption.vue"
// 整机配置模块组件
import PbomCropping from "./components/overallConfigurationTabs/pbomCropping.vue"
import InstancePlan from "./components/overallConfigurationTabs/instancePlan.vue"
// 公共页签组件
import Attachment from "./components/commom/attachment.vue"
import VersionHistory from "./components/commom/versionHistory.vue"
import ReferenceVariable from "./components/commom/referenceVariable.vue"
import InventoryInfo from "./components/commom/inventoryInfo.vue"
import WhereUse from "./components/commom/whereUse.vue"
import ConditionTab from "@/views/configureManage/productConfigure/components/conditionTab.vue"
import VariableTab from "@/views/configureManage/productConfigure/components/variableTab.vue"
import SelectTab from "@/views/configureManage/productConfigure/components/selectTab.vue"

import emitter from "@/utils/mitt"
import { getNameById } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { checkOutObject, checkInObject, exportPZBom } from "@/api/bomManage/productBom/index"
import {
    materieCancelCheckout,
    materieReviseWTPart,
    materieCreateBaseline,
    materieOneClickPublishing,
    u9SyncBom
} from "@/api/productMange/materiel"
import { useI18n } from "vue-i18n"
import { formatDateTime } from "@/utils"
import { downloadFile } from "@/utils/exportTemplate"
import { getDocumentPartDetails } from "@/api/productDetail"

//#region 参数和方法
defineOptions({
    name: "productDetail"
})
const props = defineProps({
    type: {
        type: String,
        default: ""
    },
    query: {
        type: Object,
        default: () => ({
            oid: "",
            type: "",
            materialType: ""
        })
    },
    colSpan: {
        type: Number,
        default: 8
    },
    materielTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    documnetTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    typeList: {
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
    isActive: {
        type: Boolean,
        default: false
    },
    isCanEdit: {
        type: Boolean,
        default: false
    },
    dropWidthChangeHandler: {
        type: Function,
        default: () => {
            return Function
        }
    },
    // 最顶层row数据
    topObjectRow: {
        type: Object,
        default: () => {}
    },
    // bom树展示层级
    level: {
        type: String,
        default: ""
    },
    viewName: {
        type: String,
        default: ""
    }
})
const emits = defineEmits(["handleAfterCheck", "handleRefreshLeftTree", "handleEditStatusUpdate"])
const router = useRouter()
const route = useRoute()
const query = ref({
    oid: "",
    number: "",
    parentOid: "",
    materialType: "", // 物料类型
    type: "" // 页面类型（WTPart：部件；WTDocument：文档）
})
if (props.type === "bomDetail") {
    query.value = props.query as any
} else {
    query.value = route.query as any
}
console.log("路由/父级参数query：", query.value)
console.log("props.type：", props.type)

const { t } = useI18n()
const loading = ref(false)
// const userStore = useUserStore()
const instance: any = getCurrentInstance()
//#endregion

//#region 标题
// 标题内容
// const titleText = computed(
//     () =>
//         `${detailAttrsCollectionForm.value.code}, ${detailAttrsCollectionForm.value.name}, ${detailAttrsCollectionForm.value.version}`
// )
const typeName = computed(() => getNameById(props.materielTypeList, detailAttrsCollectionForm.value.materialType))

// 页面跳转
const goPage = (url: string, goType: string, PartOid: string, Number: string) => {
    router.push({
        path: `${url}/${PartOid}/${Number}`,
        query: {
            tagTitle: `${goType}(${Number})`
        }
    })
}
// 跳转 - BOM高级编辑
const goBomHighEdit = () => {
    router.push({
        path: `/bomManage/bomHighEdit/${detailAttrsCollectionForm.value.oid}`,
        query: {
            oid: detailAttrsCollectionForm.value.oid,
            number: detailAttrsCollectionForm.value.code,
            tagTitle: `BOM高级编辑(${detailAttrsCollectionForm.value.code})`
        }
    })
}
//#endregion

//#region 详情
const detailActive = ref(true)
const handleActiveChange_detail = (val: boolean) => {
    detailActive.value = val
}
const startLoading = () => (loading.value = true)
const endLoading = () => (loading.value = false)
// 编辑成功过后
const handleConfirmSuccess = (newOid: string) => {
    console.log("编辑成功后掉检入接口")
    Object.assign(checkData, { type: "in", newOid: newOid, oldOid: currentRowData.value.oid })
    emits("handleAfterCheck", checkData)
}
const handleEditStatusUpdate = (bool: boolean) => {
    emits("handleEditStatusUpdate", bool)
}

// 获取详情
const getData = () => {
    const params = {
        oid: query.value.oid,
        type: query.value.type
    }
    loading.value = true
    getDocumentPartDetails(params)
        .then(({ data }) => {
            instance.refs.DetailRef.getMultiLevelDictionaryTypeData(data)
            // 详情列自适应
            nextTick(() => {
                props.dropWidthChangeHandler()
            })
        })
        .finally(() => (loading.value = false))
}
getData()

//#region 标签页
const activeName = ref("")
const detailAttrsCollectionForm = ref<any>({})
// 标签对应组件显示隐藏
const tabShow = reactive({
    object: false, // 相关对象
    history: false, // 历史记录
    action: false, // CAD/动态文档
    conditionTab: false, // 配置条件
    variable: false, // 配置特征
    select: false, // 配置待选项
    SHMachinePBom: false, // 上海整机PBOM
    SHMachineMBOM: false, // 上海整机MBOM
    JXMachinePBOM: false, // 江西整机PBOM
    JXMachineMBOM: false, // 江西整机MBOM
    stock: false, // 库存信息
    versionList: false // 版本历史
})
const handleTabClick = (pane: TabsPaneContext) => {
    const name = pane.paneName
    if (!name) return
    ;(tabShow as any)[name] = true
}
// 初始化初始标签
const initCurrentTab = (partType: string) => {
    let paneName = ""
    switch (partType) {
        case "wt.part.WTPart": // 部件/物料
            paneName = "PBOM裁剪"
            break
        case "wt.part.WTPart|com.pdinfo.kbomMATERIAL": // 部件/物料
            paneName = "PBOM裁剪"
            break
        case "wt.part.WTPart|com.pdinfo.kbomPHANTOM": // 零部件
            paneName = "SHMachinePBom"
            break
        case "wt.part.WTPart|com.pdinfo.kbomRawMaterial": // 原材料
            paneName = "何处使用"
            break
        case "wt.part.WTPart|com.pdinfo.kbomSubsidiaryMaterial": // 辅料
            paneName = "SHMachinePBom"
            break
        case "wt.part.WTPart|com.pdinfo.kbomMODULE": // 模块
            paneName = "versionList"
            break
        case "wt.part.WTPart|com.pdinfo.kbomCAR": // 整机配置
            paneName = "PBOM裁剪"
            break
        case "wt.part.WTPart|com.pdinfo.kbomCompleteMachine": // 整机
            paneName = "versionList"
            break
        case "wt.part.WTPart|com.pdinfo.kbomStandardParts": // 标准件
            paneName = "versionList"
            break

        default:
            break
    }
    if (paneName) {
        nextTick(() => {
            ;(tabShow as any)[paneName] = true
            activeName.value = paneName
        })
    }
}
initCurrentTab(query.value.materialType)
//#endregion

//#region 编辑弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    part: false, // 编辑部件对话框
    document: false, // 编辑文档对话框
    addToFolder: false, // 添加到文件夹话框
    setState: false, // 跃迁生命周期状态话框
    bomBatchEdit: false, // BOM批量编辑状态话框
    exportU9: false // 导出U9对话框
})

const currentRowData = ref<any>({
    oid: query.value.oid,
    name: "",
    type: query.value.type
}) // 当前行数据

const parentRowData = ref<any>({
    oid: query.value?.parentOid,
    name: "",
    type: ""
}) // 父级节点表格行数据

//#region 处理物料取消检出按钮
const handleMaterieCancelCheckoutBtn = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string
        } = {
            partOid: detailAttrsCollectionForm.value.oid
        }
        const { data } = (await materieCancelCheckout(params)) as any
        ElMessage.success("取消检出成功！")
        emits("handleAfterCheck", {
            type: "cancel",
            newOid: data.objOid,
            oldOid: params.partOid
        })
        emits("handleEditStatusUpdate", false)
        loading.value = false
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 处理刷新按钮
const handleRefreshBtn = () => {
    getData()
    emits("handleRefreshLeftTree")
}
//#endregion

//#region 导出BOM到Excel
const elementLoadingText = ref<string>("")
const handleBomExportExcelBtn = () => {
    loading.value = true
    elementLoadingText.value = "正在导出BOM，请稍等..."
    const params = {
        topPartoid: props.topObjectRow.PartOid,
        topPartNumber: props.topObjectRow.Number,
        ProductName: "",
        viewName: props.viewName,
        level: props.level
    }
    exportPZBom(params)
        .then((data) => {
            const filename = `物料BOM-${formatDateTime(new Date(), "YYYY-MM-DD")}`
            downloadFile(data, filename)
        })
        .finally(() => {
            loading.value = false
            elementLoadingText.value = ""
        })
}
//#endregion

//#region 导出U9
const handleExportU9Btn = async () => {
    dialogTitle.value = "导出到ERP"
    const dialogType = "exportU9"
    dialogVisible[dialogType] = true
}
const handleConfirmSuccess_exportU9 = async (dataForm: any) => {
    console.log("dataForm: ", dataForm)
    dialogVisible.exportU9 = false
    try {
        // 组织编码
        const sendOrgs = dataForm.productOrgMultipleData.map((item: any) => item.code).join()
        // 物料oid: 当选择导出类型为同步BOM和物料（2）时，bom必须勾选一条数据，不管勾选哪条只传顶层物料partOid
        const partOids =
            dataForm.exportType === "2"
                ? dataForm.topPartOid
                : dataForm.bomTreeMultipleData.map((item: any) => item.PartOid).join()
        console.log("partOids: ", partOids)
        // 导出的类型
        const flag = +dataForm.exportType
        const params: {
            sendOrgs: string
            partOids: string
            flag: number
            viewName: string
        } = {
            sendOrgs,
            partOids,
            flag,
            viewName: dataForm.exportBomType
        }
        console.log("params: ", params)
        const { message } = (await u9SyncBom(params)) as any
        ElMessageBox.alert(message, "同步到U9结果", {
            confirmButtonText: "确认",
            type: "success",
            center: true
        })
    } catch (error) {
        console.log(error)
    }
}
//#endregion

//#region 处理添加到按钮
const multipleSelection = ref<any[]>([])
const handleAddToBtn = () => {
    multipleSelection.value = [detailAttrsCollectionForm.value].map((item) => {
        return {
            ...item,
            oid: item.oid,
            number: item.code,
            name: item.name
        }
    })
    dialogTitle.value = "添加到工作区"
    const dialogType = "addToFolder"
    dialogVisible[dialogType] = true
}

const handleConfirmSuccess_addToFolder = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // 刷新详情数据
    getData()
}
//#endregion

//#region 处理变更所属者按钮
//变更所属者 - 弹窗
const changeOwnerDialog = reactive<any>({
    visible: false,
    title: "",
    row: null
})
const handleChangeOwnerBtn = () => {
    const partList = [detailAttrsCollectionForm.value]
    Object.assign(changeOwnerDialog, {
        visible: true,
        title: "变更所属者",
        row: partList
    })
}

const handleEditSuccess_owner = () => {
    Object.assign(changeOwnerDialog, {
        visible: false,
        title: "",
        row: null
    })
    getData()
}
//#endregion

//#region 处理物料修订按钮
const handleMaterieReviseBtn = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string
        } = {
            partOid: detailAttrsCollectionForm.value.oid
        }
        const { message, data } = (await materieReviseWTPart(params)) as any
        emits("handleAfterCheck", {
            type: "cancel",
            newOid: data.oid,
            oldOid: detailAttrsCollectionForm.value.oid
        })
        ElMessage({
            type: "success",
            message,
            center: true
        })
        // 刷新详情数据
        getData()
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 处理物料跃迁按钮
const handleMaterieSetStateBtn = () => {
    currentRowData.value = detailAttrsCollectionForm.value
    dialogTitle.value = "设置跃迁的生命周期状态"
    const dialogType = "setState"
    dialogVisible[dialogType] = true
}

const handleConfirmSuccess_setState = (dialogType: string) => {
    dialogVisible[dialogType] = false
    // 刷新详情数据
    getData()
}
//#endregion

//#region 处理物料新建基线按钮
const handleMaterieCreateBaselineBtn = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string
        } = {
            partOid: detailAttrsCollectionForm.value.oid
        }
        const { message } = (await materieCreateBaseline(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        // 刷新详情数据
        getData()
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 处理物料一键发布按钮
const handleOneClickPublishingBtn = async () => {
    try {
        loading.value = true
        const params: {
            partOid: string
        } = {
            partOid: detailAttrsCollectionForm.value.oid
        }
        const { message } = (await materieOneClickPublishing(params)) as any
        ElMessage({
            type: "success",
            message,
            center: true
        })
        // 刷新详情数据
        getData()
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 处理BOM批量编辑/BOM不升版批量编辑按钮
const handleBomBatchEditBtn = (type: string) => {
    currentRowData.value = detailAttrsCollectionForm.value
    dialogTitle.value = type === "升版" ? "升版：批量修改所属父件" : "不升版：批量修改所属父件"
    dialogType.value = type
    dialogVisible.bomBatchEdit = true
}
const handleConfirmSuccess_bomBatchEdit = (dialogType: string) => {
    console.log("dialogType: ", dialogType)
    dialogVisible[dialogType] = false
    emits("handleRefreshLeftTree")
}
//#endregion

const handleWTPartConfirmSuccess = (data: any) => {
    const newOid = data.oid
    const oldOid = query.value.oid
    console.log("handleWTPartConfirmSuccess", data, newOid, oldOid)
    let type = ""
    if (newOid === oldOid) {
        // oid不变
        // 刷新详情数据
        getData()
        type = "save"
    } else {
        // oid改变
        type = "in"
    }
    afterCheck(
        {
            data: {
                objOid: newOid
            }
        },
        type,
        { ObjectOid: oldOid }
    )
    dialogVisible.part = false
}

const handleWTDocumentConfirmSuccess = () => {
    dialogVisible.document = false
    // 刷新详情数据
    getData()
}
//#endregion

//#region 数据检入/检出
// 检入/检出
const checkData = {
    type: "",
    newOid: "",
    oldOid: ""
}
const check = (type: string, isEdit?: boolean) => {
    const params = {
        ObjectOid: currentRowData.value.oid,
        ObjectType: query.value.type === "WTPart" ? "part" : "document"
    }
    console.log("params: ", params)
    if (type === "in") {
        // 检入
        loading.value = true
        checkInObject(params)
            .then((data) => {
                // console.log(data)
                afterCheck(data, type, params)
            })
            .finally(() => (loading.value = false))
    } else if (type === "out") {
        // 检出
        loading.value = true
        checkOutObject(params)
            .then((data) => {
                // console.log(data)
                afterCheck(data, type, params, isEdit)
            })
            .finally(() => (loading.value = false))
    }
}
// 检入/检出后执行
const afterCheck = (data: any, type: string, params: { ObjectOid: string; ObjectType?: string }, isEdit?: boolean) => {
    Object.assign(checkData, { type, newOid: data.data.objOid, oldOid: params.ObjectOid })
    Object.assign(currentRowData.value, { oid: checkData.newOid })
    console.log("afterCheck", checkData, isEdit, params, currentRowData)
    emits("handleAfterCheck", checkData)
}
//#endregion

//#region BOM比较设置 - 弹窗
const bomCompareSetDialog = reactive<any>({
    visible: false,
    title: "BOM比较设置",
    material1: null,
    material2: null
})
// 格式化物料
const formatData_material = (material: any) => {
    const versionArr = material.version?.split(".")
    return {
        oid: material.oid,
        number: material.code,
        name: material.name,
        typeName: material.typeName,
        version: versionArr[0] || "",
        iteration: versionArr[1] || ""
    }
}
// BOM比较
const goBOMCompare = () => {
    const material = formatData_material(detailAttrsCollectionForm.value)
    Object.assign(bomCompareSetDialog, {
        visible: true,
        material1: { ...material },
        material2: { ...material }
    })
}
// BOM比较设置回调
const handleEditSuccess_compareSet = () => {
    console.log("handleEditSuccess_compareSet")
    Object.assign(bomCompareSetDialog, {
        visible: false,
        material1: null,
        material2: null
    })
}
//#endregion

//#region 处理保存按钮
const handleEditConfirm = () => {
    instance.refs.DetailRef.handleEditConfirm()
}
//#endregion

//#region 高度拖拽
const defaultContentHeight = ref("20vh")
const vDrag: Directive = {
    mounted(el) {
        console.log("v-drag", el)
        let starY: number, startHeight: number
        const preDom = el.previousElementSibling as HTMLElement // 前一个兄弟元素
        const nextDom = el.nextElementSibling as HTMLElement // 后一个兄弟元素
        el.onmousedown = (e: any) => {
            starY = e.clientY
            startHeight = preDom.clientHeight
            e.preventDefault()
            document.onmousemove = (e: any) => {
                // nextDom.clientHeight <= 40 ? (nextDom.style.display = "none") : (nextDom.style.display = "block")
                const preHeight = startHeight + e.clientY - starY
                console.dir(nextDom)
                if (preHeight > 0) {
                    defaultContentHeight.value = startHeight + e.clientY - starY + "px"
                }
            }
            document.onmouseup = () => {
                document.onmousemove = null
                document.onmouseup = null
            }
        }
    }
}

//#endregion

onMounted(() => {
    emitter.on("detailAttrsCollectionForm", (data: any) => {
        // console.log("detailAttrsCollectionForm: ", data)
        if (!data) return
        detailAttrsCollectionForm.value = data
        // 格式化类型名称
        if (query.value.type === "WTPart") {
            detailAttrsCollectionForm.value.typeName = typeName
        } else if (query.value.type === "WTDocument") {
            detailAttrsCollectionForm.value.typeName = getNameById(
                props.documnetTypeList,
                detailAttrsCollectionForm.value.partType
            )
        }
    })
})

// 页面关闭卸载掉emitter订阅
onBeforeUnmount(() => {
    emitter.off("detailAttrsCollectionForm")
})

defineExpose({
    check,
    handleMaterieCancelCheckoutBtn,
    goPage,
    handleRefreshBtn,
    handleAddToBtn,
    handleChangeOwnerBtn,
    goBomHighEdit,
    handleBomBatchEditBtn,
    handleMaterieReviseBtn,
    handleMaterieSetStateBtn,
    handleMaterieCreateBaselineBtn,
    handleOneClickPublishingBtn,
    goBOMCompare,
    handleBomExportExcelBtn,
    handleExportU9Btn,
    handleEditConfirm
})
</script>

<style lang="scss" scoped>
.detailWrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    .dragLine {
        width: 100%;
        height: 4px;
        margin: 0 1px;
        background-color: #ddd;
        cursor: row-resize;
        z-index: 99;
        &:hover {
            box-shadow: 0 0 0 1px #03328d;
            background-color: #03328d;
            z-index: 99;
        }
    }
    .tabsWrapper {
        width: 100%;
        flex: 1;
        height: 0;
        .tabs {
            border-right: 1px solid #e4e7ed;
            height: 100%;
            :deep(.el-tabs__header) {
                height: 30px;
                .el-tabs__nav-wrap.is-top,
                .el-tabs__nav-scroll,
                .el-tabs__nav.is-top,
                .el-tabs__item.is-top {
                    height: 100%;
                }
            }
            :deep(.el-tabs__content) {
                flex: 1;
                padding: 5px 0;
                .el-tab-pane {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    .productList {
                        flex: 1;
                        height: 0;
                    }
                }
            }
        }
    }
}
</style>
