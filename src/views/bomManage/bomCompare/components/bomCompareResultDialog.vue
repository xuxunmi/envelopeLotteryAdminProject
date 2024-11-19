<template>
    <el-dialog v-model="dialog.visible" :title="dialog.title" draggable overflow align-center width="90%">
        <div v-loading="loading" :element-loading-text="elementLoadingText">
            <el-button type="primary" size="small" @click="handleExportExcelBtn" :disabled="!differenceTableData.length"
                >导出</el-button
            >
            <div class="bomCompareResultDialog mt-2">
                <div class="bomTree">
                    <div class="bomTableWrapper">
                        <el-tooltip effect="dark" :content="materialName.material2" placement="top">
                            <div class="bomTableTitle">{{ materialName.material1 }}</div>
                        </el-tooltip>
                        <div class="leftBom">
                            <LeftBomTable
                                ref="LeftBomTableRef"
                                type="left"
                                :tableData="tableData"
                                :expandRowKeys="expandRowKeys"
                                @loadMaterial="loadMaterial"
                                @handleExpandChange="handleExpandChange"
                                @handleScroll="handleScroll"
                            />
                        </div>
                    </div>
                    <div class="bomTableWrapper">
                        <el-tooltip effect="dark" :content="materialName.material2" placement="top">
                            <div class="bomTableTitle">{{ materialName.material2 }}</div>
                        </el-tooltip>
                        <div class="leftBom">
                            <RightBomTable
                                ref="RightBomTableRef"
                                type="right"
                                :tableData="tableData"
                                :expandRowKeys="expandRowKeys"
                                @loadMaterial="loadMaterial"
                                @handleExpandChange="handleExpandChange"
                                @handleScroll="handleScroll"
                            />
                        </div>
                    </div>
                </div>
                <div class="differenceItemsList">
                    <DifferenceItemsList ref="DifferenceItemsListRef" :tableData="differenceTableData" />
                </div>
            </div>
        </div>

        <!-- <template #footer>
      <el-button
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button
        type="primary"
        @click="dialog.visible=false"
        size="small"
      >{{ t("dashboardPage.cancel") }}</el-button>
    </template> -->
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue"
import LeftBomTable from "./bomTable.vue"
import RightBomTable from "./bomTable.vue"
import DifferenceItemsList from "./differenceItemsList.vue"
import { getBomCompareInfo, exportBomCompareInfo } from "@/api/bomManage/bomCompare"
import { formatDateTime } from "@/utils"
import { downloadFile } from "@/utils/exportTemplate"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
    dialog: {
        type: Object,
        default: () => ({
            visible: false,
            title: "",
            params: {
                // 参数
                partNumber: "", // 物料1编号
                comparePartNumber: "", // 物料2编号
                partOid: "", // 物料1oid
                comparePartOid: "", // 物料2oid
                version: "", // 比较版本（0-最新版本，1-已完成
                type: "", // 比较类型（0-比较件号，1、比较历史版本，3、比较选中项
                dimension: "", // 比较维度（0-位置号比较，1-数量 物料号
                displayMethod: "" // 显示方式（0-显示全部，1-显示差异
            }
        })
    },
    materialName: {
        type: Object,
        default: {
            material1: "",
            material2: ""
        }
    }
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
const instance: any = getCurrentInstance()
const loading = ref(false)
//#endregion

//#region 比较结果
const frontEndID = ref(0) // 唯一id
// 获取比较结果
const tableData = ref<any[]>([]) // 比较结果
const expandRowKeys = ref<any[]>([]) // 展开行
const differenceTableData = ref<any[]>([]) // 差异项
const getResult = () => {
    console.log("getResult", props.dialog.params)
    const params = props.dialog.params
    // 校验参数
    if (!params.partOid) {
        ElMessage.error("物料1版本对应物料oid异常！")
        return false
    }
    if (!params.comparePartOid) {
        ElMessage.error("物料2版本对应物料oid异常！")
        return false
    }

    loading.value = true
    getBomCompareInfo(params)
        .then((data) => {
            // data.data[0].type = '差异项'

            tableData.value = formatData(data.data)
        })
        .finally(() => (loading.value = false))
}
getResult()
// 懒加载下层比较结果
const loadMaterial = (tree: any, treeNode?: unknown) => {
    console.log("loadMaterial", tree, treeNode)
    const params = {
        ...props.dialog.params,
        partNumber: tree.childNumber, // 物料1编号
        comparePartNumber: tree.compareChildNumber, // 物料2编号
        partOid: tree.partOid, // 物料1oid
        comparePartOid: tree.comparePartOid // 物料2oid
    }
    getBomCompareInfo(params).then((data) => {
        tree.leaf = false
        tree.children = formatData(data.data)
        expandRowKeys.value.push(tree.frontEndID)
    })
}
// 展开回调
const handleExpandChange = (row: any, expanded: any) => {
    console.log("handleExpandChange", row, expanded)
    if (expanded) {
        // 添加id
        expandRowKeys.value.push(row.frontEndID)
    } else {
        // 删除id
        for (let i = 0; i < expandRowKeys.value.length; i++) {
            if (expandRowKeys.value[i] === row.frontEndID) {
                expandRowKeys.value.splice(i, 1)
                expandRowKeys.value = [...expandRowKeys.value]
                return true
            }
        }
    }
}
// 格式化数据
const formatData = (list: any[]) => {
    const arr = list || []
    if (arr.length) {
        arr.forEach((ele: any) => {
            ele.frontEndID = frontEndID.value++ + ""
            if (ele.type === "差异项") differenceTableData.value.push(ele)
            // 判断物料是否为空
            if (!ele.childNumber || !ele.partOid) {
                ele.noMaterial1 = true
            }
            if (!ele.compareChildNumber || !ele.comparePartOid) {
                ele.noMaterial2 = true
            }
        })
    }
    return arr
}
// 滚动回调
const handleScroll = (options: { type: string; top: number; left: number }) => {
    // console.log('handleScroll', options);
    switch (options.type) {
        case "left":
            instance.refs.RightBomTableRef?.scrollTo(options)
            break
        case "right":
            instance.refs.LeftBomTableRef?.scrollTo(options)
            break

        default:
            break
    }
}

// 导出BOM到Excel
const elementLoadingText = ref<string>("")
const handleExportExcelBtn = () => {
    loading.value = true
    elementLoadingText.value = "正在导出到Excel，请稍等..."
    const params = props.dialog.params
    exportBomCompareInfo(params)
        .then((data) => {
            const filename = `BOM比较结果_${formatDateTime(new Date(), "YYYY-MM-DD")}`
            downloadFile(data, filename, "xls")
        })
        .finally(() => {
            loading.value = false
            elementLoadingText.value = ""
        })
}
//#endregion

// 提交
const submit = () => {
    emits("handleEditSuccess")
}
</script>
<style lang="scss" scoped>
.bomCompareResultDialog {
    height: calc(90vh - 60px);
    display: flex;
    flex-direction: column;
    gap: 6px;
    .bomTree {
        height: 0;
        flex: 1;
        display: flex;
        .bomTableWrapper {
            width: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            .bomTableTitle {
                // height: 32px;
                line-height: 1.5;
                padding: 4px 8px;
                border: 1px solid #ebeef5;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .leftBom,
            .rightBom {
                flex: 1;
                height: 0;
            }
        }
    }
    .differenceItemsList {
        height: 240px;
    }
}
</style>
