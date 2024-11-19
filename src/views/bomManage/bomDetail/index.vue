<template>
    <div class="app-container">
        <div class="sf-container3">
            <div class="search-container">
                <ScrollPane :tag-refs="buttonContainerRef" :isShowIcon="false">
                    <div
                        ref="buttonContainerRef"
                        class="button-container mb-1 pt-scrollbar inline-flex flex-nowrap overflow-auto"
                    >
                        <!-- <template
                            v-if="
                                checkMaterialCanEdit(detailAttrsCollectionForm.materialType) &&
                                userStore.userInfo.name === detailAttrsCollectionForm.owner
                            "
                        > -->
                        <template v-if="!isCanEdit">
                            <!-- 只有新建的三个物料类型是可以编辑的: 整机配置，模块，零部件-->
                            <el-button
                                class="mb-2"
                                size="small"
                                type="primary"
                                @click="handleCheckBtn('out', true)"
                                :disabled="!checkMaterialCanEdit(objectRow?.materialType)"
                                >编辑</el-button
                            >
                        </template>
                        <template v-if="isCanEdit">
                            <el-button class="mr-2" size="small" type="primary" @click="handleSaveBtn">保存</el-button>
                            <el-button class="mr-2" size="small" type="primary" @click="handleCancelBtn"
                                >取消</el-button
                            >
                        </template>
                        <!-- </template> -->
                        <template v-if="!isCanEdit">
                            <el-button class="mb-2" size="small" type="primary" @click="handleRefreshBtn"
                                >刷新</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleAddToBtn"
                                >添加到</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleChangeOwnerBtn"
                                >变更所属者</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleGoBomHighEditBtn"
                                >BOM高级编辑</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleBomBatchEditBtn('升版')"
                                >BOM批量编辑</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleBomBatchEditBtn('不升版')"
                                >BOM不升版批量编辑</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleMaterieReviseBtn"
                                >修订</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleMaterieSetStateBtn"
                                >跃迁</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleMaterieCreateBaselineBtn"
                                >新建基线</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleOneClickPublishingBtn"
                                >一键发布</el-button
                            >
                            <el-button class="mb-2" type="primary" size="small" @click="handleGoBOMCompareBtn"
                                >BOM比较</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary" @click="handleBomExportExcelBtn"
                                >BOM导出</el-button
                            >
                            <el-button
                                class="mb-2"
                                size="small"
                                type="primary"
                                @click="handleExportU9Btn"
                                :disabled="!detailAttrsCollectionForm.oid"
                                >同步到U9</el-button
                            >
                            <!-- 整机配置 -->
                            <template v-if="objectRow?.materialType === 'wt.part.WTPart|com.pdinfo.kbomCAR'">
                                <el-button
                                    class="mb-2"
                                    size="small"
                                    type="primary"
                                    @click="handleGoPage('/configuration/productionConfiguration', '维护配置')"
                                    >维护配置</el-button
                                >
                                <!-- <el-button
                                class="mb-2"
                                size="small"
                                type="primary"
                                @click="handleGoPage('/configuration/applicationConfiguration', '应用配置')"
                                >应用配置</el-button
                            >
                            <el-button class="mb-2" size="small" type="primary">配置变量报表</el-button>
                            <el-button class="mb-2" size="small" type="primary">配置条件报表</el-button>
                            <el-button class="mb-2" size="small" type="primary">配置约束报表</el-button> -->
                            </template>
                        </template>

                        <!-- 更多按钮 -->
                        <!-- <el-button
                            class="mb-2"
                            :icon="isActive ? 'ArrowDownBold' : 'ArrowUpBold'"
                            size="small"
                            circle
                            @click="changeActive(isActive)"
                        /> -->
                    </div>
                    <!-- <div class="mt-2" v-show="isActive">
                        <el-button class="mb-2" size="small" type="primary" @click="handleBomExportExcelBtn"
                            >BOM导出</el-button
                        >
                        <el-button class="mb-2" size="small" type="primary" @click="handleExportU9Btn"
                            >同步到U9</el-button
                        >
                    </div> -->
                </ScrollPane>
            </div>
            <div class="sf-container-main">
                <drop-line left-width="450px" :minDropWidth="[10, 500]" @dropWidthChange="handleDropWidthChange">
                    <template #left>
                        <PBom
                            ref="PBomRef"
                            class="p_bom"
                            from="bomDetail"
                            :topObject="topObject"
                            @handleRowClick="handleRowClick"
                            @afterRefresh="handleAfterRefresh"
                            @changeLevelCallback="handleChangeLevelCallback"
                        />
                    </template>
                    <template #right>
                        <ObjectDetail
                            v-if="showDetail"
                            ref="ObjectDetailRef"
                            class="ObjectDetail"
                            type="bomDetail"
                            :query="objectRow"
                            :colSpan="colSpan"
                            :materielTypeList="materielTypeList"
                            :documnetTypeList="documnetTypeList"
                            :typeList="typeList"
                            :optionTrimList="optionTrimList"
                            :optionLineList="optionLineList"
                            :optionChildLineList="optionChildLineList"
                            :optionPrePlanTypeList="optionPrePlanTypeList"
                            :isActive="isActive"
                            :isCanEdit="isCanEdit"
                            :topObjectRow="topObjectRow"
                            :level="level"
                            :viewName="viewName"
                            :dropWidthChangeHandler="handleDropWidthChange"
                            @handleAfterCheck="handleAfterCheck"
                            @handleRefreshLeftTree="handleRefreshLeftTree"
                            @handleEditStatusUpdate="handleEditStatusUpdate"
                        />
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue"
import { useRoute, onBeforeRouteLeave } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"
import DropLine from "@/components/dropLine/index.vue"
import PBom from "@/views/bomManage/productBom/components/pBom.vue"
import ObjectDetail from "@/views/bomManage/productDetail/index.vue"
import ScrollPane from "@/layout/components/TagsView/ScrollPane.vue"
import { checkMaterialCanEdit, recursionArray } from "@/utils"
import { useUserStore } from "@/store/modules/user"
import emitter from "@/utils/mitt"
import { getNameById } from "@/assets/common/select-list"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "bomDetail"
})

