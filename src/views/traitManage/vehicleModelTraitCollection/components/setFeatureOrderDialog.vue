<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    top="50px"
    width="60%"
    draggable
    overflow
  >
    <div v-loading="dialog.loading" class="setFeatureOrderDialog">
      <div class="tableWrapper">
        <pt-table
          ref="PtTableRef"
          :locale="locale"
          :tableColumns="tableColumns"
          :tableEditConfig="tableEditConfig"
          :paginationConfig="paginationConfig"
          :menuConfig="menuConfig"
          :data="tableData"
          highlight-current-row
          border
          size="small"
          height="calc(100vh - 268px)"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          @before-order-change="handleBeforeOrderChange"
        >
          <!-- 自定义列模板插槽 -->
          <template #col-operate="{ index }">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="setOrder('up', index, tableData)"
            >上移</el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="setOrder('down', index, tableData)"
            >下移</el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="setOrder('top', index, tableData)"
            >置顶</el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="setOrder('bottom', index, tableData)"
            >置底</el-button>
          </template>
        </pt-table>
      </div>
      <div class="editOrderBtn">
        <div>
          <el-button
            type="primary"
            size="small"
            :disabled="!chooseRow"
            @click.stop="goSetOrder('up')"
          >上移</el-button>
        </div>
        <div>
          <el-button
            type="primary"
            size="small"
            :disabled="!chooseRow"
            @click.stop="goSetOrder('down')"
          >下移</el-button>
        </div>
        <div>
          <el-button
            type="primary"
            size="small"
            :disabled="!chooseRow"
            @click.stop="goSetOrder('top')"
          >置顶</el-button>
        </div>
        <div>
          <el-button
            type="primary"
            size="small"
            :disabled="!chooseRow"
            @click.stop="goSetOrder('bottom')"
          >置底</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button
        :loading="dialog.loading"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button
        type="primary"
        @click="dialog.visible=false"
        size="small"
      >{{ t('dashboardPage.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import { setArrayEleOrder, setObjectOrder } from '@/utils'
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      tableData: [],
      loading: false
    }
  },
})
const instance: any = getCurrentInstance()
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData = ref<any[]>([])
const chooseRow = ref()
const multipleSelection = ref<any[]>([])

// 获取列表
const getList = (list: any[]) => {
  console.log('getList', list);
  tableData.value = list || []
}
if (props.dialog.tableData) tableData.value = props.dialog.tableData
// 确认
const submit = () => {
  emits('handleEditSuccess', tableData.value)
}
// 设置顺序
const setOrder = (type: string, index: number, list: any[]) => {
  setArrayEleOrder(type, index, list, 'configurationSeq')
}
// 设置顺序
const goSetOrder = (type: string) => {
  // console.log('goSetOrder', chooseRow.value);
  for (let i = 0; i < tableData.value.length; i++) {
    const ele = tableData.value[i];
    if (ele === chooseRow.value) {
      setOrder(type, i, tableData.value)
      return true
    }
  }

}
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
  // PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  size: "small",
  colSetShow: false,
  show: false,
})
//#endregion

//#region 表格列
// 表格顺序修改回调
const handleBeforeOrderChange = ({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) => {
  console.log('handleBeforeOrderChange', oldIndex, newIndex);
  setObjectOrder(tableData.value[oldIndex], tableData.value[newIndex], 'ConfigurationSeq')
}
const tableColumns = ref<PtTableColumnsType>([
  {
    colType: 'drag',
    width: '42',
    show: true,
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
    prop: "number",
    label: "编号",
    width: '160',
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "name",
    label: "名称",
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  {
    prop: "defaultValue",
    label: "默认值",
    // showOverflowTooltip: true,
    show: true,
    headerAlign: "center",
  },
  // {
  //   label: "操作",
  //   width: '180',
  //   slot: "operate",
  //   showOverflowTooltip: true,
  //   show: true,
  //   headerAlign: "center",
  // },
])
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

defineExpose({
  getList,
})
</script>
<style lang="scss" scoped>
.setFeatureOrderDialog {
  display: flex;
  .tableWrapper {
    flex: 1;
    width: 0;
  }
  .editOrderBtn {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
}
</style>
