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
  >
    <!-- 表格编辑插槽 -->
    <template #slot-edit>
      <span v-if="!onlyRead" class="table-edit">
        <el-button
          type="primary"
          size="small"
          icon="Plus"
          @click="goAdd_choice"
        >{{ t('enterpriseTraitLibraryPage.addFeatureValue') }}</el-button>
        <el-button
          type="primary"
          size="small"
          icon="Plus"
          @click="goBatchAdd_choice"
        >批量新建特征值</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!chooseRow"
          @click="goEdit_choice(chooseRow)"
        >特征值替换</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!chooseRow"
          @click="goDel(chooseRow)"
        >{{ t("dashboardPage.delete") }}</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!chooseRow"
          @click="setDefaultChoice(chooseRow)"
        >设为默认值</el-button>
        <el-button
          type="primary"
          size="small"
          @click="handleMoveUpDownBtn"
          :disabled="!tableData.length"
        >保存</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!chooseRow"
          @click="goSetOrder('up')"
        >上移</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!chooseRow"
          @click="goSetOrder('down')"
        >下移</el-button>
      </span>
    </template>
    <!-- 自定义列模板插槽 -->
    <template #head-search="{ column }">
      <HeadFilter v-model="filterValue[column.property]" @search="search" :name="column.label" />
    </template>
    <template #col-choiceType="{ row }">
      <span>特征值</span>
    </template>
    <template #col-isDefault="{ row }">
      <span v-if="row.isDefault === true">是</span>
      <span v-else-if="row.isDefault === false">否</span>
    </template>
    <!-- 右键菜单 -->
    <template #slot-menu="{ row }">
      <!-- <li @click="goDetail(row)">{{ t('dashboardPage.details') }}</li> -->
      <li @click="goEdit_choice(row)">{{ t('dashboardPage.edit') }}</li>
      <li @click="goDel(row)">{{ t('dashboardPage.delete') }}</li>
    </template>
  </pt-table>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import HeadFilter from "@/views/bomList/components/headFilter.vue"
import { addOrUpdateChoice, choiceSetOrderSave } from "@/api/traitManage/enterpriseTraitLibrary";
import { filterArray, resetFilterValue, setArrayEleOrder } from "@/utils/index"
import emitter from "@/utils/mitt"
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
    list: {
        type: Array,
        default: []
    },
    onlyRead: {
        type: Boolean,
        default: false
    },
    optionRow: {
        type: Object,
        default: {}
    },
})
const emits = defineEmits(["resetList"])
const loading = ref(false)
const { t, locale } = useI18n()
//#endregion

//#region 表头搜素
const filterValue = reactive<any>({})
const sourceData = ref<any[]>([])
const search = () => {
    tableData.value = filterArray(filterValue, sourceData.value)
}
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])
const getList = () => {

}
// 新建特征
const goAdd_choice = () => {
  emitter.emit('enterpriseTraitLibrary_goAdd_choice', props.optionRow)
}
const goBatchAdd_choice = () => {
  emitter.emit('enterpriseTraitLibrary_goBatchAdd_choice', props.optionRow)
}
const goDetail = (row: any) => {
  emitter.emit('enterpriseTraitLibrary_goDetail', row)
}
const goEdit_choice = (row: any) => {
  emitter.emit('enterpriseTraitLibrary_goEdit_choice', row)
}
const goDel = (row: any) => {
  emitter.emit('enterpriseTraitLibrary_goDel', row)
}
// 设为默认值
const setDefaultChoice = (row: any) => {
  loading.value = true
  const params = {
    pid: row.pid || '',
    oid: row.oid || '',
    desc: row.desc || '',
    name: row.name || '',
    isDefault: true
  }
  addOrUpdateChoice(params).then((res: any) => {
    if (res.resultCode == 200) {
      ElMessage.success('设置默认值成功！')
      emits('resetList')
    } else {
      ElMessage.error(res.message || t("pdmServers.interfaceError"))
    }
  })
  .finally(() => loading.value = false)
}
// 保存上移下移
const handleMoveUpDownBtn = async () => {
  try {
    loading.value = true
    const choiceList = tableData.value.map((item:any) => {
      return {
        oid: item.oid,
        name: item.name,
        number: item.number
      }
    })
    const params: {
      optionOid: string
      optionNumber: string
      optionName: string
      choiceList: any[]
    } = {
      optionOid: props.optionRow.oid,
      optionNumber: props.optionRow.number,
      optionName: props.optionRow.name,
      choiceList
    }
    console.log("params: ", params)
    const { message } = await choiceSetOrderSave(params) as any
    ElMessage({
      type: "success",
      message,
      center: true
    })
    emits('resetList')
  } catch (error) {
    console.log(error)
  } finally{
    loading.value = false
  }
}

// 设置顺序
const setOrder = (type: string, index: number, list: any[]) => {
  setArrayEleOrder(type, index, list, 'configurationSeq')
}
// 处理上移/下移
const goSetOrder = (type: string) => {
  console.log('goSetOrder', chooseRow.value);
  for (let i = 0; i < tableData.value.length; i++) {
    const ele = tableData.value[i];
    if (ele === chooseRow.value) {
      setOrder(type, i, tableData.value)
      return true
    }
  }

}
watch(
  () => props.list,
  (val: any[]) => {
    chooseRow.value = null
    multipleSelection.value = []
    if (Object.prototype.toString.call(val) === '[object Array]') {
      sourceData.value = JSON.parse(JSON.stringify(val))
    } else {
      sourceData.value = []
    }
    resetFilterValue(filterValue)
    search()
  },
  { immediate: true }
)

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log('row-click', row);
  setCurrent(row)
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
  colSetShow: true
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  // {
  //   type: "selection",
  //   width: "32",
  //   show: true,
  // },
  {
      type: 'index',
      label: "序号",
      width: '55',
      headerAlign: "center",
      // showOverflowTooltip: true,
      show: true,
  },
  // {
  //   prop: "number",
  //   label: computed(() => t("traitDetailPage.number")) as any,
  //   slot: 'search',
  //   sortable: true,
  //   width: '120',
  //   showOverflowTooltip: true,
  //   show: true,
  //   headerAlign: "center"
  // },
  {
    prop: "name",
    label: computed(() => t("traitDetailPage.name")) as any,
    width: '200',
    slot: 'search',
    // sortable: true,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "simpleName",
    label: '简化名称',
    slot: 'search',
    // sortable: true,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "desc",
    label: computed(() => t("traitDetailPage.explain")) as any,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  {
    prop: "isDefault",
    label: "是否默认值",
    width: '82',
    // sortable: true,
    // showOverflowTooltip: true,
    show: true,
    slot: "isDefault",
    headerAlign: "center"
  },
  {
    prop: "orange",
    label: '组织',
    // sortable: true,
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center"
  },
  // {
  //   prop: "choiceType",
  //   label: computed(() => t("traitDetailPage.type")) as any,
  //   // sortable: true,
  //   // showOverflowTooltip: true,
  //   show: true,
  //   slot: 'choiceType',
  //   headerAlign: "center"
  // },
])
const goEdit = (row: any) => {
  console.log('编辑', row);
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

// 向外暴露方法
defineExpose({ getList })

</script>

<style lang="scss" scoped>
</style>