const { t } = useI18n()
const userStore = useUserStore()
const instance: any = getCurrentInstance()
const route = useRoute()
const tagsViewStore = useTagsViewStore()
const query = ref<{
    oid: string
    number: string
    materialType: string // 物料类型
    type: string // 页面类型（WTPart：部件；WTDocument：文档）
}>(route.query as any)
console.log("路由参数：", query.value)

const isCanEdit = ref(false) // 判断是否默认可编辑

onMounted(() => {
    topObject.value = {
        PartOid: query.value.oid,
        Number: query.value.number
    }
    nextTick(() => instance.refs.PBomRef.getShowRuleDetails())
})
//#endregion

//#region 树
const topObject = ref({
    PartOid: "",
    Number: ""
})
const objectRow = ref()
// BOM导出需要用到
const topObjectRow = ref()
// 顶层显示规则组织视图
const viewName = ref<string>("")
const handleRowClick = (row: any) => {
    console.log("handleRowClick=>row: ", row, objectRow.value)
    // BOM导出跟层级挂钩，永远取顶层行数据
    topObjectRow.value = instance.refs.PBomRef.tableData[0]
    viewName.value = instance.refs.PBomRef.topObjectShowRule.viewName
    // console.log("viewName.value: ", viewName.value)
    let find = null
    recursionArray(instance.refs.PBomRef.tableData || [], (item) => {
        if (item?.PartOid === objectRow.value?.PartOid) {
            if (item?.isCheckOut) {
                find = item
                instance.refs.PBomRef.setCurrent(item)
            }
            return "return"
        }
    })
    if (find) {
        ElMessageBox.alert("当前处于编辑状态，不能切换!", "提示", {
            confirmButtonText: "确认",
            type: "error",
            center: true
        })
        return false
    }
    objectRow.value = {
        ...row.row,
        oid: row.row.PartOid,
        type: row.row.ObjectType,
        materialType: row.row.materialType
    }
    console.log("objectRow.value: ", objectRow.value)
    refreshDetail()
    // 只有新建的三个物料类型是可以编辑的: 整机配置，模块，零部件
    if (!checkMaterialCanEdit(objectRow.value.materialType)) return
    isCanEdit.value = objectRow.value.isCheckOut
}
const handleAfterRefresh = () => {
    const dataList = instance.refs.PBomRef.tableData
    if (objectRow.value) {
        recursionArray(dataList, (item: any) => {
            // 通过物料编码匹配，找到对应的行，oid会变化
            if (item.Number && item.Number === objectRow.value.Number) {
                nextTick(() => {
                    isCanEdit.value = item.isCheckOut || false
                })
            }
        })
    }
}

