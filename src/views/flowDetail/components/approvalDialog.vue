<template>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    fullscreen
    draggable
    overflow
  >
    <div v-loading="loading" ref="approvalDialogRef" style="position: relative;">
      <div class="approvalBox">
        <div class="left">
          <template v-if="dialog.title === '工艺划分'">
            <div class="flex" style="gap: 8px;margin-bottom: 12px;">
              <el-select
                v-model="approvalForm.zzwg"
                placeholder="请选择自制外件"
                clearable
              >
                <el-option
                  v-for="item in selfMadePartsList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button
                @click="save('zzwg')"
                type="primary"
              >保存</el-button>
            </div>
          </template>
          <template v-else-if="dialog.title === '工艺会签1'">
            <div class="flex" style="gap: 8px;margin-bottom: 12px;">
              <el-select
                remote
                filterable
                v-model="approvalForm.extraSign"
                :remote-method="onNameInput"
                @change="onNameChange"
                placeholder="请选择额外签审人员"
                clear
              >
                <el-option
                  v-for="item in options_value1"
                  :key="item.value"
                  :label="item.employeeName"
                  :value="item.employeeNo">
                </el-option>
              </el-select>
              <el-button
                @click="save('extraSign')"
                type="primary"
              >保存</el-button>
              <el-select
                v-model="approvalForm.mpmType"
                placeholder="售后专用件"
                clearable
              >
                <el-option
                  v-for="item in specialAfterSalesPartsList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button
                @click="save('mpmType')"
                type="primary"
              >保存</el-button>
              <el-select
                v-model="approvalForm.cscsd"
                placeholder="初始过程成熟度"
                clearable
              >
                <el-option
                  v-for="item in processMaturityList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button
                @click="save('cscsd')"
                type="primary"
              >保存</el-button>
            </div>
          </template>
          <template v-else-if="dialog.title === '工艺会签2'">
            <div class="flex" style="gap: 8px;margin-bottom: 12px;">
              <el-select
                v-model="approvalForm.mpmType"
                placeholder="售后专用件"
                multiple
                clearable
              >
                <el-option
                  v-for="item in specialAfterSalesPartsList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button
                @click="save('mpmType')"
                type="primary"
              >保存</el-button>
            </div>
          </template>
          <el-table
            ref="tableRef"
            class="row-click"
            :data="tableData"
            border
            size="small"
            highlight-current-row
            @row-contextmenu="(row, column, event) => { handleRowContextmenu(row, column, event, 'bom2') }"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
          >
            <!-- <el-table-column
              type="selection"
              width="40">
            </el-table-column> -->
            <!-- <el-table-column
              label=""
              width="34"
              >
              <template #default="scope">
                <i
                  v-if="scope.row.ObjType==='Doc'"
                  class="Tickets"
                  :title="scope.row.ObjTypeName"
                ></i>
                <i
                  v-else-if="scope.row.ObjType==='part'"
                  class="Tools"
                  :title="scope.row.ObjTypeName"
                ></i>
              </template>
            </el-table-column> -->
            <el-table-column
              prop="Number"
              label="编号">
            </el-table-column>
            <el-table-column
              prop="Name"
              label="名称">
            </el-table-column>
            <el-table-column
              prop="Version"
              label="版本">
            </el-table-column>
            <el-table-column
              prop="State"
              label="状态">
            </el-table-column>
            <!-- <el-table-column
              prop="Details"
              label="描述"
              width="100">
            </el-table-column> -->
            <!-- <el-table-column
              v-if="flowTaskData?.flowTasktype!=='ECR'"
              prop="RejectionIdentifier"
              label="驳回标识"
            >
              <template #default="scope">
                <span v-if="scope.row.RejectionIdentifier==='true'">驳回</span>
                <span v-else-if="scope.row.RejectionIdentifier==='false'">通过</span>
              </template>
            </el-table-column> -->
            <!-- <el-table-column
              v-if="flowTaskData?.flowTasktype!=='ECR'"
              prop="ReviewIdentifier"
              label="审阅标识"
            >
              <template #default="scope">
                <template v-if="scope.row.ObjType!=='part'&&scope.row.ObjType!=='EPM'&&scope.row.ObjTypeName!=='图纸'">
                  <span v-if="scope.row.ReviewIdentifier==='true'">已审阅</span>
                  <span v-else>未审阅</span>
                </template>
              </template>
            </el-table-column> -->
            <!-- <el-table-column label="" width="37">
              <template #default="scope">
                <el-button
                  text
                  icon="Tools"
                  @click="goEdit(scope.row)"
                />
              </template>
            </el-table-column> -->
            <!-- <el-table-column
              prop="Characteristic"
              label="特性">
            </el-table-column> -->
            <!-- <el-table-column
              prop="Zzwg"
              label="来源">
            </el-table-column> -->
            <!-- <el-table-column
              prop="extraSign"
              label="会签者">
            </el-table-column> -->
          </el-table>
        </div>
        <div class="right">
          <div class="descriptions">
            <template v-for="item in LabelPropData">
              <div :class="{
                'descriptions-item': true,
                'fullLine': item.fullLine
              }">
                <div class="descriptions-item-label">{{ item.label }}: </div>
                <template v-if="currentRow[item.prop]">
                  <el-tooltip class="item" effect="dark" :content="currentRow[item.prop]" placement="top">
                    <template v-if="item.prop === 'MDocument'">
                      <el-link type="primary" @click="goViewChart(currentRow.MDUrl)">{{ currentRow[item.prop] }}</el-link>
                    </template>
                    <template v-else-if="item.prop === 'TDocument'">
                      <el-link type="primary" @click="goViewChart(currentRow.TDUrl)">{{ currentRow[item.prop] }}</el-link>
                    </template>
                    <template v-else>
                      <div class="descriptions-item-text" :style="{color: item.color || '#000'}">{{ currentRow[item.prop] }}</div>
                    </template>
                  </el-tooltip>
                </template>
                <template v-else>
                  <div class="descriptions-item-text" :style="{color: '#909399'}">无数据</div>
                </template>
              </div>
            </template>
            <!-- <div class="descriptions-item" v-if="flowTaskData?.flowTasktype!=='ECR'">
              <div class="descriptions-item-label">驳回标识: </div>
              <div class="descriptions-item-text">
                <el-tag v-if="currentRow.RejectionIdentifier==='true'" type="primary" effect="dark">驳回</el-tag>
                <el-tag v-else-if="currentRow.RejectionIdentifier==='false'" type="success" effect="dark">通过</el-tag>
              </div>
            </div> -->
            <!-- <div class="descriptions-item col2" v-if="flowTaskData?.flowTasktype!=='ECR'">
              <div class="descriptions-item-label">随签意见: </div>
              <div class="descriptions-item-text">
                <el-input
                  v-if="currentRow.RejectionIdentifier"
                  v-model="currentRow.ObjectComment"
                  clearable
                  placeholder="请输入"
                  style="margin-right: 12px;width: 235px;"
                />
                <el-button
                  v-if="currentRow.RejectionIdentifier==='true'"
                  size="small"
                  type="primary"
                  @click="flagChange('1')"
                >取消驳回
                </el-button>
                <el-button
                  v-else-if="currentRow.RejectionIdentifier==='false'"
                  size="small"
                  type="warning"
                  @click="flagChange('-1')"
                >设置驳回
                </el-button>
              </div>
            </div> -->
          </div>
          <div v-if="currentRow.Number" class="viewBox">
          <!-- <div class="viewBox" style="min-height: calc(100vh - 442px);"> -->
            <el-tabs v-model="activeName">
              <template v-for="(item, i) in doclist">
              <!-- <template v-for="(item, i) in currentRow.doclist"> -->
                <el-tab-pane :label="item.name" :name="i+''">
                  <ViewChart
                    :data="item"
                    style="width: 100%;height: calc(100vh - 280px);min-height: 248px;"
                  />
                </el-tab-pane>
              </template>
            </el-tabs>
          </div>
        </div>
      </div>

      <!-- 右键菜单 -->
      <MenuPanel
        ref="menus"
        @checkMenu="checkMenu"
        :rowObjType="rowObjType"
        :flowTaskData="flowTaskData"
      />
      <!-- 查看图纸弹窗 -->
      <ViewChartDialog
      v-if="viewChartDialog.visible"
      :dialog="viewChartDialog"
      :url="viewChartDialog.url"
      />
      <!-- 查看物料更改记录弹框 -->
      <MaterialRecordDialog
      v-if="materialRecordDialog.visible"
      :dialog="materialRecordDialog"
      :flowTaskID="flowTaskID"
      :userInfo="userInfo"
      />
      <!-- 查看BOM更改记录弹框 -->
      <BomRecordDialog
      v-if="bomRecordDialog.visible"
      :dialog="bomRecordDialog"
      :flowTaskID="flowTaskID"
      :userInfo="userInfo"
      />
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, getCurrentInstance, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus"
import { decrypt, SECRET_KEY, SECRET_IV } from "@/utils";
import { getSaveAsFrom } from "@/api/flowDetail";
import ViewChart from "@/components/viewChart/index.vue";
import MenuPanel from "./menuPanel.vue";
import MaterialRecordDialog from "./materialRecordDialog.vue";
import BomRecordDialog from "./bomRecordDialog.vue";
import ViewChartDialog from "@/components/viewChart/components/viewChartDialog.vue";
import {
  attachedReview,
  getCountersignerList,
  flowTaskSave,
  getReviewObjDoc,
  setReviewIdentifier,
  getReviewObjList,
} from "@/api/flowDetail";
//#region 参数和方法
const props = defineProps({
  dialog: {
    type: Object,
    default: {
      visible: false,
      title: ''
    }
  },
  flowTaskID: String,
  userInfo: Object,
  objectList: Array,
  flowTaskData: Object,
})
const emits = defineEmits(["resetObject"])
const loading = ref(false)
const instance: any = getCurrentInstance()
onMounted(() => {
  tableData.value = props.objectList
})
//#endregion
const doclist = ref<any[]>([])
//#region 下拉菜单
const selfMadePartsList = [
  { value: '自制件', label: '自制件' },
  { value: '外购件', label: '外购件' },
  { value: '自制和外购件', label: '自制和外购件' },
]
const processMaturityList = [
  { value: 'P00', label: 'P00' },
  { value: 'P10', label: 'P10' },
  { value: 'P20', label: 'P20' },
  { value: 'P30', label: 'P30' },
  { value: 'P40', label: 'P40' },
]
const specialAfterSalesPartsList = [
  { value: '装配图', label: '装配图' },
  { value: '原理图', label: '原理图' },
  { value: '整车外供图', label: '整车外供图' },
  { value: '总成装配:整车外购功能件总成 (缸泵阀、电子电器件等)', label: '总成装配:整车外购功能件总成 (缸泵阀、电子电器件等)' },
  { value: '总成装配:机箱桥传动轴等(含相关功能总成)', label: '总成装配:机箱桥传动轴等(含相关功能总成)' },
  { value: '锻造', label: '锻造' },
  { value: '铸造', label: '机加工' },
  { value: '焊接', label: '焊接' },
  { value: '机加工', label: '机加工' },
  { value: '压力加工(冲压、旋压、挤压、拉拔)', label: '压力加工(冲压、旋压、挤压、拉拔)' },
  { value: '切削加工 (刃具切削、磨削、钳加工)', label: '切削加工 (刃具切削、磨削、钳加工)' },
  { value: '电物理加工(电火花等)', label: '电物理加工(电火花等)' },
  { value: '电化学加工 (电解、电铸等)', label: '电化学加工 (电解、电铸等)' },
  { value: '化学加工 (化学腐蚀刻字等)', label: '化学加工 (化学腐蚀刻字等)' },
  { value: '切割(激光切割、火焰切割、等离子切割)', label: '切割(激光切割、火焰切割、等离子切割)' },
  { value: '热处理(整体热处理，表面热处理，化学热处理)', label: '热处理(整体热处理，表面热处理，化学热处理)' },
  { value: '注塑', label: '注塑' },
  { value: '线束压接', label: '线束压接' },
  { value: '支座类硫化', label: '支座类硫化' },
  { value: '镀层 (电镀、化学镀、真空镀膜)', label: '镀层 (电镀、化学镀、真空镀膜)' },
  { value: '涂装(电泳、喷粉、PVC、中涂、面涂等)', label: '涂装(电泳、喷粉、PVC、中涂、面涂等)' },
  { value: '包覆、缝纫、胶粘', label: '包覆、缝纫、胶粘' },
  { value: '喷墨', label: '喷墨' },
  { value: '非金属', label: '非金属' },
  { value: '电控软件', label: '电控软件' },
  { value: '售后专用件', label: '售后专用件' },
]
//#endregion

