<template>
    <div class="app-container">
        <div class="sf-container">
            <div class="sf-container-main">
                <drop-line left-width="300px">
                    <template #left>
                        <el-tree
                            :data="systemMenuTreeData"
                            :props="defaultProps"
                            check-strictly
                            check-on-click-node
                            @node-click="handleNodeClick"
                        />
                    </template>
                    <template #right>
                        <div class="sf-container-main-content">
                            <div class="sf-table-wrapper">
                                <detail-page :menuCode="currentTreeNodeData.menuCode" />
                            </div>
                        </div>
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue"
import detailPage from "./components/detailPage.vue"
import { SystemMenuInterface } from "@/interface/system/systemLanguage"
import { getMenuTreeData } from "@/api/system/systemLanguage"

//#region 参数和方法
defineOptions({
    name: "systemLanguage"
})
const instance: any = getCurrentInstance()
//#endregion

//#region 系统菜单树
const defaultProps = {
    children: "children",
    label: "menuName"
}
const systemMenuTreeData = ref<SystemMenuInterface[]>([])
const currentTreeNodeData = ref<SystemMenuInterface>({
    menuCode: "",
    menuName: ""
}) // 当前选择树节点

// 获取树列表
const getTreeList = async () => {
    try {
        const { data } = await getMenuTreeData({})
        systemMenuTreeData.value = data
        // 默认加载第一条数据
        if (systemMenuTreeData.value && systemMenuTreeData.value.length > 0) {
            currentTreeNodeData.value = systemMenuTreeData.value[0]
        }
    } catch (err) {
        console.log(err)
    }
}

// 树单点击事件
const handleNodeClick = (node: SystemMenuInterface) => {
    currentTreeNodeData.value = node
}
//#endregion

onMounted(() => {
    getTreeList()
})
</script>

<style lang="scss" scoped></style>