const level = ref("0") // bom树展示层级
const handleChangeLevelCallback = (value: string) => {
    level.value = value
}
//#endregion

//#region 详情
const showDetail = ref(false)
const refreshDetail = () => {
    showDetail.value = false
    setTimeout(() => (showDetail.value = true), 1)
}
// 检入/检出后回调
const handleAfterCheck = (checkData: { type: string; newOid: string; oldOid: string }) => {
    instance.refs.PBomRef.afterCheck(checkData)
}

// 刷新树
const handleRefreshLeftTree = () => {
    instance.refs.PBomRef.partRefresh(instance.refs.PBomRef.tableData[0])
}
//#endregion

//#region 右侧详情自适应
const colSpan = ref<number>(8)
const timer = ref()
const handleDropWidthChange = () => {
    const ptContainerMainRight = document.querySelector(".pt-container-main-right") as HTMLElement
    console.log("ptContainerMainRight: ", ptContainerMainRight)
    if (ptContainerMainRight) {
        const offsetWidth = ptContainerMainRight.offsetWidth
        console.log("offsetWidth: ", offsetWidth)
        if (offsetWidth) {
            if (offsetWidth > 1560) {
                colSpan.value = 4
            } else if (offsetWidth < 1560 && offsetWidth > 1160) {
                colSpan.value = 6
            } else if (offsetWidth < 1160 && offsetWidth > 900) {
                colSpan.value = 8
            } else if (offsetWidth < 900 && offsetWidth > 520) {
                colSpan.value = 12
            } else if (offsetWidth < 520) {
                colSpan.value = 24
            }
        }
    }
}

// 延时处理
if (timer.value) clearTimeout(timer.value)
timer.value = setTimeout(() => {
    nextTick(() => {
        handleDropWidthChange()
    })
}, 1000)
//#endregion

//#region 头部按钮超出显示更多
const isActive = ref<boolean>(false)
const changeActive = (val: boolean) => {
    isActive.value = !val
}
const buttonContainerRef = ref()
const visibleBtns = ref<any[]>([
    "检出并编辑",
    "检入",
    "取消检出",
    "维护配置",
    "应用配置",
    "配置变量报表",
    "配置条件报表",
    "配置约束报表",
    "刷新",
    "添加到",
    "变更所属者",
    "BOM高级编辑",
    "BOM批量编辑",
    "BOM不升版批量编辑",
    "修订",
    "跃迁",
    "新建基线",
    "一键发布",
    "BOM比较",
    "BOM导出",
    "同步到U9"
])
// const visibleButtons = ref([])
// const handleButtonShowMore = () => {
//     const buttonContainer = document.querySelector(".button-container") as HTMLElement
//     console.dir(buttonContainer)
//     const buttons = document.querySelector(".buttons") as HTMLElement
//     console.dir(buttons)
//     console.log(buttonContainer.offsetWidth, buttons.scrollWidth)
//     const buttonsElements = buttons.children as any

