<template>
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
      @sort-change="handleSortChange"
  >
      <!-- 表格编辑插槽 -->
      <template #slot-edit>
          <span v-if="!onlyRead" class="table-edit">
              <el-button
                v-if="type!=='choose'"
                type="primary"
                size="small"
                @click="goDetail(multipleSelection[0])"
              >浏览</el-button>
              <el-button
                type="primary"
                size="small"
                @click="goInsert_part"
              >添加</el-button>
              <el-button
                v-if="type!=='choose'"
                type="primary"
                size="small"
                @click="goRemove(multipleSelection)"
              >移除</el-button>
          </span>
      </template>
      <!-- 自定义列模板插槽 -->
      <template #head-search="{ column }">
        <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
      </template>
      <!-- <template #head-cropping="{ column }">
        <el-checkbox
          v-model="isCheckAll"
          size="small"
          @change="checkAll"
        />
        {{ column.label }}
      </template> -->
      <template #col-type="{ row }">
        <div>{{ getNameById(option_type, row.type) }}</div>
      </template>
      <template #col-cropping="{ row, index }">
          <span v-if="onlyRead">{{ row.isCropping }}</span>
          <el-checkbox
            v-else
            v-model="row.isCropping"
            label=""
            true-value="是"
            false-value="否"
            size="small"
            @change="(val: any) => handleCheckboxChange(val, row)"
            @click.stop
          />
        </template>
  </pt-table>

  <!-- 添加物料 - 弹窗 -->
  <dialogFrame :title="materialDialog.title" v-model:visible="materialDialog.visible" :footer="false" width="94%">
      <MaterialDialog
          v-if="materialDialog.visible"
          v-model:visible="materialDialog.visible"
          type="chooseRows"
          :dialog="materialDialog"
          @confirm-success="handleConfirmSuccess_material"
      />
  </dialogFrame>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import { useRouter } from "vue-router"
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import MaterialDialog from "@/views/productMange/materiel/components/materialDialog.vue"
import { MaterialInterface } from "@/interface/materiel"
import { filterArray, resetFilterValue, goSort } from "@/utils/index"
import { getCandidateListOfPart, addCandidate, delCandidate } from "@/api/configureManage/productConfigure";
import { setIsCropping, getIsCropping } from "@/api/bomManage/productBom/index"
import { getDictionarySelect } from "@/api/system/dataDictionary"
import { getNameById } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  objectRow: {
    type: Object,
    default: {}
  },
  type: {
    type: String,
    default: ''
  },
  onlyRead: {
      type: Boolean,
      default: false
  }
})
const emits = defineEmits(["goDel_option", "startLoading", "endLoading"])
const router = useRouter()
const { t, locale } = useI18n()
const loading = ref(false)
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const chooseRow = ref()
const sortParams = reactive({
    sortBy: "",
    sorted: "",
    sortType: ""
})

