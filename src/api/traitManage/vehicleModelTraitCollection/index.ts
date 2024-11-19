import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 车型特征集接口
// 产品名称接口（根据当前用户的所属组织得到该组织的所有产品（过滤特征库））
export function getProductList(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfBaseManage/getProductList",
    method: "get",
    data
  })
}
// 特征集列表（根据产品名称（oid）取得特征集）
export function getOptionSetByProduct(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/getOptionSetByProduct",
    method: "post",
    data
  })
}
// 获取该组织所有选项集
export function getOptionSets() {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/getOptionSets",
    method: "get"
  })
}
// 新建/修改-特征集
export function addOrUpdateOptionSet(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/createOrUpdateOptionSet",
    method: "post",
    data
  })
}
// 另存为-特征集
export function SaveAsOptionSet(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/saveAsOptionSet",
    method: "post",
    data
  })
}
// 根据产品取得对应分配的特征集
export function getOptionByOptionSet(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/getOptionByOptionSet",
    method: "post",
    data
  })
}
// 特征列表接口--（根据特征库拉取特征，考虑特征集回显问题）
export function getOptionListOfMangerOption(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/getOptionListOfMangerOption",
    method: "post",
    data
  })
}
// 管理特征接口--（保存选中的特征值）
export function mangerOptionOfOptionSet(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/mangerOptionOfOptionSet",
    method: "post",
    data
  })
}
// 删除特征集接口
export function delOptionSet(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfOptionSet/delOptionSet",
    method: "post",
    data
  })
}
//#endregion
