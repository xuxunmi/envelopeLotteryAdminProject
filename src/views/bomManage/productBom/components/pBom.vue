<template>
    <div class="pBom" style="height: 100%" v-loading="loading" :element-loading-text="elementLoadingText">
        <pt-table
            :key="onlyKey"
            ref="PtTableRef"
            row-key="frontEndID"
            :locale="locale"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :expand-row-keys="expandRowKeys"
            :tree-props="{ children: 'children', hasChildren: 'leaf' }"
            :load="load"
            :cellDisabledEdit="cellDisabledEdit"
            :row-class-name="tableRowClassName"
            lazy
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
            @expand-change="handleExpandChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit flex-col">
                    <div>
                        <el-form size="small" :inline="true" @submit.prevent>
                            <el-form-item label="展示层级">
                                <el-select
                                    style="width: 90px"
                                    v-model="formData.level"
                                    clearable
                                    :disabled="!props.topObject?.PartOid"
                                    @change="handleSelectChange_level"
                                >
                                    <el-option
                                        v-for="item in options_level"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <!-- <el-button class="-ml-3 mr-4" type="primary" @click="handleShowLevelSeekBtn"
                                    >查找</el-button
                                > -->
                                <el-button
                                    class="mr-4"
                                    type="primary"
                                    :disabled="!props.topObject?.PartOid"
                                    @click="handleShowRuleBtn"
                                    >显示规则</el-button
                                >
                                <div v-if="showRuleForm.typeName && showRuleForm.versionRule">
                                    {{ showRuleContentFormat }}
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div class="flex gap-4" v-if="props.from !== 'bomDetail'" style="margin-top: -12px">
                        <el-button
                            v-if="from !== 'bomHighEdit_left'"
                            type="primary"
                            size="small"
                            :disabled="!props.topObject?.PartOid"
                            @click="goRefresh"
                            >{{ t("dashboardPage.refresh") }}</el-button
                        >
                        <template v-if="!onlyRead">
                            <template v-if="from === 'bomHighEdit_left'">
                                <div class="edit-btn-icon">
                                    <img-button
                                        :disabled="
                                            !(
                                                chooseRow &&
                                                chooseRow.highEditProps?.type !== 'del' &&
                                                chooseRow.materialType !== 'wt.part.WTPart|com.pdinfo.kbomMODULE'
                                            )
                                        "
                                    >
                                        <div @click="goAdd_new(chooseRow)" class="icon-li" title="新建">
                                            <img src="@/assets/images/bomHighEdit/pseCreateAdd.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!(chooseRow || chooseRowsList.length)">
                                        <div @click="goCopy(chooseRow)" class="icon-li" title="复制">
                                            <img src="@/assets/images/bomHighEdit/pseCopy.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!(chooseRow || chooseRowsList.length)">
                                        <div @click="goCut(chooseRow)" class="icon-li" title="剪切">
                                            <img src="@/assets/images/bomHighEdit/pseCut.png" />
                                        </div>
                                    </img-button>
                                    <img-button
                                        :disabled="
                                            !(
                                                chooseRow &&
                                                chooseRow.highEditProps?.type !== 'del' &&
                                                chooseRow.materialType !== 'wt.part.WTPart|com.pdinfo.kbomMODULE'
                                            )
                                        "
                                    >
                                        <div @click="goPaste(chooseRow)" class="icon-li" title="粘贴">
                                            <img src="@/assets/images/bomHighEdit/psePaste.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!(chooseRow || chooseRowsList.length)">
                                        <div @click="goDelPart(chooseRow)" class="icon-li" title="移除">
                                            <img src="@/assets/images/bomHighEdit/pseDel.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!(chooseRow || chooseRowsList.length)">
                                        <div @click="goRevokePart(chooseRow)" class="icon-li" title="撤销">
                                            <img src="@/assets/images/bomHighEdit/pseCancelDel.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!(chooseRow || chooseRowsList.length)">
                                        <div @click="goBatchAttributeSettings" class="icon-li" title="属性批量设置">
                                            <img src="@/assets/images/bomHighEdit/pseLinkBatchEdit.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!topObject.PartOid">
                                        <div @click="goExport" class="icon-li" title="导出">
                                            <img src="@/assets/images/bomHighEdit/pseXls.png" />
                                        </div>
                                    </img-button>
                                    <img-button :disabled="!props.topObject?.PartOid">
                                        <div @click="goRefresh" class="icon-li" title="刷新">
                                            <img src="@/assets/images/bomHighEdit/plmRefresh_E.png" />
                                        </div>
                                    </img-button>
                                    <img-button
                                        :disabled="
                                            !(chooseRow && !chooseRow.isTop && chooseRow.highEditProps?.type !== 'del')
                                        "
                                    >
                                        <div @click="goReplace(chooseRow)" class="icon-li" title="替换">
                                            <img src="@/assets/images/bomHighEdit/pseReplace.png" />
                                        </div>
                                    </img-button>
                                    <img-button>
                                        <div @click="changeCanDrag" class="icon-li" title="拖拽设置">
                                            <img v-if="canDrag" src="@/assets/images/bomHighEdit/suspend.jpg" />
                                            <img v-else src="@/assets/images/bomHighEdit/play.png" />
                                        </div>
                                    </img-button>
                                </div>
                                <template v-if="false">
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="
                                            !(
                                                chooseRow &&
                                                chooseRow.highEditProps?.type !== 'del' &&
                                                chooseRow.materialType !== 'wt.part.WTPart|com.pdinfo.kbomMODULE'
                                            )
                                        "
                                        @click="goAdd_new(chooseRow)"
                                        >新增子件</el-button
                                    >
                                    <!-- <el-button
                                      type="primary"
                                      size="small"
                                      :disabled="!(chooseRow&&chooseRow.highEditProps?.type!=='del')"
                                      @click="goAdd_exist(chooseRow)"
                                      >{{ t("productBomPage.exist") }}</el-button
                                  > -->
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!(chooseRow || chooseRowsList.length)"
                                        @click="goCopy(chooseRow)"
                                        >复制</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!(chooseRow || chooseRowsList.length)"
                                        @click="goCut(chooseRow)"
                                        >剪切</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="
                                            !(
                                                chooseRow &&
                                                chooseRow.highEditProps?.type !== 'del' &&
                                                chooseRow.materialType !== 'wt.part.WTPart|com.pdinfo.kbomMODULE'
                                            )
                                        "
                                        @click="goPaste(chooseRow)"
                                        >粘贴</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!(chooseRow || chooseRowsList.length)"
                                        @click="goDelPart(chooseRow)"
                                        >移除</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!(chooseRow || chooseRowsList.length)"
                                        @click="goRevokePart(chooseRow)"
                                        >撤销</el-button
                                    >
                                    <!-- <el-button
                                      type="primary"
                                      size="small"
                                      :disabled="!chooseRow"
                                      @click="goDetail(chooseRow)"
                                      >浏览</el-button
                                  > -->
                                    <el-button type="primary" size="small" @click="goBatchAttributeSettings"
                                        >属性批量编辑</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!topObject.PartOid"
                                        @click="goExport"
                                        >导出</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="!props.topObject?.PartOid"
                                        @click="goRefresh"
                                        >{{ t("dashboardPage.refresh") }}</el-button
                                    >
                                    <el-button
                                        type="primary"
                                        size="small"
                                        :disabled="
                                            !(chooseRow && !chooseRow.isTop && chooseRow.highEditProps?.type !== 'del')
                                        "
                                        @click="goReplace(chooseRow)"
                                        >替换</el-button
                                    >
                                    <el-button type="primary" size="small" @click="changeCanDrag">
                                        拖拽设置
                                        <span v-if="canDrag">关</span>
                                        <span v-else>开</span>
                                    </el-button>
                                </template>
                            </template>
                            <template v-else-if="from === 'bomHighEdit_right'">
                                <el-button type="primary" size="small" @click="goChoose">选择</el-button>
                                <el-button
                                    type="primary"
                                    size="small"
                                    :disabled="!(chooseRow || chooseRowsList.length)"
                                    @click="goCopy(chooseRow)"
                                    >复制</el-button
                                >
                                <el-button
                                    type="primary"
                                    size="small"
                                    :disabled="!chooseRowsList[chooseRowsList.length - 1]"
                                    @click="goSelectAll(chooseRowsList[chooseRowsList.length - 1])"
                                    >全选</el-button
                                >
                                <el-button
                                    type="primary"
                                    size="small"
                                    :disabled="!chooseRowsList[chooseRowsList.length - 1]"
                                    @click="goSelectReverse(chooseRowsList[chooseRowsList.length - 1])"
                                    >反选</el-button
                                >
                                <el-button type="primary" size="small" @click="goCancelSelect">取消选择</el-button>
                            </template>
                            <template v-else>
                                <el-button
                                    type="primary"
                                    size="small"
                                    :disabled="!topObject.PartOid"
                                    @click="goVersionCompare"
                                    >版本比较</el-button
                                >
                                <!-- <el-button
                                    type="primary"
                                    size="small"
                                    :disabled="!chooseRow || chooseRow.isCheckOut"
                                    @click="check('out', chooseRow.PartOid, 'part')"
                                    >{{ t("dashboardPage.checkOut") }}</el-button
                                >
                                <el-button
                                    type="primary"
                                    size="small"
                                    :disabled="!chooseRow || !(chooseRow.isCheckOut && chooseRow.isCheckUser)"
                                    @click="check('in', chooseRow.PartOid, 'part')"
                                    >{{ t("dashboardPage.checkIn") }}</el-button
                                > -->
                            </template>
                        </template>
                        <!-- <el-button type="primary" size="small">显示视图</el-button> -->
                        <!-- <el-button
                      type="primary"
                      size="small"
                      @click="goBaselineManage"
                      :disabled="!chooseRow"
                    >{{ t('productBomPage.baselineManage') }}</el-button> -->
                    </div>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #head-icon="{ column }">
                <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
            </template>
            <template #head-selection="{ column }">
                <span>选择</span>
            </template>
            <template #col-selection="{ row }">
                <el-checkbox
                    v-model="row.frontChecked"
                    size="small"
                    :disabled="row.isTop && from === 'bomHighEdit_left'"
                    @change="(val: any) => handleCheckboxChange_choose(val, row)"
                    @click.stop
                />
            </template>
            <template #col-icon="{ row }">
                <span class="textHidden">
                    <bomPartcon
                        :type="row.materialType"
                        :isCheckOut="row.isCheckOut"
                        :isCheckUser="row.isCheckUser"
                        :CheckOutUser="row.CheckOutUser"
                        :showRuleForm="showRuleForm"
                    />
                    <span v-if="row.Number && row.Name && row.Version">
                        {{ row.icon }}
                    </span>
                </span>
            </template>
            <template #col-cropping="{ row, index }">
                <el-checkbox
                    v-if="index"
                    v-model="row.isCropping"
                    label=""
                    true-value="是"
                    false-value="否"
                    size="small"
                    :disabled="!row.isCroppingCanEdit || row.highEditProps?.type === 'del'"
                    @change="(val: any) => handleCheckboxChange(val, row)"
                    @click.stop
                />
            </template>
            <template #col-drag="{ row }">
                <el-button class="dragPullBtn" type="primary" icon="Rank" link @mousedown="dragPull" />
            </template>
            <template #col-Number="{ row }">
                <span
                    class="dataDom"
                    :data-oid="row.PartOid"
                    :data-number="row.Number"
                    :data-id="row.frontEndID"
                    :data-findnumber="row.findNumber"
                    :data-highedittype="row.highEditProps?.type"
                    :data-type="row.materialType"
                >
                    <bomPartcon
                        :type="row.materialType"
                        :isCheckOut="row.isCheckOut"
                        :isCheckUser="row.isCheckUser"
                        :CheckOutUser="row.CheckOutUser"
                        :showRuleForm="showRuleForm"
                    />
                    <img
                        v-if="showFrontCheckOut(row)"
                        class="userIcon"
                        width="10"
                        src="@/assets/images/checkout.jpg"
                        style="position: relative; top: 1px; margin-right: 4px"
                    />
                    <span>{{ row.Number }}</span>
                </span>
            </template>
            <template #col-hasCondition="{ row }">
                <span v-if="row.hasCondition === '是'">是</span>
            </template>
            <!-- 右键菜单 -->
            <template #slot-menu="{ row }">
                <template v-if="!onlyRead">
                    <template v-if="from !== 'bomDetail'">
                        <template v-if="from === 'bomHighEdit_left'">
                            <template v-if="row.highEditProps?.type === 'del'">
                                <li v-if="!row.isTop" @click="goCopy(row)">复制</li>
                            </template>
                            <template v-else>
                                <!-- <li @click="goAdd_exist(row)">{{ t("productBomPage.exist") }}</li> -->
                                <li
                                    v-if="row.materialType !== 'wt.part.WTPart|com.pdinfo.kbomMODULE'"
                                    @click="goAdd_new(row)"
                                >
                                    新增子件
                                </li>
                                <li v-if="!row.isTop" @click="goReplace(row)">替换</li>
                                <li v-if="!row.isTop" @click="goCut(row)">剪切</li>
                                <li v-if="!row.isTop" @click="goCopy(row)">复制</li>
                                <li
                                    v-if="row.materialType !== 'wt.part.WTPart|com.pdinfo.kbomMODULE'"
                                    @click="goPaste(row)"
                                >
                                    粘贴
                                </li>
                                <!-- <li v-if="!row.isTop" @click="goDel(row)">移除</li> -->
                                <li v-if="!row.isTop" @click="goDelPart(row)">移除</li>
                                <li @click="goBOMCompare(row)">比较</li>
                                <li @click="goDetail(row)">浏览</li>
                            </template>
                            <li v-if="row.highEditProps?.type" @click="goRevokePart(row)">撤销</li>
                        </template>
                        <template v-else-if="from === 'bomHighEdit_right'">
                            <li v-if="row.highEditProps?.type === 'del'" @click="goCopy(row)">复制</li>
                        </template>
                        <template v-else>
                            <pt-menu-li :disabled="!(row.isCheckOut && row.isCheckUser)">
                                <span @click="goAdd_exist(row)">{{ t("productBomPage.exist") }}</span>
                            </pt-menu-li>
                            <pt-menu-li :disabled="!(row.isCheckOut && row.isCheckUser)">
                                <span @click="goAdd_new(row)">新增子件</span>
                            </pt-menu-li>
                            <li @click="goDetail(row)">{{ t("dashboardPage.details") }}</li>
                        </template>
                    </template>
                </template>
            </template>
        </pt-table>

        <!-- 插入新的 - 弹窗 -->
        <dialogFrame
            :title="addPartNewDialog.title"
            v-model:visible="addPartNewDialog.part"
            :footer="false"
            width="90%"
        >
            <CreatePartDialog
                v-if="addPartNewDialog.part"
                v-model:visible="addPartNewDialog.part"
                :currentRowData="addPartNewDialog.row"
                :parentNodeData="addPartNewDialog.parentRow"
                :grandparentProductOid="addPartNewDialog.productOid"
                :currentTreeNodeData="addPartNewDialog.nodeData"
                :dialogType="addPartNewDialog.type"
                @confirm-success="handleWTPartConfirmSuccess"
            />
        </dialogFrame>
        <!-- 基线管理 - 弹窗 -->
        <BaselineManageDialog
            v-if="baselineManageDialog.visible"
            :dialog="baselineManageDialog"
            @handleEditSuccess="handleEditSuccess_baseline"
        />
        <!-- 历史版本 - 弹窗 -->
        <HistoryListDialog v-if="historyListDialog.visible" :dialog="historyListDialog" @goChoose="goChooseHistory" />
        <!-- 添加物料弹窗 -->
        <dialogFrame :title="materialDialog.title" v-model:visible="materialDialog.visible" :footer="false" width="94%">
            <MaterialDialog
                v-if="materialDialog.visible"
                v-model:visible="materialDialog.visible"
                type="choose"
                @confirm-success="handleConfirmSuccess_material"
            />
        </dialogFrame>
        <!-- 显示规则弹窗 -->
        <ShowBomRuleDialog
            v-if="showRuleDialog.visible"
            :dialog="showRuleDialog"
            :from="from"
            :optionVersionRuleList="optionVersionRuleList"
            :topObjectShowRule="topObjectShowRule"
            @confirmSuceess="handleConfirmSuceess"
        />
        <!-- BOM比较设置 - 弹窗 -->
        <BomCompareSetDialog
            v-if="bomCompareSetDialog.visible"
            :dialog="bomCompareSetDialog"
            @handleEditSuccess="handleEditSuccess_compareSet"
        />
        <!-- 属性批量编辑 - 弹窗 -->
        <BatchAttributeSettingsDialog
            v-if="batchAttributeSettingsDialog.visible"
            :dialog="batchAttributeSettingsDialog"
            :optionLocation="option_location"
            @handleEditSuccess="handleEditSuccess_attribute"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import BaselineManageDialog from "./baselineManageDialog.vue"
