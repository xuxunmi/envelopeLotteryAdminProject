<template>
  <pt-table
    ref="PtTableRef"
    :locale="locale"
    :tableColumns="tableColumns"
    :tableEditConfig="tableEditConfig"
    :paginationConfig="paginationConfig"
    :menuConfig="menuConfig"
    :data="tableData"
    :expand-row-keys="expandRowKeys"
    :row-class-name="tableRowClassName"
    row-key="frontEndID"
    :tree-props="{ children: 'children', hasChildren: 'leaf' }"
    :load="load"
    lazy
    border
    highlight-current-row
    size="small"
    @row-click="handleRowClick"
    @expand-change="handleExpandChange"
  >
    <!-- 自定义列模板插槽 -->
    <template #col-childNumber="{ row }">
      <span v-if="row.noMaterial1">（空）</span>
      <span v-else>
        <PartIcon :type="row.materialType" />
        {{ row.childNumber }}
      </span>
    </template>
    <template #col-compareChildNumber="{ row }">
      <span v-if="row.noMaterial2">（空）</span>
      <span v-else>
        <PartIcon :type="row.materialType" />
        {{ row.compareChildNumber }}
      </span>
    </template>
  </pt-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import PartIcon from "@/views/bomManage/productBom/components/partIcon.vue"
import { useI18n } from "vue-i18n"
//#region 参数和方法
const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  tableData: {
    type: Array,
    default: []
  },
  expandRowKeys: {
    type: Array,
    default: []
  },
})
const emits = defineEmits(["loadMaterial", "handleExpandChange", "handleScroll"])
const { t, locale } = useI18n()
  const instance = getCurrentInstance();

onMounted(() => {
  initTableScroll()
})
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()

// 监听表格滚动
const initTableScroll = () => {
  const dom = PtTableRef.value?.$el.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') as HTMLDivElement
  console.dir(dom);
  dom.addEventListener('scroll', e => {
    // console.log('scroll', e);
    emits('handleScroll', {
      type: props.type,
      top: (e.target as HTMLElement)?.scrollTop,
      left: (e.target as HTMLElement)?.scrollLeft,
    })
  })

}

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log('row-click', row);
}
const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: any
  rowIndex: number
}) => {
  if (row.type === '差异项') {
    return 'difference-row'
  }
  return ''
}
// 懒加载物料列表
const load = (tree: any, treeNode?: unknown, resolve?: (date: any) => void) => {
  emits('loadMaterial', tree, treeNode)
}
// 展开回调
const handleExpandChange = (row: any, expanded: any) => {
  emits('handleExpandChange', row, expanded)
}
// 事件
const setCurrent = (row?: any) => {
  PtTableRef.value!.setCurrentRow(row)
}
const scrollTo = (options: { top: number, left: number }) => {
  PtTableRef.value!.scrollTo(options)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  size: "small",
  colSetShow: true,
  show: false
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([])
switch (props.type) {
  case 'left':
    tableColumns.value = [
      {
        type: 'index',
        label: "序号",
        width: '55',
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
      },
      {
        prop: "childNumber",
        label: '编号',
        minWidth: '220',
        // showOverflowTooltip: true,
        show: true,
        slot: 'childNumber',
        headerAlign: "center",
      },
      // {
      //   prop: "value",
      //   label: '代号',
      //   showOverflowTooltip: true,
      //   show: true,
      //   headerAlign: "center",
      // },
      {
        prop: "partName",
        label: '名称',
        minWidth: '160',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
      },
      {
        prop: "qty",
        label: '数量',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
      },
      {
        prop: "childVersion",
        label: '版本',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
      },
    ]
    break;
  case 'right':
    tableColumns.value = [
      {
        type: 'index',
        label: "序号",
        width: '55',
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
      },
      {
        prop: "compareChildNumber",
        label: '编号',
        minWidth: '220',
        // showOverflowTooltip: true,
        show: true,
        slot: 'compareChildNumber',
        headerAlign: "center",
      },
      // {
      //   prop: "value",
      //   label: '代号',
      //   showOverflowTooltip: true,
      //   show: true,
      //   headerAlign: "center",
      // },
      {
        prop: "comparePartName",
        label: '名称',
        minWidth: '160',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
      },
      {
        prop: "compareQty",
        label: '数量',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
      },
      {
        prop: "compareChildVersion",
        label: '版本',
        // showOverflowTooltip: true,
        show: true,
        headerAlign: "center",
      },
    ]
    break;

  default:
    break;
}
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
  show: false,
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
  showMenu: false
})
//#endregion

//#endregion

// 向外暴露方法
defineExpose({ scrollTo })

</script>

<style lang="scss" scoped>
:deep(.el-table) {
  .difference-row {
    color: #ff2929;
  }
}
</style>

