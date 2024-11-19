<template>
  <div ref="ptTableRef" :class="{
    'pt-table': true,
    'fullScreen': isFullscreen
  }">
    <el-config-provider :locale="locale_el">
      <!-- 编辑 -->
      <pt-table-edit
        v-bind="tableEditConfig"
        :tableColumns="TableColumns"
        :lang="locale_pt"
        :isFullscreen="isFullscreen"
        @changeOnlyKey="changeOnlyKey"
        @goFullScreen="goFullScreen"
      >
        <template #slot-edit>
          <slot name="slot-edit"></slot>
        </template>
      </pt-table-edit>
      <!-- 列表 -->
      <el-table
        :key="onlyKey"
        ref="tableRef"
        v-bind="$attrs"
        @row-contextmenu="handleRowContextmenu"
        :row-class-name="tableRowClassName"
        :tooltip-options="tooltipOptions"
        :stripe="stripe"
      >
        <template v-for="(columnItem, columnIndex) in TableColumns" :key="columnIndex">
          <el-table-column
            v-bind="columnItem"
            v-if="columnItem.show&&!columnItem.disabled"
          >
              <!-- 表头插槽 -->
              <template v-if="columnItem.slot" #header="scope">
                <slot
                  :name="`head-${columnItem.slot}`"
                  :column="scope.column"
                  :index="scope.$index"
                  :store="scope.store"
                  :_self="scope._self"
                >
                  {{ scope.column.label }}
                </slot>
              </template>
              <!-- 表格插槽 -->
              <template v-if="columnItem.slot||columnItem.colEdit?.show||columnItem.colType" #default="scope">
                <template v-if="columnItem.colType==='drag'">
                  <el-button
                    class="drag-handler"
                    type="primary"
                    icon="Rank"
                    link
                  ></el-button>
                </template>
                <template v-else>
                  <template v-if="columnItem.colEdit?.show
                    &&(!cellDisabledEdit||!cellDisabledEdit({ 
                      row: scope.row,
                      column: columnItem,
                      rowIndex: scope.$index,
                      columnIndex: scope.cellIndex,
                    }))"
                  >
                    <col-edit
                      ref="colEditRef"
                      v-if="editRow===scope.row&&editRowProp===scope.column.property"
                      v-bind="columnItem.colEdit"
                      v-model="scope.row[columnItem.colEdit.editProp?columnItem.colEdit.editProp:scope.column.property]"
                      :row="scope.row"
                      :prop="scope.column.property"
                      :size="($attrs.size as any)"
                    />
                    <div
                      v-else
                      class="editInline"
                      @click.stop="showEditRow(scope.row, scope.column.property)"
                    >
                      <slot
                        :name="`col-${columnItem.slot}`"
                        :row="scope.row"
                        :column="scope.column"
                        :expanded="scope.expanded"
                        :store="scope.store"
                        :_self="scope._self"
                        :index="scope.$index"
                        :cellIndex="scope.cellIndex"
                      >
                        {{ scope.row[scope.column.property] }}
                      </slot>
                    </div>
                  </template>
                  <template v-else>
                    <slot
                      :name="`col-${columnItem.slot}`"
                      :row="scope.row"
                      :column="scope.column"
                      :expanded="scope.expanded"
                      :store="scope.store"
                      :_self="scope._self"
                      :index="scope.$index"
                      :cellIndex="scope.cellIndex"
                    >
                      {{ scope.row[scope.column.property] }}
                    </slot>
                  </template>
                </template>
              </template>
          </el-table-column>
        </template>
      </el-table>
      <!-- 分页 -->
      <pt-pagination
        v-bind="paginationConfig"
        @current-change="handlePageCurrentChange"
        @size-change="handlePageSizeChange"
        @change="handlePageChange"
        @prev-click="handlePagePrevClick"
        @next-click="handlePageNextClick"
      ></pt-pagination>
      <!-- 右键菜单 -->
      <pt-menu
        v-bind="menuConfig"
        ref="ptMenuRef"
        @checkMenu="checkMenu"
        :rightMenuRow="rightMenuRow"
      >
        <template #default="{ row }">
          <slot v-if="row" name="slot-menu" :row="row"></slot>
        </template>
      </pt-menu>
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, onMounted, getCurrentInstance, watch, useAttrs, computed } from 'vue';
import type { ElTable } from 'element-plus'
import Lang from "./lang/index";
import PtTable from "@/../types/PtTable/index";
import {
  props as tableProps,
  type PtTableProps,
  PtLocaleType,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/../types/PtTable/prop";
import PtTableEdit from './components/ptTableEdit.vue'  // 表格编辑
import PtPagination from './components/ptPagination.vue'  // 分页
import PtMenu from './components/ptMenu.vue'  // 右键菜单
import ColEdit from './components/colEdit.vue'  // 行内编辑
import Sortable from 'sortablejs'

//#region 参数和方法
defineOptions({
    name: "permission",
    inheritAttrs: false
})
const props = defineProps({
  /**
   * 多语言
   * @default 'zh_cn'
   */
   locale : {
    type: String as PropType<PtLocaleType>,
    default: 'zh_cn'
  },
  /**
   * 表格编辑配置
   * @default {}
   */
   tableEditConfig: {
    type: Object as PropType<PtTableEditConfigType>,
    default: () => {}
  },
  /**
   * 表格列
   * @default []
   */
   tableColumns: {
    type: Array as PropType<PtTableColumnsType>,
    default: () => []
  },
  /**
   * 分页
   * @default {}
   */
   paginationConfig: {
    type: Object as PropType<PtPaginationType>,
    default: () => {}
  },
  /**
   * 菜单
   * @default {}
   */
   menuConfig: {
    type: Object as PropType<PtMenuConfigType>,
    default: () => {}
  },
  /**
   * 是否禁用单元格行内编辑
   * @default false
   */
  cellDisabledEdit: {
    type: Function as PropType<typeof tableProps['cellDisabledEdit']>,
    default: () => {}
  },
  /**
   * 同el-table的row-class-name属性
   */
   rowClassName: {
    type: Function as PropType<typeof tableProps['rowClassName']>,
    default: () => {}
  },
  /**
   * 同el-table的tooltip-options属性
   */
  tooltipOptions: {
    type: Object as PropType<typeof tableProps['tooltipOptions']>,
    default: () => {
      return {
        placement: 'bottom'
      }
    }
  },
  /**
   * 同el-table的stripe属性
   */
   stripe: {
    type: Boolean as PropType<typeof tableProps['stripe']>,
    default: () => {
      return true
    }
  },
})
const emits = defineEmits([
  'row-contextmenu',
  'page-size-change',
  'page-current-change',
  'page-change',
  'page-prev-click',
  'page-next-click',
  'afterRefreshTable',
  'before-order-change',
])
const instance: any = getCurrentInstance()
const attrs = useAttrs() as PtTableProps
const TableColumns = computed(() => props.tableColumns.filter(item => !item.disabled))
onMounted(() => {
  document.addEventListener('click', changeColEdit, false)
  initSortable() // 初始化拖拽列
})
//#endregion

//#region 表格
const ptTableRef = ref<InstanceType<typeof PtTable> & HTMLElement>()
const tableRef = ref<InstanceType<typeof ElTable>>()

const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: any
  rowIndex: number
}) => {
  if (props.rowClassName) {
    switch (typeof props.rowClassName) {
      case 'function':
        return props.rowClassName({ row, rowIndex })
        break;
      case 'string':
        return props.rowClassName
        break;
    
      default:
        break;
    }
  }
  if (row === editRow.value) {
    return 'edit-row'
  }
  return ''
} 
//#region el-table事件
const clearSelection = () => {
  tableRef.value!.clearSelection()
}
const getSelectionRows = () => {
  return tableRef.value!.getSelectionRows()
}
const toggleRowSelection = (row: any, selected: boolean) => {
  tableRef.value!.toggleRowSelection(row, selected)
}
const toggleAllSelection = () => {
  tableRef.value!.toggleAllSelection()
}
const toggleRowExpansion = (row: any, expanded?: boolean | undefined) => {
  tableRef.value!.toggleRowExpansion(row, expanded)
}
const setCurrentRow = (row: any) => {
  tableRef.value!.setCurrentRow(row)
}
const clearSort = () => {
  tableRef.value!.clearSort()
}
const clearFilter = (columnKeys?: string[] | undefined) => {
  tableRef.value!.clearFilter(columnKeys)
}
const doLayout = () => {
  tableRef.value!.doLayout()
}
const sort = (prop: string, order: string) => {
  tableRef.value!.sort(prop, order)
}
const scrollTo = (options: ScrollToOptions | number, yCoord?: number) => {
  tableRef.value!.scrollTo(options, yCoord)
}
const setScrollTop = (top?: number | undefined) => {
  tableRef.value!.setScrollTop(top)
}
const setScrollLeft = (left?: number | undefined) => {
  tableRef.value!.setScrollLeft(left)
}
//#endregion