import HistoryListDialog from "@/views/bomList/components/historyListDialog.vue"
import bomPartcon from "./bomPartcon.vue"
import ImgButton from "./imgButton.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import CreatePartDialog from "@/views/bomManage/components/creatPartDialog/index.vue"
import MaterialDialog from "@/views/productMange/materiel/components/materialDialog.vue"
import ShowBomRuleDialog from "./showBomRuleDialog.vue"
import BomCompareSetDialog from "@/views/bomManage/bomCompare/components/bomCompareSetDialog.vue"
import BatchAttributeSettingsDialog from "./batchAttributeSettingsDialog.vue"
import { MaterialInterface } from "@/interface/materiel"
import {
    getProductPZBom,
    checkOutObject,
    checkInObject,
    delBomItem,
    setIsCropping,
    getIsCropping,
    exportPZBom,
    setAmount,
    bomInsertPart,
    showRuleDetail
} from "@/api/bomManage/productBom/index"
import { materieReplaceParentPart } from "@/api/productMange/materiel"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { filterArray, recursionArray, windowOpenTab, findDomByClass, formatDateTime } from "@/utils"
import { useTagsViewStore } from "@/store/modules/tags-view"
import { downloadFile } from "@/utils/exportTemplate"
import { useI18n } from "vue-i18n"
// import Sortable from "sortablejs"
import { SelectInterface } from "@/interface/common"
import { getNameById, optionVersionRuleList } from "@/assets/common/select-list"
import emitter from "@/utils/mitt"
import { get as getStorage } from "@/utils/storage"
//#region 参数和方法
const props = defineProps({
    /**
     * 顶层系列
     */
    topObject: {
        type: Object,
        default: () => ({
            PartOid: "",
            Number: ""
        })
    },
    /**
     * 引用页面
     * bomDetail：BOM详情；
     * productConfigure：维护配置；
     * bomHighEdit_left：BOM高级编辑左侧列表；
     * bomHighEdit_right：BOM高级编辑右侧列表；
     * productListConfigure：查看配置；
     */
    from: {
        type: String,
        default: ""
    },
    /**
     * 是否只读
     */
    onlyRead: {
        type: Boolean,
        default: false
    }
})
console.log("from来自哪里： ", props.from)
const route = useRoute()
const router = useRouter()
const emits = defineEmits([
    "handleRowClick",
    "afterRefresh",
    "handleCheckPart",
    // BOM高级编辑
    "goPaste",
    "goCopy",
    "goCut",
    "chooseObj",
    "clearHighEditData",
    "goHighEdit_add",
    "goHighEdit_del",
    "goHighEdit_prop",
    "changeCanDrag",
    "cancelEdit",
    "changeLevelCallback"
])
const tagsViewStore = useTagsViewStore()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region 字典数据
const loading_select = ref(false)
const option_location = ref<any[]>([]) // 工位
const option_typeName = ref<any[]>([]) // 类型名称
loading_select.value = true
getDictionarySelect({ codes: "WORKSTATION,RELATION_IMPORT" })
    .then((data) => {
        option_location.value = (data.data.WORKSTATION || []).map((item: any) => {
            return {
                value: item.codeListNameC,
                label: item.codeListNameC
            }
        })
        option_typeName.value = data.data.RELATION_IMPORT.map((item: any) => {
            return { id: item.code, name: item.codeListNameC }
        })
    })
    .finally(() => (loading_select.value = false))
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const chooseRow = ref()
let frontEndID = 1 // 唯一id
const expandRowKeys = ref<any>([])
const topPart = reactive({
    PartOid: "",
    Name: "",
    Number: ""
})
const sortParams = reactive({
    sortBy: "",
    sorted: ""
})
// 顶层物料显示规则组织
const topObjectShowRule = ref()

