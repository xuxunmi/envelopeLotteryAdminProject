<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main" v-loading="loading">
                <drop-line left-width="350px" :minDropWidth="[250, 500]" @dropWidthChange="handleDropWidthChange">
                    <template #left>
                        <div class="sf-container-main-content">
                            <div class="sf-table-wrapper" ref="treeWrapperRef">
                                <el-tree
                                    ref="treeRef"
                                    :data="treeData"
                                    :props="treeProps"
                                    :load="loadNode"
                                    :default-expanded-keys="defaultExpandedKeys"
                                    node-key="oid"
                                    check-on-click-node
                                    highlight-current
                                    lazy
                                    @node-click="handleNodeClick"
                                    @node-expand="handleNodeClick"
                                    @node-contextmenu="handleNodeContextmenu"
                                >
                                    <template #default="{ node, data }">
                                        <el-icon class="folder-icon mr-2" v-if="data.type === 'sysFolder'"
                                            ><Folder
                                        /></el-icon>
                                        <span>{{ data.name }}</span>
                                    </template>
                                </el-tree>

                                <!-- 树右键按钮 -->
                                <ul ref="rightContextMenuRef" class="menu" v-if="isShowMenu" @click="hidden">
                                    <li class="menu-li" @click="handleAddEditFolderBtn('add')">
                                        <el-button size="small" link>{{ $t("materielPage.create") }}</el-button>
                                    </li>
                                    <li class="menu-li" @click="handleAddEditFolderBtn('edit')">
                                        <el-button size="small" link :disabled="disabledEditBtn">{{
                                            $t("materielPage.edit")
                                        }}</el-button>
                                    </li>
                                    <!-- <li class="menu-li" @click="handleFolderTreeNodeMoveUp(chooseTreeNode)">
                                        <el-button size="small" link :disabled="disabledEditBtn">{{
                                            $t("materielPage.moveUp")
                                        }}</el-button>
                                    </li>
                                    <li class="menu-li" @click="handleFolderTreeNodeMoveDown(chooseTreeNode)">
                                        <el-button size="small" link :disabled="disabledEditBtn">{{
                                            $t("materielPage.moveDown")
                                        }}</el-button>
                                    </li> -->
                                    <li class="menu-li" @click="handleRefreshFolderBtn">
                                        <el-button size="small" link>{{ $t("materielPage.refresh") }}</el-button>
                                    </li>
                                    <li class="menu-li" @click="handleDeleteFolderBtn">
                                        <el-button size="small" link :disabled="disabledDeleteBtn">{{
                                            $t("materielPage.delete")
                                        }}</el-button>
                                    </li>
                                </ul>
                            </div>
                            <div class="sf-table-edit">
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="handleAddEditFolderBtn('add')"
                                    :disabled="disabledAddBtn"
                                    >{{ $t("materielPage.create") }}</el-button
                                >
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="handleAddEditFolderBtn('edit')"
                                    :disabled="disabledEditBtn"
                                    v-loading="loading"
                                    >{{ $t("materielPage.edit") }}</el-button
                                >
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="handleFolderTreeNodeMoveUp(chooseTreeNode)"
                                    :disabled="disabledEditBtn || !chooseTreeNode.oid"
                                    v-loading="loading"
                                    >{{ $t("materielPage.moveUp") }}</el-button
                                >
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="handleFolderTreeNodeMoveDown(chooseTreeNode)"
                                    :disabled="disabledEditBtn || !chooseTreeNode.oid"
                                    v-loading="loading"
                                    >{{ $t("materielPage.moveDown") }}</el-button
                                >
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="handleDeleteFolderBtn"
                                    :disabled="disabledDeleteBtn"
                                    v-loading="loading"
                                    >{{ $t("materielPage.delete") }}</el-button
                                >
                            </div>
                        </div>
                    </template>
                    <template #right>
                        <detail-page
                            ref="detailPageRef"
                            :currentTreeNodeData="currentTreeNodeData"
                            :colSpan="colSpan"
                        />
                    </template>
                </drop-line>
            </div>
        </div>

        <!-- 新增/编辑工作区文件夹弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.workspace" :footer="false" width="40%">
            <workspaceAddFolderDialog
                v-if="dialogVisible.workspace"
                v-model:visible="dialogVisible.workspace"
                :currentTreeNodeData="currentTreeNodeData"
                :dialogType="dialogType"
                @confirm-success="handleConfirmSuccess"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import type Node from "element-plus/es/components/tree/src/model/node"