//     setTimeout(() => {
//         let totalWidth = 0
//         visibleButtons.value = []

//         for (let i = 0; i < buttonsElements.length; i++) {
//             totalWidth += buttonsElements[i].offsetWidth + 12 // 加上margin
//             if (totalWidth <= buttonContainer.offsetWidth) {
//                 visibleButtons.value.push(visibleBtns.value[i])
//             } else {
//                 break
//             }
//         }

//         console.log(buttonContainer.offsetWidth, buttons.scrollWidth, visibleButtons.value)
//         if (buttons.scrollWidth > buttonContainer.offsetWidth) {
//             console.log(2222)
//             showMoreButton.value = true
//         }
//     }, 1000)
// }
//#endregion

//#region 下拉数据
const materielTypeList = ref<SelectInterface[]>([]) // 全部物料类型
const documnetTypeList = ref<SelectInterface[]>([]) // 文档类型
const typeList = ref<SelectInterface[]>([]) // 物料类型
const optionTrimList = ref<SelectInterface[]>([]) // 裁剪方式
const optionLineList = ref<SelectInterface[]>([]) // 产品分类
const optionChildLineList = ref<SelectInterface[]>([]) // 产品子类
const optionPrePlanTypeList = ref<SelectInterface[]>([]) // 预计划分类
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({
            codes: "MATERIAL_TYPE,DOCUMENT_TYPE,KBOM_MATERIAL_TYPE,TRIM_METHOD,PRODUCT_LINE,PRODUCT_LINE_CHILD,PRE_PLAN_TYPE"
        })) as {
            data: any
        }
        materielTypeList.value =
            data.MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        documnetTypeList.value =
            data.DOCUMENT_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        typeList.value =
            data.KBOM_MATERIAL_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionTrimList.value =
            data.TRIM_METHOD.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionLineList.value =
            data.PRODUCT_LINE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionChildLineList.value =
            data.PRODUCT_LINE_CHILD.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
        optionPrePlanTypeList.value =
            data.PRE_PLAN_TYPE.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion

//#region 头部按钮
const ObjectDetailRef = ref()
const detailAttrsCollectionForm = ref<any>({})
const typeName = computed(() => getNameById(materielTypeList.value, detailAttrsCollectionForm.value.materialType))

// 处理检出并编辑
const handleCheckBtn = (type: string, isEdit?: boolean) => {
    console.log("ObjectDetailRef: ", ObjectDetailRef.value)
    ObjectDetailRef.value!.check(type, isEdit)
}

const handleEditStatusUpdate = (bool: boolean) => {
    console.log("编辑状态更新：", bool)
    // isCanEdit.value = bool
}

// 处理取消
const handleCancelBtn = () => {
    ObjectDetailRef.value!.handleMaterieCancelCheckoutBtn()
}
// 处理保存
const handleSaveBtn = () => {
    ObjectDetailRef.value!.handleEditConfirm()
}

// // 处理取消检出按钮
// const handleMaterieCancelCheckoutBtn = () => {
//     ObjectDetailRef.value!.handleMaterieCancelCheckoutBtn()
// }

// 处理跳转维护配置按钮
const handleGoPage = (url: string, goType: string) => {
    ObjectDetailRef.value!.goPage(
        url,
        goType,
        detailAttrsCollectionForm.value.oid,
        detailAttrsCollectionForm.value.code
    )
}

// 处理刷新按钮
const handleRefreshBtn = () => {
    ObjectDetailRef.value!.handleRefreshBtn()
}

// 处理添加到按钮
const handleAddToBtn = () => {
    ObjectDetailRef.value!.handleAddToBtn()
}

// 处理变更所属者按钮
const handleChangeOwnerBtn = () => {
    ObjectDetailRef.value!.handleChangeOwnerBtn()
}

