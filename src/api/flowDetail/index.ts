import request from "@/utils/https/pdm_servers"
const env = import.meta.env

// 基本信息
export function getFlowTaskDetail(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getFlowTaskDetail',
    method: 'post',
    data
  })
}
// 催办
export function goUrging(data: any) {
  return request({
    url: env.VUE_APP_BASE_DATA + '/sys/pdm/notice/send',
    method: 'post',
    data
  })
}
// 随签对象列表
export function getReviewObjList(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getReviewObjList',
    method: 'post',
    data
  })
}
// 流程节点列表
export function getFlowTaskWorkItems(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getFlowTaskWorkItems',
    method: 'post',
    data
  })
}
// 审批记录
export function getFlowTaskProofread(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getFlowTaskProofread',
    method: 'post',
    data
  })
}
// 获取更改信息
export function getChangeInfo(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getChangeInfo',
    method: 'post',
    data
  })
}
// 受影响对象列表
export function getChangeablesList(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getChangeablesList',
    method: 'post',
    data
  })
}
// 产生后的对象列表
export function getChangeablesAfter(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getChangeablesAfter',
    method: 'post',
    data
  })
}
/**
 * 任务提交
 */
export function submitTask(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/submitTask',
    method: 'post',
    data
  })
}
/**
 * 随签对象驳回
 */
export function attachedReview(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/attachedReviewObj',
    method: 'post',
    data
  })
}
/**
 * 会签者下拉选项
 */
export function getCountersignerList(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getCountersignerList',
    method: 'post',
    data
  })
}
/**
 * 接受任务
 */
export function flowTaskAccept(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/flowTaskAccept',
    method: 'post',
    data
  })
}
/**
 * 重新分配
 */
export function flowTaskReassign(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/flowTaskReassign',
    method: 'post',
    data
  })
}
/**
 * 流程编辑
 */
export function flowTaskSave(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/flowTaskSave',
    method: 'post',
    data
  })
}
/**
 * 获取随签对象的文档
 */
export function getReviewObjDoc(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getReviewObjDoc',
    method: 'post',
    data
  })
}
/**
 * 设置审阅标识
 */
export function setReviewIdentifier(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/setReviewIdentifier',
    method: 'post',
    data
  })
}
/**
 * 获取比对物料号
 */
export function getSaveAsFrom(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getSaveAsFrom',
    method: 'post',
    data
  })
}
/**
 * 获取物料更改记录
 */
export function getPartChangeInfo(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getPartChangeInfo',
    method: 'post',
    data
  })
}
/**
 * 获取BOM更改记录
 */
export function getBOMChangeInfo(data: any) {
  return request({
    url: env.VITE_APP_PDM + '/servlet/rest/CoreWorkflowRest/getBOMChangeInfo',
    method: 'post',
    data
  })
}
