<template>
    <div v-loading="loading" class="sf-container-main-content">
        <!-- <div class="title">{{ t("productLibraryPage.folder") }}</div> -->
        <div class="sf-search-wrapper">
            <el-form :model="searchForm" size="small">
                <el-form-item :label="t('productLibraryPage.folder')">
                    <el-input v-model.trim="searchForm.name" @keyup.enter="searchEnterFun" />
                </el-form-item>
            </el-form>
        </div>
        <div class="sf-table-wrapper">
            <pt-table
                :key="onlykey"
                ref="PtTableRef"
                row-key="oid"
                :tableColumns="tableColumns"
                :tableEditConfig="tableEditConfig"
                :paginationConfig="paginationConfig"
                :menuConfig="menuConfig"
                :data="tableData"
                :locale="locale"
                :expand-row-keys="expandRowKeys"
                border
                highlight-current-row
                size="small"
                lazy
                :load="loadTableTreeData"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                @row-click="handleRowClick"
            >
                <!-- 表格编辑插槽 -->
                <template #slot-edit>
                    <span class="table-edit">
                        <el-button
                            size="small"
                            type="primary"
                            @click="handleAddEditFolderBtn('add', currentRowData)"
                            :disabled="currentRowData.type !== 'PDMLinkProduct'"
                            >{{ t("productLibraryPage.createFolder") }}</el-button
                        >
                        <el-button
                            size="small"
                            type="primary"
                            @click="handleAddEditFolderBtn('edit', currentRowData)"
                            :disabled="currentRowData.type !== 'folder'"
                            >{{ t("productLibraryPage.editFolder") }}</el-button
                        >
                    </span>
                </template>
                <!-- 自定义列模板插槽 -->
                <template #col-name="{ row }">
                    <el-icon class="folder-icon" v-if="row.type !== 'PDMLinkProduct'"><Folder /></el-icon>
                    {{ row.name }}
                </template>
                <!-- 右键菜单 -->
                <template #slot-menu="{ row }">
                    <li @click="handleAddEditFolderBtn('add', row)">
                        <el-button size="small" link>新建</el-button>
                    </li>
                    <li class="menu-li" @click="handleRefreshFolderBtn(row)">
                        <el-button size="small" link>刷新</el-button>
                    </li>
                    <template v-if="row.type === 'folder'">
                        <li @click="handleAddEditFolderBtn('edit', row)">
                            <el-button size="small" link>编辑</el-button>
                        </li>
                        <!-- <li class="menu-li" @click="handleFolderNodeMoveUp">
                        <el-button size="small" link>上移</el-button>
                    </li>
                    <li class="menu-li" @click="handleFolderNodeMoveDown">
                        <el-button size="small" link>下移</el-button>
                    </li> -->
                        <li class="menu-li" @click="handleDeleteFolderBtn(row)">
                            <el-button size="small" link>删除</el-button>
                        </li>
                    </template>
                </template>
            </pt-table>
        </div>

        <!-- 新增/编辑文件夹弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.folder" :footer="false" width="40%">
            <creatFolderDialog
                v-if="dialogVisible.folder"
                v-model:visible="dialogVisible.folder"
                :currentRowData="rightMenuRowData"
                :dialogType="dialogType"
                @confirm-success="handleConfirmSuccess"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue"
// import type { ElTable } from "element-plus"
import type {
    PtTableComponent,
    PtTableEditConfigType,
    PtTableColumnsType,
    PtPaginationType,
    PtMenuConfigType
} from "@/plugins/pt-front"
import dialogFrame from "@/components/dialogFrame/index.vue"
import creatFolderDialog from "./creatFolderDialog.vue"
import { ProductListDataInterface } from "@/interface/product"
import { productList, productFolderLazyChildrenNode, folderNodeMove, deleteFolder } from "@/api/productLibrary"
import emitter from "@/utils/mitt"
import {
    recursionArray,
    findTableTreeNodeByName,
    findParentIds,
    findNextSiblingNodes,
    findPreviousSiblingNodes
} from "@/utils"
import { useI18n } from "vue-i18n"

//#region 参数和方法
const { t, locale } = useI18n()
const loading = ref(false)

const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    folder: false // 新增/编辑文件夹对话框
})

const currentRowData = ref<ProductListDataInterface>({
    oid: "",
    name: "",
    type: "",
    sort: ""
})
const rightMenuRowData = ref<ProductListDataInterface>({
    oid: "",
    name: "",
    type: "",
    sort: ""
})
const tableNodeFirstOid = ref<string>("") // 表格第一行oid
//#endregion

//#region 表单
const searchForm = reactive({
    name: ""
})

const searchEnterFun = () => {
    if (!searchForm.name || !tableData.value.length) return
    const searchValue = searchForm.name.toLowerCase()
    const rowResult = findTableTreeNodeByName(tableData.value, searchValue)
    if (!rowResult) return
    // 高亮当前行
    PtTableRef.value!.setCurrentRow(rowResult)
    // 展开当前行所有父级
    expandRowKeys.value = findParentIds(tableData.value, rowResult.oid)
    currentRowData.value = rowResult
    emitter.emit("productFolderRowData", rowResult)
}
// 方法

