<template>
    <div class="app-container">
        <div class="sf-container3" v-loading="loading" :element-loading-text="elementLoadingText">
            <div class="search-container">
                <div class="mb-2 flex">
                    <el-button class="mr-2" size="small" type="primary" @click="getTreeList" :disabled="isCanEdit"
                        >刷新</el-button
                    >
                    <template v-if="!isCanEdit">
                        <el-button class="mr-2" size="small" type="primary" @click="handleAddModifyBtn('add')"
                            >新增</el-button
                        >
                        <el-button class="mr-2" size="small" type="primary" @click="handleAddModifyBtn('modify')"
                            >修改</el-button
                        >
                    </template>
                    <template v-if="isCanEdit">
                        <el-button class="mr-2" size="small" type="primary" @click="handleCancelBtn">取消</el-button>
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleSaveBtn({ isCanLeave: false })"
                            >保存</el-button
                        >
                    </template>

                    <template v-if="!isCanEdit">
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleDeleteBtn"
                            :disabled="!currentTreeNodeData.groupOid"
                            >删除</el-button
                        >
                        <el-button
                            class="mr-2"
                            size="small"
                            type="primary"
                            @click="handleCopyBtn"
                            :disabled="!currentTreeNodeData.groupOid"
                            >复制</el-button
                        >
                        <el-button class="mr-4" type="primary" size="small" @click="goDownload">下载模板</el-button>
                        <el-upload
                            class="mr-4"
                            v-model:file-list="fileList"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleUploadChange"
                        >
                            <el-button type="primary" size="small">导入</el-button>
                        </el-upload>
                    </template>
                </div>
            </div>
            <div class="sf-container-main">
                <drop-line left-width="300px" :minDropWidth="[200, 600]">
                    <template #left>
                        <div class="sf-table-wrapper">
                            <el-tree
                                ref="departmentTreeRef"
                                :data="treeData"
                                :props="defaultProps"
                                :default-expanded-keys="defaultExpandRowKeys"
                                @node-click="handleNodeClick"
                                highlight-current
                                node-key="groupOid"
                                size="small"
                            >
                                <template #default="{ node, data }">
                                    <div v-if="data.type === 'group'">
                                        <el-icon color="#409EFF"><Management size="16" /></el-icon>
                                        <span>{{ data.name }}</span>
                                    </div>
                                    <div v-else>
                                        <span>{{ data.name }}</span>
                                    </div>
                                </template>
                            </el-tree>
                        </div>
                    </template>
                    <template #right>
                        <groupForm
                            ref="groupFormRef"
                            :organizationList="treeData"
                            :currentTreeNodeData="currentTreeNodeData"
                            :isCanEdit="isCanEdit"
                            @refreshTree="handleRefreshTree"
                        />
                    </template>
                </drop-line>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue"
import type { UploadProps, UploadUserFile } from "element-plus"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"
import groupForm from "./components/groupForm.vue"
import DropLine from "@/components/dropLine/index.vue"
import { groupTree } from "@/api/system/groupManage"
import { recursionArray } from "@/utils"
import { exportUserTemplate, uploadUserExcel } from "@/api/system/staffManage"
import { downloadFile } from "@/utils/exportTemplate"

//#region 参数和方法
defineOptions({
    name: "groupManage"
})

const route = useRoute()
const tagsViewStore = useTagsViewStore()
const instance: any = getCurrentInstance()
const loading = ref(false)
const isCanEdit = ref(false)
const groupFormRef = ref()
//#endregion

//#region 树
const defaultProps = {
    children: "children",
    label: "name"
}
// 默认树展开项
const departmentTreeRef = ref()
const defaultExpandRowKeys = ref<Array<string>>([])
const treeData = ref<any[]>([])
const currentTreeNodeData = ref({
    groupOid: "", // 部门oid
    roleOid: "", // 角色oid
    organizationOid: "" // 组织oid
}) // 当前选择树节点