import DropLine from "@/components/dropLine/index.vue"
import dialogFrame from "@/components/dialogFrame/index.vue"
import workspaceAddFolderDialog from "./components/workspaceAddFolderDialog.vue"
import detailPage from "./components/detailPage.vue"
import { MaterialTreeInterface } from "@/interface/materiel"
import { productList } from "@/api/productLibrary"
import { workspaceLazyChildrenNode, workspaceTreeMove, deleteWorkspaceFolder } from "@/api/productMange/materiel"
import { useI18n } from "vue-i18n"
import { findNextSiblingNodes, findPreviousSiblingNodes, findTreeNodeById } from "@/utils/index"

//#region 参数和方法
defineOptions({
    name: "materiel"
})

const { t } = useI18n()
const loading = ref(false)
//#endregion

//#region 弹窗
const dialogTitle = ref<string>("") // 弹窗标题
const dialogType = ref<string>("") // 弹窗类型
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    personalWorkspace: false // 新增/编辑个人文件夹对话框
})
//#endregion

//#region 系统菜单树
const treeProps = {
    label: "name",
    children: "children",
    isLeaf: "hasChildren"
}
const loadMap = new Map() // 保存懒加载
const treeRef = ref()
const defaultExpandedKeys = ref<string[]>(["0", "1"]) // ["0", "1"]
const treeData = ref<MaterialTreeInterface[]>([
    {
        oid: "0",
        name: "个人工作区",
        type: "personalWorkspace",
        flag: 0,
        hasChildren: false,
        children: []
    },
    {
        oid: "1",
        name: "公共工作区",
        type: "commonWorkspace",
        flag: 1,
        hasChildren: false,
        children: []
    }
])
const currentTreeNodeData = ref<any>({
    oid: "",
    name: "",
    flag: 0, // flag：0为个人，1为公共
    type: "" // flag：0为个人，1为公共
}) // 当前选择树节点
const chooseTreeNode = ref({
    oid: ""
})

// 禁用新建按钮
const disabledAddBtn = computed(() => {
    return (
        !currentTreeNodeData.value.oid ||
        currentTreeNodeData.value.oid === "1" ||
        currentTreeNodeData.value.type === "commonWorkspace"
    )
})

// 禁用编辑按钮
const disabledEditBtn = computed(() => {
    return (
        !currentTreeNodeData.value.oid ||
        currentTreeNodeData.value.oid === "0" ||
        currentTreeNodeData.value.oid === "1" ||
        currentTreeNodeData.value.type === "PDMLinkProduct"
    )
})

// 禁用删除按钮
const disabledDeleteBtn = computed(() => {
    return (
        !currentTreeNodeData.value.oid ||
        currentTreeNodeData.value.oid === "0" ||
        currentTreeNodeData.value.oid === "1" ||
        currentTreeNodeData.value.type === "personalWorkspace" ||
        currentTreeNodeData.value.type === "commonWorkspace" ||
        currentTreeNodeData.value.type === "PDMLinkProduct"
    )
})

const detailPageRef = ref()

// 获取公共工作区列表
const getProductList = async (resolve: (data: any[]) => void, node: Node) => {
    try {
        const { data } = (await productList()) as { data: any }
        const newData = data.map((item: any) => {
            return {
                ...item,
                pdmLinkProductOid: item.oid,
                flag: 1,
                children: [],
                hasChildren: false
            }
        })
        node.data.children = newData
        return resolve(newData)
    } catch (err: any) {
        console.log(err)
    }
}