//#endregion

//#region pt-table表格
const PtTableRef = ref<PtTableComponent>()
// const tableRef = ref<InstanceType<typeof ElTable>>()
const tableEditConfig = reactive<PtTableEditConfigType>({
    size: "small",
    colSetShow: false
})

// 表格列
const tableColumns = ref<PtTableColumnsType>([
    {
        width: "80",
        slot: "icon",
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: false
    },
    {
        type: 'index',
        label: "序号",
        width: '55',
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
    },
    {
        prop: "name",
        label: computed(() => t("productLibraryPage.name")) as any,
        headerAlign: "center",
        // showOverflowTooltip: true,
        show: true,
        slot: "name"
    }
])

// 默认树展开项
const expandRowKeys = ref<Array<string>>([])
const tableData = ref<ProductListDataInterface[]>([])

const loadMap = new Map() // 保存懒加载
const onlykey = ref<number>(1)

//#region el-table相关事件
const loadTableTreeData = async (
    row: ProductListDataInterface,
    treeNode: unknown,
    resolve: (date: ProductListDataInterface[]) => void
) => {
    try {
        loading.value = true
        const params: {
            oid: string
        } = {
            oid: row.oid
        }
        //将懒加载节点数据添加到loadMap变量中
        loadMap.set(row.oid, { row, treeNode, resolve })
        // console.log("loadMap", loadMap)
        const { data } = (await productFolderLazyChildrenNode(params)) as { data: any }
        loading.value = false
        // 手动添加到当前懒加载节点下
        row.children = data
        // console.log("tableData:", tableData.value)
        resolve(data)
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}

const handleRowClick = (row: ProductListDataInterface) => {
    currentRowData.value = row
    emitter.emit("productFolderRowData", row)
}
//#endregion

// 获取表格树列表
const getProductFolderList = async () => {
    try {
        loading.value = true
        const { data } = (await productList()) as { data: any }
        loading.value = false
        tableData.value =
            data.map((item: ProductListDataInterface) => {
                return {
                    hasChildren: true,
                    name: item.name,
                    oid: item.oid,
                    type: item.type,
                    children: []
                }
            }) || []
        // 缓存第一行oid
        tableNodeFirstOid.value = tableData.value[0].oid
        // console.log("tableNodeFirstOid.value:", tableNodeFirstOid.value)
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}

getProductFolderList()
//#endregion

//#region 分页
const paginationConfig = reactive<PtPaginationType>({
    show: false
})
//#endregion

//#region 右键菜单
const menuConfig = reactive<PtMenuConfigType>({
    showMenu: true
})
//#endregion

// 局部刷新表格树节点
const refreshTableNode = (oid: string) => {
    console.log("loadMap", loadMap, oid)
    if (loadMap.get(oid)) {
        console.log(222)
        const { row, treeNode, resolve } = loadMap.get(oid)
        loadTableTreeData(row, treeNode, resolve)
    } else {
        console.log(3333)
        getProductFolderList()
    }
}

const handleAddEditFolderBtn = (type: string, row: any) => {
    dialogTitle.value = type === "add" ? t("productLibraryPage.createFolder") : t("productLibraryPage.editFolder")
    dialogType.value = type
    rightMenuRowData.value = row
    dialogVisible.folder = true
}

// 获取父级懒加载oid
const getParentLazyOid = async (oid: string) => {
    let parentOid = ""
    recursionArray(tableData.value, (item, i, parent) => {
        if (item.oid === oid && parent) parentOid = parent.oid
        onlykey.value++
    })
    console.log("parentOid", parentOid)
    return parentOid
}

// 上移
// const handleFolderNodeMoveUp = async () => {
//     // console.log("上移", currentTreeNodeData.value)
//     // 当前节点0id
//     const currrentNodeOid = currentRowData.value.oid
//     console.log("currrentNodeOid上:", currrentNodeOid)
//     // 当前节点排序
//     const currrentNodeSort = currentRowData.value.sort
//     console.log("currrentNodeSort上:", currrentNodeSort, tableData.value)
//     const previousSiblingNodes = findPreviousSiblingNodes(tableData.value, currrentNodeOid)
//     console.log(" previousSiblingNodes上:", previousSiblingNodes)
//     // if (previousSiblingNodes.length) {
//     //     // 上一兄弟节点id
//     //     const previousNodeOid = previousSiblingNodes[0].oid
//     //     // console.log("previousNodeOid:", previousNodeOid)
//     //     // 上一兄弟节点排序
//     //     const previousNodeSort = previousSiblingNodes[0].sort
//     //     treeNodeMove(currrentNodeOid, previousNodeOid, currrentNodeSort, previousNodeSort)
//     // } else {
//     //     ElMessage({
//     //         type: "warning",
//     //         message: "当前行不可上移",
//     //         center: true
//     //     })
//     // }
// }
// 下移
// const handleFolderNodeMoveDown = async () => {
//     // console.log("下移", currentTreeNodeData.value)
//     // 当前节点oid
//     const currrentNodeOid = currentRowData.value.oid
//     // console.log("currrentNodeOid下:", currrentNodeOid)
//     // 当前节点排序
//     const currrentNodeSort = currentRowData.value.sort
//     // console.log("currrentNodeSort下:", currrentNodeSort, tableData.value)
//     const nextSiblingNodes = findNextSiblingNodes(tableData.value, currrentNodeOid)
//     // console.log(" nextSiblingNodes下:", nextSiblingNodes)
//     if (nextSiblingNodes.length) {
//         // 下一兄弟节点oid
//         const nextNodeOid = nextSiblingNodes[0].oid
//         // console.log("nextNodeOid:", nextNodeOid)
//         // 下一兄弟节点排序
//         const nextNodeSort = nextSiblingNodes[0].sort
//         treeNodeMove(currrentNodeOid, nextNodeOid, currrentNodeSort, nextNodeSort)
//     } else {
//         ElMessage({
//             type: "warning",
//             message: "当前行不可下移",
//             center: true
//         })
//     }
// }

// 个人文件夹：上移/下移
// const treeNodeMove = async (oid: string, moveOid: string, sort: number, moveSort: number) => {
//     // console.log("移动参数：", oid, moveOid, sort, moveSort)
//     try {
//         const params = {
//             oid, // 当前节点oid
//             moveOid, // 上移就是上个节点的oid，下移就是下一个oid
//             sort, // 当前节点排序
//             moveSort // 上移就是上个节点的排序，下移就是下一个排序
//         }
//         await folderNodeMove(params)
//         let parentOid = ""
//         recursionArray(tableData.value, (item, i, parent) => {
//             if (item.oid === currentRowData.value.oid && parent) parentOid = parent.oid
//             onlykey.value++
//         })
//         if (parentOid) refreshTableNode(parentOid)
//         ElMessage({
//             type: "success",
//             message: "移动成功",
//             center: true
//         })
//     } catch (err: any) {
//         if (err.msg)
//             ElMessage({
//                 type: "error",
//                 message: err.msg,
//                 center: true
//             })
//         return
//     }
// }

const handleRefreshFolderBtn = (row: ProductListDataInterface) => {
    refreshTableNode(row.oid)
}

const handleDeleteFolderBtn = (rowData: ProductListDataInterface) => {
    ElMessageBox.confirm("是否确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            const oid = rowData.oid
            deleteBatchHandler(oid)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: "已取消删除操作！",
                center: true
            })
        })
}

