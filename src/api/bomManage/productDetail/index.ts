import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 物料详情
// 获取部件的相关对象
export function getPartRelatedObjects(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getPartRelatedObjects",
    method: "post",
    data
  })
}
// 获取部件的历史记录
export function getPartHistoryRecord(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getPartHistoryRecord",
    method: "post",
    data
  })
}
// 获取文档的相关对象
export function getDocumentRelatedObjects(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfDocument/getDocumentRelatedObjects",
    method: "post",
    data
  })
}
// 获取文档的历史记录
export function getDocumentHistoryRecord(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfDocument/getDocumentHistoryRecord",
    method: "post",
    data
  })
}
// 库存列表
export function getInventoryViewList(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getInventoryViewList",
    method: "post",
    data
  })
}
//#endregion