// 获取工作区懒加载子节点树
const getWorkspaceLazyNodeList = async (oid: string, node: Node, resolve: (data: any[]) => void) => {
    try {
        const flag = node.data.flag === 0 ? 0 : 1
        const params = {
            oid,
            flag,
            pdmLinkProductOid: node.data.flag === 1 ? node.data.pdmLinkProductOid : "" // 公共工作区懒加载时需要传产品库oid
        }
        const { data } = (await workspaceLazyChildrenNode(params)) as { data: any }
        const newData = data.map((item: any) => {
            return {
                oid: item.oidStr,
                pid: item.pidStr,
                name: item.name,
                type: item.type,
                sort: item.sort,
                flag: item.flag,
                pdmLinkProductOid: item.pdmLinkProductOid,
                children: item.children ? item.children : [],
                hasChildren: item.hasChildren ? false : true
            }
        })
        node.data.children = newData
        return resolve(newData)
    } catch (err: any) {
        console.log(err)
    }
}

const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
    console.log("懒加载node: ", node)
    // 添加默认展开项
    defaultExpandedKeys.value.push(node.data.oid)
    const oid = node.data.oid
    //将懒加载节点数据添加到loadMap变量中
    loadMap.set(oid, { node, resolve })
    if (node.level === 0) {
        resolve(treeData.value)
    }
    if (node.level === 1) {
        if (node.data.name === "公共工作区") {
            await getProductList(resolve, node)
        } else {
            // 加载个人工作区第一层数据
            await getWorkspaceLazyNodeList("0", node, resolve)
        }
    }
    // 当点击节点为第二层及以上
    if (node.level >= 2) {
        const oid = node.data.type === "PDMLinkProduct" ? "0" : node.data.oid
        await getWorkspaceLazyNodeList(oid, node, resolve)
    }
}

// 局部刷新树节点
const refreshTreeNode = async (node: Node) => {
    const nodeData = treeRef.value!.getNode(node)
    // console.log("nodeData: ", nodeData)
    if (nodeData) {
        nodeData.loaded = false
        nodeData.expand()
    }
}
//#endregion

// 树单点击事件
const handleNodeClick = (data: MaterialTreeInterface, node: Node) => {
    // console.log("工作区树节点node: ", data)
    isShowMenu.value = false
    if (detailPageRef.value!.isCanEdit) {
        ElMessageBox.alert("当前处于编辑状态，不能切换!", "提示", {
            confirmButtonText: "确认",
            type: "error",
            center: true
        })
        treeRef.value!.setCurrentKey(currentTreeNodeData.value.oid)
        return false
    }
    currentTreeNodeData.value = data
    chooseTreeNode.value = data
    //将懒加载节点数据添加到loadMap变量中
    loadMap.set(data.oid, { node })
}

// 树右键点击
const isShowMenu = ref(false)
const treeWrapperRef = ref<HTMLElement>()
const rightContextMenuRef = ref<HTMLElement>()

// 初始化表格右键菜单
const initRightMenu = () => {
    document.addEventListener(
        "click",
        (e: MouseEvent) => {
            const rightMenu = rightContextMenuRef.value
            if (rightMenu && !rightMenu.contains(e.target as HTMLElement)) hidden()
        },
        false
    )
}
// 隐藏右键菜单
const hidden = () => {
    const rightMenu = rightContextMenuRef.value
    if (rightMenu) rightMenu.style.display = "none"
    isShowMenu.value = false
}
// 显示
const show = (event: MouseEvent, rect: any) => {
    event.preventDefault()
    // console.log("event:", event)
    if (!isShowMenu.value) return false
    const rightMenu = rightContextMenuRef.value
    // console.dir(rightMenu)
    if (!rightMenu) return false
    nextTick(() => {
        // 根据事件对象中鼠标点击的位置，进行定位
        if (event.clientX - rect.x + rightMenu.clientWidth > rect.width) {
            rightMenu.style.left = event.clientX - rect.x - rightMenu.clientWidth + "px"
        } else {
            rightMenu.style.left = event.clientX - rect.x + "px"
        }
        if (event.clientY - rect.y + rightMenu.clientHeight > rect.height) {
            rightMenu.style.top = event.clientY - rect.y - rightMenu.clientHeight + "px"
        } else {
            rightMenu.style.top = event.clientY - rect.y + "px"
        }
    })
}

//#endregion

