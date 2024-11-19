import { SelectInterface } from "@/interface/common"

/**
 * 传入id查找名称
 * @param arr 数组
 * @param id id
 * @param options 选项
 */
export const getNameById = (
    arr: Array<any>,
    id: string | number,
    options = {
        value: "id",
        label: "name"
    }
) => {
    const { value, label } = options
    const find = arr.find((ele) => ele[value] === id)
    return find ? find[label] : ""
}

/**
 * 传入id查找名称
 * @param arr 树数组
 * @param id id
 */
export const findNameById = (data: any[], id: string): string | null => {
    for (const item of data) {
        if (item.id === id) {
            return item.name
        } else if (item.children && item.children.length > 0) {
            const name = findNameById(item.children, id)
            if (name) {
                return name
            }
        }
    }
    return null
}

// 状态列表
export const statusList: SelectInterface[] = [
    {
        id: "启用",
        name: "启用"
    },
    {
        id: "禁用",
        name: "禁用"
    }
]

// 日志操作状态列表
export const operateStatusList: SelectInterface[] = [
    {
        id: 0,
        name: "失败"
    },
    {
        id: 1,
        name: "成功"
    }
]

// 语言列表
export const languageList: SelectInterface[] = [
    {
        id: "zh_cn",
        name: "中文"
    },
    {
        id: "en",
        name: "English"
    }
]

// 是or否列表
export const yesOrNoList: SelectInterface[] = [
    {
        id: 1,
        name: "是"
    },
    {
        id: 0,
        name: "否"
    }
]

// 高级查询条件列表
// 高级搜索条件目前只有时间才会有大于、小于
export const queryConditionList: SelectInterface[] = [
    {
        id: "等于",
        name: "等于"
    },
    {
        id: "不等于",
        name: "不等于"
    },
    {
        id: "in",
        name: "在...之中"
    },
    {
        id: "not in",
        name: "不在...之中"
    },
    {
        id: "包含",
        name: "包含"
    },
    {
        id: "不包含",
        name: "不包含"
    },
    {
        id: "左包含",
        name: "左包含"
    },
    {
        id: "右包含",
        name: "右包含"
    }
]
export const queryConditionList2: SelectInterface[] = [
    {
        id: "等于",
        name: "等于"
    },
    {
        id: "不等于",
        name: "不等于"
    }
]
export const queryConditionList_time: SelectInterface[] = [
    {
        id: "小于",
        name: "小于"
    },
    {
        id: "大于",
        name: "大于"
    },
    {
        id: "等于",
        name: "等于"
    },
    {
        id: "包含",
        name: "包含"
    }
]

export const queryConditionList_material: SelectInterface[] = [
    {
        id: "左包含",
        name: "左包含"
    },
    {
        id: "右包含",
        name: "右包含"
    },
    {
        id: "包含",
        name: "包含"
    },
    {
        id: "等于",
        name: "等于"
    }
]

// 单位列表
export const unitList: SelectInterface[] = [
    {
        id: "pcs",
        name: "pcs"
    },
    {
        id: "set",
        name: "set"
    },
    {
        id: "克",
        name: "克"
    },
    {
        id: "千克",
        name: "千克"
    },
    {
        id: "吨",
        name: "吨"
    },
    {
        id: "米",
        name: "米"
    },
    {
        id: "千米",
        name: "千米"
    },
    {
        id: "平方米",
        name: "平方米"
    },
    {
        id: "立方米",
        name: "立方米"
    },
    {
        id: "立方分米",
        name: "立方分米"
    },
    {
        id: "升",
        name: "升"
    },
    {
        id: "套",
        name: "套"
    }
]

// 零件类型列表
export const partTypeList: SelectInterface[] = [
    {
        id: "标准件",
        name: "标准件"
    },
    {
        id: "原材料",
        name: "原材料"
    },
    {
        id: "外购件",
        name: "外购件"
    },
    {
        id: "委外部件",
        name: "委外部件"
    },
    {
        id: "委外零件",
        name: "委外零件"
    },
    {
        id: "自制部件",
        name: "自制部件"
    },
    {
        id: "自制零件",
        name: "自制零件"
    },
    {
        id: "虚拟件",
        name: "虚拟件"
    },
    {
        id: "套件",
        name: "套件"
    }
]