//#region 流程编辑
const approvalForm = reactive({
  zzwg: "",  // 自制外购
  extraSign: "", // 额外签审人员工号
  mpmType: [], // 工艺类型
  cscsd: "" // 初始过程成熟度
})
const save = (field: string) => {
  if (!multipleSelection.value.length) {
    ElMessage.error('请选择一条数据！')
    return false
  }
  loading.value = true
  let params: any = {
    flowTaskID: props.flowTaskID || '',
    employeeNo: props.userInfo?.employeeNo || '',
    flowTaskMsg:[]
  }
  multipleSelection.value.forEach((ele: any) => {
    let data = {
      oid: ele.Oid, // 随签对象oid
    }
    if (!(approvalForm as any)[field]) {
      (data as any)[field] = 'null'
    } else {
      if (field === 'mpmType') {
        (data as any)[field] = ((approvalForm as any)[field] || []).join(',')
      } else {
        (data as any)[field] = (approvalForm as any)[field]
      }
    }
    params.flowTaskMsg.push(data)
  })
  flowTaskSave(params).then(data => {
    console.log('data', data);
    loading.value = false
  }).catch(err => {
    console.log('流程编辑', err)
    loading.value = false
  })
}
const options_value1 = ref<any>([])
const onNameInput = (name: string) => {
  name = name.trim()
  if (name === '') return
  options_value1.value = [
    {
      label: '加载中...',
      value: '请耐心等待',
      organizationsName: '',
      disabled: true
    }
  ]
  console.log(name)
  var param ={
    "employeeNoOrName":name
  }
  // 请求后端接口
  getCountersignerList(param).then((res: any) => {
    options_value1.value = res.data
  })
}
const onNameChange = () => {
  // 赋值操作
}
//#endregion

