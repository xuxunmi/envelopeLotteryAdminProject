<template>
    <div class="list-wrapper">
        <documentPartDetail
            v-if="query.type === 'WTPart' || query.type === 'WTDocument'"
            ref="documentPartDetailRef"
            :query="query"
            :materielTypeList="materielTypeList"
            :optionTrimList="optionTrimList"
            :optionLineList="optionLineList"
            :optionChildLineList="optionChildLineList"
            :optionPrePlanTypeList="optionPrePlanTypeList"
            :colSpan="colSpan"
            :isCanEdit="isCanEdit"
            :currentRowData="currentRowData"
            :viewName="viewName"
            @startLoading="startLoading"
            @endLoading="endLoading"
            @confirm-success="handleConfirmSuccess"
            @handleEditStatusUpdate="handleEditStatusUpdate"
        />
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from "vue"
import documentPartDetail from "./components/documentPartDetail.vue"
import { SelectInterface } from "@/interface/common"

//#region 路由参数
const props = defineProps({
    query: {
        type: Object,
        default: () => ({
            oid: "",
            type: "",
            materialType: ""
        })
    },
    materielTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    typeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionTrimList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionLineList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionChildLineList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    optionPrePlanTypeList: {
        type: Array as () => SelectInterface[],
        default: () => []
    },
    colSpan: {
        type: Number,
        default: 8
    },
    isCanEdit: {
        type: Boolean,
        default: false
    },
    currentRowData: {
        type: Object,
        default: () => ({})
    },
    // 显示规则类型名称
    viewName: {
        type: String,
        default: ""
    }
    // dropWidthChangeHandler: {
    //     type: Function,
    //     default: () => {
    //         return Function
    //     }
    // }
})
const emits = defineEmits(["startLoading", "endLoading", "confirm-success", "handleEditStatusUpdate"])
const instance: any = getCurrentInstance()
//#endregion

const startLoading = () => emits("startLoading")
const endLoading = () => emits("endLoading")
const handleConfirmSuccess = (newOid: string) => emits("confirm-success", newOid)
const handleEditStatusUpdate = (bool: boolean) => emits("handleEditStatusUpdate", bool)

const getDocumentPartDetailsData = (data: any) => {
    instance.refs.documentPartDetailRef.getDocumentPartDetailsData(data)
}

const getMultiLevelDictionaryTypeData = (data: any) => {
    instance.refs.documentPartDetailRef.getMultiLevelDictionaryTypeData(data)
}

const handleEditConfirm = () => {
    instance.refs.documentPartDetailRef.handleEditConfirm()
}

// 向外暴露方法
defineExpose({
    getDocumentPartDetailsData,
    handleEditConfirm,
    getMultiLevelDictionaryTypeData
})
</script>

<style lang="scss" scoped>
.list-wrapper {
    height: 100%;
    padding: 6px 12px 12px;
}
</style>
