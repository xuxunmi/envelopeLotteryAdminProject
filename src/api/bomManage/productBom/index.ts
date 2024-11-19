import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 产品BOM
// 获取产品顶层BOM接口
export function getProductTopBom(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getProductTopBom",
    method: "post",
    data
  })
}
// 获取产品BOM
export function getProductPZBom(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getProductPZBom",
    method: "post",
    data
  })
}
// 获取产品BOM
export function getProductLayerBom(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getProductLayerBom",
    method: "post",
    data
  })
}
// 模糊查找部件列表
export function getFindPartList(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getFindPartList",
    method: "post",
    data
  })
}
// Bom插入部件
export function bomInsertPart(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/bomInsertPart",
    method: "post",
    data
  })
}
// 编辑BOM
export function editBomItem(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/editBomItem",
    method: "post",
    data
  })
}
// 删除BOM
export function delBomItem(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/delBomItem",
    method: "post",
    data
  })
}
// 新建部件
export function createPart(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/product/createPart",
    method: "post",
    data
  })
}
// 检出
export function checkOutObject(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfObject/checkOutObject",
    method: "post",
    data
  })
}
// 检入
export function checkInObject(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfObject/checkInObject",
    method: "post",
    data
  })
}
// 获取流水码
export function getSerialNumber(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/product/getSerialNumber",
    method: "post",
    data
  })
}
// 获取文档流水码
export function getDocumentCode(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/PartController/getDocumentCode",
    method: "post",
    data
  })
}
// 设置是否裁剪属性值
export function setIsCropping(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/setIsCropping",
    method: "post",
    data
  })
}
// 获取是否裁剪属性值
export function getIsCropping(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getIsCropping",
    method: "post",
    data
  })
}
// 导出BOM到Excel
export function exportPZBom(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/exportPZBom",
    method: "post",
    data,
    responseType: "blob",
  })
}
// 设置数量
export function setAmount(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/setAmount",
    method: "post",
    data,
  })
}
// 上海整机PBOM列表
export function getAllChild(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/getAllChild",
    method: "post",
    data,
  })
}
// 上海整机PBOM列表 - BOM裁剪
export function pbomToMBOM(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/PartController/pbomToMBOM",
    method: "post",
    data,
  })
}
// 上海整机PBOM列表 - BOM裁剪
export function saveBom(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfPart/saveBom",
    method: "post",
    data,
  })
}
//#endregion

//#region 显示规则
export function saveShowRule(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/sysDisplayRule/createOrEdit",
    method: "post",
    data,
  })
}

export function showRuleDetail(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/sysDisplayRule/getDisplayRule",
    method: "post",
    data,
  })
}
//#endregion