//#region 分页
const handlePageSizeChange = (currentPage: number) => {
  emits('page-size-change', currentPage)
}
const handlePageCurrentChange = (currentPage: number) => {
  emits('page-current-change', currentPage)
}
// 2.4.4
const handlePageChange = (currentPage: number, pageSize: number) => {
  emits('page-change', currentPage, pageSize)
}
const handlePagePrevClick = (currentPage: number) => {
  emits('page-prev-click', currentPage)
}
const handlePageNextClick = (currentPage: number) => {
  emits('page-next-click', currentPage)
}
//#endregion

//#region 右键菜单
const ptMenuRef = ref<typeof PtMenu>()
const rightMenuRow = ref<any>()

// 点击菜单
const checkMenu = (msg: string, row: any) => {
  console.log(msg, row);
}
const handleRowContextmenu = (row: any, column: any, event: any) => {
  rightMenuRow.value = row
  const menu = ptMenuRef.value
  const rect = ptTableRef.value?.getBoundingClientRect()
  if (menu && rect) menu.show(event, rect)
  emits('row-contextmenu', row, column, event)
}
//#endregion

//#region 重新渲染表格
const onlyKey = ref(1)
const changeOnlyKey = () => {
  onlyKey.value++
  emits('afterRefreshTable', onlyKey)
}
//#endregion