const handleNodeContextmenu = (event: any, data: MaterialTreeInterface, node: Node) => {
    // console.log("树节点右键event: ", event)
    // console.log("树节点右键data: ", data)
    // console.log("树节点右键node: ", node)
    currentTreeNodeData.value = data
    //将懒加载节点数据添加到loadMap变量中
    loadMap.set(data.oid, { node })
    console.log("右键currentTreeNodeData.value： ", chooseTreeNode.value)
    if (!data.oid || data.oid === "1") return

    isShowMenu.value = true
    nextTick(() => {
        const rightMenu = rightContextMenuRef.value
        const rect = treeWrapperRef.value?.getBoundingClientRect()
        // console.log("rect: ", rect)
        if (rightMenu && rect) show(event, rect)
    })
}
//#endregion

//#region 新建，编辑，刷新，上移，下移删除个人文件夹
const handleAddEditFolderBtn = (type: string) => {
    dialogTitle.value = type === "add" ? "新建工作区" : "编辑工作区"
    dialogType.value = type
    dialogVisible.workspace = true
}

// 上移
const handleFolderTreeNodeMoveUp = async (treeNode: any) => {
    console.log("上移", treeNode)
    // 当前节点0id
    const currrentNodeOid = treeNode.oid
    // console.log("currrentNodeOid上:", currrentNodeOid)
    // 当前节点排序
    const currrentNodeSort = treeNode.sort
    // console.log("currrentNodeSort上:", currrentNodeSort, treeData.value)
    const previousSiblingNodes = findPreviousSiblingNodes(treeData.value, currrentNodeOid)
    // console.log(" previousSiblingNodes上:", previousSiblingNodes)
    if (previousSiblingNodes.length) {
        // 上一兄弟节点id
        const previousNodeOid = previousSiblingNodes[0].oid
        // console.log("previousNodeOid:", previousNodeOid)
        // 上一兄弟节点排序
        const previousNodeSort = previousSiblingNodes[0].sort
        treeNodeMove(currrentNodeOid, previousNodeOid, currrentNodeSort, previousNodeSort)
    } else {
        ElMessage({
            type: "warning",
            message: "当前节点不可上移",
            center: true
        })
    }
}
// 下移
const handleFolderTreeNodeMoveDown = async (treeNode: any) => {
    console.log("下移", treeNode)
    // 当前节点oid
    const currrentNodeOid = treeNode.oid
    // console.log("currrentNodeOid下:", currrentNodeOid)
    // 当前节点排序
    const currrentNodeSort = treeNode.sort
    // console.log("currrentNodeSort下:", currrentNodeSort, treeData.value)
    const nextSiblingNodes = findNextSiblingNodes(treeData.value, currrentNodeOid)
    // console.log(" nextSiblingNodes下:", nextSiblingNodes)
    if (nextSiblingNodes.length) {
        // 下一兄弟节点oid
        const nextNodeOid = nextSiblingNodes[0].oid
        // console.log("nextNodeOid:", nextNodeOid)
        // 下一兄弟节点排序
        const nextNodeSort = nextSiblingNodes[0].sort
        treeNodeMove(currrentNodeOid, nextNodeOid, currrentNodeSort, nextNodeSort)
    } else {
        ElMessage({
            type: "warning",
            message: "当前节点不可下移",
            center: true
        })
    }
}

// 个人文件夹：上移/下移
const timer = ref()
const treeNodeMove = async (oid: string, moveOid: string, sort: number, moveSort: number) => {
    // console.log("移动参数：", oid, moveOid, sort, moveSort)
    try {
        loading.value = true
        const params = {
            oid, // 当前节点oid
            moveOid, // 上移就是上个节点的oid，下移就是下一个oid
            sort, // 当前节点排序
            moveSort // 上移就是上个节点的排序，下移就是下一个排序
        }
        await workspaceTreeMove(params)

        const { node } = loadMap.get(currentTreeNodeData.value.oid)
        // console.log("node: ", node)
        // 判断当前点击树节点的层级，如果是level为1，则刷新当前层级，否则刷新父级
        if (node.level === 1) {
            await refreshTreeNode(node)
        } else {
            await refreshTreeNode(node.parent)
        }
        // 延时处理
        if (timer.value) clearTimeout(timer.value)
        timer.value = setTimeout(() => {
            const newChooseTreeNode = findTreeNodeById(treeData.value, chooseTreeNode.value.oid)
            chooseTreeNode.value = newChooseTreeNode
            treeRef.value!.setCurrentKey(chooseTreeNode.value.oid)
            ElMessage({
                type: "success",
                message: "移动成功",
                center: true
            })
            loading.value = false
        }, 1500)
    } catch (err: any) {
        console.log(err)
        loading.value = false
    }
}