//#region 增、删、改、查
// 获取列表
const getList = (defaultChooseRowOid?: string) => {
    console.log("getList123456789", defaultChooseRowOid, showRuleForm)
    loading.value = true
    tableData.value = []
    expandRowKeys.value = []
    multipleSelection.value = []
    chooseRowsList.value = []
    chooseRow.value = null
    emits("clearHighEditData")
    frontEndID = 1
    const params = {
        topPartoid: props.topObject.PartOid,
        topPartNumber: props.topObject.Number,
        ProductName: "",
        trimMethod: "",
        hierarchy: formData.level,
        version: showRuleForm.versionRule,
        viewName: showRuleForm.typeName,
        ...sortParams
    }
    getProductPZBom(params)
        .then((data) => {
            console.log("pBom懒加载data: ", data)
            Object.assign(topPart, {
                PartOid: data.data[0].children[0].PartOid,
                Name: data.data[0].children[0].Name,
                Number: data.data[0].children[0].Number
            })

            const list = formatData(data.data[0].children)
            if (list[0].viewName && list[0].viewOption) {
                topObjectShowRule.value = {
                    viewName: list[0].viewName,
                    viewOption: list[0].viewOption
                }
                Object.assign(showRuleForm, {
                    ...showRuleForm,
                    typeName: list[0].viewName
                })
            }

            // 判断物料详情url的物料oid与列表返回的顶层oid是否一致，不一致则设置物料详情url的物料oid为最新oid
            if (list[0].PartOid !== props.topObject.PartOid) {
                checkTopObject({
                    newOid: list[0].PartOid,
                    oldOid: props.topObject.PartOid
                })
            }
            list[0].isTop = true // 顶层系列添加字段
            list[0].children?.forEach((ele: any) => ele.isSecond = true) // 第二层物料添加字段
            sourceData.value = list
            refresh()

            setTimeout(() => {
                let row = tableData.value[0]
                if (defaultChooseRowOid) {
                    recursionArray(tableData.value, (item: any) => {
                        console.log(item.PartOid, defaultChooseRowOid, item.PartOid === defaultChooseRowOid)
                        if (item.PartOid === defaultChooseRowOid) {
                            row = item
                        }
                    })
                }
                console.log("defaultChooseRowOid", defaultChooseRowOid, row)
                handleRowClick(row)
                // // 重新初始化获取拖拽ref
                // initCustomSortable()
            }, 1)
        })
        .catch((err) => {
            console.log("err", err)
            sourceData.value = []
        })
        .finally(() => (loading.value = false))
}
// 懒加载物料列表
const load = (tree: any, treeNode?: unknown, resolve?: (date: any) => void, objs?: any[]) => {
    console.log("load", tree, treeNode)
    loading.value = true
    const params = {
        topPartoid: props.topObject.PartOid,
        Name: props.topObject.Name,
        Number: props.topObject.Number,
        PartOid: tree?.PartOid,
        trimMethod: tree?.trimMethod,
        viewName: showRuleForm.typeName,
        ...sortParams
    }
    getProductPZBom(params)
        .then((data: any) => {
            let list = formatData(data.data[0].children, {
                parentOid: tree.PartOid,
                parentFrontEndID: tree.frontEndID
            })
            if (!list.length) list = []
            if (objs?.length) {
                let add = false
                objs.forEach((obj) => {
                    const flag = checkAdd(obj, list)
                    if (flag) {
                        add = true
                        list.push(obj)
                        emits("goHighEdit_add", obj)
                    }
                })
                if (list.length) expandRowKeys.value.push(tree.frontEndID)
            }
            insertAllTableData(tree.frontEndID, list)
            if (resolve) resolve([])
            search()
            // setTimeout(() => resetCurrent(tree.frontEndID), 1)
        })
        .catch((err: any) => {
            console.log("err", err)
            insertAllTableData(tree.frontEndID, [])
            if (resolve) resolve([])
        })
        .finally(() => (loading.value = false))
}
// 插入最新物料展开数据
const insertAllTableData = (id: any, arr: any) => {
    recursionArray(sourceData.value, (item: any) => {
        if (item.frontEndID === id) {
            item.children = JSON.parse(JSON.stringify(arr))
            item.leaf = false
        }
    })
}
// 局部刷新
const partRefresh = (row?: any, defaultChooseRowOid?: string) => {
    // 刷新bom
    const refreshRow = row || chooseRow.value
    console.log("局部刷新props.topObject", props.topObject)
    console.log("局部刷新refreshRow", refreshRow)
    if (!refreshRow?.leaf) {
        if (refreshRow?.PartOid === props.topObject.PartOid) {
            // 第一层
            getList(defaultChooseRowOid)
        } else {
            // 非第一层
            load(refreshRow)
            // 刷新list
            handleRowClick(refreshRow)
        }
    }
}
// 格式化返回数据
const formatData = (
    list: any[],
    options?: {
        parentOid: string
        parentFrontEndID: string
    }
) => {
    const arr: any[] = JSON.parse(JSON.stringify(list || []))
    recursionArray(arr, (item: any, i: any, parent) => {
        item.frontEndID = "" + frontEndID++ // 生成唯一id
        item.frontChecked = false
        // 默认展开行
        if (item.expanded) expandRowKeys.value.push(item.frontEndID)
        // 添加父级oid
        if (options?.parentOid) {
            // 懒加载
            item.parentOid = options?.parentOid
            item.parentFrontEndID = options?.parentFrontEndID
        } else {
            // 首次获取数据
            if (parent) {
                item.parentOid = parent.PartOid
                item.parentFrontEndID = parent.frontEndID
            }
        }
        item.topObjectOid = topPart.PartOid // 添加顶层oid
        item.topObjectNumber = topPart.Number // 添加顶层oid
        item.topObjectName = topPart.Name // 添加顶层name
        item.oldData = {
            // 缓存数据
            isCropping: item.isCropping,
            Amount: item.Amount,
            remark: item.remark,
            location: item.location
        }
        if (props.from !== "bomHighEdit_left" && props.from !== "bomHighEdit_right") {
            // 格式化icon
            item.icon = getContentFormat(showRuleForm, item)
        }
    })
    return arr
}
// 重置当前行
const resetCurrent = (frontEndID: string) => {
    console.log("resetCurrent", frontEndID)
    if (!frontEndID) return false
    let find = null
    recursionArray(tableData.value, (item: any) => {
        if (item.frontEndID === frontEndID) {
            find = item
            return "return"
        }
    })
    setCurrent(find)
}
// 是否裁剪回调
const handleCheckboxChange = (val: boolean, row: any) => {
    console.log("handleCheckboxChange", val, row)
    recursionArray(sourceData.value, (item) => {
        if (row.frontEndID === item.frontEndID) {
            if (!item.highEditProps?.type) {
                const obj = {
                    isCropping: val,
                    highEditProps: {
                        type: "prop",
                        oid: row.PartOid,
                        parentOid: row.parentOid,
                        parentFrontEndID: row.parentFrontEndID,
                        params: {
                            ParentPartOid: row.parentOid,
                            PartOid: row.PartOid,
                            findNumber: "",
                            isCropping: val
                        }
                    }
                }
                Object.assign(item, JSON.parse(JSON.stringify(obj)))
                Object.assign(row, JSON.parse(JSON.stringify(obj)))
            }
            return "return"
        }
    })
    emits("goHighEdit_prop", row, "isCropping", val)
    // loading.value = true
    // const params = {
    //     LinkOid: row.LinkOid,
    //     isCropping: val
    // }
    // setIsCropping(params).then((data1) => {
    //     ElMessage.success("修改成功！")
    //     getIsCropping({ LinkOid: row.LinkOid })
    //         .then((data2) => {
    //             row.isCropping = data2.data.isCropping
    //         })
    //         .finally(() => (loading.value = false))
    // })
}
// 移除
const goDel = (row: any) => {
    ElMessageBox.confirm("是否确认移除该BOM?", t("dashboardPage.messageBoxTitle"), {
        confirmButtonText: t("dashboardPage.confirm"),
        cancelButtonText: t("dashboardPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    }).then(() => {
        // 确认
        loading.value = true
        delBomItem({ LinkOid: row.LinkOid })
            .then((data) => {
                ElMessage.success("移除成功！")
                // 找到父级并刷新
                recursionArray(tableData.value, (item) => {
                    if (item.PartOid === row.parentOid) partRefresh(item)
                })
            })
            .catch(() => (loading.value = false))
    })
}
// 导出BOM到Excel
const elementLoadingText = ref<string>("")
const goExport = () => {
    loading.value = true
    elementLoadingText.value = "正在导出到Excel，请稍等..."
    const params = {
        topPartoid: props.topObject.PartOid,
        topPartNumber: props.topObject.Number,
        ProductName: ""
    }
    exportPZBom(params)
        .then((data) => {
            const filename = `物料BOM（${props.topObject.Number}）-${formatDateTime(new Date(), "YYYYMMDDHHmmss")}`
            downloadFile(data, filename)
        })
        .finally(() => {
            loading.value = false
            elementLoadingText.value = ""
        })
}
// 编辑物料
const editPart = (options: any) => {
    console.log("editPart", options)
    const newValue = options.row[options.prop]
    if (newValue === options.oldValue) return false
    recursionArray(sourceData.value, (item) => {
        if (options.row.frontEndID === item.frontEndID) {
            if (!item.highEditProps?.type) {
                const obj: any = {
                    highEditProps: {
                        type: "prop",
                        oid: item.PartOid,
                        parentOid: item.parentOid,
                        parentFrontEndID: item.parentFrontEndID,
                        params: {
                            ParentPartOid: item.parentOid,
                            PartOid: item.PartOid,
                            findNumber: ""
                        }
                    }
                }
                obj.highEditProps.params[options.prop] = newValue
                Object.assign(item, JSON.parse(JSON.stringify(obj)))
                Object.assign(options.row, JSON.parse(JSON.stringify(obj)))
            }
            item[options.prop] = newValue
            return "return"
        }
    })
    emits("goHighEdit_prop", options.row, options.prop, newValue)
    // const params = {
    //     LinkOid: options.row.LinkOid, //使用关系oid
    //     Amount: newValue
    // }
    // loading.value = true
    // setAmount(params)
    //     .then((data) => {
    //         ElMessage.success("修改成功！")
    //         options.row.Amount = newValue
    //     })
    //     .finally(() => (loading.value = false))
}
// 替换物料
const replacePart = (oldRow: any, newRow: { PartOid: string }) => {
    // console.log('replacePart', oldRow, newRow);
    loading.value = true
    const params = {
        LinkOid: oldRow.LinkOid, //关系oid
        ParentPartOid: oldRow.parentOid, //父oid
        PartOid: newRow.PartOid //新的子oid
    }
    materieReplaceParentPart(params)
        .then((data) => {
            ElMessage.success("替换成功！")
            // 找到父级并刷新
            recursionArray(tableData.value, (item) => {
                if (item.PartOid === oldRow.parentOid) partRefresh(item)
            })
        })
        .finally(() => (loading.value = false))
}
// 插入物料
const insertPart = (row: any, part: { PartOid: string }) => {
    loading.value = true
    const params = {
        PartOid: part.PartOid,
        ParentPartOid: row.PartOid,
        findNumber: ""
    }
    bomInsertPart(params)
        .then((data) => {
            ElMessage.success(t("productBomPage.insertSuccessful"))
            partRefresh(row)
        })
        .finally(() => (loading.value = false))
}
// 刷新
const goRefresh = () => {
    if (props.from === "bomHighEdit_left") {
        emits("cancelEdit")
    } else {
        getList()
    }
}
// 多选
const chooseRowsList = ref<any[]>([])
const handleCheckboxChange_choose = (val: boolean, row: any) => {
    // console.log("handleCheckboxChange_choose", val, row, chooseRowsList.value)
    if (chooseRow.value && row && chooseRow.value.frontEndID === row.frontEndID) nextTick(() => setCurrent(row))
    recursionArray(sourceData.value, (item) => {
        if (item.frontEndID === row.frontEndID) {
            item.frontChecked = row.frontChecked
            return "return"
        }
    })
    let flag = true
    for (let i = 0; i < chooseRowsList.value.length; i++) {
        const ele = chooseRowsList.value[i]
        if (ele.frontEndID === row.frontEndID) {
            if (val) {
                flag = false
            } else {
                chooseRowsList.value.splice(i, 1)
                return true
            }
        }
    }
    if (flag && val) chooseRowsList.value.push(row)
}
const toggleRowChecked = (row: any) => {
    if (row.isTop && props.from === "bomHighEdit_left") return false
    row.frontChecked = !row.frontChecked
    handleCheckboxChange_choose(row.frontChecked, row)
}
// 全选（操作当前行下一级）
const goSelectAll = (row: any) => {
    console.log("goSelectAll", row)
    row.frontChecked = false
    handleCheckboxChange_choose(false, row)
    row.children?.forEach((ele: any) => {
        ele.frontChecked = true
        handleCheckboxChange_choose(true, ele)
    })
}
// 反选（操作当前行同一级）
const goSelectReverse = (row: any) => {
    console.log("goSelectReverse", row)
    if (row.frontEndID === tableData.value[0].frontEndID) {
        tableData.value[0].frontChecked = !tableData.value[0].frontChecked
        handleCheckboxChange_choose(tableData.value[0].frontChecked, tableData.value[0])
    } else {
        recursionArray(tableData.value, (item) => {
            if (item.frontEndID === row.parentFrontEndID) {
                item.children?.forEach((ele: any) => {
                    ele.frontChecked = !ele.frontChecked
                    handleCheckboxChange_choose(ele.frontChecked, ele)
                })
                return "return"
            }
        })
    }
}
// 取消选择
const goCancelSelect = () => {
    chooseRowsList.value = []
    chooseRow.value = null
    recursionArray(sourceData.value, (item) => (item.frontChecked = false))
    search()
}
// 前端检出
const showFrontCheckOut = (row: any) => {
    let flag = false
    row.children?.forEach((ele: any) => {
        if (ele.highEditProps?.type === "addExist" || ele.highEditProps?.type === "addNew") flag = true
    })
    return flag
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column?: any, event?: any) => {
    console.log("row-click", row)
    if (!row) return
    if (event && (props.from === "bomHighEdit_left" || props.from === "bomHighEdit_right")) {
        toggleRowChecked(row)
        nextTick(() => setCurrent(row))
    } else {
        setCurrent(row)
    }
    // PtTableRef.value!.toggleRowSelection(row)
    emits("handleRowClick", {
        topPartoid: props.topObject.PartOid,
        row
    })
    // 多选
    // if (controlKey.value) {
    //   chooseRow.value = null
    //   setCurrent()
    //   let flag = true
    //   selectRows.value.forEach((ele, i) => {
    //     if (ele.frontEndID === row.frontEndID) {
    //       flag = false
    //       selectRows.value.splice(i, 1)
    //     }
    //   })
    //   if (flag) selectRows.value.push(row)
    // } else {
    //   selectRows.value = []
    //   if (shiftKey.value) {
    //     if (shiftSelectId.length < 2) shiftSelectId.push(row.frontEndID)
    //     if (shiftSelectId.length === 2) goSelectRows()
    //   } else {
    //     shiftSelectId.length = 0
    //   }
    // }
}
const handleSelectionChange = (val: any[]) => {
    console.log("handleSelectionChange", val)
    multipleSelection.value = val
}
const cellDisabledEdit = ({
    row,
    column,
    rowIndex,
    columnIndex
}: {
    row: any
    column: any
    rowIndex: number
    columnIndex: number
}) => {
    // console.log('cellDisabledEdit', row, column, rowIndex, columnIndex);
    if (row.highEditProps?.type === "del") {
        return true
    }
    if (rowIndex === 0 && column.prop === "Amount") {
        return true
    }
    return false
}
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
    const classNames = []
    if (row.highEditProps?.type === "addExist" || row.highEditProps?.type === "addNew") {
        classNames.push("highEdit-add")
    } else if (row.highEditProps?.type === "del") {
        classNames.push("highEdit-del")
    } else if (row.highEditProps?.type === "prop") {
        if (row.oldData.isCropping !== row.isCropping) {
            classNames.push("highEdit-prop-isCropping")
        }
    }
    if (row.frontChecked) classNames.push("front-checked")
    // if (selectRows.value.length) {
    //     let flag = false
    //     selectRows.value.forEach(ele => {
    //       if (ele.frontEndID === row.frontEndID) flag = true
    //     })
    //     // console.log('tableRowClassName', flag, selectRows.value, row.frontEndID);
    //     if (flag) classNames.push("selectedRow")
    // }
    return classNames.join(" ")
}
// 展开回调
const handleExpandChange = (row: any, expanded: any) => {
    // console.log(row, expanded, texpandRowKeys.value);
    if (expanded) {
        // 添加id
        expandRowKeys.value.push(row.frontEndID)
    } else {
        // 删除id
        for (let i = 0; i < expandRowKeys.value.length; i++) {
            if (expandRowKeys.value[i] === row.frontEndID) {
                expandRowKeys.value.splice(i, 1)
                return false
            }
        }
    }
}
// 事件
const setCurrent = (row?: any) => {
    console.log("setCurrent", row)
    chooseRow.value = row
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false
})
// 刷新
const onlyKey = ref(1)
const refresh = () => {
    Object.keys(filterValue).forEach((key) => (filterValue[key] = ""))
    search()
    nextTick(() => {
        onlyKey.value++
        nextTick(() => emits("afterRefresh"))
    })
}
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([])
switch (props.from) {
    case "bomHighEdit_left":
        tableColumns.value = [
            {
                label: "序号",
                type: "index",
                width: "50",
                headerAlign: "center",
                show: true
            },
            {
                type: "index",
                width: "48",
                align: "center",
                show: true,
                slot: "selection"
            },
            {
                label: "裁剪",
                type: "index",
                width: "50",
                align: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "cropping",
                disabled: props.from !== "bomHighEdit_left"
            },
            {
                prop: "partCategory",
                type: "index",
                label: "零件类型",
                width: "80",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "search"
            },
            {
                prop: "Number",
                label: "编码",
                width: "240",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "Number"
            },
            {
                prop: "materialSymbol",
                label: "代号",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Name",
                label: "名称",
                width: "180",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "material",
                label: "材料",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Amount",
                label: "数量",
                width: "120",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                colEdit: {
                    show: true,
                    type: "number",
                    controlPropConfig: {
                        precision: 3,
                        min: 0
                    },
                    afterEditInline: editPart
                }
            },
            {
                prop: "processRoute",
                label: "工艺路线",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "remark",
                label: "BOM备注",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                colEdit: {
                    show: true,
                    afterEditInline: editPart
                }
            },
            {
                prop: "location",
                label: "工位",
                width: "140",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                colEdit: {
                    show: true,
                    type: "select",
                    options: option_location,
                    editProp: "location",
                    controlPropConfig: {
                        loading: loading_select
                    },
                    afterEditInline: editPart
                }
            },
            {
                label: "是否有条件",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "hasCondition"
            },
            {
                prop: "State",
                label: "生命周期",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "value",
                label: "生产目的",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Version",
                label: "版本",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "Version"
            },
            {
                prop: "Modifyer",
                label: "所有者",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "CheckOutUserName",
                label: "检出者",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            }
        ]
        break
    case "bomHighEdit_right":
        tableColumns.value = [
            // {
            //     type: "index",
            //     width: "42",
            //     headerAlign: "center",
            //     show: true,
            //     slot: "drag",
            // },
            {
                label: "序号",
                type: "index",
                width: "50",
                headerAlign: "center",
                show: true
            },
            {
                type: "index",
                width: "48",
                align: "center",
                show: true,
                slot: "selection"
            },
            {
                prop: "partCategory",
                type: "index",
                label: "零件类型",
                width: "80",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "search"
            },
            {
                prop: "Number",
                label: "编码",
                width: "200",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true,
                slot: "Number"
            },
            {
                prop: "materialSymbol",
                label: "代号",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Name",
                label: "名称",
                width: "180",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "material",
                label: "材料",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Amount",
                label: "数量",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "remark",
                label: "BOM备注",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "location",
                label: "工位",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "hasCondition",
                label: "是否有条件",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "State",
                label: "生命周期",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Version",
                label: "版本",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "Modifyer",
                label: "所有者",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            },
            {
                prop: "CheckOutUserName",
                label: "检出者",
                width: "100",
                headerAlign: "center",
                // showOverflowTooltip: true,
                show: true
            }
        ]

        break

    default:
        tableColumns.value = [
            // {
            //     type: "selection",
            //     width: "32",
            //     show: true
            // },
            {
                label: "序号",
                type: "index",
                width: "50",
                headerAlign: "center",
                show: true
            },
            {
                prop: "icon",
                label: computed(() => t("productBomPage.icon")) as any,
                // showOverflowTooltip: true,
                show: true,
                headerAlign: "center",
                slot: "icon"
            }
            // {
            //     prop: "Amount",
            //     label: "数量",
            //     width: "120",
            //     headerAlign: "center",
            //     // showOverflowTooltip: true,
            //     show: true
            // }
            // {
            //     prop: "Name",
            //     label: "名称",
            //     headerAlign: "center",
            //     showOverflowTooltip: true,
            //     show: true,
            //     slot: "search"
            // },
            // {
            //     prop: "Version",
            //     label: "版本",
            //     headerAlign: "center",
            //     showOverflowTooltip: true,
            //     show: true,
            //     slot: "search"
            // }
        ]
        break
}