// 处理跳转BOM高级编辑
const handleGoBomHighEditBtn = () => {
    ObjectDetailRef.value!.goBomHighEdit()
}

// 处理BOM批量编辑/BOM不升版批量编辑按钮
const handleBomBatchEditBtn = (type: string) => {
    ObjectDetailRef.value!.handleBomBatchEditBtn(type)
}

// 处理修订按钮
const handleMaterieReviseBtn = () => {
    ObjectDetailRef.value!.handleMaterieReviseBtn()
}

// 处理跃迁按钮
const handleMaterieSetStateBtn = () => {
    ObjectDetailRef.value!.handleMaterieSetStateBtn()
}

// 处理物料新建基线按钮
const handleMaterieCreateBaselineBtn = () => {
    ObjectDetailRef.value!.handleMaterieCreateBaselineBtn()
}

// 处理物料一键发布按钮
const handleOneClickPublishingBtn = () => {
    ObjectDetailRef.value!.handleOneClickPublishingBtn()
}

// 处理BOM比较
const handleGoBOMCompareBtn = () => {
    ObjectDetailRef.value!.goBOMCompare()
}

// 处理导出BOM到Excel
const handleBomExportExcelBtn = () => {
    ObjectDetailRef.value!.handleBomExportExcelBtn()
}

// 处理导出U9
const handleExportU9Btn = () => {
    ObjectDetailRef.value!.handleExportU9Btn()
}

//#endregion

onMounted(() => {
    emitter.on("detailAttrsCollectionForm", (data: any) => {
        console.log("detailAttrsCollectionForm2222: ", data)
        if (!data) return
        detailAttrsCollectionForm.value = data
        // 格式化类型名称
        if (query.value.type === "WTPart") {
            detailAttrsCollectionForm.value.typeName = typeName
        } else if (query.value.type === "WTDocument") {
            detailAttrsCollectionForm.value.typeName = getNameById(
                documnetTypeList.value,
                detailAttrsCollectionForm.value.partType
            )
        }
    })

    // 解决同一个页面多个组件使用window.onresize不生效
    window.addEventListener("resize", () => {
        handleDropWidthChange()
    })
})

// 页面关闭卸载掉emitter订阅
onBeforeUnmount(() => {
    emitter.off("detailAttrsCollectionForm")
})

// onBeforeRouteLeave((to, from, next) => {
//     if (isCanEdit2.value) {
//         ElMessageBox.confirm("是否离开当前页面？", "提示", {
//             confirmButtonText: "是(Y)",
//             cancelButtonText: "否(N)",
//             confirmButtonClass: "confirmButton",
//             cancelButtonClass: "cancelButton",
//             type: "warning",
//             center: true
//         })
//             .then(() => {
//                 // const leaveParams = {
//                 //     isCanLeave: true,
//                 //     fn: next()
//                 // }
//                 // isCanEdit2.value = false
//                 // handleSaveBtn(leaveParams)
//                 // 防止页签丢失
//                 if (route.name) {
//                     tagsViewStore.addVisitedView(route)
//                     tagsViewStore.addCachedView(route)
//                 }
//                 ElMessage({
//                     type: "warning",
//                     message: "当前处于编辑状态!",
//                     center: true
//                 })
//                 return
//             })
//             .catch(() => {
//                 // 防止页签丢失
//                 if (route.name) {
//                     tagsViewStore.addVisitedView(route)
//                     tagsViewStore.addCachedView(route)
//                 }
//             })
//     } else {
//         next()
//     }
// })
</script>

<style lang="scss" scoped>
:deep(.ObjectDetail) {
    height: 100%;
    // .sf-container {
    //     height: 100%;
    //     // // 隐藏滚动条
    //     // .el-scrollbar__bar.is-vertical {
    //     //     display: none !important;
    //     // }
    // }
}
</style>
