<template>
    <div>
        <el-scrollbar v-loading="loading" height="calc(90vh - 158px)">
            <el-tree
                ref="treeRef"
                :data="treeData"
                :props="treeProps"
                :load="loadNode"
                :default-expanded-keys="defaultExpandedKeys"
                node-key="oid"
                check-strictly
                check-on-click-node
                highlight-current
                lazy
                show-checkbox
                @node-click="handleNodeClick"
                @check="handleNodeCheckChange"
            >
                <template #default="{ node, data }">
                    <el-icon class="folder-icon mr-2"><Folder /></el-icon>
                    <span>{{ data.name }}</span>
                </template>
            </el-tree>
        </el-scrollbar>
        <div class="mt-6 text-center">
            <el-button size="small" type="primary" @click="handleConfirm" :loading="loading">保存</el-button>
            <el-button size="small" type="primary" @click="emits('update:visible')">{{
                t("materielPage.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type Node from "element-plus/es/components/tree/src/model/node"
import { MaterialTreeInterface } from "@/interface/materiel"
import { productList } from "@/api/productLibrary"
import { workspaceLazyChildrenNode, materieBatchAddFolder } from "@/api/productMange/materiel"
import { useI18n } from "vue-i18n"

//#region 参数和方法
defineOptions({
    name: "addToFolderDialog"
})

const { t } = useI18n()
const loading = ref(true)

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    // 选择的物料列表
    multipleTableSelection: {
        type: Array,
        required: true
    }
})
// console.log("multipleTableSelection: ", props.multipleTableSelection)

const emits = defineEmits(["update:visible", "confirm-success"])
//#endregion

//#region 树
// 树节点禁用，禁止发起流程
const disabledTreeNodeFun = computed(() => {
    return (node: any) => {
        // 禁用自定义第一层复选框
        if (node.type === "personalWorkspace" || node.type === "commonWorkspace" || node.type === "PDMLinkProduct") {
            return true
        }
        return false
    }
})

const treeProps = {
    label: "name",
    children: "children",
    isLeaf: "hasChildren",
    disabled: disabledTreeNodeFun.value
}
const loadMap = new Map() // 保存懒加载
const treeRef = ref()
const defaultExpandedKeys = ref<string[]>(["0", "1"]) // ["0", "1"

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

// 获取公共工作区列表
const getProductList = async (resolve: (data: any[]) => void, node: Node) => {
    try {
        loading.value = true
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
        loading.value = false
        return resolve(newData)
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}

// 获取工作区懒加载子节点树
const getWorkspaceLazyNodeList = async (oid: string, node: Node, resolve: (data: any[]) => void) => {
    try {
        loading.value = true
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
        loading.value = false
        return resolve(newData)
    } catch (err: any) {
        loading.value = false
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

// 树单点击事件
const handleNodeClick = (data: MaterialTreeInterface, node: Node) => {
    console.log("树节点node: ", data, node)
    //将懒加载节点数据添加到loadMap变量中
    loadMap.set(data.oid, { node })
}

const treeMultipleCheckedList = ref<any[]>([]) // 勾选数据
const handleNodeCheckChange = (data: any, node: any) => {
    if (node.checkedNodes.length) {
        treeMultipleCheckedList.value = node.checkedNodes
        console.log("treeMultipleCheckedList.value: ", treeMultipleCheckedList.value)
    }
}

const handleConfirm = async () => {
    if (!treeMultipleCheckedList.value.length) {
        ElMessage({
            type: "warning",
            message: "请先勾选物料要添加到的文件中",
            center: true
        })
        return
    }
    try {
        loading.value = true
        const parts = props.multipleTableSelection.map((item: any) => {
            return {
                partOid: item.oid,
                materialCode: item.number,
                name: item.name
            }
        })
        const folderOids = treeMultipleCheckedList.value.map((item) => item.oid).join()
        const params: {
            folderIds: string
            parts: Array<{ partOid: string; materialCode: string; name: string }>
        } = {
            folderIds: folderOids,
            parts
        }
        await materieBatchAddFolder(params)
        loading.value = false
        ElMessage({
            type: "success",
            message: "添加到文件成功",
            center: true
        })
        emits("confirm-success", "addToFolder")
    } catch (err: any) {
        loading.value = false
        console.log(err)
    }
}
//#endregion
</script>

<style lang="scss" scoped></style>