// const customTableColumns = ref<{ prop: string; label: string; show: boolean }[]>([
//     {
//         prop: "isCropping",
//         label: "是否裁剪",
//         show: true
//     },
//     {
//         prop: "Number",
//         label: "编号",
//         show: true
//     },
//     {
//         prop: "Name",
//         label: "名称",
//         show: true
//     },
//     {
//         prop: "materialSymbol",
//         label: "代号",
//         show: true
//     },
//     {
//         prop: "Version",
//         label: "版本",
//         show: true
//     },
//     {
//         prop: "Amount",
//         label: "数量",
//         show: true
//     }
// ])
//#endregion

//#region 自定义拼接
const formData = reactive({
    level: "" // 显示层级
})
// 显示层级列表
const options_level = ref<SelectInterface[]>([
    {
        id: "1",
        name: "1"
    },
    {
        id: "2",
        name: "2"
    },
    {
        id: "3",
        name: "3"
    },
    {
        id: "4",
        name: "4"
    },
    {
        id: "5",
        name: "5"
    },
    {
        id: "0",
        name: "全部"
    }
])
// const dropdownRef = ref<HTMLDivElement>()

// 初始化列排序
// const customSortable = ref<Sortable | null>(null)
// const initCustomSortable = () => {
//     // console.log(111, dropdownRef.value)
//     if (dropdownRef.value) {
//         customSortable.value = new Sortable(dropdownRef.value, {
//             handle: ".drag-handler",
//             draggable: ".menu-list-li",
//             onEnd: ({ oldIndex, newIndex, from, to, item }) => {
//                 if (typeof oldIndex === "number" && typeof newIndex === "number") {
//                     to.removeChild(item)
//                     from.insertBefore(item, from.children[oldIndex])
//                     const currentRow = customTableColumns.value.splice(oldIndex, 1)[0]
//                     console.log("currentRow:", currentRow)
//                     customTableColumns.value.splice(newIndex, 0, currentRow)
//                 }
//             }
//         })
//     }
// }
// 处理查找按钮
const handleShowLevelSeekBtn = () => {
    getList()
}
// 层级选择回调
const handleSelectChange_level = (val: any) => {
    handleShowLevelSeekBtn()
    emits("changeLevelCallback", formData.level)
}
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
// 查看详情
const goDetail = (row: any) => {
    console.log("查看详情", row)
    setCurrent(row)
    // const url = router.resolve({
    //     path: "/product/productDetail",
    //     query: { oid: row.PartOid, type: "WTPart", hiddenNav: "true" }
    // })
    // windowOpenTab(url.href)
    router.push({
        path: `/product/bomDetail/${row.PartOid}`,
        query: { oid: row.PartOid, type: "WTPart", tagTitle: `${row.Number}_${row.Name}_${row.Version}` }
    })
}
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
    resetCurrent(chooseRow.value?.frontEndID)
}
//#endregion