//#region 表格
const tableData = ref<any>([])
const multipleSelection = ref<any>([])
// 列表右键点击事件
const rowNumber = ref('')
const rowObjType = ref('')
const handleRowContextmenu = (row: any, column: any, event: MouseEvent, menus: any) => {
  const menu = instance.refs.menus
  rowNumber.value = row.Number
  rowObjType.value = row.ObjType
  console.log('ok', row, menu);
  // 初始化根元素位置
  const rect = instance.refs.approvalDialogRef?.getBoundingClientRect()
  if (rect) menu.show(event, rect)
}
const handleSelectionChange = (val: any) => {
  console.log('val', val);
  multipleSelection.value = val;
}
const handleRowClick = (row: any) => {
  console.log('row', row);
  // currentRow.value = row || {}
  if (row) getData(row)
}
// 获取数据
const newpartNumber = ref('')
const oldpartNumber = ref('')
const currentRow = ref<any>({})
const getData = (row: any) => {
  loading.value = true
  let params = {
    flowTaskID: props.flowTaskID || '',
    employeeNo: props.userInfo?.employeeNo || '',
    ObjType: row.ObjType,
    objOid: row.PartOid
  }
  //获取对比物料号
  if(params.ObjType === 'part') {
    getSaveAsFrom(params).then((data: any) => {
      console.log('getSaveAsFrom',data);
      newpartNumber.value = data.data.newpartNumber
      oldpartNumber.value = data.data.oldpartNumber
    })
  }

  getReviewObjDoc(params).then((data: any) => {
    console.log('currentRow', data);
    // url解密
    // data.data.MDUrl = decrypt(data.data.MDUrl, SECRET_KEY, SECRET_IV)
    // data.data.TDUrl = decrypt(data.data.TDUrl, SECRET_KEY, SECRET_IV)
    data.data.doclist.forEach((ele: any) => {
      ele.url = decrypt(ele.url, SECRET_KEY, SECRET_IV)
    })
    doclist.value = data.data.doclist
    currentRow.value = data.data
    loading.value = false
  }).catch(err => {
    console.log('获取文档列表', err);
    loading.value = false
  })
}

