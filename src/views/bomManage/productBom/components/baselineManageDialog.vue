<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    draggable
    overflow
    align-center
    width="80%"
  >
    <div class="baselineManageDialog">
      <pt-table
        ref="PtTableRef"
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
        style="width: 100%"
      >
        <!-- 表格编辑插槽 -->
        <template #slot-edit>
          <span class="table-edit">
            <el-button
              type="primary"
              size="small"
              @click="goAddBaseline"
            >添加基线</el-button>
          </span>
        </template>
        <!-- 自定义列模板插槽 -->
        <!-- <template #col-detail="{ row }">
          <el-button
            type="primary"
            link
          ></el-button>
        </template> -->
        <!-- 右键菜单 -->
        <template #slot-menu="{ row }">
          <li @click="goDetail(row)">查看</li>
          <li @click="goDel(row)">删除</li>
        </template>
      </pt-table>

      <!-- 新建基线 - 弹窗 -->
      <AddBaselineDialog
        v-if="addBaselineDialog.visible"
        :dialog="addBaselineDialog"
        @handleEditSuccess="handleEditSuccess_add"
      />
    </div>

    <template #footer>
      <el-button
        v-if="dialog.type==='choose'"
        type="primary"
        @click="submit"
        size="small"
      >保存</el-button>
      <el-button
        type="primary"
        @click="dialog.visible=false"
        size="small"
      >{{ t("dashboardPage.cancel") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import type {
  PtTableComponent,
  PtTableEditConfigType,
  PtTableColumnsType,
  PtPaginationType,
  PtMenuConfigType,
} from "@/plugins/pt-front";
import AddBaselineDialog from "./addBaselineDialog.vue";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: '',
      row: {},
      type: ''  // choose: 选择基线；'': 基线管理
    }
  },
})
const emits = defineEmits(["handleEditSuccess"])
const { t, locale } = useI18n()
//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
const tableData: any[] = []
const multipleSelection = ref<any[]>([])

// 提交
const submit = () => {
  emits('handleEditSuccess')
}
//#region 增、删、改、查
const getList = () => {

}
const goDel = (row: any) => {
  console.log('删除', row);
}
const goDetail = (row: any) => {
  console.log('查看详情', row);
}
//#endregion

//#region el-table默认参数
// 方法
const handleRowClick = (row: any, column: any, event: any) => {
  console.log('row-click', row);
}
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
  console.log(multipleSelection.value);
}
// 事件
const setCurrent = (row?: any) => {
  PtTableRef.value!.setCurrentRow(row)
}
//#endregion

//#region 表格编辑
const tableEditConfig = reactive<PtTableEditConfigType>({
  size: "small",
  colSetShow: true,
  show: props.dialog.type !== 'choose'
})
//#endregion

//#region 表格列
const tableColumns = ref<PtTableColumnsType>([
  {
    prop: "value",
    label: "编码",
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "value",
    label: "名称",
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "value",
    label: "类型",
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "value",
    label: "创建者",
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "value",
    label: "创建时间",
    // showOverflowTooltip: true,
    show: true,
  },
  {
    prop: "value",
    label: "描述",
    // showOverflowTooltip: true,
    show: true,
  },
])
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

//#region 新建基线 - 弹窗
const addBaselineDialog = reactive<any>({
    visible: false,
    title: "",
    row: null,
    type: ''
})
// 新建基线
const goAddBaseline = () => {
  console.log('goAddBaseline', props.dialog.row);
  Object.assign(addBaselineDialog, {
    visible: true,
    title: '新建基线',
    row: props.dialog,
    type: 'edit'
  })
}
// 新建基线成功回调
const handleEditSuccess_add = () => {
  const row = addBaselineDialog.row
  console.log('handleEditSuccess_add', row);
  getList()
  Object.assign(addBaselineDialog, {
    visible: false,
    title: "",
    row: null,
    type: ''
  })
}
//#endregion

</script>
<style lang="scss" scoped>
.baselineManageDialog {
  height: calc(86vh - 168px);
}
</style>
