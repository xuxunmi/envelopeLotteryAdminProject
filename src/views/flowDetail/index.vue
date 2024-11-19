<template>
  <div class="app-container">
    <div class="flowDetail" v-loading="loading">
      <div class="fixed-card">
        <div class="pdm-card">
          <div class="pdm-card-head">
            <div class="pdm-card-head-title">
              <span style="margin-right: 40px;">基本信息</span>
              <el-button
                v-if="flowState==='open'
                &&flowTaskData.flowTaskReassigned
                &&flowTaskData.flowTaskAccepted==='Reassigned'"
                size="small"
                type="primary"
                @click="receiveTask">
                接收任务
              </el-button>
              <el-button
                v-if="flowState==='open'"
                size="small"
                type="primary"
                @click="anewAllot">
                重新分配
              </el-button>
              <el-button
                v-if="type==='ECR'||type==='ECA'||type==='FLOWTASK'||type==='PN'"
                size="small"
                type="primary"
                @click="goApproval()">
                审批随签
              </el-button>
              <!-- <el-button
                v-if="flowState==='open'&&type==='ECA'"
                size="small"
                type="primary"
                @click="materialRecord">
                查看物料更改记录
              </el-button>
              <el-button
                v-if="flowState==='open'&&type==='ECA'"
                size="small"
                type="primary"
                @click="bomRecord">
                查看BOM更改记录
              </el-button> -->
              <!-- <el-switch
                v-model="type"
                active-value="审批"
                inactive-value="更改"
                active-text="审批"
                inactive-text="更改"
                style="margin-left: 260px;">
              </el-switch> -->
            </div>
            <div class="pdm-card-head-btn">
              <template v-if="flowState==='open'
                &&!(
                  flowTaskData.flowTaskReassigned
                  &&flowTaskData.flowTaskAccepted==='Reassigned'
                )"
              >
                <el-input
                  v-if="submitTaskBtn.length"
                  v-model="inputValue"
                  autosize
                  type="textarea"
                  placeholder="填写流程意见"
                  size="small"
                  style="margin-right: 10px;width: 410px;"
                />
                <template v-for="item in submitTaskBtn">
                  <template v-if="item==='撤回'">
                    <el-button
                      v-if="flowTaskData.creator===userInfo.employeeNo"
                      size="small"
                      type="primary"
                      @click="submitSuccess(item)">
                      {{ item }}
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button
                      size="small"
                      type="primary"
                      @click="submitSuccess(item)">
                      {{ item }}
                    </el-button>
                  </template>
                </template>
              </template>
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.info = !cardFold.info"
              ></el-button>
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="!cardFold.info">
              <el-divider></el-divider>
              <div class="pdm-content">
                <div class="descriptions">
                  <div class="descriptions-item">
                    <div class="descriptions-item-label">主题: </div>
                    <div class="descriptions-item-text">
                      <el-button
                        v-if="flowTaskData.flowTasktype === 'WTPart' || flowTaskData.flowTasktype === 'WTDocument'"
                        link
                        type="primary"
                        @click="goDetail(flowTaskData)"
                      >{{ flowTaskData.flowTaskPbo }}</el-button>
                      <div v-else class="descriptions-item-text">{{ flowTaskData.flowTaskPbo }}</div>
                    </div>
                  </div>
                  <div class="descriptions-item">
                    <div class="descriptions-item-label">流程发起人: </div>
                    <div class="descriptions-item-text">
                      <div class="descriptions-item-text">{{ flowTaskData.flowTaskProcessinitiator1 }}</div>
                    </div>
                  </div>
                  <div class="descriptions-item">
                    <div class="descriptions-item-label">状况: </div>
                    <div class="descriptions-item-text">{{ flowTaskData.flowTaskPboState }}</div>
                  </div>
                  <div class="descriptions-item">
                    <div class="descriptions-item-label">流程发起时间: </div>
                    <div class="descriptions-item-text">{{ flowTaskData.flowTaskProcessStartTime }}</div>
                  </div>
                </div>
                <div style="margin-top: 6px;">
                  <el-button
                    v-if="type==='FLOWTASK' || type==='PN'"
                    size="small"
                    type="primary"
                    icon="Location"
                    @click="pointClick('object')"
                  >随签对象</el-button>
                  <el-button
                    v-if="type==='ECR' || type==='ECA'"
                    size="small"
                    type="primary"
                    icon="Location"
                    @click="pointClick('attachedObject')"
                  >受影响的对象</el-button>
                  <el-button
                    v-if="type==='ECA'"
                    size="small"
                    type="primary"
                    icon="Location"
                    @click="pointClick('afterObject')"
                  >产生后的对象</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    icon="Location"
                    @click="pointClick('approvalRecord')"
                  >审批记录</el-button>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <div class="pdm-card" v-if="type==='ECR'||type==='ECA'">
          <div class="pdm-card-head">
            <div class="pdm-card-head-title">
              <span style="margin-right: 40px;">更改信息</span>
            </div>
            <div class="pdm-card-head-btn">
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.changeInfo = !cardFold.changeInfo"
              ></el-button>
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="!cardFold.changeInfo">
              <el-divider></el-divider>
              <div class="pdm-content">
                <template v-if="type==='ECR'">
                  <div class="descriptions2">
                    <div class="descriptions-item" v-for="(item, i) in changeInfoTableColumn_ECR" :key="item.prop">
                      <div class="descriptions-item-label">{{ changeInfoTableColumn_ECR[i].label }}: </div>
                      <el-tooltip class="item" effect="dark" :content="data_change[changeInfoTableColumn_ECR[i].prop]" placement="top">
                        <div class="descriptions-item-text">
                          {{ data_change[changeInfoTableColumn_ECR[i].prop] }}
                        </div>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
                <template v-else-if="type==='ECA'">
                  <div class="descriptions2">
                    <div class="descriptions-item" v-for="(item, i) in changeInfoTableColumn_ECA" :key="item.prop">
                      <div class="descriptions-item-label">{{ changeInfoTableColumn_ECA[i].label }}: </div>
                      <el-tooltip class="item" effect="dark" :content="data_change[changeInfoTableColumn_ECA[i].prop]" placement="top">
                        <div class="descriptions-item-text">
                          {{ data_change[changeInfoTableColumn_ECA[i].prop] }}
                        </div>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <div class="pdm-card">
          <div class="pdm-card-head">
            <div class="pdm-card-head-title">流程处理</div>
            <div class="pdm-card-head-btn">
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.flow = !cardFold.flow"
              ></el-button>
            </div>
          </div>
          <el-collapse-transition>
            <div v-if="!cardFold.flow">
              <el-divider></el-divider>
              <div class="pdm-content">
                <div class="stepsWrapper">
                  <el-steps
                    finish-status="success"
                    align-center
                  >
                    <el-step
                      v-for="(item, index) in stepDataList"
                      :title="item.WORKITEM_NAME"
                      :key="index"
                    >
                      <template #icon>
                        <el-dropdown placement="bottom">
                          <div class="step_icon">
                            <template v-if="item.WORKITEM_STATE === 'Close'">
                              <el-button
                                type="success"
                                icon="Check"
                                size="small"
                                circle
                              />
                            </template>
                            <template v-else-if="item.WORKITEM_STATE === 'error'">
                              <el-button
                                type="primary"
                                icon="Close"
                                size="small"
                                circle
                              />
                            </template>
                            <template v-else-if="item.WORKITEM_STATE === 'Open'">
                              <el-button
                                type="info"
                                icon="LocationInformation"
                                size="small"
                                circle
                              />
                            </template>
                            <template v-else>
                              <el-button
                                size="small"
                                circle
                              >{{ index + 1 }}</el-button>
                            </template>
                          </div>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <div class="childStep">
                                <el-table
                                  :data="item.WORKITEM_Proofread"
                                  border
                                  max-height="60vh"
                                >
                                  <el-table-column prop="WORKITEM_USERNAME" label="处理人" />
                                  <el-table-column prop="WORKITEM_VOTE" label="审批结果">
                                    <!-- <template #default="scope">
                                      <span :style="{
                                        color: scope.row.WORKITEM_VOTE==='通过'?'green':'red'
                                      }">{{ scope.row.WORKITEM_VOTE }}</span>
                                    </template> -->
                                  </el-table-column>
                                  <el-table-column prop="WORKITEM_COMMENTS" label="备注" width="85" />
                                  <el-table-column prop="WORKITEM_StartTime" label="任务开始时间" width="155" />
                                  <el-table-column prop="WORKITEM_COMPLETEDDATE" label="任务完成时间" width="155" />
                                </el-table>
                              </div>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </template>
                      <template #title>
                        <div
                          :class="{
                            'title': true,
                            'success': item.WORKITEM_STATE === 'Close',
                            'info': item.WORKITEM_STATE === 'Open',
                            'error': item.WORKITEM_STATE === 'error',
                          }"
                        >
                          <div class="name">{{ item.WORKITEM_NAME}}</div>
                          <template v-for="(record, index) in item.WORKITEM_Proofread">
                            <template v-if="item.WORKITEM_STATE==='Open'">
                              <div v-if="!record.WORKITEM_COMPLETEDDATE" :key="index">
                                <div class="record">{{ `用户：${record.WORKITEM_USER || ''}(${record.WORKITEM_USERNAME || ''})${record.WORKITEM_VOTE || ''}` }}</div>
                                <div v-if="record.WORKITEM_COMMENTS" class="record">{{ `备注：${record.WORKITEM_COMMENTS || ''}` }}</div>
                              </div>
                            </template>
                            <template v-else>
                              <div v-if="index===0" :key="index">
                                <div class="record">{{ `用户：${record.WORKITEM_USER || ''}(${record.WORKITEM_USERNAME || ''})${record.WORKITEM_VOTE || ''}` }}</div>
                                <div v-if="record.WORKITEM_COMMENTS" class="record">{{ `备注：${record.WORKITEM_COMMENTS || ''}` }}</div>
                              </div>
                            </template>
                          </template>
                        </div>
                      </template>
                      <template #description>
                        <!-- <el-button
                          v-if="item.WORKITEM_STATE==='Open'&&flowTaskData.flowTaskCurrentStat===true"
                          size="small"
                          type="primary"
                          @click="handleUrgingBtn(item)"
                        >催办</el-button> -->
                      </template>
                    </el-step>
                  </el-steps>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>
      <el-scrollbar class="scroll-card">
        <div ref="topPoint" class="topPoint"></div>
        <div v-if="type==='FLOWTASK' || type==='PN'" class="pdm-card" ref="object">
          <div class="pdm-card-head">
            <div class="pdm-card-head-title">
              <i class="Location"></i>
              <span>随签对象</span>
            </div>
            <div class="pdm-card-head-btn">
              <el-button
                icon="Top"
                type="primary"
                size="small"
                circle
                @click="pointClick('topPoint')"
              />
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.production = !cardFold.production"
              />
            </div>
          </div>
          <el-collapse-transition>
            <div v-if="!cardFold.production">
              <el-divider></el-divider>
              <div class="pdm-content">
                <el-table :data="data_object" border size="small">
                  <el-table-column
                    v-for="(column, index) in attachedTableColumn"
                    :key="index"
                    :prop="column.prop"
                    :label="column.label"
                    align="center"
                    :width="column.width"
                  >
                  <template #default="scope">
                      <div v-if="column.prop==='RejectionIdentifier'">
                        <span v-if="scope.row[column.prop]==='true'">驳回</span>
                        <span v-else-if="scope.row[column.prop]==='false'">通过</span>
                      </div>
                      <div v-else-if="column.prop==='ReviewIdentifier'">
                        <template v-if="scope.row.ObjType!=='part'&&scope.row.ObjType!=='EPM'&&scope.row.ObjTypeName!=='图纸'">
                          <span v-if="scope.row[column.prop]==='true'">已审阅</span>
                          <span v-else>未审阅</span>
                        </template>
                      </div>
                      <div v-else-if="column.prop==='Url'">
                        <el-button
                          v-if="scope.row[column.prop]"
                          text
                          size="small"
                          icon="View"
                          @click="goViewChart(scope.row)"
                        ></el-button>
                      </div>
                      <div v-else-if="column.prop==='ObjType'">
                        <el-icon size="14px">
                          <Tickets v-if="scope.row.ObjType==='Doc'" :title="scope.row.ObjTypeName" />
                          <Tools v-else-if="scope.row.ObjType==='WTPart'" :title="scope.row.ObjTypeName" />
                        </el-icon>
                      </div>
                      <div v-else>{{ scope.row[column.prop] }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <div v-if="type==='ECR' || type==='ECA'" class="pdm-card" ref="attachedObject">
          <div class="pdm-card-head">
            <div class="pdm-card-head-title">
              <i class="Location"></i>
              <span>受影响的对象</span>
            </div>
            <div class="pdm-card-head-btn">
              <el-button
                icon="Top"
                type="primary"
                size="small"
                circle
                @click="pointClick('topPoint')"
              />
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.affected = !cardFold.affected"
              />
            </div>
          </div>
          <el-collapse-transition>
            <div v-if="!cardFold.affected">
              <el-divider></el-divider>
              <div class="pdm-content">
                <el-table :data="data_object_affected" border size="small">
                  <el-table-column
                    v-for="(column, index) in attachedTableColumn"
                    :key="index"
                    :prop="column.prop"
                    :label="column.label"
                    align="center"
                    :width="column.width"
                  >
                  <template #default="scope">
                      <div v-if="column.prop==='RejectionIdentifier'">
                        <span v-if="scope.row[column.prop]==='true'">驳回</span>
                        <span v-else-if="scope.row[column.prop]==='false'">通过</span>
                      </div>
                      <div v-else-if="column.prop==='ReviewIdentifier'">
                        <template v-if="scope.row.ObjType!=='part'&&scope.row.ObjType!=='EPM'&&scope.row.ObjTypeName!=='图纸'">
                          <span v-if="scope.row[column.prop]==='true'">已审阅</span>
                          <span v-else>未审阅</span>
                        </template>
                      </div>
                      <div v-else-if="column.prop==='Url'">
                        <el-button
                          v-if="scope.row[column.prop]"
                          text
                          size="small"
                          icon="View"
                          @click="goViewChart(scope.row)"
                        ></el-button>
                      </div>
                      <div v-else-if="column.prop==='ObjType'">
                        <el-icon size="14px">
                          <Tickets v-if="scope.row.ObjType==='Doc'" :title="scope.row.ObjTypeName" />
                          <Tools v-else-if="scope.row.ObjType==='WTPart'" :title="scope.row.ObjTypeName" />
                        </el-icon>
                      </div>
                      <div v-else>{{ scope.row[column.prop] }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <div v-if="type==='ECA'" class="pdm-card" ref="afterObject">
          <div class="pdm-card-head">
            <div class="pdm-card-head-title">
              <i class="Location"></i>
              <span>产生后的对象</span>
            </div>
            <div class="pdm-card-head-btn">
              <el-button
                icon="Top"
                type="primary"
                size="small"
                circle
                @click="pointClick('topPoint')"
              />
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.after = !cardFold.after"
              />
            </div>
          </div>
          <el-collapse-transition>
            <div v-if="!cardFold.after">
              <el-divider></el-divider>
              <div class="pdm-content">
                <el-table :data="data_object_after" border size="small">
                  <el-table-column
                    v-for="(column, index) in attachedTableColumn"
                    :key="index"
                    :prop="column.prop"
                    :label="column.label"
                    align="center"
                    :width="column.width"
                  >
                  <template #default="scope">
                      <div v-if="column.prop==='RejectionIdentifier'">
                        <span v-if="scope.row[column.prop]==='true'">驳回</span>
                        <span v-else-if="scope.row[column.prop]==='false'">通过</span>
                      </div>
                      <div v-else-if="column.prop==='ReviewIdentifier'">
                        <template v-if="scope.row.ObjType!=='part'&&scope.row.ObjType!=='EPM'&&scope.row.ObjTypeName!=='图纸'">
                          <span v-if="scope.row[column.prop]==='true'">已审阅</span>
                          <span v-else>未审阅</span>
                        </template>
                      </div>
                      <div v-else-if="column.prop==='Url'">
                        <el-button
                          v-if="scope.row[column.prop]"
                          text
                          size="small"
                          icon="View"
                          @click="goViewChart(scope.row)"
                        ></el-button>
                      </div>
                      <div v-else-if="column.prop==='ObjType'">
                        <el-icon size="14px">
                          <Tickets v-if="scope.row.ObjType==='Doc'" :title="scope.row.ObjTypeName" />
                          <Tools v-else-if="scope.row.ObjType==='WTPart'" :title="scope.row.ObjTypeName" />
                        </el-icon>
                      </div>
                      <div v-else>{{ scope.row[column.prop] }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <div class="pdm-card">
          <div class="pdm-card-head" ref="approvalRecord">
            <div class="pdm-card-head-title">
              <i class="Location"></i>
              审批记录
            </div>
            <div class="pdm-card-head-btn">
              <el-button
                icon="Top"
                type="primary"
                size="small"
                circle
                @click="pointClick('topPoint')"
              />
              <el-button
                icon="ArrowDown"
                size="small"
                circle
                @click="cardFold.approval = !cardFold.approval"
              />
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="!cardFold.approval">
              <el-divider></el-divider>
              <div class="pdm-content">
                <el-table
                  ref="tableRef"
                  :data="data_record"
                  border
                  size="small"
                >
                  <el-table-column
                    v-for="(column, index) in approvalTableColumn"
                    :key="index"
                    :prop="column.prop"
                    :label="column.label"
                    align="center"
                    :width="column.width || ''"
                  >
                    <template #header>
                      {{ column.label }}
                      <el-link :underline="false">
                        <div class="caret-wrapper" :id="column.prop">
                          <i @click="sortChange($event, column, 'ascending')" class="sort-caret ascending"></i>
                          <i @click="sortChange($event, column, 'descending')" class="sort-caret descending"></i>
                        </div>
                      </el-link>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </el-scrollbar>

      <!-- 审批随签弹窗 -->
      <ApprovalDialog
        v-if="approvalDialog.visible"
        :dialog="approvalDialog"
        :objectList="data_object"
        :flowTaskID="flowTaskID"
        :userInfo="userInfo"
        :flowTaskData="flowTaskData"
        @resetObject="resetObject"
      />

      <!-- 重新分配弹窗 -->
      <RedistributionDialog
        v-if="redistributionDialog.visible"
        :dialog="redistributionDialog"
        :flowTaskID="flowTaskID"
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, getCurrentInstance, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { getUserAuth, getUserInfo } from "@/utils";
import { encrypt, decrypt, SECRET_KEY, SECRET_IV } from "@/utils";
import ApprovalDialog from "./components/approvalDialog.vue";
import CompleteTaskDialog from "./components/completeTaskDialog.vue";
import RedistributionDialog from "./components/redistributionDialog.vue";
import ViewChartDialog from "@/components/viewChart/components/viewChartDialog.vue";
import MaterialRecordDialog from "./components/materialRecordDialog.vue";
import BomRecordDialog from "./components/bomRecordDialog.vue";
import {
  goUrging,
  getFlowTaskDetail,
  getReviewObjList,
  getFlowTaskWorkItems,
  getFlowTaskProofread,
  getChangeInfo,
  getChangeablesList,
  getChangeablesAfter,
  submitTask,
  flowTaskAccept,
  setReviewIdentifier,
} from "@/api/flowDetail";
import { windowOpenTab } from "@/utils";
import sharedWorker from '@/views/dashboard/components/taskListWorker.js?sharedworker';
//#region 参数和方法
defineOptions({
  name: "flowDetail"
})
const instance: any = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const type = ref('')  // FLOWTASK\ECR\ECA\PN
const userInfo = reactive({
  employeeNo: '',
  userName: '',
})
onMounted(() => {
  init()
})
//#endregion

//#region 初始化
const init = () => {
  if (route.query.id) flowTaskID.value = route.query.id as string
  if (route.query.employeeNo) userInfo.employeeNo = route.query.employeeNo as string
  getData_basic() // 获取基本信息
  initSort() // 初始化排序
}
//#endregion

//#region 基本信息
const flowTaskID = ref('') // 任务ID
const flowState = ref('') // 任务状态
// 获取基本信息
const getData_basic = () => {
  if (!userInfo.employeeNo) {
    ElMessage.error('获取工号异常！');
    return false
  }
  if (!flowTaskID.value) {
    ElMessage.error('获取任务id异常！');
    return false
  }
  let params = {
    flowTaskID: flowTaskID.value, // 任务ID （必填）更改
    employeeNo: userInfo.employeeNo // 工号（必填）
  }
  getFlowTaskDetail(params).then((data: any) => {
    // console.log(params, data);
    flowTaskData.value = data.data || {}
    console.log('flowTaskData', flowTaskData.value);
    getData(params)
  }).catch(err => {
    console.log('获取基本信息', err);
    flowTaskData.value = {}
  })
}
// 获取数据
const getData = (params: any) => {
  getData_record(params) // 获取审批记录
  getData_flow(params) // 获取流程节点列表
  // flowTaskData.flowTasktype = '更改'
  // flowTasktype（ECR：受影响对象+更改信息,ECN,ECA：产生对象+更改信息,FLOWTASK: 随签对象）
  type.value = flowTaskData.value.flowTasktype
  // 判断流程类型
  if (type.value === 'ECR' || type.value === 'ECA') {
    // 在获取更改信息前移除"ReviewIdentifier"列
    attachedTableColumn.value = attachedTableColumn.value.filter(column => {
      return column.prop !== 'ReviewIdentifier'&&column.prop !== 'RejectionIdentifier'&&column.prop !=='MDocument'&&column.prop !=='TDocument'
    })
    getData_change(params) // 获取更改信息
  }
  getObjectData()
  // 判断流程状态
  if (flowTaskData.value.flowTaskCurrentStat === false) {
    // 未完成
    flowState.value = 'open'
  }
}
// 流程数据
const flowTaskData = ref<any>({
  flowTaskPbo: '', // 流程主题
  flowTaskProcessinitiator1: '', // 流程发起人
  flowTaskPboState: '', // 流程状态
  flowTaskProcessStartTime: '', //  流程发起时间
  flowTaskReassigned: '',
  flowTaskAccepted: '',
  flowTaskcurrent: '',
  creator: '',
})
// 接收任务
const receiveTask = () => {
  loading.value = true
  const params = {
    flowTaskID: flowTaskID.value || '',
    employeeNo: userInfo.employeeNo || ''
  }
  flowTaskAccept(params).then(res => {
    ElMessage.success('已接收任务！')
    refreshTaskList()
    reloadPage()
  }).catch(err => {
    loading.value = false
    console.log('接收任务', err);
  })
}
const submitTaskBtn = ref([])
const inputValue = ref('')
// 任务提交
const submitSuccess = (type: any) => {
  if (type==='驳回'&&!inputValue.value.trim()) {
    ElMessage.error('驳回请输入流程意见！')
    return false
  }
  loading.value = true
  let msg = JSON.stringify({
    flowTaskID: flowTaskID.value,
    employeeNo: userInfo.employeeNo,
    route: type,
    notes: inputValue.value
  })

  const params = encrypt(msg, SECRET_KEY, SECRET_IV)
  // 加密
  submitTask({ data: params }).then(data => {
    console.log(data);
    ElMessage.success('提交成功！')
    refreshTaskList()
    reloadPage()
  }).catch(err => {
    loading.value = false
    console.log('任务提交', err);
  })
}
// 折叠
const cardFold = reactive({
  info: false, // 基本信息
  changeInfo: false, // 更改信息
  flow: false,  // 流程处理
  production: false, // 随签对象
  affected: false, // 受影响的对象
  after: false, // 产生后的对象
  approval: false, // 审批记录
})
// 点击锚点
const pointClick = (name: string) => {
  instance.refs[name].scrollIntoView({
    behavior: "smooth",
    block: 'start'
  });
}
// 查看详情
const goDetail = (data: any) => {
  console.log("查看详情", data)
  if (data.flowTasktype === 'WTPart' || data.flowTasktype === 'WTDocument') {
    const url = router.resolve({
      path: "/product/productDetail",
      query: { oid: data.flowTaskPboOid, type: data.flowTasktype, hiddenNav: 'true' }
    })
    windowOpenTab(url.href)
  }
}
//#region 重新分配弹窗
const redistributionDialog = reactive({
  visible: false,
})
const anewAllot = () => {
  redistributionDialog.visible = true
}
//#endregion

//#region 审批随签弹窗
const approvalDialog = reactive({
  visible: false,
  title: ''
})
const goApproval = () => {
  approvalDialog.title = flowTaskData.value.flowTaskcurrent
  // approvalDialog.title = '工艺划分'
  // approvalDialog.title = '工艺会签1'
  // approvalDialog.title = '工艺会签2'
  approvalDialog.visible = true
}
//#endregion

//#region 物料更改记录弹窗
const materialRecordDialog = reactive({
  visible: false,
  title: ''
})
const materialRecord = () => {
  materialRecordDialog.title = '物料更改记录'
  materialRecordDialog.visible = true
}
//#endregion

//#region BOM更改记录弹窗
const bomRecordDialog = reactive({
  visible: false,
  title: ''
})
const bomRecord = () => {
  bomRecordDialog.title = 'BOM更改记录'
  bomRecordDialog.visible = true
}
//#endregion

//#endregion

//#region 更改信息
const changeInfoTableColumn_ECR = ref([
  {
    prop: "UserDepartment",
    label: "部门",
  },
  {
    prop: "CurrentMaturity",
    label: "当前成熟度",
  },
  {
    prop: "ChangeBasis",
    label: "变更依据",
  },
  {
    prop: "CostChange",
    label: "更改前后成本变化",
  },
  {
    prop: "ChangeClassify",
    label: "变更执行分类",
  },
  {
    prop: "InventoryOption",
    label: "库存处理意见",
  },
  {
    prop: "ProductOption",
    label: "在制品处理意见",
  },
  {
    prop: "PrepareOption",
    label: "备件处理意见",
  },
  {
    prop: "CarePlace",
    label: "变更影响的生产单位",
  },
  {
    prop: "ChangeImpactRange",
    label: "变更影响范围",
  },
  {
    prop: "ChangePlan",
    label: "变更方案描述",
  },
  {
    prop: "ListType",
    label: "变更类型",
  },
  {
    prop: "MaturityChangeOrNot",
    label: "成熟度是否变更",
  },
  {
    prop: "ProductUpDownRequest",
    label: "产品上下场需求",
  },
  {
    prop: "InvolvedDrawingChangeOrNot",
    label: "是否涉及图样变更",
  },
  {
    prop: "DigestVehicle",
    label: "消化车型及截止日期",
  },
  {
    prop: "EstimatedCompletionTime",
    label: "技术变更预计完成时间",
  },
])
const changeInfoTableColumn_ECA = ref([
  {
    prop: "Name",
    label: "名称",
  },
  {
    prop: "Number",
    label: "编号",
  },
  {
    prop: "PowerPredict",
    label: "产能预估",
  },
  {
    prop: "PrepareTestContent",
    label: "生产准备验证内容",
  },
  {
    prop: "CostChange",
    label: "成本变化",
  },
  {
    prop: "PrepareNeed",
    label: "生产准备需求",
  },
  {
    prop: "ChangeBasis",
    label: "变更依据",
  },
  {
    prop: "TestNeed",
    label: "上下场需求",
  },
  {
    prop: "SuggestFinishTime",
    label: "生产准备建议完成时间",
  },
])
const data_change = ref<any>([])
// 获取更改信息
const getData_change = (params: any) => {
  getChangeInfo(params).then((data: any) => {
    // console.log(data);
    data_change.value = data.data || {}
  }).catch(err => {
    console.log('获取更改信息', err);
    data_change.value = {}
  })
}
//#endregion

//#region 流程处理
const stepDataList = ref<any>([])
// 获取流程节点列表
const getData_flow = (params: any) => {
  getFlowTaskWorkItems(params).then((data: any) => {
    console.log(data);
    let btnArr: any = []
    data.data.forEach((ele: any) => {
      // 判断驳回状态
      if (ele.WORKITEM_Proofread[0]?.WORKITEM_VOTE === '驳回') ele.WORKITEM_STATE = 'error'
      // 获取任务提交按钮
      if (flowTaskData.value.flowTaskcurrent === ele.WORKITEM_NAME) {
        if (ele.WORKITEM_route.length) {
          ele.WORKITEM_route.forEach((btn: any) => {
            if (btn === '提交') btn = '完成任务'
          })
          btnArr = ele.WORKITEM_route
        } else {
          btnArr = []
        }
      }
    });
    stepDataList.value = data.data || []
    submitTaskBtn.value = btnArr || []
  }).catch(err => {
    console.log('获取流程节点列表', err);
    stepDataList.value = []
  })
}
// 催办
const handleUrgingBtn = (item: any) => {
  let curentUrl = window.location.href.split("?id="+ route.query.id);
  let targetUrl = curentUrl[0]+"?id="+item.WORKITEM_Proofread[0].WORKITEM_ID + curentUrl[1];

  let params = {
    "sysCode": "rdlp",
    "sendCode": userInfo.employeeNo,
    "sendName": userInfo.userName,
    "messageType": "01",
    "title": "流程催办消息",
    "msg": {
      "msgtype": "text",
      "text": {
        "content": `${flowTaskData.value.flowTaskDesc}_${flowTaskData.value.flowTaskPbo}(${flowTaskData.value.flowTaskProcessinitiator1} ${flowTaskData.value.flowTaskProcessStartTime})`
      },
      "link": {
        // "messageUrl": window.location.href
        "messageUrl": targetUrl
      }
    },
    "receiverList": [{
      "employeeNo": item.WORKITEM_Proofread[0].WORKITEM_USER,
      "userName": item.WORKITEM_Proofread[0].WORKITEM_USERNAME
    }]
  }
  const str = JSON.stringify(params)
  const paramsEncrypt = encrypt(str, SECRET_KEY, SECRET_IV)
  console.log('paramsEncrypt', paramsEncrypt);
  let paramsEn = {
    "data": paramsEncrypt
  }
  goUrging(paramsEn).then((data: any) => {
    console.log('goUrging', data);
    if (data.success) {
      ElMessage.success('催办成功！')
    } else {
      ElMessage.error('催办失败！')
    }
  })
}
//#endregion

//#region 随签对象
const data_object = ref<any>([]) // 随签对象
const data_object_affected = ref<any>([]) // 随签对象
const data_object_after = ref<any>([]) // 随签对象
const attachedTableColumn = ref([
  // {
  //   prop: "RejectionIdentifier",
  //   label: "驳回标识",
  // },
  // {
  //   prop: "MDocument",
  //   label: "M单单号",
  //   width: 130
  // },
  // {
  //   prop: "TDocument",
  //   label: "T单单号",
  //   width: 130
  // },
  // {
  //   prop: "ReviewIdentifier",
  //   label: "审阅标识",
  // },
  // {
  //   prop: "Url",
  //   label: "预览图纸",
  // },
  // {
  //   prop: "SeeInformation",
  //   label: "查看信息",
  // },
  {
    prop: "ObjType",
    label: "",
    width: 54
  },
  {
    prop: "Number",
    label: "编号",
    width: 240
  },
  {
    prop: "Name",
    label: "名称",
    width: 240
  },
  {
    prop: "State",
    label: "状态",
  },
  {
    prop: "Version",
    label: "版本",
  },
  {
    prop: "Modifier",
    label: "修改者",
  },
  {
    prop: "LatestUpdateTime",
    label: "上次修改时间",
    width: 155
  },
  // {
  //   prop: "DevelopmentMaturity",
  //   label: "研发成熟度",
  //   width: 110
  // },
  // {
  //   prop: "Details",
  //   label: "详细描述",
  // },
  // {
  //   prop: "TechnicalReleaseLevel",
  //   label: "技术放行级别",
  //   width: 110
  // },
  // {
  //   prop: "Characteristic",
  //   label: "特性",
  // },
  // {
  //   prop: "EstimatedAnnualUsage",
  //   label: "预计年用量",
  //   width: 110
  // },
  // {
  //   prop: "PartPhase",
  //   label: "阶段",
  // },
  // {
  //   prop: "EnglishName",
  //   label: "英文名称",
  // },
  // {
  //   prop: "Regulations",
  //   label: "法规件",
  // },
  // {
  //   prop: "KeyParts",
  //   label: "关重件",
  // },
  // {
  //   prop: "Recindex",
  //   label: "参图号",
  // },
])
// 获取随签对象/产生后的对象/受影响对象
const getObjectData = () => {
  let params = {
    flowTaskID: flowTaskID.value, // 任务ID （必填）更改
    employeeNo: userInfo.employeeNo // 工号（必填）
  }
  data_object.value = []
  if (type.value === 'FLOWTASK' || type.value === 'PN') {
    getData_object(params) // 获取随签对象
  } else if (type.value === 'ECR') {
    getData_affectObject(params) // 获取受影响对象列表
  } else if (type.value === 'ECA') {
    getData_object(params) // 获取随签对象
    getData_afterObject(params)  // 获取产生后的对象列表
    getData_affectObject(params) // 获取受影响对象列表
  }
}
// 设置审阅
const setReview = (row: any) => {
  if (!row.Oid || row.ReviewIdentifier==='true' || row.ObjType==='part' || row.ObjType==='EPM' || row.ObjTypeName==='图纸' || type.value==='ECR') return false
  let params = {
    flowTaskID: flowTaskID.value || '',
    employeeNo: userInfo.employeeNo || '',
    objReview:[
      {
        oid: row.Oid,
        reviewIdentifier: "1"
      }
    ]
  }
  setReviewIdentifier(params).then(data => {
    console.log(data);
    // 刷新列表
    resetObject()
  }).catch(err => {
    console.log('设置审阅标识', err);
  })
}
// 重新获取随签对象
const resetObject = (cb?: Function) => {
  let params = {
    flowTaskID: flowTaskID.value, // 任务ID （必填）更改
    employeeNo: userInfo.employeeNo // 工号（必填）
  }
  data_object.value = []
  if (type.value === 'FLOWTASK' || type.value === 'PN') {
    getData_object(params, cb) // 获取随签对象
  } else if (type.value === 'ECR') {
    getData_affectObject(params, cb) // 获取受影响对象列表
  } else if (type.value === 'ECA') {
    getData_object(params, cb) // 获取随签对象
  }
}
// 获取随签对象
const getData_object = (params: any, cb?: Function) => {
  getReviewObjList(params).then((data: any) => {
    console.log('获取随签对象',data);
    // 解密
    data.data.forEach((ele: any) => ele.Url = decrypt(ele.Url, SECRET_KEY, SECRET_IV))
    data_object.value = data.data || []
    if (cb) cb(data_object.value)
  }).catch(err => {
    console.log('获取随签对象', err);
    data_object.value = []
  })
}
// 获取受影响对象列表
const getData_affectObject = (params: any, cb?: Function) => {
  getChangeablesList(params).then((data: any) => {
    console.log('获取受影响对象列表',data);
    // 解密
    data.data.forEach((ele: any) => ele.Url = decrypt(ele.Url, SECRET_KEY, SECRET_IV))
    data_object_affected.value = data.data || []
    // ECR的随签对象列表使用受影响的对象列表
    if (type.value === 'ECR') {
      data_object.value = data.data || []
      if (cb) cb(data_object.value)
    }
  }).catch(err => {
    console.log('获取受影响对象列表', err);
    data_object_affected.value = []
    // ECR的随签对象列表使用受影响的对象列表
    if (type.value === 'ECR') data_object.value = []
  })
}
// 获取产生后的对象列表
const getData_afterObject = (params: any) => {
  getChangeablesAfter(params).then((data: any) => {
    // console.log(data);
    // 解密
    data.data.forEach((ele: any) => ele.Url = decrypt(ele.Url, SECRET_KEY, SECRET_IV))
    data_object_after.value = data.data || []
  }).catch(err => {
    console.log('获取产生后的对象列表', err);
    data_object_after.value = []
  })
}
//#region 预览图纸弹窗
const viewChartDialog = reactive({
  visible: false,
  title: '',
  url: ''
})
const goViewChart = (row: any) => {
  viewChartDialog.url = row.Url || ''
  viewChartDialog.title = '预览图纸'
  viewChartDialog.visible = true
  setReview(row) // 设置审阅
  // isReviewed = true; // 设置审阅完成
}
//#endregion

//#endregion

//#region 审批记录
const allData_record = ref([])
const data_record = ref([])
let frontEndID = 1
const approvalTableColumn = ref([
  {
    prop: "WORKITEM_NAME",
    label: "名称",
  },
  {
    prop: "WORKITEM_USERNAME",
    label: "工作负责人",
    width: 120,
  },
  {
    prop: "WORKITEM_ROLE",
    label: "角色",
  },
  {
    prop: "WORKITEM_VOTE",
    label: "投票",
  },
  {
    prop: "WORKITEM_COMMENTS",
    label: "备注",
  },
  {
    prop: "WORKITEM_COMPLETE",
    label: "完成者",
    width: 100,
  },
  {
    prop: "WORKITEM_StartTime",
    label: "开始日期",
    width: 170,
    sortType: 'time'
  },
  {
    prop: "WORKITEM_COMPLETEDDATE",
    label: "完成日期",
    width: 170,
    sortType: 'time'
  },
])
// 获取审批记录
const getData_record = (params: any) => {
  getFlowTaskProofread(params).then((data: any) => {
    // console.log(data);
    data.data.forEach((ele: any) => ele.frontEndID = frontEndID++)
    allData_record.value = data.data || []
    goSort()
  }).catch(err => {
    console.log('获取审批记录', err);
    data_record.value = []
  })
}
//#region 排序
const sortData = ref({
  prop: '',
  order: '',
  sortType: ''
})
// 初始化排序
const initSort = () => {
  // 顺查默认按位置号排序
  const box = instance.refs.tableRef.$el.querySelector('#WORKITEM_COMPLETEDDATE.caret-wrapper')
  if (box) {
    const box = instance.refs.tableRef.$el.querySelector('#WORKITEM_COMPLETEDDATE.caret-wrapper')
    box.className = 'caret-wrapper ascending'
    sortData.value = {
      prop: 'WORKITEM_COMPLETEDDATE',
      order: 'ascending',
      sortType: 'number'
    }
  }
}
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
  if (sortData.value.order) {
    console.log('sort1');
    allData_record.value.sort((a: any, b: any) => {
      return handleSort(a, b) as any
    })
  } else {
    console.log('sort2');
    allData_record.value.sort((a: any, b: any) => a.frontEndID - b.frontEndID)
  }
  data_record.value = allData_record.value
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

//#region sharedWorker
const worker = new sharedWorker()
worker.port.start();
// 刷新任务列表
const refreshTaskList = () => {
  worker.port.postMessage("refreshTaskList");
}
onBeforeUnmount(() => {
  worker.port.close()
})
//#endregion

// 刷新页面
const reloadPage = () => {
  setTimeout(() => location.reload(), 1000)
}
</script>

<style lang='scss' scoped>
.flowDetail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .pdm-card {
    position: relative;
    padding: 6px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    &+.pdm-card {
      margin-top: 16px;
    }
    .pdm-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .pdm-card-head-title {
        font-size: 18px;
        font-weight: bold;
      }
      .pdm-card-head-btn {
        display: flex;
      }
    }
    .pdm-content {
      .descriptions {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        .descriptions-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        :deep(.el-button span) {
          font-size: inherit!important;
        }
      }
      .descriptions2 {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .descriptions-item {
          width: 320px;
          height: 28px;
          display: flex;
          gap: 12px;
          align-items: center;
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
        :deep(.el-button span) {
          font-size: inherit!important;
        }
      }
    }
    .pdm-point {
      position: absolute;
      bottom: 0;
    }
  }
  .scroll-card {
    .topPoint {
      margin-bottom: 16px;
    }
    :deep(.el-scrollbar__view) {
      overflow: hidden;
    }
  }
}
.stepsWrapper {
  overflow: auto;
  padding-top: 6px;
  :deep(.el-steps) {
    .title {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 18px;
      margin: 6px 0;
      .name {
        width: max-content;
        height: 18px;
        font-size: 14px;
        padding: 0 16px;
      }
      .record {
        width: max-content;
        height: 18px;
        font-size: 12px;
        padding: 0 16px;
      }
    }
  }
}
.childStep {
  width: max-content;
  :deep(.el-table) {
    display: flex;
    flex-direction: column;
    .el-table__header-wrapper {
      height: 38px;
    }
  }
}
.success {
  color: #6cc04c;
}
.error {
  color: #e60012;
}
.info {
  color: #909399;
}
.el-button--mini.is-circle {
  padding: 5px;
}
.el-divider--horizontal {
  margin: 10px 0 !important;
}
:deep(.el-form) {
  div.el-form-item *,
  div.el-form-item .el-form-item__label {
    font-size: 14px !important;
  }
}
// .el-dialog__wrapper {
//   z-index: 1000!important;
// }
</style>