//#region 查看物料更改记录弹框
const materialRecordDialog = reactive({
  visible: false,
  title: ''
})
//#endregion

//#region 查看BOM更改记录弹框
const bomRecordDialog = reactive({
  visible: false,
  title: ''
})
//#endregion

// 点击菜单
const checkMenu = (msg: string) => {
  console.log("=====================")
  const menu = instance.refs.menus
  if (msg === '查询BOM') {
    window.open('/#/bomManage/forwardType?Number='+rowNumber||'')
  } else if (msg === 'BOM一键比对') {
    window.open(`/#/bomManage/bomCompare?newpartNumber=${newpartNumber || ''}&oldpartNumber=${oldpartNumber || ''}`)
  } else if (msg === '物料更改记录') {
    materialRecordDialog.title = '物料更改记录'
    materialRecordDialog.visible = true
  } else if (msg === 'BOM更改记录') {
    bomRecordDialog.title = 'BOM更改记录'
    bomRecordDialog.visible = true
  }
  menu.hidden()
}
//#endregion

//#region 表单
const LabelPropData: any = [
  // {
  //   label: 'M单单号',
  //   prop: 'MDocument'
  // },
  // {
  //   label: 'T单单号',
  //   prop: 'TDocument'
  // },
  {
    label: '编号',
    prop: 'Number'
  },
  {
    label: '名称',
    prop: 'Name'
  },
  {
    label: '状态',
    prop: 'State'
  },
  {
    label: '版本',
    prop: 'Version'
  },
  {
    label: '创建者',
    prop: 'Creator'
  },
  {
    label: '创建时间',
    prop: 'CreateTime'
  },
  {
    label: '修改者',
    prop: 'Modifyer'
  },
  {
    label: '上次修改时间',
    prop: 'ModifyTime'
  },
  // {
  //   label: '研发成熟度',
  //   prop: 'DevelopmentMaturity'
  // },
  // {
  //   label: '技术放行级别',
  //   prop: 'TechnicalReleaseLevel'
  // },
  // {
  //   label: '预计年用量',
  //   prop: 'EstimatedAnnualUsage'
  // },
  // {
  //   label: '特性',
  //   prop: 'Characteristic'
  // },
  // {
  //   label: '阶段',
  //   prop: 'PartPhase'
  // },
  // {
  //   label: '英文名称',
  //   prop: 'EnglishName'
  // },
  // {
  //   label: '关重件',
  //   prop: 'KeyParts'
  // },
  // {
  //   label: '法规件',
  //   prop: 'Regulations'
  // },
  // {
  //   label: '详细描述',
  //   prop: 'Details',
  //   fullLine: true
  // },
  // {
  //   label: '备注',
  //   prop: 'Remark',
  //   fullLine: true
  // },
  // {
  //   label: '采用标准号',
  //   prop: 'AdoptStanNum'
  // },
]
const activeName = ref('0')
const viewChartDialog = reactive({
  visible: false,
  title: '',
  url: ''
})
// 预览图纸
const goViewChart = (url: string) => {
  if (url) {
    viewChartDialog.url = url || ''
    viewChartDialog.title = '预览图纸'
    viewChartDialog.visible = true
  } else {
    ElMessage.error('地址不存在！')
  }
}
// 点击放大回调
const handleEnlarged = (row: any) => {
  // 设置审阅
  if (!row.Oid || row.ReviewIdentifier==='true' || row.ObjType==='part' || row.ObjType==='EPM' || props.flowTaskData?.flowTasktype==='ECR') return false
  let params = {
    flowTaskID: props.flowTaskID || '',
    employeeNo: props.userInfo?.employeeNo || '',
    objReview:[
      {
        oid: row.Oid,
        reviewIdentifier: "1"
      }
    ]
  }
  const oid = currentRow.value.Oid
  setReviewIdentifier(params).then(data => {
    console.log(data);
    // 刷新列表
    emits('resetObject', (list: any) => {
      loading.value = false
      tableData.value = list
      nextTick(() => {
        setTimeout(() => {
          tableData.forEach((ele: any) => {
            console.log(ele.Oid, oid);
            if (ele.Oid === oid) instance.refs.tableRef.setCurrentRow(ele, true)
          })
        }, 1)
      })
    })
  }).catch(err => {
    console.log('设置审阅标识', err);
  })
}
// 设置驳回
const flagChange = (type: string) => {
  if (!currentRow.value.ObjectComment.trim()) {
  ElMessage.error('随签意见不能为空！')
  return
  }
  loading.value = true
  const oid = currentRow.value.Oid
  const params = {
    flowTaskID: props.flowTaskID || '',
    employeeNo: props.userInfo?.employeeNo || '',
    objReview: [
      {
        oid,
        reviewType: type,
        reviewOpinion: currentRow.value.ObjectComment || ''
      }
    ]
  }
  // params.flowTaskID = '8656259923'
  // params.objReview.oid = 'OR:wt.part.WTPart:8656237120'
  attachedReview(params).then((data: any) => {
    console.log(data);
    if(data.data === 'ok') {
      ElMessage.success('设置成功')
    } else {
      ElMessage.error(data.message)
    }
    currentRow.value = {}
    tableData.value = []
    // 刷新列表
    emits('resetObject', (list: any) => {
      loading.value = false
      tableData.value = list
      nextTick(() => {
        setTimeout(() => {
          tableData.forEach((ele: any) => {
            console.log(ele.Oid, oid);
            if (ele.Oid === oid) instance.refs.tableRef.setCurrentRow(ele, true)
          })
        }, 1)
      })
    })
  }).catch(err => {
    console.log('驳回', err);
    loading.value = false
  })
}
//#endregion

</script>
<style lang="scss" scoped>
.approvalBox {
  display: flex;
  gap: 10px;
  .left {
    width: 50%;
  }
  .right {
    flex: 1;
    border: 1px solid #e9e6e6;
    padding: 6px;
  }
}
.descriptions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .descriptions-item {
    width: 50%;
    height: 28px;
    display: flex;
    gap: 12px;
    align-items: center;
    &.fullLine {
      width: 100%;
    }
    &.col2 {
      width: 400px;
    }
    .descriptions-item-text {
      flex: 1;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  :deep(.el-button span)  {
    font-size: inherit!important;
  }
}
</style>
