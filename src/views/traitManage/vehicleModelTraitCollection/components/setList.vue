<template>
  <div class="sf-container-main-content">
    <pt-table
      v-loading="loading"
      ref="PtTableRef"
      :locale="locale"
      :tableColumns="tableColumns"
      :tableEditConfig="tableEditConfig"
      :paginationConfig="paginationConfig"
      :menuConfig="menuConfig"
      :data="tableData"
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
            type="primary"
            size="small"
            icon="Plus"
            @click="goAdd_set"
          >{{ t('vehicleModelTraitCollectionPage.addFeatureSet') }}</el-button>
          <el-button
            icon="Refresh"
            size="small"
            @click="getList"
          >{{ t('dashboardPage.refresh') }}</el-button>
        </span>
      </template>
      <!-- 自定义列模板插槽 -->
      <template #head-icon="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template>
      <template #col-icon="{ row }">
        <ObjectIcon
          objectType="OptionSet"
          style="top: 3px;"
        />
        {{ row.name }}
      </template>
      <!-- 右键菜单 -->
      <template #slot-menu="{ row }">
        <!-- <pt-menu-li
          :disabled="!row || row.checkOut"
          @click="check('out', row.oid, 'OptionSet')"
        >{{ t('dashboardPage.checkOut') }}</pt-menu-li>
        <pt-menu-li
          :disabled="!row || !(row.checkOut && row.checkUser)"
          @click="check('in', row.oid, 'OptionSet')"
        >{{ t('dashboardPage.checkIn') }}</pt-menu-li>
        <pt-menu-li
          :disabled="!row || !(row.checkOut && row.checkUser)"
          @click="goEdit_set(row)"
        >{{ t('dashboardPage.edit') }}</pt-menu-li>
        <pt-menu-li
          :disabled="!row || (row.checkOut && row.checkUser)"
          @click="goDel(row)"
        >{{ t('dashboardPage.delete') }}</pt-menu-li> -->
        <!-- <pt-menu-li
          :disabled="!row || !(row.checkOut && row.checkUser)"
          @click="goSaveAs_set(row)"
        >{{ t('vehicleModelTraitCollectionPage.saveAs') }}</pt-menu-li> -->
        <li @click="goEdit_set(row)">{{ t('dashboardPage.edit') }}</li>
        <li @click="goDel(row)">{{ t('dashboardPage.delete') }}</li>
        <li @click="goSaveAs_set(row)">{{ t('vehicleModelTraitCollectionPage.saveAs') }}</li>
      </template>
    </pt-table>

    <!-- 特征集- 新增/编辑弹窗 -->
    <EditSetDialog
      v-if="editSetDialog.visible"
      :dialog="editSetDialog"
      :topObject="topObject"
      @handleEditSuccess="handleEditSuccess_set"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { filterArray, resetFilterValue } from "@/utils/index"
import EditSetDialog from "./editSetDialog.vue"
import ObjectIcon from "@/views/traitManage/enterpriseTraitLibrary/components/objectIcon.vue";
import { getOptionSets, delOptionSet } from "@/api/traitManage/vehicleModelTraitCollection";
import { checkOutObject, checkInObject } from "@/api/bomManage/productBom/index"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  topObject: {
    type: Object,
    default: {}
  },
})
const loading = ref(false)
const emits = defineEmits(["handleRowClick"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])
// 获取列表
const getList = () => {
  const oid = props.topObject.oid
  getOptionSets().then(data => {
    sourceData.value = data.data || []
    resetFilterValue(filterValue)
    search()
    if (tableData.value[0]) handleRowClick(tableData.value[0])
  })
}
getList()

//#region el-table默认参数
// 方法
const handleRowClick = (row: any) => {
  console.log('row-click', row);
  setCurrent(row)
  emits('handleRowClick', row)
}
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value);
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
  colSetShow: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
    prop: "name",
    label: computed(() => t("vehicleModelTraitCollectionPage.name")) as any,
    slot: 'icon',
    // showOverflowTooltip: true,
    show: true,
  },
])
const goDel = (row: any) => {
  console.log('删除', row);
  ElMessageBox.confirm(t('dashboardPage.deleteSelectedData'), t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t('dashboardPage.confirm'),
    cancelButtonText: t('dashboardPage.cancel'),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    delOptionSet({ oid: row.oid }).then((data) => {
      ElMessage.success(t("vehicleModelTraitCollectionPage.deleteSuccess"))
      getList()
    })
  })
}
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
  show: false,
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: true
})
//#endregion

//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
  tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region 列表数据检入/检出
// 检入/检出
type CheckType = (type: string, ObjectOid: string, ObjectType: string) => void
const check: CheckType = (type, ObjectOid, ObjectType) => {
  let params = { ObjectOid, ObjectType }
  if (type === 'in') {
    // 检入
    checkInObject(params).then(data => {
      getList()
    })
  } else if (type === 'out') {
    // 检出
    checkOutObject(params).then(data => {
      getList()
    })
  }
}
//#endregion

//#region 车型特征集 - 新增/编辑弹窗
const editSetDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ''
})
// 新建车型特征集
const goAdd_set = () => {
  console.log('goAdd_set');
  Object.assign(editSetDialog, {
    visible: true,
    title: t('vehicleModelTraitCollectionPage.addModelFeatureSet'),
    row: null,
    type: 'add'
  })
}
// 编辑车型特征集
const goEdit_set = (row: any) => {
  console.log('goEdit_set', row);
  Object.assign(editSetDialog, {
    visible: true,
    title: t('vehicleModelTraitCollectionPage.editModelFeatureSet'),
    row,
    type: 'edit'
  })
}
// 另存为车型特征集
const goSaveAs_set = (row: any) => {
  console.log('goSaveAs_set', row);
  Object.assign(editSetDialog, {
    visible: true,
    title: t('vehicleModelTraitCollectionPage.saveAsModelFeatureSet'),
    row,
    type: 'saveAs'
  })
}
// 车型特征集编辑成功回调
const handleEditSuccess_set = (data?: any) => {
  const row = editSetDialog.row
  console.log('handleEditSuccess_set', row);
  getList()
  Object.assign(editSetDialog, {
    visible: false,
    title: "",
    row: null,
    type: ''
  })
}
//#endregion

// 向外暴露方法
defineExpose({ getList })

</script>

<style lang="scss" scoped>
</style>

