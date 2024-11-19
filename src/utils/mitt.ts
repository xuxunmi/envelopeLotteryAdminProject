import mitt from "mitt"

type Events = {
    productOid: string // 产品库列表行oid
    productFolderRowData: any // 产品库文件夹列表行数据
    localRefreshProductParentNodeOId: string // 产品库文件夹内容父级表格行节点oid
    storageOid: string // 存储库列表行oid
    storageFolderRowData: any // 存储库文件夹列表行数据
    localRefreshStorageParentNodeOId: string // 存储库文件夹内容父级表格行节点oid
    detailAttrsCollectionForm: object // 部件/文档详细信息合集
    isRefreshWTPartDocumentDetailData: boolean // 是否刷新部件/文档详细信息
    clearFolderContentList: boolean // 清空文件夹内容列表
    //#region 企业级特征库
    enterpriseTraitLibrary_goDel: any // 删除
    enterpriseTraitLibrary_goAdd_option: any // 新建特征
    enterpriseTraitLibrary_goEdit_option: any // 编辑特征
    enterpriseTraitLibrary_goDetail: any // 查看详情（特征/特征值）
    enterpriseTraitLibrary_goAllocation: any // 分配到组
    enterpriseTraitLibrary_goAdd_choice: any // 新建特征值
    enterpriseTraitLibrary_goBatchAdd_choice: any // 批量新建特征值
    enterpriseTraitLibrary_goEdit_choice: any // 编辑特征值
    //#endregion
    //#region 产品配置
    productionConfiguration_options_group: (options: any[]) => void // 组织名称 - 下拉列表
    //#endregion
    //#region 首页
    dashboard_refresh_initiatedProcessList: () => void // 刷新我发起列表
    dashboard_refresh_pendingApprovalList: () => void // 刷新带我审批列表
    //#endregion
    //#region 头部设置
    kbom_showRule_interfaceRefresh: object // KBOM规则设置 - 接口刷新
    //#endregion
}

const emitter = mitt<Events>()

export default emitter