//#region 复制/粘贴/剪切
// 复制
const goCopy = (row: any) => {
    const rows = getCurrentRows(row)
    // console.log('goCopy', rows);
    if (!rows.length) {
        ElMessage.warning("请选择物料！")
        return false
    }
    emits("goCopy", rows)
}
// 粘贴
const goPaste = (row: any) => {
    emits("goPaste", row)
}
// 剪切
const goCut = (row: any) => {
    const rows = getCurrentRows(row)
    // console.log('goCopy', rows);
    if (!rows.length) {
        ElMessage.warning("请选择物料！")
        return false
    }
    emits("goCut", rows)
    delPart(rows)
}
//#endregion

//#region 拖拽事件
const canDrag = ref(false)
const changeCanDrag = () => {
    canDrag.value = !canDrag.value
    emits("changeCanDrag", canDrag.value)
}
// 拖拽出
const dragPull = (e: Event) => {
    console.log("down", e)
    const domList = e.composedPath()
    const pullDom = findDomByClass(domList, "el-table__row")
    const dataDom = pullDom.querySelector(".dataDom")
    if (!dataDom) return false
    pullDom.draggable = true

    pullDom.ondragstart = (e: DragEvent) => {
        console.log("ondragstart", e)
        let data
        recursionArray(tableData.value, (item) => {
            if (item.PartOid === dataDom.dataset.oid && item.Number === dataDom.dataset.number) data = item
        })
        e.dataTransfer?.setData("pullData", JSON.stringify(data))
        // e.dataTransfer?.setDragImage(pullDom, -30, 30)
    }
    pullDom.ondragend = (e: DragEvent) => {
        console.log("ondragend", e)
        pullDom.draggable = false
        pullDom.ondrag = null
        pullDom.ondragend = null
    }
}
//#endregion