const handleRefreshFolderBtn = () => {
    const { node } = loadMap.get(currentTreeNodeData.value.oid)
    // console.log("node: ", node)
    // 判断当前点击树节点的层级，如果是level为1，则刷新当前层级，否则刷新父级
    if (node.level === 1) {
        refreshTreeNode(node)
    } else {
        refreshTreeNode(node.parent)
    }
}

const handleDeleteFolderBtn = () => {
    ElMessageBox.confirm(t("materielPage.confirmDeleteMsg"), t("materielPage.prompt"), {
        confirmButtonText: t("materielPage.confirm"),
        cancelButtonText: t("materielPage.cancel"),
        confirmButtonClass: "confirmButton",
        cancelButtonClass: "cancelButton",
        type: "warning",
        center: true
    })
        .then(async () => {
            const oid = currentTreeNodeData.value.oid
            deleteBatchHandler(oid)
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t("materielPage.cancelDelMsg"),
                center: true
            })
        })
}

const deleteBatchHandler = async (oid: string) => {
    try {
        loading.value = true
        const params = {
            oidStr: oid
        }
        await deleteWorkspaceFolder(params)
        loading.value = false
        ElMessage({
            type: "success",
            message: t("materielPage.deleteSuccessMsg"),
            center: true
        })
        const { node } = loadMap.get(currentTreeNodeData.value.oid)
        // console.log("node: ", node)
        // 判断当前点击树节点的层级，如果是level为1，则刷新当前层级，否则刷新父级
        if (node.level === 1) {
            refreshTreeNode(node)
        } else {
            refreshTreeNode(node.parent)
        }
        resetDialog()
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion

//#region 关闭对话弹窗
const handleConfirmSuccess = (dialogType: string) => {
    dialogVisible[dialogType] = false
    const { node } = loadMap.get(currentTreeNodeData.value.oid)
    // console.log("node: ", node)
    // 判断当前点击树节点的层级，如果是level为1，则刷新当前层级，否则刷新父级
    if (node.level === 1) {
        refreshTreeNode(node)
    } else {
        refreshTreeNode(node.parent)
    }
}
//#endregion

// 重置dialog值
const resetDialog = () => {
    Object.assign(currentTreeNodeData.value, {
        oid: "",
        name: "",
        type: ""
    })
}
//#endregion

//#region 右侧详情自适应
const colSpan = ref<number>(8)
const handleDropWidthChange = () => {
    const ptContainerMainRight = document.querySelector(".pt-container-main-right") as HTMLElement
    if (ptContainerMainRight) {
        const offsetWidth = ptContainerMainRight.offsetWidth
        console.log("offsetWidth: ", offsetWidth)
        if (offsetWidth) {
            if (offsetWidth > 1560) {
                colSpan.value = 4
            } else if (offsetWidth < 1560 && offsetWidth > 1160) {
                colSpan.value = 6
            } else if (offsetWidth < 1160 && offsetWidth > 900) {
                colSpan.value = 8
            } else if (offsetWidth < 900 && offsetWidth > 540) {
                colSpan.value = 12
            } else if (offsetWidth < 540) {
                colSpan.value = 24
            }
        }
    }
}
//#endregion

onMounted(() => {
    initRightMenu()

    // 延时处理
    if (timer.value) clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        handleDropWidthChange()
    }, 1000)

    // 解决同一个页面多个组件使用window.onresize不生效
    window.addEventListener("resize", () => {
        handleDropWidthChange()
    })
})
</script>

<style lang="scss" scoped>
.sf-table-wrapper {
    position: relative;
    .menu {
        position: absolute;
        padding: 5px 0;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
        font-size: 14px;
        z-index: 1000;
        list-style: none;
        .menu-li {
            cursor: pointer;
            padding: 5px 16px;
            list-style: none;
            line-height: 22px;
            &:hover {
                background-color: #ecf5ff;
                color: #409eff;
                .el-button {
                    color: #409eff;
                }
            }
            .el-button {
                font-size: 14px;
            }
        }
    }
}
</style>
