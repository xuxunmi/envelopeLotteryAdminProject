import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 颜色分组
// 分页查询
export function colorGroupPage(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/colorGroupPage",
    method: "post",
    data
  })
}
// 添加颜色分组数据
export function createColorGroup(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/createColorGroup",
    method: "post",
    data
  })
}
// 多选移除
export function deleteColorGroupOids(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/deleteColorGroupOids",
    method: "post",
    data
  })
}
// 修改颜色分组
export function editColorGroup(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/editColorGroup",
    method: "post",
    data
  })
}
//#endregion