const deleteBatchHandler = async (oid: string) => {
    try {
        const params = {
            FolderOid: oid
        }
        loading.value = true
        await deleteFolder(params)
        ElMessage({
            type: "success",
            message: "删除成功",
            center: true
        })
        const parentOid = await getParentLazyOid(oid)
        if (parentOid) refreshTableNode(parentOid)
        resetDialog()
    } catch (err: any) {
        console.log(err)
    } finally {
        loading.value = false
    }
}
//#endregion

//#region 关闭对话弹窗
const handleConfirmSuccess = async (oid: string) => {
    dialogVisible.folder = false
    if (dialogType.value === "add") {
        // 新增
        refreshTableNode(oid)
    } else if (dialogType.value === "edit") {
        // 编辑
        // 查找父级oid
        const parentOid = await getParentLazyOid(oid)
        if (parentOid) refreshTableNode(parentOid)
    }
}
//#endregion

// 重置dialog值
const resetDialog = () => {
    Object.assign(currentRowData.value, {
        oid: "",
        name: "",
        type: ""
    })
}

const findTableTreeNodeByOid = (arr: ProductListDataInterface[], oid: string): any => {
    for (const obj of arr) {
        if (obj.oid === oid) {
            return obj
        }
        if (obj.children) {
            const found: ProductListDataInterface | null = findTableTreeNodeByOid(obj.children, oid)
            if (found) {
                return found
            }
        }
    }
    return null
}

onMounted(() => {
    emitter.on("localRefreshProductParentNodeOId", (oid) => {
        dialogVisible.folder = false
        if (!oid) return
        // 如果是在第一行创建文件,直接刷新整个表格
        if (oid === tableNodeFirstOid.value) {
            getProductFolderList()
        } else {
            const currentNode = findTableTreeNodeByOid(tableData.value, oid)
            if (!currentNode.hasChildren) {
                productFolderLazyChildrenNode({ oid })
                    .then((res) => {
                        const { data } = res
                        recursionArray(tableData.value, (item: any) => {
                            if (item.oid === oid) {
                                item.children = data
                                item.hasChildren = false
                                onlykey.value++
                            }
                        })
                        expandRowKeys.value.push(oid)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        }
    })
})

// 页面关闭卸载掉emitter订阅
onBeforeUnmount(() => {
    emitter.off("productOid")
    emitter.off("localRefreshProductParentNodeOId")
})
</script>

<style lang="scss" scoped>
.sf-container-main-content {
    .title {
        height: 30px;
        line-height: 30px;
        background: #409eff;
        color: #fff;
        font-weight: bold;
        padding-left: 12px;
    }
    .folder-icon {
        position: relative;
        top: 2px;
        margin-right: 5px;
    }
}
</style>
