import request from "@/utils/https/pdm_servers"
const env = import.meta.env

//#region 定义特征
// 根据物料获取特征接口
export function getOptionListOfPart(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getOptionListOfPart",
        method: "post",
        data
    })
}
// 获取特征列表接口
export function getAllOptionList(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getAllOptionList",
        method: "post",
        data
    })
}
// 选项集添加选项
export function addOption(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/addOption",
        method: "post",
        data
    })
}
// 选项集移除选项
export function delOption(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/delOption",
        method: "post",
        data
    })
}
// 设置选配顺序
export function setConfigurationSeq(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/setConfigurationSeq",
        method: "post",
        data
    })
}
// 设置特征集的界面显示（visitable）、是否关键特征（isKeyOption）
export function updateOption(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/updateOption",
        method: "post",
        data
    })
}
// 编辑特征回显
export function getOption(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getOption",
        method: "post",
        data
    })
}
// 编辑特征
export function saveOption(data: any) {
    return request({
        url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/saveOption",
        method: "post",
        data
    })
}
//#endregion

//#region 特征约束
// 查询物料约束列表
export function getRuleListOfPart(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getRuleListOfPart",
      method: "post",
      data
  })
}
// 新建约束
export function addRule(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/addRule",
      method: "post",
      data
  })
}
// 编辑约束
export function editRule(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/editRule",
      method: "post",
      data
  })
}
// 删除约束
export function delRule(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/delRule",
      method: "post",
      data
  })
}
// 下载配置特征报表
export function exportOptionListOfPart(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/exportOptionListOfPart",
      method: "post",
      data,
      responseType: "blob", // 接收二进制流
  })
}
// 特征约束下载
export function exportRuleListOfPart(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/exportRuleListOfPart",
      method: "post",
      data,
      responseType: "blob", // 接收二进制流
  })
}
// 下载配置条件报表
export function exportConditionListOfPart(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/exportConditionListOfPart",
      method: "post",
      data,
      responseType: "blob", // 接收二进制流
  })
}
//#endregion

//#region 配置待选项
// 查询已添加的待选物料列表
export function getCandidateListOfPart(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getCandidateListOfPart",
      method: "post",
      data
  })
}
// 添加待选物料
export function addCandidate(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/addCandidate",
      method: "post",
      data
  })
}
// 移除待选物料
export function delCandidate(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/delCandidate",
      method: "post",
      data
  })
}
//#endregion

//#region 配置条件
// 查询物料配置条件
export function getConditionListOfPart(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/getConditionListOfPart",
      method: "post",
      data
  })
}
// 添加条件
export function addCondition(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/addCondition",
      method: "post",
      data
  })
}
// 编辑条件
export function editCondition(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/editCondition",
      method: "post",
      data
  })
}
// 删除条件
export function delCondition(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/delCondition",
      method: "post",
      data
  })
}
// 设置条件顺序
export function saveOptionOrder(data: any) {
  return request({
      url: env.VITE_APP_PDM + "/servlet/rest/CoreRestServiceOfConfiguration/saveOptionOrder",
      method: "post",
      data
  })
}
//#endregion

//#region 颜色设置
// 分页查询
export function colorSettingPage(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/colorSettingPage",
    method: "post",
    data
  })
}
// 多选移除
export function deleteColorSetting(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/deleteColorSetting",
    method: "post",
    data
  })
}
// 添加系列颜色设置
export function createColorSetting(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/SysColorManger/createColorSetting",
    method: "post",
    data
  })
}
//#endregion

//#region 品名规则设置
// 增加品名
export function saveProNameRule(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/productNameRules/saveProNameRule",
    method: "post",
    data
  })
}
// 品名列表
export function getProNameRuleList(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/productNameRules/getProNameRuleList",
    method: "post",
    data
  })
}
// 获取单个列表
export function getSettingList(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/productNameRules/getSettingList",
    method: "post",
    data
  })
}
// 删除品名规则
export function delSettingDetail(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/productNameRules/delSettingDetail",
    method: "post",
    data
  })
}
// 规则排序
export function resortedSetting(data: object) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/productNameRules/resortedSetting",
    method: "post",
    data
  })
}
//#endregion


//#region 集成同步接口

export function sync_occ_crm_option(data: any) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/OccUpdateController/option",
    method: "post",
    data
  })
}

export function sync_occ_crm_rule(data: any) {
  return request<any>({
    url: env.VITE_APP_PDM + "/servlet/rest/OccUpdateController/rule",
    method: "post",
    data
  })
}

//#endregion
