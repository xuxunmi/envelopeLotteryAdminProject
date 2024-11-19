<template>
    <div>
        <el-input
            size="small"
            v-model="formData.searchValue"
            style="width: 380px"
            placeholder="请输入"
            class="input-with-select"
            @keydown.enter="goJumpToFastQueryPage"
        >
            <template #prepend>
                <el-select
                    size="small"
                    v-model="formData.selectValue"
                    style="width: 80px"
                    @change="handleSelectValueChange"
                >
                    <el-option v-for="item in inputOptionsList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <el-select size="small" v-model="formData.symbol" style="width: 80px" @change="handleSymbolChange">
                    <el-option
                        v-for="item in queryConditionList_material"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </template>
            <template #append>
                <el-button style="background: #fff" size="small" icon="Search" @click="handleQueryIcon" />
            </template>
        </el-input>
        <el-button style="background: #fff" class="ml-2" size="small" @click="handleAdvancedQueryBtn"
            >高级查询</el-button
        >

        <!-- 高级查询弹窗 -->
        <dialogFrame :title="dialogTitle" v-model:visible="dialogVisible.query" :footer="false" width="40%">
            <AdvancedQueryDialog
                v-if="dialogVisible.query"
                v-model:visible="dialogVisible.query"
                @confirm-success="handleMaterialConfirmSuccess_query"
            />
        </dialogFrame>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import dialogFrame from "@/components/dialogFrame/index.vue"
import AdvancedQueryDialog from "@/components/AdvancedQueryDialog/index.vue"
import { queryConditionList_material } from "@/assets/common/select-list"
import { useI18n } from "vue-i18n"

defineOptions({
    name: "HeadQuery"
})

const router = useRouter()

const { t } = useI18n()

const dialogTitle = ref<string>("") // 弹窗标题
// 显示不同的弹窗
const dialogVisible: { [key: string]: boolean } = reactive({
    query: false // 高级查询对话框
})

const inputOptionsList = [
    {
        id: "all",
        name: "全部"
    },
    {
        id: "WTPart",
        name: "物料"
    },
    {
        id: "WTDocument",
        name: "文档"
    }
]
const formData = reactive({
    selectValue: "all",
    symbol: "左包含",
    searchValue: ""
})

const handleSelectValueChange = (value: string) => {
    Object.assign(formData, {
        selectValue: value,
        searchValue: "",
        symbol: "左包含"
    })
}

const handleSymbolChange = (value: string) => {
    Object.assign(formData, {
        ...formData,
        symbol: value
    })
}

// 处理快速查询按钮
const handleQueryIcon = () => {
    if (!formData.searchValue) return
    goJumpToFastQueryPage()
}

// 处理高级查询按钮
const handleAdvancedQueryBtn = () => {
    dialogTitle.value = "查询条件"
    const dialogType = "query"
    dialogVisible[dialogType] = true
}

// 关闭高级查询弹窗
const handleMaterialConfirmSuccess_query = (globalParams: object) => {
    console.log("globalParams: ", globalParams)
    dialogVisible.query = false
    goJumpToGlobalQueryPage(globalParams)
}

// 跳转快速查询页面
const goJumpToFastQueryPage = () => {
    router.push({
        path: "/product/materielQuery/fast",
        query: { queryParam: JSON.stringify(formData), tagTitle: "快速查询" }
    })
}

// 跳转全局查询页面
const goJumpToGlobalQueryPage = (globalParams: any) => {
    router.push({
        path: "/product/materielQuery/global",
        query: { queryParam: JSON.stringify(globalParams), name: "高级查询", tagTitle: "全局查询" }
    })
}
</script>

<style lang="scss" scoped>
:deep(.el-input-group__prepend) {
    width: 160px;
    display: flex;
    justify-content: space-between !important;
}
:deeep(.el-button) {
    background-color: #fff !important;
}
</style>
