<template>
    <div class="app-container dashboard">
        <div class="sf-container" v-loading="loading">
            <div class="header">
                <div class="title">待我审批</div>
            </div>
            <PendingApprovalList class="list" :processStatusList="processStatusList" />
            <div class="header">
                <div class="title">我发起的</div>
            </div>
            <InitiatedProcessList class="list" :processStatusList="processStatusList" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import PendingApprovalList from "./components/pendingApprovalList.vue"
import InitiatedProcessList from "./components/initiatedProcessList.vue"
import { SelectInterface } from "@/interface/common"
import { getDictionarySelect } from "@/api/system/dataDictionary"

//#region 参数和方法
defineOptions({
    name: "dashboard"
})
const loading = ref(false)

//#region 下拉数据
const processStatusList = ref<SelectInterface[]>([])
const getSelectData = async () => {
    try {
        const { data } = (await getDictionarySelect({ codes: "PROCESS_STATUS" })) as { data: any }
        processStatusList.value =
            data.PROCESS_STATUS.map((item: any) => {
                return {
                    id: item.code,
                    name: item.codeListNameC
                }
            }) || []
    } catch (error: any) {
        console.log(error)
    }
}
getSelectData()
//#endregion
</script>

<style lang="scss" scoped>
.dashboard {
    .sf-container {
        padding: 6px;
        display: flex;
        flex-direction: column;
        .header {
            display: flex;
            align-items: center;
            gap: 50px;
            padding: 6px;
            .title {
                font-size: 14px;
                &::before {
                    content: "";
                    position: relative;
                    top: 1px;
                    margin-right: 10px;
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border-radius: 12px;
                    background-color: #409eff;
                    border: 1px solid #fff;
                    box-shadow: 0px 0px 3px rgb(0, 0, 0);
                }
            }
            .info {
                display: flex;
                gap: 50px;
                border-bottom: 1px solid;
                padding: 0 6px;
            }
        }
        .list {
            flex: 1;
            height: 0;
        }
    }
}
</style>
