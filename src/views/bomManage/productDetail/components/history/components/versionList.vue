<template>
    <div class="productList">
        <pt-table
            v-loading="loading"
            ref="PtTableRef"
            :tableColumns="tableColumns"
            :tableEditConfig="tableEditConfig"
            :paginationConfig="paginationConfig"
            :menuConfig="menuConfig"
            :data="tableData"
            :locale="locale"
            border
            highlight-current-row
            size="small"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <!-- 表格编辑插槽 -->
            <template #slot-edit>
                <span class="table-edit">
                    <el-button
                      v-if="data.type==='WTPart'"
                      type="primary"
                      size="small"
                      @click="goBOMCompare"
                    >{{ t("productDetailPage.versionCompare") }}</el-button>
                    <el-button size="small" icon="Refresh" @click="getList">{{
                        t("productDetailPage.refresh")
                    }}</el-button>
                </span>
            </template>
            <!-- 自定义列模板插槽 -->
            <template #col-icon>
                <el-icon>
                    <Tools v-if="data.type === 'WTPart'" />
                    <Document v-else-if="data.type === 'WTDocument'" />
                </el-icon>
            </template>
        </pt-table>

        <!-- BOM比较设置 - 弹窗 -->
        <BomCompareSetDialog
            v-if="bomCompareSetDialog.visible"
            :dialog="bomCompareSetDialog"
            @handleEditSuccess="handleEditSuccess_compareSet"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { getPartHistoryRecord, getDocumentHistoryRecord } from "@/api/bomManage/productDetail/index"
import { useRouter } from "vue-router"
import BomCompareSetDialog from "@/views/bomManage/bomCompare/components/bomCompareSetDialog.vue"
import { getNameById } from "@/assets/common/select-list"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { useI18n } from "vue-i18n"

const { t, locale } = useI18n()

//#region 参数和方法
const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            oid: "",
            type: ""
        })
    },
})
const router = useRouter()
const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
// 获取列表
const getList = () => {
    if (!props.data.oid) {
        ElMessage.error(t("productDetailPage.versionHistoricalRecord") + "-" + t("productDetailPage.dataError"))
        return
    }
    if (props.data.type === "WTPart") {
        // 部件
        getList_part()
    } else if (props.data.type === "WTDocument") {
        // 文档
        getList_doc()
    }
}
// 部件 - 历史记录
const getList_part = () => {
    loading.value = true
    const params = {
        PartOid: props.data.oid
    }
    getPartHistoryRecord(params).then((data) => {
        tableData.value = data.data || []
    })
    .finally(() => loading.value = false)
}
// 文档 - 历史记录
const getList_doc = () => {
    loading.value = true
    const params = {
        Oid: props.data.oid
    }
    getDocumentHistoryRecord(params)
        .then((data) => {
            tableData.value = data.data || []
        })
        .catch((err) => {
            console.log(err)
            tableData.value = []
        })
        .finally(() => {
            loading.value = false
        })
}

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
}
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
    console.log(multipleSelection.value)
}
// 事件
const setCurrent = (row?: any) => {
    PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: true
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true
    },
    {
        width: "36",
        slot: "icon",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "productOid",
        label: computed(() => t("productDetailPage.organizationId")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "version",
        label: computed(() => t("productDetailPage.version")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "cnState",
        label: computed(() => t("productDetailPage.status")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "updater",
        label: computed(() => t("productDetailPage.mender")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "updateTime",
        label: computed(() => t("productDetailPage.lastModifyTime")) as any,
        headerAlign: "center",
        width: "160",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.accredit")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.frontTask")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    },
    {
        prop: "value",
        label: computed(() => t("productDetailPage.remark")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true
    }
])
const goEdit = (row: any) => {
    console.log("编辑", row)
}
const goDel = (row: any) => {
    console.log("删除", row)
}
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: false
})
const goCopy = (row: any) => {
    console.log("复制", row)
}
const goDetail = (row: any) => {
    console.log("查看详情", row)
}
//#endregion

//#endregion

//#region BOM比较设置 - 弹窗
const bomCompareSetDialog = reactive<any>({
    visible: false,
    title: "BOM比较设置",
    material1: null,
    material2: null,
})
// 格式化物料
const formatData_material = (material: any) => {
  const versionArr = material.version?.split('.') || []
  return {
    oid: material.oid,
    number: material.number,
    name: material.name,
    typeName: getNameById(option_type.value, material.materialType, {
      value: 'code',
      label: 'codeListNameC'
    }),
    version: versionArr[0] || '',
    iteration: versionArr[1] || '',
  }
}
// BOM比较
const goBOMCompare = () => {
    console.log('goBOMCompare', multipleSelection.value);
    let material1, material2
    if (multipleSelection.value.length === 1) {
      material1 = formatData_material(multipleSelection.value[0])
      material2 = formatData_material(multipleSelection.value[0])
    } else if (multipleSelection.value.length === 2) {
      material1 = formatData_material(multipleSelection.value[0])
      material2 = formatData_material(multipleSelection.value[1])
    } else {
      ElMessage.warning('请选择一个或两个物料！')
      return false
    }
    Object.assign(bomCompareSetDialog, {
        visible: true,
        material1, material2
    })
}
// BOM比较设置回调
const handleEditSuccess_compareSet = () => {
    console.log("handleEditSuccess_compareSet")
    Object.assign(bomCompareSetDialog, {
        visible: false,
        material1: null,
        material2: null,
    })
}
//#endregion

//#region 字典数据
const loading_select = ref(false)
const option_type = ref<any[]>([])  // 物料类型
loading_select.value = true
getDictionarySelect({ codes: "MATERIAL_TYPE" }).then(data => {
  option_type.value = data.data.MATERIAL_TYPE || []
})
.finally(() => loading_select.value = false)
//#endregion

// 向外暴露方法
defineExpose({ getList })
</script>

<style lang="scss" scoped></style>