//#region 行内编辑
const editRow = ref()
const editRowProp = ref('')
const colEditRef = ref<HTMLDivElement>()
const showEditRow = (row: any, prop: string) => {
  editRow.value = row
  editRowProp.value = prop
}
const changeColEdit = () => {
  if (instance.refs.colEditRef) {
    const row = instance.refs.colEditRef[0]?.row
    if (row === editRow.value) editRow.value = null
  }
}
//#endregion

//#region 拖拽修改列顺序
// 初始化列排序
const sortable = ref<Sortable | null>(null)
const initSortable = () => {
  const listDom = tableRef.value?.$el.querySelector('.el-table__body-wrapper .el-table__body tbody')
  const listData = attrs.data
  sortable.value = new Sortable(listDom, {
    handle: '.drag-handler',
    draggable: '.el-table__row',
    onEnd: ({ oldIndex, newIndex, from, to, item }) => {
      if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
        emits('before-order-change', { oldIndex, newIndex })
        to.removeChild(item)
        from.insertBefore(item, from.children[oldIndex])
        var currentRow = listData.splice(oldIndex, 1)[0]
        listData.splice(newIndex, 0, currentRow)
      }
    }
  })
}
//#endregion

//#region 全屏编辑
const isFullscreen = ref(false)
const goFullScreen = () => {
  isFullscreen.value = !isFullscreen.value
}
//#endregion

//#endregion

//#region 多语言
const locale_el = ref((Lang as any).el['zh_cn'])
const locale_pt = ref((Lang as any).pt['zh_cn'])
// 设置语言
const setLocale = (lang: any) => {
  // console.log('locale', lang);
  if (lang) {
    if ((Lang as any).pt[lang]) locale_pt.value = (Lang as any).pt[lang]
    if ((Lang as any).pt[lang]) locale_el.value = (Lang as any).el[lang]
  } else {
    locale_pt.value = (Lang as any).pt['zh_cn']
    locale_el.value = (Lang as any).el['zh_cn']
  }
}
watch(() => props.locale, (newValue, oldValue) => {
    setLocale(props.locale)
}, { immediate: true })
//#endregion

// 向外暴露方法
defineExpose({
  // 默认事件-表格
  clearSelection,
  getSelectionRows,
  toggleRowSelection,
  toggleAllSelection,
  toggleRowExpansion,
  setCurrentRow,
  clearSort,
  clearFilter,
  doLayout,
  sort,
  scrollTo,
  setScrollTop,
  setScrollLeft,
  // 自定义事件
})
</script>
<style lang='scss' scoped src="../../styles/index.scss"></style>
<style lang='scss' scoped>
.pt-table {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  :deep(.el-table) {
    flex: 1;
    .edit-row {
      background-color: #ffd292;
    }
  }
  .editInline {
    min-height: 25px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding-left: 2px;
    white-space:nowrap;        // 强制一行显示
    overflow:hidden;          // 超出隐藏
    text-overflow:ellipsis;   // 省略号
  }
}
</style>