// 获取部门树列表
const getTreeList = async () => {
    try {
        loading.value = true
        const { data } = await groupTree()
        treeData.value = data
        recursionArray(treeData.value, (item: any) => {
            item.roleOid = item.groupOid
        })
        console.log("treeData.value: ", treeData.value)
        defaultExpandRowKeys.value = data.map((item: any) => item.groupOid)
        loading.value = false
    } catch (error: any) {
        console.log(error)
        loading.value = false
    }
}

getTreeList()

// 树单点击事件
const handleNodeClick = (node: any) => {
    console.log("部门节点node: ", node)
    if (node.level === "0") {
        groupFormRef.value!.handleAllClear()
        return
    }
    if (isCanEdit.value) {
        ElMessageBox.alert("当前处于编辑状态，不能切换!", "提示", {
            confirmButtonText: "确认",
            type: "error",
            center: true
        })
        departmentTreeRef.value!.setCurrentKey(currentTreeNodeData.value.groupOid)
        return
    }
    currentTreeNodeData.value = node
    groupFormRef.value!.getDetail(node)
}

const handleRefreshTree = () => {
    isCanEdit.value = false
    currentTreeNodeData.value = {
        groupOid: "",
        roleOid: "",
        organizationOid: ""
    }
    getTreeList()
}
//#endregion

//#region 按钮操作
// 新增/修改/复制
const handleAddModifyBtn = (type: string) => {
    console.log("groupFormRef: ", groupFormRef.value)
    isCanEdit.value = true
    if (type === "add") {
        groupFormRef.value!.handleClear()
    }
}
// 取消
const handleCancelBtn = () => {
    isCanEdit.value = false
    handleNodeClick(currentTreeNodeData.value)
}
// 保存
const handleSaveBtn = (leaveParams: any) => {
    groupFormRef.value!.handleSaveBtn(leaveParams)
}
// 删除
const handleDeleteBtn = () => {
    groupFormRef.value!.handleDeleteBtn()
}
// 复制
const handleCopyBtn = () => {
    isCanEdit.value = true
    groupFormRef.value!.copyHandler()
}
// 下载模板
const goDownload = async () => {
    try {
        loading.value = true
        elementLoadingText.value = "正在下载导入模板，请稍等..."
        const res = await exportUserTemplate()
        const filename = `部门管理导入模板.xlsx`
        downloadFile(res, filename)
    } catch (error: any) {
        console.error(error)
    } finally {
        loading.value = false
        elementLoadingText.value = ""
    }
}
//#region 导入
const fileList = ref<UploadUserFile[]>([])
const elementLoadingText = ref<string>("")
const handleUploadChange: UploadProps["onChange"] = (uploadFile) => {
    if (uploadFile.raw) {
        const formData = new FormData()
        formData.append("file", uploadFile.raw)
        loading.value = true
        elementLoadingText.value = "正在导入，请稍等..."
        uploadUserExcel(formData)
            .then((data: any) => {
                ElMessage.success(data.message)
                getTreeList()
            })
            .catch((err: any) => {
                console.log(err)
            })
            .finally(() => {
                loading.value = false
                elementLoadingText.value = ""
            })
    }
}
//#endregion

onBeforeRouteLeave((to, from, next) => {
    if (isCanEdit.value) {
        ElMessageBox.confirm("是否离开当前页面？", "提示", {
            confirmButtonText: "是(Y)",
            cancelButtonText: "否(N)",
            confirmButtonClass: "confirmButton",
            cancelButtonClass: "cancelButton",
            type: "warning",
            center: true
        })
            .then(() => {
                // const leaveParams = {
                //     isCanLeave: true,
                //     fn: next()
                // }
                // isCanEdit.value = false
                // handleSaveBtn(leaveParams)
                // 防止页签丢失
                if (route.name) {
                    tagsViewStore.addVisitedView(route)
                    tagsViewStore.addCachedView(route)
                }
                ElMessage({
                    type: "warning",
                    message: "当前处于编辑状态!",
                    center: true
                })
                return
            })
            .catch(() => {
                // 防止页签丢失
                if (route.name) {
                    tagsViewStore.addVisitedView(route)
                    tagsViewStore.addCachedView(route)
                }
            })
    } else {
        next()
    }
})
</script>

<style lang="scss" scoped></style>