// 关重件特性列表
export const impodegreeList: SelectInterface[] = [
    {
        id: "N/A",
        name: "N/A"
    },
    {
        id: "G",
        name: "G"
    },
    {
        id: "Z",
        name: "Z"
    }
]

// 工艺状态列表
export const processStatusList: SelectInterface[] = [
    {
        id: "无工艺",
        name: "无工艺"
    },
    {
        id: "工艺审核",
        name: "工艺审核"
    },
    {
        id: "工艺发布",
        name: "工艺发布"
    }
]

// 图幅列表
export const drawingList: SelectInterface[] = [
    {
        id: "A0",
        name: "A0"
    },
    {
        id: "A1",
        name: "A1"
    },
    {
        id: "A2",
        name: "A2"
    },
    {
        id: "A3",
        name: "A3"
    },
    {
        id: "A4",
        name: "A4"
    },
    {
        id: "N/A",
        name: "N/A"
    }
]

// 生命周期列表
export const lifeCycleTemplateList: SelectInterface[] = [
    {
        id: "编制",
        name: "编制"
    },
    {
        id: "审核",
        name: "审核"
    },
    {
        id: "发布",
        name: "发布"
    }
]

// 所属用户组列表
export const ownerGroupList: SelectInterface[] = [
    {
        id: "龙工（上海）叉车有限公司",
        name: "龙工（上海）叉车有限公司"
    },
    {
        id: "龙工（上海）路面机械有限公司",
        name: "龙工（上海）路面机械有限公司"
    },
    {
        id: "龙工（上海）挖掘机制造有限公司",
        name: "龙工（上海）挖掘机制造有限公司"
    },
    {
        id: "龙工（上海）机械制造有限公司",
        name: "龙工（上海）机械制造有限公司"
    },
    {
        id: "龙工（上海）液压有限公司",
        name: "龙工（上海）液压有限公司"
    },
    {
        id: "龙工（上海）精工液压有限公司",
        name: "龙工（上海）精工液压有限公司"
    },
    {
        id: "龙工（上海）机械部件有限公司",
        name: "龙工（上海）机械部件有限公司"
    },
    {
        id: "龙工（福建）机械有限公司",
        name: "龙工（福建）机械有限公司"
    },
    {
        id: "龙工（福建）挖掘机有限公司",
        name: "龙工（福建）挖掘机有限公司"
    },
    {
        id: "龙工（福建）铸锻有限公司",
        name: "龙工（福建）铸锻有限公司"
    },
    {
        id: "龙工（福建）桥箱有限公司",
        name: "龙工（福建）桥箱有限公司"
    },
    {
        id: "龙工（福建）液压有限公司",
        name: "龙工（福建）液压有限公司"
    },
    {
        id: "福建龙岩龙工机械配件有限公司",
        name: "福建龙岩龙工机械配件有限公司"
    },
    {
        id: "技术研究院",
        name: "技术研究院"
    },
    {
        id: "数据中心",
        name: "数据中心"
    }
]

// 阶段标识列表
export const productPhaseList: SelectInterface[] = [
    {
        id: "设计",
        name: "设计"
    },
    {
        id: "试制",
        name: "试制"
    },
    {
        id: "小批量生产",
        name: "小批量生产"
    },
    {
        id: "批量生产",
        name: "批量生产"
    },
    {
        id: "停产",
        name: "停产"
    },
    {
        id: "退市",
        name: "退市"
    }
]

