<template>
  <div
    v-loading="loading"
    ref="bomListRef"
    class="bomList"
  >
    <div class="left">
      <div class="bomList_head">
        <span v-if="type==='forward'">{{ t('forwardTypePage.title_forward') }}</span>
        <span v-else-if="type==='reverse'">{{ t('forwardTypePage.title_reverse') }}</span>
      </div>
      <div class="bomList_content">
        <div class="table-search">
          <el-form
            ref="formRef"
            :inline="true"
            :model="searchData"
            :rules="rules"
            label-width="80px"
            size="small"
          >
            <el-form-item :label="t('forwardTypePage.materialNumber')" prop="materialNumber">
              <el-autocomplete
                ref="autocompleteNumberRef"
                popper-class="autocompleteBox"
                v-model="searchData.materialNumber"
                :fetch-suggestions="querySearch_code"
                @select="handleSelect"
                @input="queryFlag=false"
              >
                <template #suffix>
                  <el-button
                    text
                    icon="Search"
                    @click="remoteMethod_code"
                  ></el-button>
                </template>
                <template #default="{ item }">
                  <div style="display: flex;">
                    <span style="float: left;padding-right: 12px;">{{ item.partnumber }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.partname }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item :label="t('forwardTypePage.materialName')" prop="materialName">
              <el-autocomplete
                ref="autocompleteNameRef"
                popper-class="autocompleteBox"
                v-model="searchData.materialName"
                :fetch-suggestions="querySearch_name"
                @select="handleSelect"
                @input="queryFlag=false"
              >
                <template #suffix>
                  <el-button
                    text
                    icon="Search"
                    @click="remoteMethod_name"
                  ></el-button>
                </template>
                <template #default="{ item }">
                  <div style="display: flex;">
                    <span style="float: left;padding-right: 12px;">{{ item.partnumber }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.partname }}</span>
                  </div>
                </template>
              </el-autocomplete>
              <!-- <el-input v-model="searchData.name" placeholder="" clearable /> -->
            </el-form-item>
            <el-form-item :label="t('forwardTypePage.version')">
              <el-radio-group
              v-model="searchData.verType"
              style="width: 202px;"
            >
                <el-radio label="0">最新版本</el-radio>
                <el-radio label="1">已完成</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                @click="getList"
              >{{ t('forwardTypePage.query') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-edit">
          <el-button
            icon="Refresh"
            size="small"
            @click="refresh"
          >{{ t('forwardTypePage.refresh') }}</el-button>
          <el-dropdown ref="dropdown" trigger="click" style="margin-left: 12px;">
            <el-button icon="Setting" size="small">{{ t('forwardTypePage.volumnSettings') }}</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <div ref="dropdownMenuBoxRef" class="dropdown-menu-box">
                  <el-scrollbar max-height="60vh">
                    <template v-for="(column, index) in ColumnList_bom">
                      <div
                        v-if="!column.view || column.view===type"
                        class="menu-list-li"
                        :key="index"
                      >
                        <i class="el-icon-rank drag-handler"></i>
                        <el-checkbox
                          v-model="column.show"
                          :label="column.label"
                          size="small"
                        />
                      </div>
                    </template>
                  </el-scrollbar>
                  <!-- <div class="dropdown-menu-box-btn">
                    <el-button @click="changeColShow" type="primary" size="small">保存</el-button>
                  </div> -->
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div v-if="refreshFlag" class="tableWrapper">
          <el-table
            ref="tableRef"
            class="row-click"
            :data="tableData_BOM"
            row-key="frontEndID"
            border
            lazy
            highlight-current-row
            :expand-row-keys="expandRowKeys"
            @expand-change="handleExpandChange"
            size="small"
            :load="load"
            :tree-props="{children: 'children', hasChildren: 'leaf'}"
            height="100%"
            @row-click="handleRowClick"
            @row-contextmenu="(row, column, event) => { handleRowContextmenu(row, column, event, 'bom2') }"
          >
            <template v-for="column in ColumnList_bom">
              <el-table-column
                v-if="column.show&&(!column.view || column.view===type)"
                :prop="column.prop"
                :width="column.width || '110'"
              >
                <template #header>
                  <HeadFilter
                    v-model="searchFront[column.prop]"
                    @search="search"
                    :name="column.label"
                  />
                  <el-link :underline="false">
                    <div class="caret-wrapper" :id="column.prop">
                      <i @click="sortChange($event, column, 'ascending')" class="sort-caret ascending"></i>
                      <i @click="sortChange($event, column, 'descending')" class="sort-caret descending"></i>
                    </div>
                  </el-link>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>
      </div>
    </div>
    <div class="dropLine" />
    <div class="right">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane :label="t('forwardTypePage.attribute')" name="1">
          <MaterialDetail ref="MaterialDetailRef" />
        </el-tab-pane>
        <el-tab-pane :label="t('forwardTypePage.documents')" name="2">
          <MaterialDocument ref="MaterialDocumentRef" />
        </el-tab-pane>
        <el-tab-pane :label="t('forwardTypePage.changes')" name="3">
          <ChangeList ref="ChangeListRef" />
        </el-tab-pane>
      </el-tabs>
      <!-- <myPlugin/> -->
    </div>

    <!-- 右键菜单 -->
    <MenuPanel
      ref="menus"
      @checkMenu="checkMenu"
    />

    <!-- 历史版本 - 弹窗 -->
    <HistoryListDialog
      v-if="historyListDialog.visible"
      :dialog="historyListDialog"
      @goChoose="goChooseHistory"
    />
    <MaterialBasicInformation
      v-if="materialBasicInformation.visible"
      :dialog="materialBasicInformation"
      @close="materialBasicInformation.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, getCurrentInstance, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router"
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from "element-plus"
import Sortable from 'sortablejs'
import { recursionArray, getUserAuth, checkFactory } from "@/utils";
import MenuPanel from "./components/menuPanel.vue";
import HeadFilter from "./components/headFilter.vue";
import MaterialDetail from "./components/materialDetail.vue";
import MaterialDocument from "./components/materialDocument.vue";
import ChangeList from "./components/changeList.vue";
import HistoryListDialog from "./components/historyListDialog.vue";
import MaterialBasicInformation from "./components/materialBasicInformation.vue";
import {
  getPartList,
  getMaterialList,
  getMaterialDocumentList,
} from '@/api/bomList'
import { decrypt, SECRET_KEY, SECRET_IV } from "@/utils";
import { useI18n } from "vue-i18n"

const env = import.meta.env
//#region 参数和方法
const props = defineProps({
  type: String  // 页面类型
})
const instance: any = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const userInfo = reactive({
  employeeNo: '',
  userName: '',
})
let frontEndID = 1 // 唯一id
const { t, locale } = useI18n()

onMounted(() => {
  init()
})
//#endregion

//#region 初始化
const init = () => {
  nextTick(() => {
    initPageType() // 初始化顺查/逆查
    initDropLine() // 初始化左右宽度拖拽
    initSortable() // 初始化列排序
    if (route.query.Number) {
      searchData.materialNumber = route.query.Number as string
      getList()
    }
  })
}
// 初始化左右宽度拖拽
const initDropLine = () => {
  const dropLine = document.querySelector(".dropLine") as HTMLElement
  let starX: number, startWidth: number
  let preDom = dropLine.previousElementSibling as HTMLElement // 前一个兄弟元素
  let nextDom = dropLine.nextElementSibling as HTMLElement  // 后一个兄弟元素
  let [leftWidth, rightMinWidth] = [50, 50]
  preDom.style.minWidth = leftWidth + 'px'
  nextDom.style.minWidth = rightMinWidth + 'px'
  dropLine.onmousedown = (e) => {
    starX = e.clientX
    startWidth = preDom.clientWidth
    e.preventDefault()
    document.onmousemove = (e) => {
      let preWidth = startWidth + e.clientX - starX + 2
      preDom.style.width = preWidth + 'px'
      nextDom.style.width = 'calc(100% - ' + preWidth + 'px)'
    }
    document.onmouseup = () => {
      document.onmousemove = null
      document.onmouseup = null
    }
  }
}
// 初始化顺查/逆查
const initPageType = () => {
  const type = props.type
  console.log('type', type);
  if (type === 'forward') {
    searchData.queryType = '0'
    // 顺查默认按位置号排序
    const box = instance.refs.tableRef.$el.querySelector('#findNumber.caret-wrapper')
    if (box) {
      const box = instance.refs.tableRef.$el.querySelector('#findNumber.caret-wrapper')
      box.className = 'caret-wrapper ascending'
      sortData.value = {
        prop: 'findNumber',
        order: 'ascending',
        sortType: 'number'
      }
    }
  } else if (type === 'reverse') {
    searchData.queryType = '1'
  } else {
    searchData.queryType = '0'
  }
}
// 初始化列排序
const sortable = ref<Sortable | null>(null)
const initSortable = () => {
  const el = instance.refs.dropdownMenuBoxRef
  sortable.value = new Sortable(el, {
    handle: '.drag-handler',
    draggable: '.menu-list-li',
    onEnd: (evt: any) => {
      console.log(evt, ColumnList_bom);
      refreshFlag.value = false
      let [fbox, oldIndex, tbox, newIndex, item] = [evt.from, evt.oldIndex, evt.to, evt.newIndex, evt.item];
      tbox.removeChild(item)
      fbox.insertBefore(item, fbox.children[oldIndex])
      var currentRow = ColumnList_bom.value.splice(oldIndex, 1)[0]
      ColumnList_bom.value.splice(newIndex, 0, currentRow)
      nextTick(() => refreshFlag.value = true)
    }
  })
}
//#endregion

//#region 左侧BOM列表
const ColumnList_bom = ref([
  {
    label: computed(() => t("forwardTypePage.findNumber")) as any,
    prop: 'findNumber',
    show: true,
    sortType: 'number',
    view: 'forward'
  },
  {
    label: computed(() => t("forwardTypePage.SubDrawingNumber")) as any,
    prop: 'SubDrawingNumber',
    show: true,
    width: '130'
  },
  {
    label: computed(() => t("forwardTypePage.Name")) as any,
    prop: 'Name',
    show: true,
    width: '300'
  },
  {
    label: computed(() => t("forwardTypePage.CR")) as any,
    prop: 'CR',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.Characteristic")) as any,
    prop: 'Characteristic',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.State")) as any,
    prop: 'State',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.DevelopmentMaturity")) as any,
    prop: 'DevelopmentMaturity',
    show: true,
    width: '140'
  },
  {
    label: computed(() => t("forwardTypePage.Process")) as any,
    prop: 'Process',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.ContactForm")) as any,
    prop: 'ContactForm',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.Amount")) as any,
    prop: 'Amount',
    show: true,
    sortType: 'number'
  },
  {
    label: computed(() => t("forwardTypePage.QuantityUnit")) as any,
    prop: 'QuantityUnit',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.ST")) as any,
    prop: 'ST',
    show: true
  },
  // {
  //   label: '工艺走向',
  //   prop: '',
  //   show: true
  // },
  {
    label: computed(() => t("forwardTypePage.LatestUpdateTime")) as any,
    prop: 'LatestUpdateTime',
    show: true,
    width: '160',
    sortType: 'time'
  },
  {
    label: computed(() => t("forwardTypePage.Remark")) as any,
    prop: 'Remark',
    show: true
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '1',
    prop: 'Feature_1',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '2',
    prop: 'Feature_2',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '3',
    prop: 'Feature_3',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '4',
    prop: 'Feature_4',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '5',
    prop: 'Feature_5',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '6',
    prop: 'Feature_6',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '7',
    prop: 'Feature_7',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '8',
    prop: 'Feature_8',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '9',
    prop: 'Feature_9',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '10',
    prop: 'Feature_10',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '11',
    prop: 'Feature_11',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '12',
    prop: 'Feature_12',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '13',
    prop: 'Feature_13',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '14',
    prop: 'Feature_14',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '15',
    prop: 'Feature_15',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '16',
    prop: 'Feature_16',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '17',
    prop: 'Feature_17',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '18',
    prop: 'Feature_18',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '19',
    prop: 'Feature_19',
    show: false,
    width: '160'
  },
  {
    label: computed(() => t("forwardTypePage.Feature")) as any + '20',
    prop: 'Feature_29',
    show: false,
    width: '160'
  },
])
const rightRow = ref<any>({})
const tableData_file = ref([])
// 获取数据
const getData = (row: any) => {
  // 属性参数
  console.log('row',row);
  instance.refs.MaterialDetailRef?.getList(row)
  getList_document(row)
  instance.refs.ChangeListRef?.getList(row)
}
// 获取相关文档列表
const getList_document = (row: any) => {
  let params = {
    materialNumber: row.SubDrawingNumber,
    materialName: row.Name,
    partOid: row.oid
  }
  getMaterialDocumentList(params).then((data: any) => {
    console.log(data);
    // url解密
    data.doclist.forEach((ele: any) => ele.url = decrypt(ele.url, SECRET_KEY, SECRET_IV))
    instance.refs.MaterialDetailRef?.getChartList(data.doclist)
    instance.refs.MaterialDocumentRef?.getChartList(data.doclist)
  }).catch(err => {
    tableData_file.value = []
  })
}
// 展开回调
const handleExpandChange = (row: any, expanded: any) => {
  // console.log(row, expanded, this.expandRowKeys);
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
// 列表右键点击事件
const handleRowContextmenu = (row: any, column: any, event: any, menus: any) => {
  rightRow.value = row
  const menu = instance.refs.menus
  // console.log(row, menu);
  // 初始化根元素位置
  const rect = instance.refs.bomListRef?.getBoundingClientRect()
  if (rect) menu.show(event, rect)
}
// 懒加载物料列表
const load = (tree: any, treeNode: unknown, resolve: (date: any) => void) => {
  console.log(tree, treeNode);
  if (tree.oid) {
    let params = {
      ...searchData,
      partOid: tree.oid
    }
    getMaterialList(params).then((data: any) => {

      const list = data.partlist[0].children
      if (list.length) {
        // 生成唯一id
        recursionArray(list, (item: any) => {
          item.frontEndID = '' + frontEndID++
          if (item.expanded) expandRowKeys.push(item.frontEndID)
          formatData(item)
        })
        intoAllTableData_BOM(tree.frontEndID, list)
        resolve([])
        goSort()
      } else {
        intoAllTableData_BOM(tree.frontEndID, [])
        resolve([])
      }
    }).catch(err => {
      console.log('err', err);
      intoAllTableData_BOM(tree.frontEndID, [])
      resolve([])
    })
  } else {
    intoAllTableData_BOM(tree.frontEndID, [])
    resolve([])
  }
}
// 插入最新物料展开数据
const intoAllTableData_BOM = (id: any, arr: any) => {
  recursionArray(allTableData_BOM.value, (item: any) => {
    if (item.frontEndID === id) {
      item.children = JSON.parse(JSON.stringify(arr))
      item.leaf = false
    }
  })
}
//#region 搜索栏
// 后端搜索条件
const searchData = reactive({
  isSharedAccount: '0',
  // materialNumber: 'AZK307--00210', // 物料号
  materialNumber: '', // 物料号
  materialName: '', // 物料名称
  verType: '0', // 版本（0-最新版本；1-已完成）
  queryType: '0', // 查询方式（0-顺查；1-逆查）
})
const rules = reactive<FormRules>({
  materialNumber: [
    { required: true, message: t('forwardTypePage.tip_materialNumber'), trigger: 'blur' },
  ],
})
// 获取列表
const getList = () => {
  instance.refs.formRef.validate((valid: any) => {
    if (valid) {
      // 发送获取列表请求
      goRequestList()
    }
  });
}
const expandRowKeys = ref<any>([])
// 获取列表请求
const goRequestList = () => {
  console.log(searchData, searchFront.value);
  let params = {
    ...searchData,
    partOid: '',
  }
  tableData_BOM.value = []
  expandRowKeys.value = []
  frontEndID = 1
  loading.value = true
  getMaterialList(params).then((data: any) => {
    console.log('ata.partlist[0].children',data.partlist[0].children);
    const list = data.partlist[0].children
    if (list.length) {
      const canvas = document.createElement('canvas')
      let SubDrawingNumberWidth = 100
      let NameWidth = 100
      // 生成唯一id
      recursionArray(list, (item: any, i: any) => {
        item.frontEndID = '' + frontEndID++
        if (item.expanded) expandRowKeys.value.push(item.frontEndID)
        // 计算最大宽度
        const context = canvas.getContext('2d')
        context && (context.font = '14px Microsoft YaHei')
        if (item.SubDrawingNumber) {
          let width = context?.measureText(item.SubDrawingNumber + '').width || 0
          if (SubDrawingNumberWidth < width) SubDrawingNumberWidth = width
        }
        if (item.Name) {
          let width = context?.measureText(item.Name + '').width || 0
          if (NameWidth < width) NameWidth = width
        }
        // 格式化数据
        formatData(item)
      })
      // console.log('SubDrawingNumberWidth', SubDrawingNumberWidth);
      // console.log('NameWidth', NameWidth);
      ColumnList_bom.value.forEach(ele => {
        if (ele.prop === 'SubDrawingNumber') {
          ele.width = Math.ceil(SubDrawingNumberWidth) + 22 + 'px'
        } else if (ele.prop === 'Name') {
          ele.width = Math.ceil(NameWidth) + 22 + 'px'
        }
      })
      allTableData_BOM.value = list || []
      goSort()
      // 默认获取第一行基本信息
      setTimeout(() => {
        // 延迟1s减小服务器压力
        loading.value = false
        handleRowClick(tableData_BOM.value[0])
        instance.refs.tableRef.setCurrentRow(tableData_BOM.value[0])
      }, 1000);
    } else {
      loading.value = false
      tableData_BOM.value = []
      allTableData_BOM.value = []
    }
  }).catch(err => {
    console.log('err', err);
    loading.value = false
    tableData_BOM.value = []
    allTableData_BOM.value = []
  })
}
const handleSelect = (item: any) => {
  console.log(item);
  searchData.materialNumber = item.partnumber
  searchData.materialName = item.partname
}
// 格式化数据
const formatData = (item: any) => {
  // 位置号
  // if (item.findNumber){
  //   if(item.findNumber.length==1){
  //     item.findNumber = "000"+item.findNumber
  //   }else if(item.findNumber.length==2){
  //     item.findNumber = "00"+item.findNumber
  //   }else if(item.findNumber.length==3){
  //     item.findNumber = "0"+item.findNumber
  //   }
  // }
  if(item.findNumber) item.findNumber = item.findNumber.padStart(4,"0")
  // 数量
  if (item.Amount) item.Amount = item.Amount * 1
}
// 列表左键点击事件
const handleRowClick = (row: any) => {
  console.log(row);
  rightRow.value = row
  getData(row)
}
const queryFlag = ref(false)
//#region 远程搜索物料号
const options_code = ref([])
const loading_code = ref(false)
const remoteMethod_code = () => {
  instance.refs.formRef.validate((valid: boolean) => {
    if (valid) {
      queryFlag.value = true
      nextTick(()=>{
        instance.refs.autocompleteNumberRef.focus()
      })
    }
  });
}
const querySearch_code = (queryString: string, cb: Function) => {
  console.log('搜索物料号', queryFlag.value, queryString, searchData);
  if (queryFlag.value) {
    queryFlag.value = false
    getPartList({
      materialNumber: queryString,
      materialName: ''
    }).then((data: any) => {
      console.log(data);
      options_code.value = data.partlist || []
      cb(options_code.value);
    }).catch(err => {
      console.log('物料号远程搜索', err);
      options_code.value = []
      cb(options_code.value);
    })
  } else {
    cb(options_code.value);
  }
}
//#endregion
//#region 远程搜索物料名称
const options_name = ref([])
const loading_name = ref(false)
const remoteMethod_name = () => {
  queryFlag.value = true
  nextTick(()=>{
    instance.refs.autocompleteNameRef.focus()
  })
}
const querySearch_name = (queryString: string, cb: Function) => {
  console.log('搜索物料号', queryString, searchData);
  if (queryFlag.value) {
    queryFlag.value = false
    getPartList({
      materialNumber: '',
      materialName: queryString
    }).then((data: any) => {
      console.log(data);
      options_name.value = data.partlist || []
      cb(options_name.value);
    }).catch(err => {
      console.log('物料号远程搜索', err);
      options_name.value = []
      cb(options_name.value);
    })
  } else {
    cb(options_name.value);
  }
}
//#endregion

//#endregion

//#region 操作栏
// 刷新
const refreshFlag = ref(true)
const refresh = () => {
  refreshFlag.value = false
  Object.keys(searchFront).forEach(key => searchFront[key] = '')
  Object.keys(sortData).forEach(key => sortData[key] = '')
  goSort()
  setTimeout(() => refreshFlag.value = true, 1);
}
//#endregion

//#region 前端搜索
const searchFront = ref<any>({})
const sortData = ref<any>({
  prop: '',
  order: '',
  sortType: ''
})
const allTableData_BOM = ref<any>([])
const tableData_BOM = ref<any>([])
// 前端搜索
const search = () => {
  console.log('search', searchFront.value, allTableData_BOM.value);
  // this.tableData_BOM = []
  // this.refreshFlag = false
  // 筛选不为空的条件
  let flag = true
  Object.keys(searchFront.value).forEach(key => {
    if (searchFront.value[key]) flag = false
  })
  if (flag) {
    tableData_BOM.value = JSON.parse(JSON.stringify(allTableData_BOM.value))
    setTimeout(() => refreshFlag.value = true, 1);
  } else {
    let list = searchTree(JSON.parse(JSON.stringify(allTableData_BOM.value)))
    console.log('list', list);
    tableData_BOM.value = list
    // setTimeout(() => {
    //   this.refreshFlag = true
    //   this.$nextTick(() => {
    //     recursionArray(this.tableData_BOM, item => {
    //       this.$refs.tableRef.toggleRowExpansion(item, true)
    //     })
    //   });
    // }, 1);
  }
}
// 过滤数据
// 特殊字符
const special_regular =  new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
const searchTree = (treeList: any) => {
  let emptyArr = [];
  for (let item of treeList) {
    let flag2 = true
    Object.keys(searchFront.value).forEach(key => {
      if (searchFront.value[key]) {
        const reg = new RegExp(searchFront.value[key].replace(special_regular, ''), 'i')
        if (!reg.test(String(item[key]).replace(special_regular, ''))) flag2 = false
      }
    })
    if (flag2) {
      emptyArr.push(item);
    } else {
      if (item.children && Array.isArray(item.children) && item.children.length) {
        let subArr: any = searchTree(item.children);
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

//#region 排序
const sortChange = (e: any, column: any, order: any) => {
  console.log(sortData.value);
  // 修改参数
  const allBox = instance.refs.tableRef.$el.querySelectorAll('.caret-wrapper')
  const box = e.target.parentElement
  sortData.value.prop = column.prop
  sortData.value.sortType = column.sortType || ''
  sortData.value.order = order
  if (box.className.indexOf(order) !== -1) sortData.value.order = ''
  allBox.forEach((ele: any) => ele.className = 'caret-wrapper')
  box.className = 'caret-wrapper ' + sortData.value.order
  // 开始排序
  goSort()
}
const goSort = () => {
  console.log(sortData.value);
  if (sortData.value.order) {
    console.log('sort1');
    allTableData_BOM.value.sort((a: any, b: any) => {
      return handleSort(a, b)
    })
    recursionArray(allTableData_BOM.value, (item: any) => {
      if (item.children && item.children) {
        item.children.sort((a: any, b: any) => {
          return handleSort(a, b)

        })
      }
    })
  } else {
    console.log('sort2');
    allTableData_BOM.value.sort((a: any, b: any) => a.frontEndID - b.frontEndID)
    recursionArray(allTableData_BOM.value, (item: any) => {
      if (item.children && item.children) {
        item.children.sort((a: any, b: any) => a.frontEndID - b.frontEndID)
      }
    })
  }
  search()
}
const handleSort = (a: any, b: any) => {
  let aValue = a[sortData.value.prop]
  let bValue = b[sortData.value.prop]
  if (sortData.value.sortType === 'number') {
    // 数字
    if (sortData.value.order === 'ascending') {
      return aValue - bValue
    } else if (sortData.value.order === 'descending') {
      return bValue - aValue
    }
  } else if (sortData.value.sortType === 'time') {
    // 时间
    if (sortData.value.order === 'ascending') {
      return new Date(aValue).getTime() - new Date(bValue).getTime()
    } else if (sortData.value.order === 'descending') {
      return new Date(bValue).getTime() - new Date(aValue).getTime()
    }
  } else {
    // 字符串
    let aStr = aValue.substring(0, 1).toUpperCase()
    let bStr = bValue.substring(0, 1).toUpperCase()
    if (sortData.value.order === 'ascending') {
      if (aStr < bStr) return -1
      if (aStr > bStr) return 1
      return 0
    } else if (sortData.value.order === 'descending') {
      if (bStr < aStr) return -1
      if (bStr > aStr) return 1
      return 0
    }
  }
}
//#endregion

//#endregion

//#region 右侧基本信息
const activeName = ref('1')
//#endregion

//#region 右键菜单
// 点击菜单
const checkMenu = (msg: string) => {
  const menu = instance.refs.menus
  if (msg === '历史版本') {
    historyListDialog.row = {
      materialNumber: rightRow.value.SubDrawingNumber,
      partOid: rightRow.value.oid
    }
    historyListDialog.visible = true
  } else if (msg === '物料基础信息') {
    materialBasicInformation.row = {
      partOid: rightRow.value.oid
    }
    materialBasicInformation.visible = true
  } else {
    ElMessage(msg)
  }
  menu.hidden()
}
//#endregion

//#region 历史版本弹窗
const historyListDialog = reactive<any>({
  visible: false
})
// 历史版本选择
const goChooseHistory = (arr: any[]) => {
  console.log('arr', arr)
  router.push({
    path: '/bomManage/bomCompare',
    query: {
      code: arr[0].Number,
      version1: arr[0].Oid,
      version2: arr[1].Oid,
      type: 'version'
    }
  })
}
//#endregion

//#region 物料基础信息弹窗
const materialBasicInformation = reactive<any>({
  visible: false
})
//#endregion

</script>

<style lang='scss' scoped>
.bomList {
  display: flex;
  height: 100%;
  position: relative;
  background-color: #fff;
  .bomList_head {
    height: 31px;
    line-height: 31px;
    position: relative;
    top: 1px;
    background: #409EFF;
    color: #fff;
    font-weight: bold;
    padding-left: 12px;
  }
  .left {
    flex: 1;
    overflow: auto;
    .bomList_content {
      height: calc(100% - 31px);
      display: flex;
      flex-direction: column;
      .tableWrapper {
        flex: 1;
        height: 0;
      }
    }
  }
  .right {
    width: 435px;
    overflow: auto;
  }
}

.table-search {
  padding: 4px 4px 0;
}
.table-edit {
  padding: 0 4px;
  text-align: right;
  .el-button {
    margin-bottom: 10px;
  }
}
.tableWrapper {
  padding: 0 4px;
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #f5f7fa!important;
    }
  }
}
.dropLine {
  width: 2px;
  height: 100%;
  background-color: #ddd;
  cursor: ew-resize;
  &:hover {
    background-color: #409EFF;
  }
}
</style>
<style lang="scss">
.autocompleteBox {
  width: auto!important;
}
.dropdown-menu-box {
  .menu-list-li {
    .drag-handler {
      margin-right: 4px;
      font-size: 14px;
      cursor: pointer;
    }
  }
}
</style>
