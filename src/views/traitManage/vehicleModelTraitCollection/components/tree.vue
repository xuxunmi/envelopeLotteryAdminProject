<template>
  <div class="sf-container-main-content">
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
        :tree-props="{ children: 'choice' }"
        border
        highlight-current-row
        size="small"
        @row-click="handleRowClick"
        @expand-change="handleExpandChange"
    >
        <!-- 表格编辑插槽 -->
        <template #slot-edit>
            <span class="table-edit">
              <el-button
                size="small"
                :disabled="!topObject.oid"
                @click="getList"
              >{{ t('dashboardPage.refresh') }}</el-button>
              <el-button
                type="primary"
                size="small"
                :disabled="!topObject"
                @click="goEdit_manger"
              >{{ t('vehicleModelTraitCollectionPage.manger') }}</el-button>
              <el-button
                type="primary"
                size="small"
                :disabled="!(chooseRow && chooseRow.type==='Option')"
                @click="goRemove_option(chooseRow)"
              >移除特征</el-button>
              <el-button
                type="primary"
                size="small"
                @click="setFeatureOrder"
              >设置特征顺序</el-button>
            </span>
        </template>
        <!-- 自定义列模板插槽 -->
        <template #head-search="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #head-icon="{ column }">
            <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
        </template>
        <template #col-icon="{ row }">
            <ObjectIcon
              :objectType="row.type"
              style="top: 3px;"
            />
            {{ row.name }}
        </template>
    </pt-table>

    <!-- 管理特征 - 弹窗 -->
    <MangerOptionDialog
      v-if="mangerOptionDialog.visible"
      :dialog="mangerOptionDialog"
      @handleEditSuccess="handleEditSuccess_manger"
    />
    <!-- 设置特征顺序 - 弹窗 -->
    <SetFeatureOrderDialog
      v-if="setFeatureOrderDialog.visible"
      :dialog="setFeatureOrderDialog"
      :topObject="topObject"
      :optionList="optionList"
      @handleEditSuccess="handleEditSuccess_order"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, reactive } from "vue"
import { useRouter } from "vue-router"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import ObjectIcon from "@/views/traitManage/enterpriseTraitLibrary/components/objectIcon.vue";
import MangerOptionDialog from "./mangerOptionDialog.vue"
import SetFeatureOrderDialog from "./setFeatureOrderDialog.vue"
import { getOptionByOptionSet } from "@/api/traitManage/vehicleModelTraitCollection";
import { filterArray, resetFilterValue, recursionArray } from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  topObject: {
    type: Object,
    default: {}
  },
})
const router = useRouter()
const emits = defineEmits(["handleRowClick"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
let frontEndID = 1 // 唯一id
const expandRowKeys = ref<any>([])

// 获取列表
const getList = () => {
  console.log('topObject', props.topObject);
  tableData.value = []
  expandRowKeys.value = ['0']
  frontEndID = 1
  let params = {
    oid: props.topObject.oid
  }
  getOptionByOptionSet(params).then((data) => {
    // console.log(data)
    recursionArray(data.data, (item: any, i: any) => {
      item.frontEndID = "" + frontEndID++ // 生成唯一id
      if (item.expanded) expandRowKeys.value.push(item.frontEndID) // 默认展开行
    })
    const list = [{
      ...props.topObject,
      frontEndID: '0',
      type: 'OptionSet',
      choice: data.data || [],
    }]
    sourceData.value = list || []
    resetFilterValue(filterValue)
    search()
    setTimeout(() => handleRowClick(tableData.value[0]), 1)
  })
}
// 刷新列表
const onlyKey = ref(1)
const refresh = () => {
  Object.keys(filterValue).forEach((key) => (filterValue[key] = ""))
  search()
  nextTick(() => onlyKey.value++)
}
// 移除特征
const goRemove_option = (row: any) => {
  ElMessageBox.confirm('是否确认移除该特征？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t('dashboardPage.confirm'),
    cancelButtonText: t('dashboardPage.cancel'),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    // delOptionSet({ oid: row.oid }).then((data) => {
    //   ElMessage.success(t("vehicleModelTraitCollectionPage.deleteSuccess"))
    //   getList()
    // })
  })
}
//#region el-table默认参数
// 方法
const handleRowClick = (row: any) => {
    console.log("row-click", row)
    setCurrent(row)
    emits('handleRowClick', row)
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
    chooseRow.value = row
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
        prop: "name",
        label: computed(() => t("vehicleModelTraitCollectionPage.featureName")) as any,
        minWidth: "180",
        // showOverflowTooltip: true,
        show: true,
        slot: "icon"
    },
    {
        prop: "number",
        label: computed(() => t("vehicleModelTraitCollectionPage.featureNumber")) as any,
        minWidth: "160",
        // showOverflowTooltip: true,
        show: true,
        slot: "search"
    },
])
const goEdit = (row: any) => {
    console.log("编辑", row)
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
const goCopy = (row: any) => {
    console.log("复制", row)
}
//#endregion

//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
  tableData.value = filterArray(filterValue, sourceData.value, { child: 'choice' })
}
//#endregion

//#region 管理特征 - 弹窗
const mangerOptionDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ''
})
// 管理特征
const goEdit_manger = () => {
  console.log('goEdit_manger', props.topObject);
  Object.assign(mangerOptionDialog, {
    visible: true,
    title: '管理特征',
    row: props.topObject,
    type: 'edit'
  })
}
// 车型特征集编辑成功回调
const handleEditSuccess_manger = () => {
  const row = mangerOptionDialog.row
  console.log('handleEditSuccess_manger', row);
  getList()
  Object.assign(mangerOptionDialog, {
    visible: false,
    title: "",
    row: null,
    type: ''
  })
}
//#endregion

//#region 设置特征顺序 - 弹窗
const optionList = ref()
const setFeatureOrderDialog = reactive<any>({
    visible: false,
    title: "",
})
// 设置特征顺序
const setFeatureOrder = () => {
  console.log('setFeatureOrder');
  optionList.value = tableData.value[0]?.choice || []
  Object.assign(setFeatureOrderDialog, {
    visible: true,
    title: '设置特征顺序',
  })
}
// 车型特征集编辑成功回调
const handleEditSuccess_order = () => {
  console.log('handleEditSuccess_order');
  getList()
  Object.assign(setFeatureOrderDialog, {
    visible: false,
    title: "",
  })
}
//#endregion

defineExpose({
    getList,
})

</script>

<style lang="scss" scoped></style>