// 装载机发料仓库列表
export const zzjissueStockList: SelectInterface[] = [
    {
        id: "配套库",
        name: "配套库"
    },
    {
        id: "VMI仓库",
        name: "VMI仓库"
    },
    {
        id: "VMI虚仓",
        name: "VMI虚仓"
    },
    {
        id: "薄板毛坯库",
        name: "薄板毛坯库"
    },
    {
        id: "备料毛坯库",
        name: "备料毛坯库"
    },
    {
        id: "铲斗周转库",
        name: "铲斗周转库"
    },
    {
        id: "出口整机仓（厂内）",
        name: "出口整机仓（厂内）"
    },
    {
        id: "出口整机仓（港口）",
        name: "出口整机仓（港口）"
    },
    {
        id: "出口整机库",
        name: "出口整机库"
    },
    {
        id: "批量生产",
        name: "批量生产"
    },
    {
        id: "待检仓",
        name: "待检仓"
    },
    {
        id: "刀具库",
        name: "刀具库"
    },
    {
        id: "动臂周转库",
        name: "动臂周转库"
    },
    {
        id: "非三包库",
        name: "非三包库"
    },
    {
        id: "废料库",
        name: "废料库"
    },
    {
        id: "废品回收虚仓",
        name: "废品回收虚仓"
    },
    {
        id: "钢材库",
        name: "钢材库"
    },
    {
        id: "工装委外库",
        name: "工装委外库"
    },
    {
        id: "后车架周转库",
        name: "后车架周转库"
    },
    {
        id: "机罩/挡泥板周转库",
        name: "机罩/挡泥板周转库"
    },
    {
        id: "驾驶室/油箱周转库",
        name: "驾驶室/油箱周转库"
    },
    {
        id: "配件内销库",
        name: "配件内销库"
    },
    {
        id: "配套大件库",
        name: "配套大件库"
    },
    {
        id: "平衡重周转库",
        name: "平衡重周转库"
    },
    {
        id: "前车架周转库",
        name: "前车架周转库"
    },
    {
        id: "三角铁公司仓库",
        name: "三角铁公司仓库"
    },
    {
        id: "三角铁客户仓库",
        name: "三角铁客户仓库"
    },
    {
        id: "实验整机库",
        name: "实验整机库"
    },
    {
        id: "涂装库",
        name: "涂装库"
    },
    {
        id: "涂装周转库",
        name: "涂装周转库"
    },
    {
        id: "挖机仓库",
        name: "挖机仓库"
    },
    {
        id: "外购代管库",
        name: "外购代管库"
    },
    {
        id: "外观周转库",
        name: "外观周转库"
    },
    {
        id: "委外库",
        name: "委外库"
    },
    {
        id: "小金工库",
        name: "小金工库"
    },
    {
        id: "油气库",
        name: "油气库"
    },
    {
        id: "整机返修库",
        name: "整机返修库"
    },
    {
        id: "整机下线库",
        name: "整机下线库"
    },
    {
        id: "中环库",
        name: "中环库"
    },
    {
        id: "装载机成品库",
        name: "装载机成品库"
    },
    {
        id: "综合库",
        name: "综合库"
    }
]