//#region 多选
const selectRows = ref<any[]>([])
const shiftKey = ref(false)
const shiftSelectId: string[] = []
const controlKey = ref(false)
// if (props.from === 'bomHighEdit_left' || props.from === 'bomHighEdit_right') {
//   document.addEventListener('keydown', (event: KeyboardEvent) => {
//     // console.log('keydown', event.key);
//     event.preventDefault()
//     if (event.key === 'Shift' && !shiftKey.value) shiftKey.value = true
//     if (event.key === 'Control' && !controlKey.value) controlKey.value = true
//   });
//   document.addEventListener('keyup', (event: KeyboardEvent) => {
//     event.preventDefault()
//     if (event.key === 'Shift') shiftKey.value = false
//     if (event.key === 'Control') controlKey.value = false
//   });
//   document.onselectstart = () => {
//     if (shiftKey.value || controlKey.value) return false
//   }
// }
// 多选数据
const goSelectRows = () => {
    if (shiftSelectId.length !== 2) return false
    setCurrent()
    let isSelect = false
    recursionArray(tableData.value, (item) => {
        if (isSelect) selectRows.value.push(item)
        shiftSelectId.forEach((id) => {
            if (id === item.frontEndID) {
                isSelect = !isSelect
                if (isSelect) selectRows.value.push(item)
            }
        })
    })
    shiftSelectId.length = 0
}
//#endregion

//#endregion

//#region BOM高级编辑
const getCurrentRows = (row: any) => {
    let rows = []
    if (chooseRowsList.value.length) {
        rows = chooseRowsList.value
    } else if (row) {
        rows = [row]
    }
    return rows
}
const goDelPart = (row: any) => {
    const rows = getCurrentRows(row)
    // console.log('goDelPart', rows);
    if (!rows.length) {
        ElMessage.warning("请选择物料！")
        return false
    }
    delPart(rows)
}
const goRevokePart = (row: any) => {
    const rows = getCurrentRows(row)
    // console.log('goRevokePart', rows);
    if (!rows.length) {
        ElMessage.warning("请选择物料！")
        return false
    }
    revokePart(rows)
}
// 撤销
const revokePart = (rows: any[], noSearch?: boolean) => {
    let revoke = false
    rows.forEach((row) => {
        if (row.highEditProps?.type) {
            recursionArray(sourceData.value, (item, index, parent) => {
                if (item.frontEndID === row.frontEndID) {
                    if (item.highEditProps?.type === "addExist" || item.highEditProps?.type === "addNew") {
                        // 移除当前行
                        parent.children.splice(index, 1)
                        // 递归删除子集的操作
                        if (row.children?.length) {
                            row.children.forEach((ele: any) => {
                                emits("goHighEdit_del", ele)
                            })
                        }
                    } else if (item.highEditProps?.type === "del" || item.highEditProps?.type === "prop") {
                        if (item.oldData) Object.keys(item.oldData).forEach((key) => (item[key] = item.oldData[key]))
                        delete item.highEditProps
                    }
                    revoke = true
                    emits("goHighEdit_del", row)
                    return "return"
                }
            })
        }
    })
    if (revoke && !noSearch) goCancelSelect()
}
// 添加物料
const addPart = (objs: any) => {
    console.log("addPart", objs)
    const rows = formatData(objs, {
        parentOid: objs[0].highEditProps.parentOid,
        parentFrontEndID: objs[0].highEditProps.parentFrontEndID
    })
    rows.forEach((ele) => {
        // 如果是模块直接拉过来，则是否有条件，不管原来是啥，都得显示否
        if (ele.materialType === "wt.part.WTPart|com.pdinfo.kbomMODULE") ele.hasCondition = "否"
    })
    recursionArray(sourceData.value, (item) => {
        if (item.frontEndID === objs[0].highEditProps.parentFrontEndID) {
            if (item.leaf) {
                // 未展开
                load(item, undefined, undefined, rows)
            } else {
                // 已展开
                let add = false
                rows.forEach((row) => {
                    const flag = checkAdd(row, item.children)
                    if (flag) {
                        add = true
                        if (!item.children?.length) {
                            item.children = []
                            expandRowKeys.value.push(item.frontEndID)
                        }
                        item.children.push(row)
                        emits("goHighEdit_add", row)
                    }
                })
                if (add) goCancelSelect()
            }
            return "return"
        }
    })
}
// 移除物料
const delPart = (rows: any[]) => {
    console.log("delPart", rows)
    let del = false
    rows.forEach((row) => {
        if (row.isTop) return false
        switch (row.highEditProps?.type) {
            case "addExist" || "addExist":
                del = true
                revokePart([row], true)
                break

            default:
                // 移除当前行
                recursionArray(sourceData.value, (item) => {
                    if (item.frontEndID === row.frontEndID) {
                        item.highEditProps = {
                            type: "del",
                            oid: item.PartOid,
                            parentOid: item.parentOid,
                            parentFrontEndID: item.parentFrontEndID,
                            params: {
                                LinkOid: item.LinkOid
                            }
                        }
                        del = true
                        emits("goHighEdit_add", item)
                        return "return"
                    }
                })
                break
        }
    })
    if (del) goCancelSelect()
}
// 校验是否可以添加
const checkAdd = (row: any, children: any[] = []) => {
    if (row.highEditProps?.type === "addNew") return true
    for (let i = 0; i < children.length; i++) {
        const ele = children[i]
        if (ele.PartOid === row.PartOid) {
            // ElMessage.error("已存在该物料！")
            return false
        }
    }
    return true
}
//#endregion

