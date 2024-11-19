<template>
  <div class='bomCompareList'>
    <div class="table-search">
      <el-form
        ref="formRef"
        :inline="true"
        :model="searchData"
        :rules="rules"
        label-width="75px"
        size="small"
      >
        <el-form-item :label="$t('bomComparePage.partNumber')" prop="partNumber">
          <el-input
            v-model="searchData.partNumber"
            placeholder=""
            clearable
            type="textarea"
            :rows="3"
            @input="isClearTableData2=true"
          />
        </el-form-item>
        <template v-if="type==='物料比较'">
          <el-form-item :label="$t('bomComparePage.comparePartNumber')" prop="comparePartNumber" label-width="82px">
            <el-input
              v-model="searchData.comparePartNumber"
              placeholder=""
              clearable
              type="textarea"
              :rows="3"
              @input="isClearTableData2=true"
            />
          </el-form-item>
        </template>
        <template v-if="type==='物料比较'">
          <el-form-item :label="$t('bomComparePage.version')" class="w120">
            <el-radio-group
              v-model="searchData.version"
              :disabled="isSharedAccount==='1'"
              @input="handleInput"
            >
              <el-radio label="0">{{ $t('bomComparePage.version_radio1') }}</el-radio>
              <el-radio label="1">{{ $t('bomComparePage.version_radio2') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
        <el-form-item :label="$t('bomComparePage.dimension')" class="w120">
          <el-radio-group v-model="searchData.dimension" @input="handleInput">
            <el-radio label="0">{{ $t('bomComparePage.dimension_radio1') }}</el-radio>
            <el-radio label="1">{{ $t('bomComparePage.dimension_radio2') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('bomComparePage.displayMethod')" class="w120">
          <el-radio-group v-model="searchData.displayMethod" @input="handleInput">
            <el-radio label="0">{{ $t('bomComparePage.displayMethod_radio1') }}</el-radio>
            <el-radio label="1">{{ $t('bomComparePage.displayMethod_radio2') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
        </el-form-item>
        <el-form-item class="flexWrap">
          <el-button
            v-if="type==='物料比较'"
            type="primary"
            size="small"
            @click="goCompare"
          >{{ $t('bomComparePage.materialCompare') }}</el-button>
          <el-button
            v-else-if="type==='版本比较'"
            type="primary"
            size="small"
            @click="openDialog_history"
          >{{ $t('bomComparePage.versionCompare') }}</el-button>
          <el-button
            size="small"
            @click="reset"
          >{{ $t('bomComparePage.reset') }}</el-button>
        </el-form-item>
        <el-form-item class="flexWrap">
          <el-button
            type="success"
            size="small"
            @click="goCompareChoose"
            style="margin-bottom: 12px;"
          >{{ $t('bomComparePage.compareChoose') }}</el-button>
          <el-dropdown ref="dropdown" trigger="click">
            <el-button icon="Setting" size="small">{{ $t('bomComparePage.columnSettings') }}</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <div class="dropdown-menu-box">
                  <template v-for="column in ColumnList_bom">
                    <div v-if="column.label">
                      <el-checkbox
                        v-model="column.show"
                        :label="column.label"
                        size="small"
                      />
                    </div>
                  </template>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-form-item>
        <el-button
          type="info"
          size="small"
          v-if="isRole"
          @click="goExport"
          style="vertical-align: top;"
        >{{ $t('bomComparePage.export') }}</el-button>
      </el-form>
    </div>
    <div class="tableWrapper">
      <!-- <virtual-scroll
        ref="virtualScrollRef"
        :data="virtualData"
        :item-size="62"
        key-prop="frontEndID"
        @change="(virtualList) => tableData = virtualList"
        :virtualized="true"
      > -->
        <el-table
          :data="tableData"
          border
          size="small"
          :row-class-name="tableRowClassName"
          :tree-props="{children: 'children', hasChildren: 'leaf'}"
          :load="(tree, treeNode, resolve) => load(tree, treeNode, resolve, '1')"
          lazy
          row-key="frontEndID"
          height="100%"
          @expand-change="updateVirtualScroll('virtualScrollRef')"
        >
          <el-table-column
            :label="$t('bomComparePage.index')"
            type="index"
            width="50"
          />
          <template v-for="column in ColumnList_bom">
            <template v-if="column.type==='radio1'">
              <el-table-column width="40">
                <template #default="scope">
                  <el-radio
                    v-if="scope.row.partOid&&scope.row.partOid!=='null'"
                    class="noLabel"
                    v-model="checked1"
                    :label="scope.row.partOid"
                    @change="checkboxChange(scope.row.partOid,'checked1')"
                  ><span></span></el-radio>
                </template>
              </el-table-column>
            </template>
            <template v-else-if="column.type==='radio2'">
              <el-table-column width="40">
                <template #default="scope">
                  <el-radio
                    v-if="scope.row.comparePartOid&&scope.row.comparePartOid!=='null'"
                    class="noLabel"
                    v-model="checked2"
                    :label="scope.row.comparePartOid"
                    @change="checkboxChange(scope.row.comparePartOid,'checked2')"
                  ><span></span></el-radio>
                </template>
              </el-table-column>
            </template>
            <template v-else>
              <el-table-column
                v-if="column.show&&column.label&&(!column.name||column.name===type)"
                :prop="column.prop"
                :label="column.label"
                :min-width="column.width"
              >
              <template #header>
                  <HeadFilter
                    v-model="searchFront[column.prop]"
                    @search="search"
                    :name="column.label"
                  />
                </template>
              </el-table-column>
            </template>
          </template>
        </el-table>
      <!-- </virtual-scroll> -->
    </div>
    <div v-if="tableData2.length" class="tableWrapper" style="margin-top: 20px;">
      <!-- <virtual-scroll
        ref="virtualScrollRef2"
        :data="virtualData2"
        :item-size="62"
        key-prop="frontEndID2"
        @change="(virtualList) => tableData2 = virtualList"
        :virtualized="true"
      > -->
        <el-table
          :data="tableData2"
          border
          size="small"
          :row-class-name="tableRowClassName"
          :tree-props="{children: 'children', hasChildren: 'leaf'}"
          :load="(tree, treeNode, resolve) => load(tree, treeNode, resolve, '2')"
          lazy
          row-key="frontEndID2"
          height="100%"
          @expand-change="updateVirtualScroll('virtualScrollRef2')"
        >
          <el-table-column
            :label="$t('bomComparePage.index')"
            type="index"
            width="50"
          />
          <template v-for="column in ColumnList_bom">
            <el-table-column
              v-if="column.show&&column.label&&(!column.name||column.name===type)"
              :prop="column.prop"
              :label="column.label"
              :min-width="column.width"
            />

          </template>
        </el-table>
      <!-- </virtual-scroll> -->
    </div>

    <!-- 历史版本 - 弹窗 -->
    <HistoryListDialog
      v-if="historyListDialog.visible"
      :dialog="historyListDialog"
      @goChoose="goChooseHistory"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, getCurrentInstance, onMounted } from "vue";
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import * as XLSX from 'xlsx';
import axios from 'axios'
import HeadFilter from "@/views/bomList/components/headFilter.vue";
import HistoryListDialog from "@/views/bomList/components/historyListDialog.vue";
import { getUserInfo, checkFactory } from "@/utils";
import { getBomCompareInfo, searchUserRoles } from '@/api/bomList'
import { getToken } from "@/utils/sessionStorage";
import { AnyARecord } from "dns";
import { useI18n } from "vue-i18n"

//#region 参数和方法
const props = defineProps({
  type: String,
  isSharedAccount: String,
  isRole: Boolean
})
const instance: any = getCurrentInstance()
const route = useRoute()
const loading = ref(false)
const userInfo = reactive({
  employeeNo: '',
  userName: '',
})
const { t, locale } = useI18n()
onMounted(() => {
  // init()
})
//#endregion

//#region 初始化
const init = () => {
  if (route.query.newpartNumber || route.query.oldpartNumber) {
    searchData.partNumber = route.query.newpartNumber || ''
    searchData.comparePartNumber = route.query.oldpartNumber || ''
    goCompare()
  }
}
//#endregion

//#region 搜索栏
const searchData = reactive<any>({
  partNumber: '',
  comparePartNumber: '',
  // partNumber: 'AC97184700302',
  // comparePartNumber: 'AC97184700303',
  version: '0',
  dimension: '0',
  displayMethod: '0',
})
const rules = reactive({
  partNumber: [
    { required: true, message: t('bomComparePage.tip_partNumber'), trigger: 'blur' },
  ],
  comparePartNumber: [
    { required: true, message: t('bomComparePage.tip_comparePartNumber'), trigger: 'blur' },
  ],
})
//#endregion

//#region 表格
const allTableData_BOM = ref<any[]>([])
const tableData = ref<any[]>([])
const tableData2 = ref<any[]>([])
const isClearTableData2 = ref(false)
let frontEndID = 1 // 唯一id
let frontEndID2 = 1 // 唯一id
const checked1 = ref('')
const checked2 = ref('')
const ColumnList_bom = ref<any[]>([
  {
    label: computed(() => t("bomComparePage.type")) as any,
    prop: 'type',
    show: true,
    width: '120'
  },
  {
    type: 'radio1',
    show: true
  },
  {
    label: computed(() => t("bomComparePage.parentNumber")) as any,
    prop: 'parentNumber',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.parentVersion")) as any,
    prop: 'parentVersion',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.parentStatus")) as any,
    prop: 'parentStatus',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.childNumber")) as any,
    prop: 'childNumber',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.childVersion")) as any,
    prop: 'childVersion',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.childStatus")) as any,
    prop: 'childStatus',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.partName")) as any,
    prop: 'partName',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.qty")) as any,
    prop: 'qty',
    show: true
  },
  {
    label: computed(() => t("bomComparePage.lineNumber")) as any,
    prop: 'lineNumber',
    show: true,
    width: 90
  },
  {
    type: 'radio2',
    show: true
  },
  {
    label: computed(() => t("bomComparePage.compareParentNumber")) as any,
    prop: 'compareParentNumber',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.compareParentVersion")) as any,
    prop: 'compareParentVersion',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.compareParentStatus")) as any,
    prop: 'compareParentStatus',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.compareChildNumber")) as any,
    prop: 'compareChildNumber',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.compareChildVersion")) as any,
    prop: 'compareChildVersion',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.compareChildStatus")) as any,
    prop: 'compareChildStatus',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.comparePartName")) as any,
    prop: 'comparePartName',
    show: true,
    width: '120'
  },
  {
    label: computed(() => t("bomComparePage.compareQty")) as any,
    prop: 'compareQty',
    show: true,
    width: 90
  },
  {
    label: computed(() => t("bomComparePage.compareLineNumber")) as any,
    prop: 'compareLineNumber',
    show: true,
    width: '120'
  },

])
// 物料比较
const goCompare = ($event?: any, type: string | undefined = '0', data: any = {}) => {
  console.log(type, data);
  if (props.type === '版本比较' && !data.partOid && !data.comparePartOid) {
    return false
  }
  instance.refs.formRef.validate((valid: boolean) => {
    if (valid) {
      goRequestList(type, data)
    }
  });
}

const goRequestList = (type = '0', data: any = {}) => {
  const userInfo = getUserInfo()
  let params = {
    employeeNo: userInfo.employeeNo, // 工号
    partNumber: searchData.partNumber, // 件号
    comparePartNumber: searchData.comparePartNumber, // 比较件号
    version: searchData.version, // 比较版本(0-最新版本;1-已完成)
    type,  // 比较类型(0-比较件号，1-比较历史版本, 2-比较选中项)
    dimension: searchData.dimension, // 比较维度(0-位置号编比较;1-数量 物料号)
    displayMethod: searchData.displayMethod, // 显示方式(0-显示全部;1-显示差异)
    partOid: data.partOid || '',  // 件号oid
    comparePartOid : data.comparePartOid || '', // 比较件号Oid
  }
  getBomCompareInfo(params).then((data: any) => {
    console.log(data);
    // 生成唯一id
    if (type === '0' || type === '1') {
      if (isClearTableData2.value) {
        tableData2.value = []
        isClearTableData2.value = false
      }
      data.data.forEach((item: any) => item.frontEndID = '' + frontEndID++)
      tableData.value = data.data || []
    } else if (type === '2') {
      data.data.forEach((item: any) => item.frontEndID2 = '' + frontEndID2++)
      tableData2.value = data.data || []
    }
    allTableData_BOM.value = data.data || []
  }).catch(err => {
    console.log('物料比较', err);
    if (type === '0' || type === '1') {
      if (isClearTableData2.value) {
        tableData2.value = []
        isClearTableData2.value = false
      }
      tableData.value = []
    } else if (type === '2') {
      tableData2.value = []
    }
  })
}
// 懒加载
const load = (tree: any, treeNode: unknown, resolve: (date: any) => void, num: string) => {
  console.log('tree', tree, treeNode);
  const userInfo = getUserInfo()
  let params = {
    employeeNo: userInfo.employeeNo, // 工号
    partNumber: searchData.partNumber, // 件号
    comparePartNumber: searchData.comparePartNumber, // 比较件号
    version: searchData.version, // 比较版本(0-最新版本;1-已完成)
    type: '3',  // 比较类型(0-比较件号，1-比较历史版本, 2-比较选中项)
    dimension: searchData.dimension, // 比较维度(0-位置号编比较;1-数量 物料号)
    displayMethod: searchData.displayMethod, // 显示方式(0-显示全部;1-显示差异)
    partOid: tree.partOid || '',  // 件号oid
    comparePartOid : tree.comparePartOid || '', // 比较件号Oid
  }
  getBomCompareInfo(params).then((data: any) => {
    console.log(data);
    // 生成唯一id
    if (num === '1') {
      data.data.forEach((item: any) => item.frontEndID = '' + frontEndID++)
    } else if (num === '2') {
      data.data.forEach((item: any) => item.frontEndID2 = '' + frontEndID2++)
    }
    resolve(data.data)
    tree.children = data.data
    console.log('tableData', tableData.value);
  }).catch(err => {
    console.log('物料比较-懒加载', err);
  })
}
const updateVirtualScroll = (virtualScroll: any) => {
  // instance.refs[virtualScroll].update()
}
// 比较选中项
const goCompareChoose = () => {
  console.log(checked1.value, checked2.value);
  if (!checked1.value || !checked2.value) {
    ElMessage.error(t('bomComparePage.tip_compareChoose'))
    return false
  }
  let params = {
    partOid: checked1.value,
    comparePartOid : checked2.value,
  }
  goCompare(null, '2', params)
}
const tableRowClassName = ({row, rowIndex}: any) => {
  if (row.type === '差异项') {
    return 'differentRow';
  } else {
    return ''
  }
}
const checkboxChange = (id: string, type: string) => {
  console.log([checked1.value, checked2.value]);
}
// 导出
const goExport = () => {
  if (!tableData.value.length && !tableData2.value.length) {
    ElMessage.error(t('bomComparePage.tip_export'))
    return false
  }
  let {utils, writeFile, write} = XLSX; // 解构
  let book = utils.book_new(); // 新建工作簿

  //创建工作表（二维数组格式）
  // let sheetValue = [
  //   ['姓名', '年龄'],
  //   ['张三', 10],
  //   ['李四', 18],
  // ];
  // let sheet = utils.aoa_to_sheet(sheetValue);

  let listValue: any[] = []
  ColumnList_bom.value.forEach(ele => {
    let arr = []
    if (ele.show && ele.label) {
      arr.push(ele.prop)
      arr.push(ele.label)
      listValue.push(arr)
    }
  })
  // 递归数组
  function recursionArray(arr: any[], cb: Function, child = "children") {
    for (let i = 0; i < arr.length; i++) {
      cb && cb(arr[i], i)
      if (arr[i][child] && arr[i][child].length) {
        recursionArray(arr[i][child], cb, child)
      }
    }
  }
  // 创建工作表（json格式）
  function appendSheetJson(Data: any[], SheetName: string) {
    let sheetValue = Data;
    let data: any[] = []
    console.log('sheetValue', sheetValue);
    recursionArray(sheetValue, (item: any) => {
      console.log('item', item);
      let obj: any = {}
      listValue.forEach(list => obj[list[1]] = item[list[0]]?item[list[0]]:'')
      data.push(obj)
    })
    let sheet = utils.json_to_sheet(data);
    // console.log(sheet, data);
    utils.book_append_sheet(book, sheet, SheetName); // 将工作表放入工作簿中
  }
  if (tableData.value.length) appendSheetJson(tableData.value, props.type || '比较')
  if (tableData2.value.length) appendSheetJson(tableData2.value, '选中项比较')

  let filename = `${props.type || '物料列表'}.xlsx` // 自定义导出文件名
  // utils.setPassword(book, '123') // 设置密码
  writeFile(book, filename, {bookType: 'xlsx'}) // 导出文件
}
// 置空
const reset = () => {
  searchData.partNumber = ''
  searchData.comparePartNumber = ''
}
const handleInput = (val: string) => {
  console.log(val);
  if (props.type === '物料比较') {
    goCompare()
  } else if (props.type === '版本比较') {
    goCompare(null, '1', chooseVersion)
  }
}
//#endregion

//#region 前端搜索
const searchFront = reactive<any>({})
// 特殊字符
const special_regular = new RegExp(
  "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
)
const search = () => {
  console.log('search', searchFront, allTableData_BOM.value);
  // 筛选不为空的条件
  let flag = true
  Object.keys(searchFront).forEach(key => {
    if (searchFront[key]) flag = false
  })
  if (flag) {
    tableData.value = JSON.parse(JSON.stringify(allTableData_BOM.value))
  } else {
    let list = searchTree(JSON.parse(JSON.stringify(allTableData_BOM.value)))
    console.log('list', list);
    tableData.value = list
  }
}
// 过滤数据
const searchTree: any = (treeList: any[]) => {
  let emptyArr = [];
  for (let item of treeList) {
    let flag2 = true
    Object.keys(searchFront).forEach(key => {
      if (searchFront[key]) {
        const reg = new RegExp(searchFront[key].replace(special_regular, ''), 'i')
        if (!reg.test(String(item[key]).replace(special_regular, ''))) flag2 = false
      }
    })
    if (flag2) {
      emptyArr.push(item);
    } else {
      if (item.children && Array.isArray(item.children) && item.children.length) {
        let subArr = searchTree(item.children);
        if (subArr && subArr.length) {
          let node = { ...item, children: subArr }
          emptyArr.push(node)
        }
      }
    }
  }
  return emptyArr
}
//#endregion

//#region 历史版本弹窗
const historyListDialog = reactive({
  visible: false,
  row: {}
})
const openDialog_history = () => {
  instance.refs.formRef.validate((valid: any) => {
    if (valid) {
      historyListDialog.row = {
        materialNumber: searchData.partNumber
      }
      historyListDialog.visible = true
    }
  });
}
// 历史版本选择
const chooseVersion = reactive({
  partOid: '',
  comparePartOid : '',
})
const goChooseHistory = (arr: any[]) => {
  console.log('arr', arr)
  chooseVersion.partOid = arr[0].Oid
  chooseVersion.comparePartOid = arr[1].Oid
  goCompare(null, '1', chooseVersion)
}
//#endregion

</script>
<style lang="scss" scoped>
.bomCompareList {
  height: calc(var(--v3-container-height) - 48px);
  display: flex;
  flex-direction: column;
  .table-search {
    :deep(.el-form) {
      .el-form-item {
        margin-right: 10px;
      }
    }

  }
  :deep(.w120) {
    width: auto;
    .el-form-item__label {
        margin-bottom: 6px;
    }
    .el-form-item__content {
      .el-radio-group {
        flex-direction: column;
        align-items: flex-start;
      }
      .el-radio {
        margin-right: 0;
        &+.el-radio {
          margin-top: 12px;
        }
      }
    }
  }
  .flexWrap {
    :deep(.el-form-item__content) {
      display: flex;
      flex-wrap: wrap;
      width: min-content;
      .el-button {
        &+.el-button {
          margin-left: 0;
          margin-top: 12px;
        }
      }
    }
  }
  :deep(.el-table) {
    .differentRow > td {
      background-color: #75F9FD!important;
    }
  }
  .tableWrapper {
    flex: 1;
    height: 0;
  }
}
</style>