// 福建装载机发料仓库列表
export const fjzzjissueStockList: SelectInterface[] = [
    {
        id: "配套仓库",
        name: "配套仓库"
    },
    {
        id: "备料毛坯库",
        name: "备料毛坯库"
    },
    {
        id: "铲斗外购件现场库",
        name: "铲斗外购件现场库"
    },
    {
        id: "车间现场钢材库",
        name: "车间现场钢材库"
    },
    {
        id: "动臂外购件现场库",
        name: "动臂外购件现场库"
    },
    {
        id: "后车架外购件现场库",
        name: "后车架外购件现场库"
    },
    {
        id: "机罩外购件现场库",
        name: "机罩外购件现场库"
    },
    {
        id: "驾驶室外购件现场库",
        name: "驾驶室外购件现场库"
    },
    {
        id: "平衡重现场库",
        name: "平衡重现场库"
    },
    {
        id: "前车架外购件现场库",
        name: "前车架外购件现场库"
    },
    {
        id: "涂装库",
        name: "涂装库"
    },
    {
        id: "涂装外购件现场库",
        name: "涂装外购件现场库"
    },
    {
        id: "委外加工库",
        name: "委外加工库"
    },
    {
        id: "油箱挡泥板储气罐外购件现场库",
        name: "油箱挡泥板储气罐外购件现场库"
    },
    {
        id: "主刀板成品库",
        name: "主刀板成品库"
    },
    {
        id: "产品代管库",
        name: "产品代管库"
    },
    {
        id: "成品材料库",
        name: "成品材料库"
    },
    {
        id: "出口整机仓（厂内）",
        name: "出口整机仓（厂内）"
    },
    {
        id: "出口整机仓（港口）",
        name: "出口整机仓（港口）"
    },
    {
        id: "刀具库",
        name: "刀具库"
    },
    {
        id: "废料库",
        name: "废料库"
    },
    {
        id: "废品库",
        name: "废品库"
    },
    {
        id: "工装成品库",
        name: "工装成品库"
    },
    {
        id: "工装毛坯库",
        name: "工装毛坯库"
    },
    {
        id: "海克力斯成品库",
        name: "海克力斯成品库"
    },
    {
        id: "焊丝焊条库",
        name: "焊丝焊条库"
    },
    {
        id: "三角铁客户仓库",
        name: "三角铁客户仓库"
    },
    {
        id: "配套仓库2",
        name: "配套仓库2"
    },
    {
        id: "设备库",
        name: "设备库"
    },
    {
        id: "退货三包库",
        name: "退货三包库"
    },
    {
        id: "外购不合格品库",
        name: "外购不合格品库"
    },
    {
        id: "外购钢材库",
        name: "外购钢材库"
    },
    {
        id: "外购件代管库",
        name: "外购件代管库"
    },
    {
        id: "外购整机库",
        name: "外购整机库"
    },
    {
        id: "外观外购件现场库",
        name: "外观外购件现场库"
    },
    {
        id: "小金工库",
        name: "小金工库"
    },
    {
        id: "油气库",
        name: "油气库"
    },
    {
        id: "赠品不合格品库",
        name: "赠品不合格品库"
    },
    {
        id: "赠品成品材料库",
        name: "赠品成品材料库"
    },
    {
        id: "赠品钢材库",
        name: "赠品钢材库"
    },
    {
        id: "赠品配件库",
        name: "赠品配件库"
    },
    {
        id: "赠品配套仓库",
        name: "赠品配套仓库"
    },
    {
        id: "赠品油气库",
        name: "赠品油气库"
    },
    {
        id: "赠品综合库",
        name: "赠品综合库"
    },
    {
        id: "整机成品库",
        name: "整机成品库"
    },
    {
        id: "整机下线库",
        name: "整机下线库"
    },
    {
        id: "整机中环库仓库",
        name: "整机中环库仓库"
    },
    {
        id: "主刀板热处理库",
        name: "主刀板热处理库"
    },
    {
        id: "自制件不合格品库",
        name: "自制件不合格品库"
    },
    {
        id: "综合库",
        name: "综合库"
    }
]

// 计划方法列表
export const projectMethodList: SelectInterface[] = [
    {
        id: "MRP",
        name: "MRP"
    },
    {
        id: "DRP",
        name: "DRP"
    },
    {
        id: "DRP+MPS",
        name: "DRP+MPS"
    },
    {
        id: "DRP+MRP",
        name: "DRP+MRP"
    }
]

// 规划方法列表
export const planningMethodList: SelectInterface[] = [
    {
        id: "MRP规划",
        name: "MRP规划"
    },
    {
        id: "最高最低点法",
        name: "最高最低点法"
    },
    {
        id: "再订货点法",
        name: "再订货点法"
    },
    {
        id: "盘点补货法",
        name: "盘点补货法"
    },
    {
        id: "固定期间法",
        name: "固定期间法"
    },
    {
        id: "经济批量法",
        name: "经济批量法"
    },
    {
        id: "不使用物料规划",
        name: "不使用物料规划"
    }
]

// 变更通知通知分类列表
export const noticeClassificationList: SelectInterface[] = [
    {
        id: "特征变更",
        name: "特征变更"
    },
    {
        id: "物料变更",
        name: "物料变更"
    },
    {
        id: "配置BOM变更",
        name: "配置BOM变更"
    },
    {
        id: "订单BOM变更",
        name: "订单BOM变更"
    }
]

// 审批类型列表
export const approveTypeList: SelectInterface[] = [
    {
        id: "1",
        name: "通过"
    },
    {
        id: "0",
        name: "拒绝"
    }
]

// 发给我的状态列表
export const readStatusList: SelectInterface[] = [
    {
        id: 1,
        name: "未读"
    },
    {
        id: 2,
        name: "已读"
    }
]

// 数据字典状态列表
export const dictionaryStatusList = ref<SelectInterface[]>([
    {
        id: "0",
        name: "停用"
    },
    {
        id: "1",
        name: "正常"
    }
])

// 显示规则列表
export const optionVersionRuleList: SelectInterface[] = [
    {
        id: " ",
        name: "最新版本"
    },
    {
        id: "RELEASED",
        name: "最新发布版本"
    }
]