//#region 增、删、改、查
// 获取列表
const getList = () => {
  loading.value = true
  emits('startLoading')
  getCandidateListOfPart({ oid: props.objectRow.oid }).then(data => {
    sourceData.value = data.data || []
    resetFilterValue(filterValue)
    search()
  })
  .finally(() => {
    loading.value = false
    emits('endLoading')
  })
}
getList()
// 移除
const goRemove = (rows: any[]) => {
  if (!rows.length) {
    ElMessage.warning('请选择一行数据！')
    return false
  }
  ElMessageBox.confirm('是否确认移除该物料？', t("dashboardPage.messageBoxTitle"), {
    confirmButtonText: t("dashboardPage.confirm"),
    cancelButtonText: t("dashboardPage.cancel"),
    confirmButtonClass: "confirmButton",
    cancelButtonClass: "cancelButton",
    type: "warning",
    center: true
  }).then(() => {
    loading.value = true
    const params = {
      oid: props.objectRow.oid,
      candidateOids: rows.map(item => {
        return { oid: item.oid }
      })
    }
    delCandidate(params).then((data) => {
      ElMessage.success('移除成功！')
      getList()
    })
    .catch(() => loading.value = false)
  })
}
// 全选/全不选
const isCheckAll = ref(false)
const checkAll = (val: any) => {
  const rows = tableData.value.map(item => {
    return {
      ...item,
      view: isCheckAll.value
    }
  })
  tableData.value.forEach(ele => {
    ele.view = isCheckAll.value
  })
  handleCheckboxChange(val, rows)
}
// 是否裁剪回调
const handleCheckboxChange = (val: boolean, row: any) => {
  console.log('handleCheckboxChange', val, row);
  loading.value = true
  const params = {
    LinkOid: row.LinkOid,
    isCropping: val,
  }
  setIsCropping(params).then(data1 => {
    ElMessage.success('修改成功！')
    getIsCropping({ LinkOid: row.LinkOid }).then(data2 => {
      row.isCropping = data2.data.isCropping
    })
    .finally(() => loading.value = false)
  }).catch(err => loading.value = false)
}
// 跳转物料详情
const goDetail = (row: any) => {
  if (multipleSelection.value.length !== 1) {
    ElMessage.warning('请选择一行数据！')
    return false
  }
  router.push({
      path: `/product/bomDetail/${row.oid}`,
      query: { oid: row.oid, type: "WTPart", tagTitle: `${row.number}_${row.name}_${row.version}` }
  })
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
    console.log("row-click", row)
    setCurrent(row)
}
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value);
}
const handleSortChange = (data: { column: any; prop: string; order: any }) => {
  console.log("handleSortChange", data)
  sortParams.sortBy = data.prop
  sortParams.sorted = data.order
  search()
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
    colSetShow: true,
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        type: "selection",
        width: "32",
        show: true,
        disabled: props.type === 'choose' || props.onlyRead
    },
    {
        type: 'index',
        label: "序号",
        width: '55',
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
    },
    {
        label: '类型',
        width: "80",
        showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
        sortable: 'custom',
        slot: 'type'
    },
    {
        prop: "number",
        label: '编码',
        width: "120",
        // showOverflowTooltip: true,
        show: true,
        slot: 'search',
        headerAlign: "center",
        sortable: 'custom'
    },
    {
        prop: "name",
        label: '名称',
        // showOverflowTooltip: true,
        show: true,
        slot: 'search',
        headerAlign: "center",
        sortable: 'custom'
    },
    {
        prop: "materialSymbol",
        label: '代号',
        minWidth: "75",
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
        sortable: 'custom'
    },
    // {
    //     prop: "version",
    //     label: '版本',
    //     width: "90",
    //     minWidth: "75",
    //     showOverflowTooltip: true,
    //     show: true,
    //     headerAlign: "center",
    //     sortable: 'custom'
    // },
    // {
    //     prop: "state",
    //     label: "生命周期",
    //     width: "160",
    //     minWidth: "105",
    //     showOverflowTooltip: true,
    //     show: true,
    //     headerAlign: "center",
    //     sortable: 'custom'
    // },
    {
        label: "是否裁剪",
        width: "120",
        minWidth: "105",
        fixed: props.onlyRead?false:'right',
        // showOverflowTooltip: true,
        show: true,
        slot: 'cropping',
        headerAlign: "center",
        disabled: props.type === 'choose',
        sortable: 'custom'
    },
])
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
//#endregion

//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
    goSort(sortParams, tableData.value)
}
//#endregion

//#region 添加物料 - 弹窗
const materialDialog = reactive<any>({
  visible: false,
  title: '选择物料',
  loading: false
})
// 添加物料
const goInsert_part = () => {
  console.log("添加物料")
  materialDialog.visible = true
}
// 添加物料回调
const handleConfirmSuccess_material = (rows: MaterialInterface[]) => {
  materialDialog.loading = true
  const params = {
    oid: props.objectRow.oid,
    candidateOids: rows.map(item => {
      return { oid: item.oid }
    })
  }
  addCandidate(params).then(data => {
    ElMessage.success('添加成功！')
    getList()
    materialDialog.visible = false
  })
  .finally(() => materialDialog.loading = false)
}
//#endregion

//#region 字典数据
const loading_select = ref(false)
const option_type = ref<any[]>([])  // 物料类型
loading_select.value = true
getDictionarySelect({ codes: "MATERIAL_TYPE" }).then(data => {
  option_type.value = (data.data.MATERIAL_TYPE || []).map((item: any) => {
    return {
      id: item.code,
      name: item.codeListNameC
    }
  })
})
.finally(() => loading_select.value = false)
//#endregion

defineExpose({
  getList,
  chooseRow,
  multipleSelection,
})
</script>

<style lang="scss" scoped></style>