//#region 列表数据检入/检出
// 检入/检出
const check = (type: "in" | "out", ObjectOid: string, ObjectType: string) => {
    emits("handleCheckPart", type)
    const params = { ObjectOid, ObjectType }
    if (type === "in") {
        // 检入
        loading.value = true
        checkInObject(params)
            .then((data) => {
                console.log(data)
                afterCheck({
                    type,
                    newOid: data.data.objOid,
                    oldOid: params.ObjectOid
                })
            })
            .finally(() => (loading.value = false))
    } else if (type === "out") {
        // 检出
        loading.value = true
        checkOutObject(params)
            .then((data) => {
                console.log(data)
                afterCheck({
                    type,
                    newOid: data.data.objOid,
                    oldOid: params.ObjectOid
                })
            })
            .finally(() => (loading.value = false))
    }
}
// 检入/检出后执行
const afterCheck = (data: { type: string; newOid: string; oldOid: string }) => {
    console.log("afterCheck", data, props.topObject)
    if (props.topObject.PartOid === data.oldOid) {
        // 顶层数据
        checkTopObject(data)
    } else {
        // 下层数据
        // 找到父级并刷新
        recursionArray(tableData.value, (item: any, i: number, parent: any) => {
            if (item.PartOid === data.oldOid) {
                console.log("parent", parent)
                partRefresh(parent, data.newOid)
            }
        })
    }
}
// 检入/检出顶层物料
const checkTopObject = (data: { type?: string; newOid: string; oldOid: string }) => {
    // instance.refs.PListRef.getList(id)
    console.log("checkTopObject")
    router.push({
        params: { ...route.params, oid: data.newOid },
        query: { ...route.query, oid: data.newOid }
    })
    tagsViewStore.visitedViews.forEach((view) => {
        if (view.params?.oid === data.oldOid) {
            // 删除标签
            tagsViewStore.delVisitedView(view)
            tagsViewStore.delCachedView(view)
        }
    })
}
//#endregion

//#region 插入新的 - 弹窗
const addPartNewDialog = reactive<any>({
    part: false,
    title: t("productLibraryPage.createPart"),
    type: "insert",
    row: null,
    productOid: "",
    parentRow: null
})
// 插入新的
const goAdd_new = (row: any) => {
    console.log("插入新的", row, tableData.value[0])
    if (!row.PartOid) {
        ElMessage.error("PartOid为空！")
        return false
    }
    if (!row.oid) row.oid = row.PartOid
    Object.assign(addPartNewDialog, {
        row,
        nodeData: { ProductOid: row.ProductOid },
        parentRow: { oid: "", name: tableData.value[0].FolderName, flag: 1 },
        productOid: row.ProductOid,
        part: true
    })
}
// 插入新的回调
const handleWTPartConfirmSuccess = (data: any) => {
    console.log("handleWTPartConfirmSuccess", data)
    if (props.from === "bomHighEdit_left") {
        const obj = {
            PartOid: data.oid,
            Name: data.name,
            Number: data.number,
            Amount: 1,
            highEditProps: {
                type: "addExist",
                oid: data.oid,
                parentOid: addPartNewDialog.row.PartOid,
                parentFrontEndID: addPartNewDialog.row.frontEndID,
                params: {
                    ParentPartOid: addPartNewDialog.row.PartOid,
                    PartOid: data.oid,
                    findNumber: "",
                    Amount: 1
                }
            }
        }
        addPart([obj])
    } else {
        partRefresh(addPartNewDialog.row)
    }
    Object.assign(addPartNewDialog, {
        part: false,
        row: null
    })
}
//#endregion

//#region 基线管理 - 弹窗
const baselineManageDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ""
})
// 基线管理
const goBaselineManage = () => {
    // console.log('goBaselineManage', props.topObject);
    Object.assign(baselineManageDialog, {
        visible: true,
        title: `基线管理：${props.topObject.Name}`,
        row: props.topObject,
        type: "edit"
    })
}
// 基线管理回调
const handleEditSuccess_baseline = () => {
    const row = baselineManageDialog.row
    console.log("handleEditSuccess_baseline", row)
    partRefresh(baselineManageDialog.row)
    Object.assign(baselineManageDialog, {
        visible: false,
        title: "",
        row: null,
        type: ""
    })
}
//#endregion

//#region 历史版本 - 弹窗
const historyListDialog = reactive<any>({
    visible: false,
    row: {}
})
const goVersionCompare = () => {
    historyListDialog.row = {
        partOid: props.topObject.PartOid
    }
    historyListDialog.visible = true
}
// 历史版本选择回调
const goChooseHistory = (arr: any[]) => {
    console.log("goChooseHistory", arr)
    const url = router.resolve({
        path: "/bomManage/bomCompare",
        query: {
            code: historyListDialog.row.partOid,
            version1: arr[0].Oid,
            version2: arr[1].Oid,
            type: "version",
            hiddenNav: true
        } as any
    })
    windowOpenTab(url.href)
}
//#endregion

//#region 添加物料 - 弹窗
const materialDialog = reactive<any>({
    visible: false,
    title: "选择物料",
    type: "",
    row: null
})
// 添加物料
const goChoose = () => {
    console.log("添加物料")
    Object.assign(materialDialog, {
        visible: true,
        type: "",
        row: null
    })
}
// 替换
const goReplace = (row: any) => {
    if (!row.PartOid) {
        ElMessage.error("PartOid为空！")
        return false
    }
    Object.assign(materialDialog, {
        visible: true,
        type: "replace",
        row: row
    })
}
// 插入现有的
const goAdd_exist = (row: any) => {
    if (!row.PartOid) {
        ElMessage.error("PartOid为空！")
        return false
    }
    Object.assign(materialDialog, {
        visible: true,
        type: "exist",
        row
    })
}
// 添加物料回调
const handleConfirmSuccess_material = (row: MaterialInterface) => {
    console.log("handleConfirmSuccess_material", row, materialDialog)
    if (materialDialog.type === "replace") {
        // 替换
        if (props.from === "bomHighEdit_left") {
            recursionArray(sourceData.value, (item, i, parent) => {
                if (item.frontEndID === materialDialog.row.frontEndID) {
                    const flag = checkAdd(row, parent.children)
                    if (flag) {
                        // 移除
                        delPart([item])
                        // 添加
                        const obj = {
                            PartOid: row.oid,
                            Name: row.name,
                            Number: row.code,
                            Version: row.version,
                            leaf: false,
                            isTop: false,
                            Amount: 1,
                            highEditProps: {
                                type: "addExist",
                                oid: row.oid,
                                parentOid: materialDialog.row.PartOid,
                                parentFrontEndID: materialDialog.row.frontEndID,
                                params: {
                                    ParentPartOid: materialDialog.row.PartOid,
                                    PartOid: row.oid,
                                    findNumber: materialDialog.row.findNumber || "",
                                    Amount: 1
                                }
                            }
                        }
                        const list = formatData([obj], {
                            parentOid: obj.highEditProps.parentOid,
                            parentFrontEndID: obj.highEditProps.parentFrontEndID
                        })
                        parent.children.push(list[0])
                        search()
                        emits("goHighEdit_add", list[0])
                    }
                }
            })
        } else {
            replacePart(materialDialog.row, { PartOid: row.oid })
        }
    } else if (materialDialog.type === "exist") {
        // 插入现有的
        if (props.from === "bomHighEdit_left") {
            const obj = {
                PartOid: row.oid,
                Name: row.name,
                Number: row.code,
                Version: row.version,
                leaf: false,
                isTop: false,
                Amount: 1,
                highEditProps: {
                    type: "addExist",
                    oid: row.oid,
                    parentOid: materialDialog.row.PartOid,
                    parentFrontEndID: materialDialog.row.frontEndID,
                    params: {
                        ParentPartOid: materialDialog.row.PartOid,
                        PartOid: row.oid,
                        findNumber: materialDialog.row.findNumber || "",
                        Amount: 1
                    }
                }
            }
            addPart([obj])
        } else {
            insertPart(materialDialog.row, { PartOid: row.oid })
        }
    } else {
        // 添加到右侧列表
        emits("chooseObj", {
            PartOid: row.oid,
            Number: row.code
        })
    }
    Object.assign(materialDialog, {
        visible: false,
        type: "",
        row: null
    })
}
//#endregion

//#region 显示规则 - 弹窗
// const showRuleCache = reactive(JSON.parse(getStorage("kbom-show-rule-cache", false)))
// console.log("showRuleCache: ", showRuleCache)
// const initShowRuleForm = reactive({
//     oid: "",
//     versionRule: " ", // 版本规则
//     sortBy: "", // 一级排序
//     sorted: "DESC", // 升序/降序
//     typeName: props.from === "productConfigure" || props.from === "productListConfigure" ? "Design" : "", // 类型名称
//     attributeInterval: " ", // 显示属性间隔
//     showAttribute: [
//         {
//             oid: "",
//             ruleOid: "",
//             prop: "hasCondition",
//             label: "是否有条件",
//             show: true
//         },
//         {
//             oid: "",
//             ruleOid: "",
//             prop: "Number",
//             label: "编码",
//             show: true
//         },
//         {
//             oid: "",
//             ruleOid: "",
//             prop: "Name",
//             label: "名称",
//             show: true
//         },
//         {
//             oid: "",
//             ruleOid: "",
//             prop: "Version",
//             label: "版本",
//             show: true
//         },
//         {
//             oid: "",
//             ruleOid: "",
//             prop: "materialSymbol",
//             label: "代号",
//             show: true
//         },
//         {
//             oid: "",
//             ruleOid: "",
//             prop: "Amount",
//             label: "数量",
//             show: true
//         }
//     ], // 显示属性
//     showTypeIcon: true, // 显示类型图标
//     showLifeCycleIcon: true, // 显示生命周期图标
//     showCheckoutIcon: true, // 显示检出图标
//     showAttachment: true, // 显示是否有附件
//     viewOption: "" // 显示选项
// })
// const showRuleForm = showRuleCache || initShowRuleForm
const showRuleForm = reactive({
    oid: "",
    versionRule: " ", // 版本规则
    sortBy: "", // 一级排序
    sorted: "DESC", // 升序/降序
    typeName: props.from === "productConfigure" || props.from === "productListConfigure" ? "Design" : "", // 类型名称
    attributeInterval: " ", // 显示属性间隔
    showAttribute: [
        {
            oid: "",
            ruleOid: "",
            prop: "hasCondition",
            label: "是否有条件",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Number",
            label: "编码",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Name",
            label: "名称",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Version",
            label: "版本",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "materialSymbol",
            label: "代号",
            show: true
        },
        {
            oid: "",
            ruleOid: "",
            prop: "Amount",
            label: "数量",
            show: true
        }
    ], // 显示属性
    showTypeIcon: true, // 显示类型图标
    showLifeCycleIcon: true, // 显示生命周期图标
    showCheckoutIcon: true, // 显示检出图标
    showAttachment: true, // 显示是否有附件
    viewOption: "" // 显示选项
})
const showRuleDialog = reactive<any>({
    visible: false,
    title: "显示规则",
    type: ""
})

// 处理显示规则按钮
const handleShowRuleBtn = () => {
    showRuleDialog.visible = true
}

const getContentFormat = (rows: any, row: any) => {
    const jointSymbol = rows.attributeInterval
    const customColumns = rows.showAttribute
    // console.log("jointSymbol: ", customColumns, jointSymbol)
    return customColumns
        .filter((column: any) => column.show)
        .map((column: any) => row[column.prop])
        .filter((ele: any) => ele !== undefined && ele !== "否")
        .join(jointSymbol)
}

// 显示规则
const showRuleContentFormat = computed(() => {
    return (
        getNameById(option_typeName.value, showRuleForm.typeName) +
        `${showRuleForm.attributeInterval}` +
        getNameById(optionVersionRuleList, showRuleForm.versionRule)
    )
})

// 关闭显示规则弹窗
const handleConfirmSuceess = (ruleForm: any) => {
    Object.assign(showRuleForm, ruleForm)
    Object.assign(sortParams, {
        sortBy: ruleForm.sortBy,
        sorted: ruleForm.sorted
    })
    // 重新赋值
    topObjectShowRule.value = {
        viewName: ruleForm.typeName
    }
    console.log("显示规则showRuleForm：", showRuleForm, sortParams)
    getList()
}

// 获取保存得显示规则设置
const getShowRuleDetails = async () => {
    try {
        loading.value = true
        const { data } = (await showRuleDetail({})) as { data: any }
        if (!Object.keys(data).length) return
        Object.assign(showRuleForm, {
            oid: data.oid,
            versionRule: data.versionRule,
            sortBy: data.sortBy,
            sorted: data.sorted,
            typeName: data.typeName,
            attributeInterval: data.attributeInterval,
            showTypeIcon: data.showTypeIcon === "1" ? true : false,
            showLifeCycleIcon: data.showLifeCycleIcon === "1" ? true : false,
            showCheckoutIcon: data.showCheckoutIcon === "1" ? true : false,
            showAttachment: data.showAttachment === "1" ? true : false,
            creator: data.creator,
            showAttribute: data.columnList.map((item: any) => {
                return {
                    oid: item.oid,
                    ruleOid: item.ruleOid,
                    prop: item.prop,
                    label: item.label,
                    show: item.show === "1" ? true : false
                }
            })
        })
        // console.log("getShowRuleDetails: ", showRuleForm, tableData.value, topObjectShowRule.value)
        Object.assign(sortParams, {
            sortBy: data.sortBy,
            sorted: data.sorted
        })
        // showRuleForm重新赋值取弹窗缓存的数据
        const showRuleCache = reactive(JSON.parse(getStorage("kbom-show-rule-cache", false)))
        if (showRuleCache) {
            Object.assign(showRuleForm, {
                ...showRuleForm,
                ...showRuleCache,
                typeName: showRuleCache.typeName
            })
        }
        // 如果是维护配置，则类型名称写死为配置BOM(Design)
        if (props.from === "productConfigure" || props.from === "productListConfigure") {
            showRuleForm.typeName = "Design"
        }
    } catch (err: any) {
        console.log(err)
    } finally {
        loading.value = false
        getList()
    }
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
    return {
        oid: material.PartOid,
        number: material.Number,
        name: material.Name,
        typeName: material.type,
        version: material.Version,
        iteration: material.Iteration
    }
}
// BOM比较
const goBOMCompare = (material: any) => {
    let material1, material2
    if (material) {
        material1 = formatData_material(material)
        material2 = formatData_material(material)
    } else {
        ElMessage.warning("请选择一个物料！")
        return false
    }
    Object.assign(bomCompareSetDialog, {
        visible: true,
        material1,
        material2
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

//#region 属性批量编辑 - 弹窗
const batchAttributeSettingsDialog = reactive({
    visible: false,
    title: "属性批量编辑",
    rows: [] as any[]
})
// 属性批量编辑
const goBatchAttributeSettings = () => {
    const rows = getCurrentRows(chooseRow.value)
    // console.log('goBatchAttributeSettings', rows);
    if (!rows.length) {
        ElMessage.warning("请选择物料！")
        return false
    }
    Object.assign(batchAttributeSettingsDialog, {
        visible: true,
        rows
    })
}
// 批量属性设置回调
const handleEditSuccess_attribute = (formData: any) => {
    console.log("handleEditSuccess_attribute", formData)
    recursionArray(sourceData.value, (item) => {
        let flag = false
        // 是否裁剪编辑权限判断
        if ((!item.isCroppingCanEdit || item.highEditProps?.type === "del") && formData.prop === "isCropping")
            return false
        batchAttributeSettingsDialog.rows.forEach((ele) => {
            if (ele.frontEndID === item.frontEndID) flag = true
        })
        if (flag) {
            item[formData.prop] = formData.value
            if (!item.highEditProps?.type) {
                const obj = {
                    highEditProps: {
                        type: "prop",
                        oid: item.PartOid,
                        parentOid: item.parentOid,
                        parentFrontEndID: item.parentFrontEndID,
                        params: {
                            ParentPartOid: item.parentOid,
                            PartOid: item.PartOid,
                            findNumber: ""
                        }
                    }
                }
                Object.assign(item, JSON.parse(JSON.stringify(obj)))
            }
            item[formData.prop] = formData.value
            item.highEditProps.params[formData.prop] = formData.value
            emits("goHighEdit_prop", item, formData.prop, formData.value)
        }
    })
    goCancelSelect()
    Object.assign(batchAttributeSettingsDialog, {
        visible: false,
        rows: []
    })
}
//#endregion

defineExpose({
    tableData,
    chooseRow,
    setCurrent,
    getList,
    partRefresh,
    afterCheck,
    // BOM高级编辑
    addPart,
    delPart,
    goBOMCompare,
    goSelectRows,
    getShowRuleDetails,
    topObjectShowRule
})
onMounted(() => {
    emitter.off("kbom_showRule_interfaceRefresh")
    // 头部设置保存时刷新列表
    emitter.on("kbom_showRule_interfaceRefresh", (ruleForm: any) => {
        console.log("kbom_showRule_interfaceRefres规则：", ruleForm)
        Object.assign(showRuleForm, ruleForm)
        Object.assign(sortParams, {
            sortBy: ruleForm.sortBy,
            sorted: ruleForm.sorted
        })
        // 如果是维护配置，则类型名称写死为配置BOM(Design)
        if (props.from === "productConfigure" || props.from === "productListConfigure") {
            showRuleForm.typeName = "Design"
        }
        console.log("显示规则showRuleForm：", showRuleForm, sortParams)
        console.log("props.topObject?.PartOid: ", props.topObject?.PartOid)
        if (!props.topObject?.PartOid) return
        getList()
    })
})
</script>

<style lang="scss" scoped>
.pBom {
    :deep(.pt-table) {
        .highEdit-add {
            color: red;
        }
        .highEdit-del .cell {
            text-decoration: line-through;
            color: #ccc;
        }
        .highEdit-prop-isCropping {
            color: #23ff23;
        }
        .front-checked {
            td.el-table__cell {
                background-color: #f9e2d0 !important;
            }
        }
        .cell {
            white-space: nowrap;
        }
    }
    :deep(.el-form) {
        .el-form-item {
            margin-bottom: 6px;
        }
    }
    .edit-btn-icon {
        display: flex;
        border: 1px solid #ccc;
        border-radius: 10px 0 10px 0;
        background-image: linear-gradient(to top, #dfe9f3 0%, white 100%);
        .img-button {
            & + .img-button {
                border-left: 1px solid #ccc;
            }
            .icon-li {
                display: flex;
                align-items: center;
                padding: 2px 12px;
            }
        }
    }
}
</style>
